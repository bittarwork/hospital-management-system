const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'hospital-management-super-secret-jwt-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT Token - Simple and Clean
const generateToken = (userId) => {
    try {
        const token = jwt.sign(
            {
                id: userId,
                iat: Math.floor(Date.now() / 1000)
            },
            JWT_SECRET,
            {
                expiresIn: JWT_EXPIRES_IN
            }
        );
        return token;
    } catch (error) {
        console.error('❌ Token Generation Error:', error);
        throw new Error('Failed to generate authentication token');
    }
};

// تسجيل الدخول
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // التحقق من البيانات المطلوبة
        if (!username || !password) {
            return res.status(400).json({
                status: 'fail',
                message: 'يرجى إدخال اسم المستخدم وكلمة المرور'
            });
        }

        // البحث عن المستخدم
        const user = await User.findOne({
            $or: [
                { username: username.toLowerCase() },
                { email: username.toLowerCase() }
            ]
        }).select('+password');

        // التحقق من وجود المستخدم وصحة كلمة المرور
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                status: 'fail',
                message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
            });
        }

        // التحقق من حالة الحساب
        if (user.status !== 'active') {
            return res.status(401).json({
                status: 'fail',
                message: `الحساب غير نشط. يرجى التواصل مع الإدارة`
            });
        }

        // التحقق من قفل الحساب
        if (user.isLocked) {
            return res.status(401).json({
                status: 'fail',
                message: 'الحساب مقفل مؤقتاً بسبب محاولات دخول خاطئة متكررة'
            });
        }

        // إنشاء التوكن
        const token = generateToken(user._id);

        // تحديث آخر دخول
        user.lastLogin = new Date();
        user.loginAttempts = 0; // إعادة تعيين محاولات الدخول
        await user.save({ validateBeforeSave: false });

        // إرسال الاستجابة
        res.status(200).json({
            status: 'success',
            message: 'تم تسجيل الدخول بنجاح',
            data: {
                token,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                    position: user.position,
                    employeeId: user.employeeId,
                    permissions: user.permissions,
                    preferences: user.preferences,
                    mustChangePassword: user.mustChangePassword
                }
            }
        });

    } catch (error) {
        console.error('❌ Login Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'خطأ في الخادم أثناء تسجيل الدخول'
        });
    }
};

// تسجيل الخروج
const logout = async (req, res) => {
    try {
        res.status(200).json({
            status: 'success',
            message: 'تم تسجيل الخروج بنجاح'
        });
    } catch (error) {
        console.error('❌ Logout Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'خطأ في الخادم أثناء تسجيل الخروج'
        });
    }
};

// التحقق من صحة التوكن والحصول على المستخدم الحالي
const getCurrentUser = async (req, res) => {
    try {
        // المستخدم متوفر من middleware التحقق
        const user = await User.findById(req.user.id).populate('doctorProfile', 'firstName lastName specialization');

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'المستخدم غير موجود'
            });
        }

        if (user.status !== 'active') {
            return res.status(401).json({
                status: 'fail',
                message: 'الحساب غير نشط'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                    position: user.position,
                    employeeId: user.employeeId,
                    permissions: user.permissions,
                    preferences: user.preferences,
                    mustChangePassword: user.mustChangePassword,
                    doctorProfile: user.doctorProfile
                }
            }
        });

    } catch (error) {
        console.error('❌ Get Current User Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'خطأ في الخادم'
        });
    }
};

// تغيير كلمة المرور
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.user.id;

        // التحقق من البيانات
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                status: 'fail',
                message: 'جميع الحقول مطلوبة'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                status: 'fail',
                message: 'كلمة المرور الجديدة وتأكيدها غير متطابقين'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                status: 'fail',
                message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
            });
        }

        // البحث عن المستخدم
        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'المستخدم غير موجود'
            });
        }

        // التحقق من كلمة المرور الحالية
        const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordCorrect) {
            return res.status(401).json({
                status: 'fail',
                message: 'كلمة المرور الحالية غير صحيحة'
            });
        }

        // تحديث كلمة المرور
        user.password = newPassword;
        user.mustChangePassword = false;
        user.lastModifiedBy = userId;
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'تم تغيير كلمة المرور بنجاح'
        });

    } catch (error) {
        console.error('❌ Change Password Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'خطأ في الخادم أثناء تغيير كلمة المرور'
        });
    }
};

// نسيت كلمة المرور
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: 'fail',
                message: 'البريد الإلكتروني مطلوب'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'لا يوجد مستخدم بهذا البريد الإلكتروني'
            });
        }

        // إنشاء توكن إعادة التعيين
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // صالح لمدة 10 دقائق

        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            status: 'success',
            message: 'تم إنشاء رمز إعادة تعيين كلمة المرور',
            // في التطوير فقط - في الإنتاج يتم إرسال بريد إلكتروني
            ...(process.env.NODE_ENV === 'development' && { resetToken })
        });

    } catch (error) {
        console.error('❌ Forgot Password Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'خطأ في الخادم'
        });
    }
};

// إعادة تعيين كلمة المرور
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;

        if (!token || !newPassword || !confirmPassword) {
            return res.status(400).json({
                status: 'fail',
                message: 'جميع الحقول مطلوبة'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                status: 'fail',
                message: 'كلمتا المرور غير متطابقتين'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                status: 'fail',
                message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
            });
        }

        // تشفير التوكن
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // البحث عن المستخدم
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                status: 'fail',
                message: 'رمز إعادة التعيين غير صحيح أو منتهي الصلاحية'
            });
        }

        // تحديث كلمة المرور
        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.mustChangePassword = false;
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'تم إعادة تعيين كلمة المرور بنجاح'
        });

    } catch (error) {
        console.error('❌ Reset Password Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'خطأ في الخادم'
        });
    }
};

// تحديث تفضيلات المستخدم
const updatePreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        const { language, theme, notifications } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'المستخدم غير موجود'
            });
        }

        // تحديث التفضيلات
        if (language) user.preferences.language = language;
        if (theme) user.preferences.theme = theme;
        if (notifications) {
            user.preferences.notifications = {
                ...user.preferences.notifications,
                ...notifications
            };
        }

        user.lastModifiedBy = userId;
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'تم تحديث التفضيلات بنجاح',
            data: {
                preferences: user.preferences
            }
        });

    } catch (error) {
        console.error('❌ Update Preferences Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'خطأ في الخادم'
        });
    }
};

module.exports = {
    login,
    logout,
    getCurrentUser,
    changePassword,
    forgotPassword,
    resetPassword,
    updatePreferences
}; 