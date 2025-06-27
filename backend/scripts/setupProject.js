#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const mongoose = require('mongoose');

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

// إنشاء ملف .env
async function createEnvFile() {
    header('📝 إعداد ملف متغيرات البيئة');

    const envPath = path.join(__dirname, '..', '.env');

    if (fs.existsSync(envPath)) {
        log('✅ ملف .env موجود بالفعل', 'green');
        return;
    }

    const envContent = `# Node Environment
NODE_ENV=development

# Server Configuration
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/PRoneHos

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=super-secure-jwt-secret-for-pronehospital-2024-advanced-system
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=

# Hospital Information
HOSPITAL_NAME=مستشفى المشروع الأول الطبي
HOSPITAL_ADDRESS=الرياض، المملكة العربية السعودية
HOSPITAL_PHONE=+966-11-9876543
HOSPITAL_EMAIL=info@first-medical-project.com

# Admin User Configuration
ADMIN_EMAIL=admin@first-medical-project.com
ADMIN_PASSWORD=Admin@123456
ADMIN_NAME=مدير النظام
ADMIN_PHONE=+966501234567

# Data Seeding Configuration
SEED_LARGE_DATA=true
TOTAL_PATIENTS=500
TOTAL_DOCTORS=50
TOTAL_APPOINTMENTS=1000
TOTAL_MEDICAL_RECORDS=800
TOTAL_INVOICES=1200
`;

    try {
        fs.writeFileSync(envPath, envContent);
        log('✅ تم إنشاء ملف .env بنجاح', 'green');
    } catch (error) {
        log('❌ فشل في إنشاء ملف .env', 'red');
        console.error(error.message);
    }
}

// اختبار الاتصال بقاعدة البيانات
async function testDatabaseConnection() {
    header('🔌 اختبار الاتصال بقاعدة البيانات');

    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/PRoneHos';
        log(`🔄 محاولة الاتصال بـ: ${mongoUri}`, 'yellow');

        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000
        });

        log('✅ تم الاتصال بقاعدة البيانات بنجاح', 'green');
        log(`📊 اسم قاعدة البيانات: PRoneHos`, 'blue');

        await mongoose.disconnect();
        return true;

    } catch (error) {
        log('❌ فشل في الاتصال بقاعدة البيانات', 'red');
        log('   يرجى التأكد من تشغيل MongoDB', 'yellow');
        console.error(error.message);
        return false;
    }
}

// إنشاء سكريپت التشغيل
async function createStartScript() {
    header('📜 إنشاء سكريپت التشغيل');

    const startScript = `#!/bin/bash

echo "🏥 مستشفى المشروع الأول الطبي"
echo "🚀 بدء تشغيل النظام..."
echo ""

# التحقق من MongoDB
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB غير مشغل. يرجى تشغيله أولاً:"
    echo "   sudo systemctl start mongod"
    echo "   أو:"
    echo "   mongod"
    exit 1
fi

# تشغيل Backend
echo "📡 تشغيل خادم Backend..."
cd backend && npm run dev &
BACKEND_PID=$!

# انتظار قصير
sleep 3

# تشغيل Frontend
echo "🎨 تشغيل خادم Frontend..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ تم تشغيل النظام بنجاح!"
echo ""
echo "🌐 الروابط:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo ""
echo "🔐 بيانات تسجيل الدخول:"
echo "   Email: admin@first-medical-project.com"
echo "   Password: Admin@123456"
echo ""
echo "للإيقاف اضغط Ctrl+C"

# انتظار الإشارة للإيقاف
trap "echo ''; echo '🛑 إيقاف النظام...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

wait
`;

    try {
        const rootPath = path.join(__dirname, '..', '..');
        const scriptPath = path.join(rootPath, 'تشغيل_النظام.sh');

        fs.writeFileSync(scriptPath, startScript);

        // جعل السكريپت قابل للتنفيذ
        if (process.platform !== 'win32') {
            execSync(`chmod +x "${scriptPath}"`);
        }

        log('✅ تم إنشاء سكريپت التشغيل: تشغيل_النظام.sh', 'green');

    } catch (error) {
        log('❌ فشل في إنشاء سكريپت التشغيل', 'red');
        console.error(error.message);
    }
}

// الدالة الرئيسية
async function setupProject() {
    try {
        console.clear();

        log('🏥 مستشفى المشروع الأول الطبي', 'bright');
        log('⚙️  إعداد المشروع والبيئة', 'bright');

        // إنشاء ملف .env
        await createEnvFile();

        // تحميل متغيرات البيئة
        try {
            require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
        } catch (error) {
            // dotenv قد لا يكون مثبت، سنستخدم القيم الافتراضية
        }

        // اختبار قاعدة البيانات
        const dbConnected = await testDatabaseConnection();
        if (!dbConnected) {
            log('❌ يرجى تشغيل MongoDB والمحاولة مرة أخرى', 'red');
            return false;
        }

        // إنشاء سكريپت التشغيل
        await createStartScript();

        header('✅ تم إعداد المشروع بنجاح!');
        log('الآن يمكنك تشغيل: node scripts/massiveDataSeeder.js', 'green');

        return true;

    } catch (error) {
        log('❌ حدث خطأ أثناء الإعداد', 'red');
        console.error(error);
        return false;
    }
}

module.exports = { setupProject };

// تشغيل إذا كان الملف الرئيسي
if (require.main === module) {
    setupProject();
} 