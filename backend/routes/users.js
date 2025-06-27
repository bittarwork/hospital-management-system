const express = require('express');
const router = express.Router();

// Import middleware
const {
    authenticate,
    authorize,
    checkPermission
} = require('../middleware/auth');

// Import controller functions
const {
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
} = require('../controllers/userController');

// All routes require authentication
router.use(authenticate);

// Public user routes (available to all authenticated users)
router.get('/search', checkPermission('users', 'read'), searchUsers); // البحث عن المستخدمين

// Statistics route (للمديرين والأدمن)
router.get('/stats',
    authorize('super_admin', 'admin'),
    getUsersStats
); // إحصائيات المستخدمين

// Main CRUD operations
router.post('/',
    checkPermission('users', 'create'),
    createUser
); // إنشاء مستخدم جديد

router.get('/',
    checkPermission('users', 'read'),
    getAllUsers
); // الحصول على جميع المستخدمين

// Individual user operations (parameterized routes at the end)
router.get('/:id',
    checkPermission('users', 'read'),
    getUserById
); // الحصول على مستخدم محدد

router.put('/:id',
    checkPermission('users', 'update'),
    updateUser
); // تحديث بيانات المستخدم

router.delete('/:id',
    checkPermission('users', 'delete'),
    deleteUser
); // حذف المستخدم (إلغاء تفعيل)

// User status management
router.patch('/:id/status',
    checkPermission('users', 'update'),
    updateUserStatus
); // تغيير حالة المستخدم

// Password management
router.post('/:id/reset-password',
    authorize('super_admin', 'admin'),
    resetUserPassword
); // إعادة تعيين كلمة مرور المستخدم

// Account unlock
router.post('/:id/unlock',
    authorize('super_admin', 'admin'),
    unlockUser
); // فتح حساب مستخدم مقفل

// Permissions management
router.put('/:id/permissions',
    authorize('super_admin', 'admin'),
    updateUserPermissions
); // تحديث صلاحيات المستخدم

module.exports = router; 