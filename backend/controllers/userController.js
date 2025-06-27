const User = require('../models/User');
const Doctor = require('../models/Doctor');

// إنشاء مستخدم جديد
const createUser = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            username,
            email,
            password,
            phone,
            role,
            department,
            position,
            doctorProfile
        } = req.body;

        // التحقق من عدم وجود مستخدم بنفس البريد الإلكتروني أو اسم المستخدم
        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: username.toLowerCase() }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                status: 'fail',
                message: 'User with this email or username already exists'
            });
        }

        // إنشاء المستخدم الجديد
        const newUser = new User({
            firstName,
            lastName,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password,
            phone,
            role,
            department,
            position,
            doctorProfile,
            permissions: User.getDefaultPermissions(role),
            createdBy: req.user.id
        });

        await newUser.save();

        res.status(201).json({
            status: 'success',
            message: 'User created successfully',
            data: {
                user: {
                    id: newUser._id,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role,
                    department: newUser.department,
                    employeeId: newUser.employeeId,
                    status: newUser.status
                }
            }
        });

    } catch (error) {
        console.error('Create User Error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                status: 'fail',
                message: 'Validation Error',
                errors: errors
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Internal server error during user creation'
        });
    }
};

// الحصول على جميع المستخدمين
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // فلاتر البحث
        const filters = {};
        if (req.query.role) filters.role = req.query.role;
        if (req.query.status) filters.status = req.query.status;
        if (req.query.department) filters.department = req.query.department;
        if (req.query.search) {
            filters.$or = [
                { firstName: { $regex: req.query.search, $options: 'i' } },
                { lastName: { $regex: req.query.search, $options: 'i' } },
                { username: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
                { employeeId: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const users = await User.find(filters)
            .populate('doctorProfile', 'firstName lastName specialization')
            .populate('createdBy', 'firstName lastName')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(filters);

        res.json({
            status: 'success',
            data: {
                users,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalUsers: total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get All Users Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

// الحصول على مستخدم بالمعرف
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('doctorProfile', 'firstName lastName specialization')
            .populate('createdBy', 'firstName lastName')
            .populate('lastModifiedBy', 'firstName lastName');

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            data: { user }
        });

    } catch (error) {
        console.error('Get User By ID Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

// تحديث بيانات المستخدم
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updateData = { ...req.body };

        // حذف الحقول التي لا يجب تحديثها من هنا
        delete updateData.password;
        delete updateData.username;
        delete updateData.loginAttempts;
        delete updateData.lockUntil;
        delete updateData.passwordResetToken;
        delete updateData.passwordResetExpires;

        // إضافة معلومات التحديث
        updateData.lastModifiedBy = req.user.id;

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).populate('doctorProfile', 'firstName lastName specialization');

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            message: 'User updated successfully',
            data: { user }
        });

    } catch (error) {
        console.error('Update User Error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                status: 'fail',
                message: 'Validation Error',
                errors: errors
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

// حذف مستخدم (إلغاء تفعيل)
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // التحقق من عدم حذف المستخدم الحالي
        if (userId === req.user.id) {
            return res.status(400).json({
                status: 'fail',
                message: 'You cannot delete your own account'
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            {
                status: 'inactive',
                lastModifiedBy: req.user.id
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

// تغيير حالة المستخدم
const updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const userId = req.params.id;

        if (!['active', 'inactive', 'suspended'].includes(status)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid status value'
            });
        }

        // التحقق من عدم تعليق المستخدم الحالي
        if (userId === req.user.id && status !== 'active') {
            return res.status(400).json({
                status: 'fail',
                message: 'You cannot change your own account status'
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            {
                status,
                lastModifiedBy: req.user.id
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            message: `User status updated to ${status}`,
            data: { user }
        });

    } catch (error) {
        console.error('Update User Status Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

// إعادة تعيين كلمة مرور المستخدم
const resetUserPassword = async (req, res) => {
    try {
        const userId = req.params.id;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                status: 'fail',
                message: 'New password must be at least 6 characters long'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        // تحديث كلمة المرور
        user.password = newPassword;
        user.mustChangePassword = true;
        user.lastModifiedBy = req.user.id;
        user.loginAttempts = 0;
        user.lockUntil = undefined;

        await user.save();

        res.json({
            status: 'success',
            message: 'Password reset successfully. User must change password on next login.'
        });

    } catch (error) {
        console.error('Reset User Password Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

// فتح حساب مستخدم مقفل
const unlockUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findByIdAndUpdate(
            userId,
            {
                $unset: {
                    loginAttempts: 1,
                    lockUntil: 1
                },
                lastModifiedBy: req.user.id
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            message: 'User account unlocked successfully'
        });

    } catch (error) {
        console.error('Unlock User Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

// تحديث صلاحيات المستخدم
const updateUserPermissions = async (req, res) => {
    try {
        const userId = req.params.id;
        const { permissions } = req.body;

        if (!Array.isArray(permissions)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Permissions must be an array'
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            {
                permissions,
                lastModifiedBy: req.user.id
            },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            message: 'User permissions updated successfully',
            data: {
                permissions: user.permissions
            }
        });

    } catch (error) {
        console.error('Update User Permissions Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

// إحصائيات المستخدمين
const getUsersStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'active' });
        const inactiveUsers = await User.countDocuments({ status: 'inactive' });
        const suspendedUsers = await User.countDocuments({ status: 'suspended' });

        // إحصائيات الأدوار
        const roleStats = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        // إحصائيات الأقسام
        const departmentStats = await User.aggregate([
            {
                $match: { department: { $exists: true, $ne: null } }
            },
            {
                $group: {
                    _id: '$department',
                    count: { $sum: 1 }
                }
            }
        ]);

        // المستخدمين الجدد هذا الشهر
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const newUsersThisMonth = await User.countDocuments({
            createdAt: { $gte: startOfMonth }
        });

        res.json({
            status: 'success',
            data: {
                totalUsers,
                activeUsers,
                inactiveUsers,
                suspendedUsers,
                newUsersThisMonth,
                roleStats: roleStats.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                departmentStats: departmentStats.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            }
        });

    } catch (error) {
        console.error('Get Users Stats Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

// البحث عن المستخدمين
const searchUsers = async (req, res) => {
    try {
        const { query, role, department, status } = req.query;

        let searchCriteria = {};

        if (query) {
            searchCriteria.$or = [
                { firstName: { $regex: query, $options: 'i' } },
                { lastName: { $regex: query, $options: 'i' } },
                { username: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
                { employeeId: { $regex: query, $options: 'i' } }
            ];
        }

        if (role) searchCriteria.role = role;
        if (department) searchCriteria.department = department;
        if (status) searchCriteria.status = status;

        const users = await User.find(searchCriteria)
            .populate('doctorProfile', 'firstName lastName specialization')
            .limit(20)
            .sort({ firstName: 1 });

        res.json({
            status: 'success',
            data: {
                users,
                count: users.length
            }
        });

    } catch (error) {
        console.error('Search Users Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateUserStatus,
    resetUserPassword,
    unlockUser,
    updateUserPermissions,
    getUsersStats,
    searchUsers
}; 