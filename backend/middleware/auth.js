const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'hospital-management-super-secret-jwt-key-2024';

// Middleware للتحقق من صحة التوكن
const authenticate = async (req, res, next) => {
    try {
        let token;

        // الحصول على التوكن من الهيدر
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // التحقق من وجود التوكن
        if (!token) {
            return res.status(401).json({
                status: 'fail',
                message: 'غير مسموح. يرجى تسجيل الدخول أولاً'
            });
        }

        // التحقق من صحة التوكن
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    status: 'fail',
                    message: 'التوكن غير صحيح'
                });
            } else if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    status: 'fail',
                    message: 'انتهت صلاحية جلسة العمل. يرجى تسجيل الدخول مرة أخرى'
                });
            } else {
                return res.status(401).json({
                    status: 'fail',
                    message: 'خطأ في التحقق من التوكن'
                });
            }
        }

        // البحث عن المستخدم
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({
                status: 'fail',
                message: 'المستخدم غير موجود'
            });
        }

        // التحقق من حالة الحساب
        if (currentUser.status !== 'active') {
            return res.status(401).json({
                status: 'fail',
                message: 'الحساب غير نشط'
            });
        }

        // إضافة المستخدم لطلب الشبكة
        req.user = currentUser;
        next();

    } catch (error) {
        console.error('❌ Authentication Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'خطأ في الخادم أثناء التحقق من الهوية'
        });
    }
};

// Middleware للتحقق من الصلاحيات
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'fail',
                message: 'غير مسموح. يرجى تسجيل الدخول أولاً'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'fail',
                message: 'غير مسموح. ليس لديك صلاحية للوصول لهذا المورد'
            });
        }

        next();
    };
};

// Middleware للتحقق من صلاحية إجراء معين
const checkPermission = (resource, action) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'fail',
                message: 'غير مسموح. يرجى تسجيل الدخول أولاً'
            });
        }

        // المدير العام له جميع الصلاحيات
        if (req.user.role === 'super_admin') {
            return next();
        }

        // التحقق من الصلاحيات المحددة
        const hasPermission = req.user.hasPermission(resource, action);

        if (!hasPermission) {
            return res.status(403).json({
                status: 'fail',
                message: `غير مسموح. ليس لديك صلاحية ${action} على ${resource}`
            });
        }

        next();
    };
};

// Middleware اختياري للتحقق من التوكن (لا يرجع خطأ إذا لم يوجد)
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                const currentUser = await User.findById(decoded.id);

                if (currentUser && currentUser.status === 'active') {
                    req.user = currentUser;
                }
            } catch (error) {
                // تجاهل الأخطاء في الوضع الاختياري
                console.warn('Optional auth failed:', error.message);
            }
        }

        next();
    } catch (error) {
        console.error('❌ Optional Auth Error:', error);
        next(); // المتابعة حتى لو فشل
    }
};

module.exports = {
    authenticate,
    authorize,
    checkPermission,
    optionalAuth,
    // تصدير مع الأسماء المستخدمة في الطرق
    protect: authenticate,
    restrictTo: authorize
}; 