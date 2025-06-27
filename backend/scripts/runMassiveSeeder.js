#!/usr/bin/env node

require('dotenv').config();
const { seedMassiveData } = require('./massiveDataSeeder');

// ألوان للطباعة
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
    console.log(`${colors[color]}${message}${colors.reset}`);
};

const header = (title) => {
    console.log('\n' + '='.repeat(60));
    log(title, 'cyan');
    console.log('='.repeat(60));
};

async function main() {
    try {
        console.clear();

        header('🏥 مستشفى المشروع الأول الطبي');
        log('📊 إنشاء البيانات التجريبية الضخمة', 'bright');

        log('⚠️  تحذير: هذه العملية ستمحو جميع البيانات الموجودة!', 'yellow');
        log('⏳ قد تستغرق العملية عدة دقائق...', 'yellow');

        // بدء العملية
        await seedMassiveData();

        header('🎉 تمت العملية بنجاح!');

        log('✅ تم إنشاء قاعدة البيانات: PRoneHos', 'green');
        log('✅ تم إنشاء البيانات التجريبية الضخمة:', 'green');
        log('   • 500 مريض مع بيانات كاملة', 'blue');
        log('   • 50 طبيب في تخصصات مختلفة', 'blue');
        log('   • 1000 موعد بحالات متنوعة', 'blue');
        log('   • 25 مستخدم بأدوار مختلفة', 'blue');
        log('   • مدير النظام الرئيسي', 'blue');

        console.log('\n' + '🔐 بيانات تسجيل الدخول:');
        log('   البريد: admin@first-medical-project.com', 'cyan');
        log('   كلمة المرور: Admin@123456', 'cyan');
        log('   الدور: مدير النظام (super_admin)', 'cyan');

        console.log('\n' + '🚀 لتشغيل النظام:');
        log('   ./تشغيل_النظام.sh', 'magenta');

        console.log('\n' + '🌐 بعد التشغيل:');
        log('   Frontend: http://localhost:3000', 'blue');
        log('   Backend: http://localhost:5000', 'blue');

        console.log('\n' + '📊 يمكنك الآن اختبار النظام مع البيانات الضخمة!');

    } catch (error) {
        header('❌ حدث خطأ أثناء إنشاء البيانات');
        log(error.message, 'red');
        console.error(error);
        process.exit(1);
    }
}

// تشغيل البرنامج
main(); 