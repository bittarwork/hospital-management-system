const express = require('express');
const router = express.Router();

// Import middleware
const { authenticate } = require('../middleware/auth');

// Import controller functions
const {
    login,
    logout,
    getCurrentUser,
    changePassword,
    forgotPassword,
    resetPassword,
    updatePreferences
} = require('../controllers/authController');

// ========== Public Routes (لا تحتاج تسجيل دخول) ==========

// تسجيل الدخول
router.post('/login', login);

// نسيت كلمة المرور
router.post('/forgot-password', forgotPassword);

// إعادة تعيين كلمة المرور
router.post('/reset-password', resetPassword);

// ========== Protected Routes (تحتاج تسجيل دخول) ==========

// تسجيل الخروج
router.post('/logout', authenticate, logout);

// الحصول على بيانات المستخدم الحالي
router.get('/me', authenticate, getCurrentUser);

// تحديد صحة التوكن والصلاحيات (للتشخيص)
router.get('/debug', authenticate, (req, res) => {
    try {
        const user = req.user;
        res.status(200).json({
            status: 'success',
            debug: {
                userId: user._id,
                username: user.username,
                role: user.role,
                status: user.status,
                permissions: user.permissions,
                hasPatientRead: user.hasPermission('patients', 'read'),
                hasPatientManage: user.hasPermission('patients', 'manage'),
                isSuperAdmin: user.role === 'super_admin',
                tokenValid: true
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Debug error',
            error: error.message
        });
    }
});

// تغيير كلمة المرور
router.put('/change-password', authenticate, changePassword);

// تحديث تفضيلات المستخدم
router.put('/preferences', authenticate, updatePreferences);

module.exports = router; 