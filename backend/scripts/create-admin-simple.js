const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

// تحميل متغيرات البيئة
dotenv.config();

// الاتصال بقاعدة البيانات
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/PRoneHos');
        console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
    } catch (error) {
        console.error('❌ فشل الاتصال بقاعدة البيانات:', error.message);
        process.exit(1);
    }
};

// إنشاء حساب ادمن جديد باسم admin
const createNewAdminAccount = async () => {
    try {
        // التحقق من وجود حساب بالاسم المطلوب
        const existingAdminByUsername = await User.findOne({ username: 'admin' });

        if (existingAdminByUsername) {
            console.log('✅ حساب الادمن باسم "admin" موجود بالفعل!');
            console.log('👤 اسم المستخدم: admin');
            console.log('🔒 كلمة المرور: admin123');
            return;
        }

        // إنشاء حساب ادمن جديد
        const newAdminUser = new User({
            firstName: 'مدير',
            lastName: 'النظام',
            username: 'admin',
            email: 'admin@hospital-system.com',
            password: 'admin123',
            phone: '+966501234568',
            role: 'super_admin',
            department: 'Administration',
            position: 'مدير النظام الرئيسي',
            status: 'active',
            isVerified: true,
            mustChangePassword: false,
            permissions: User.getDefaultPermissions('super_admin')
        });

        await newAdminUser.save();

        console.log('✅ تم إنشاء حساب ادمن جديد باسم "admin"!');
        console.log('=====================================');
        console.log('👤 اسم المستخدم: admin');
        console.log('🔒 كلمة المرور: admin123');
        console.log('📧 الايميل:', newAdminUser.email);
        console.log('🆔 رقم الموظف:', newAdminUser.employeeId);
        console.log('=====================================');

    } catch (error) {
        console.error('❌ خطأ في إنشاء الحساب الجديد:', error.message);
        if (error.code === 11000) {
            console.error('⚠️  اسم المستخدم أو الايميل موجود بالفعل');
        }
    }
};

// إنشاء حساب الادمن
const createAdminAccount = async () => {
    try {
        // التحقق من وجود حساب ادمن مسبقاً
        const existingAdmin = await User.findOne({
            $or: [
                { username: 'admin' },
                { role: 'super_admin' }
            ]
        });

        if (existingAdmin) {
            console.log('⚠️  حساب الادمن موجود بالفعل!');
            console.log('📧 الايميل:', existingAdmin.email);
            console.log('👤 اسم المستخدم:', existingAdmin.username);
            console.log('🆔 رقم الموظف:', existingAdmin.employeeId);
            console.log('');
            console.log('🔑 لتسجيل الدخول استخدم:');
            console.log('   - اسم المستخدم:', existingAdmin.username);
            console.log('   - كلمة المرور: (كلمة المرور المحفوظة)');
            console.log('');
            console.log('⚡ هل تريد إنشاء حساب ادمن جديد باسم "admin"؟');
            console.log('   سيتم إنشاء حساب إضافي مع الصلاحيات الكاملة');

            // إنشاء حساب ادمن جديد باسم admin
            await createNewAdminAccount();
            return;
        }

        // إنشاء حساب ادمن جديد
        const adminUser = new User({
            firstName: 'مدير',
            lastName: 'النظام',
            username: 'admin',
            email: 'admin@hospital.com',
            password: 'admin123',
            phone: '+966501234567',
            role: 'super_admin',
            department: 'Administration',
            position: 'مدير النظام الرئيسي',
            status: 'active',
            isVerified: true,
            mustChangePassword: false,
            permissions: User.getDefaultPermissions('super_admin')
        });

        // حفظ الحساب في قاعدة البيانات
        await adminUser.save();

        console.log('✅ تم إنشاء حساب الادمن بنجاح!');
        console.log('=====================================');
        console.log('👤 اسم المستخدم: admin');
        console.log('🔒 كلمة المرور: admin123');
        console.log('📧 الايميل:', adminUser.email);
        console.log('🆔 رقم الموظف:', adminUser.employeeId);
        console.log('🏥 القسم:', adminUser.department);
        console.log('💼 المنصب:', adminUser.position);
        console.log('=====================================');
        console.log('');
        console.log('🚨 مهم: يُنصح بتغيير كلمة المرور بعد تسجيل الدخول الأول!');

    } catch (error) {
        console.error('❌ خطأ في إنشاء حساب الادمن:', error.message);
        if (error.code === 11000) {
            console.error('⚠️  اسم المستخدم أو الايميل موجود بالفعل');
        }
    }
};

// الوظيفة الرئيسية
const main = async () => {
    console.log('🏥 نظام إدارة المستشفى - إنشاء حساب الادمن');
    console.log('==========================================\n');

    await connectDB();
    await createAdminAccount();

    console.log('\n📖 تعليمات الاستخدام:');
    console.log('1. تشغيل الخادم: npm run dev');
    console.log('2. فتح المتصفح والذهاب للموقع');
    console.log('3. تسجيل الدخول باستخدام:');
    console.log('   - اسم المستخدم: admin');
    console.log('   - كلمة المرور: admin123');

    // إغلاق الاتصال بقاعدة البيانات
    mongoose.connection.close();
    process.exit(0);
};

// التعامل مع إنهاء العملية
process.on('SIGINT', () => {
    mongoose.connection.close();
    console.log('\n👋 تم إنهاء العملية');
    process.exit(0);
});

// تشغيل السكريبت
main().catch(error => {
    console.error('❌ فشل تشغيل السكريبت:', error);
    mongoose.connection.close();
    process.exit(1);
}); 