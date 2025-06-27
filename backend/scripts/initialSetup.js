#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const mongoose = require('mongoose');
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

// التحقق من المتطلبات
async function checkRequirements() {
    header('🔍 التحقق من المتطلبات الأساسية');

    try {
        // التحقق من Node.js
        const nodeVersion = process.version;
        log(`✅ Node.js: ${nodeVersion}`, 'green');

        // التحقق من npm
        const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
        log(`✅ npm: v${npmVersion}`, 'green');

        // التحقق من MongoDB
        try {
            execSync('mongod --version', { encoding: 'utf8', stdio: 'pipe' });
            log('✅ MongoDB: متوفر', 'green');
        } catch (error) {
            log('⚠️  MongoDB: غير متوفر أو غير مشغل', 'yellow');
            log('   يرجى التأكد من تشغيل MongoDB قبل المتابعة', 'yellow');
        }

        return true;
    } catch (error) {
        log('❌ خطأ في التحقق من المتطلبات', 'red');
        console.error(error.message);
        return false;
    }
}

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

// تثبيت التبعيات
async function installDependencies() {
    header('📦 تثبيت التبعيات');

    try {
        log('🔄 تثبيت تبعيات Backend...', 'yellow');
        execSync('npm install', {
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit'
        });
        log('✅ تم تثبيت تبعيات Backend', 'green');

        const frontendPath = path.join(__dirname, '..', '..', 'frontend');
        if (fs.existsSync(frontendPath)) {
            log('🔄 تثبيت تبعيات Frontend...', 'yellow');
            execSync('npm install', {
                cwd: frontendPath,
                stdio: 'inherit'
            });
            log('✅ تم تثبيت تبعيات Frontend', 'green');
        }

    } catch (error) {
        log('❌ فشل في تثبيت التبعيات', 'red');
        console.error(error.message);
        throw error;
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

// إنشاء البيانات التجريبية
async function setupDatabase() {
    header('🗃️  إعداد قاعدة البيانات والبيانات التجريبية');

    try {
        log('🔄 بدء إنشاء البيانات التجريبية الضخمة...', 'yellow');
        log('⚠️  هذه العملية قد تستغرق عدة دقائق', 'yellow');

        await seedMassiveData();

        log('✅ تم إعداد قاعدة البيانات بنجاح', 'green');

    } catch (error) {
        log('❌ فشل في إعداد قاعدة البيانات', 'red');
        console.error(error.message);
        throw error;
    }
}

// إنشاء سكريپتات التشغيل
async function createRunScripts() {
    header('📜 إنشاء سكريپتات التشغيل');

    // سكريپت تشغيل Backend
    const backendScript = `#!/bin/bash
echo "🚀 تشغيل خادم Backend..."
cd backend
npm run dev
`;

    // سكريپت تشغيل Frontend
    const frontendScript = `#!/bin/bash
echo "🎨 تشغيل خادم Frontend..."
cd frontend
npm run dev
`;

    // سكريپت تشغيل شامل
    const fullScript = `#!/bin/bash
echo "🏥 مرحباً بك في مستشفى المشروع الأول الطبي"
echo "🚀 تشغيل النظام الكامل..."
echo ""

# تشغيل Backend في خلفية
echo "📡 تشغيل خادم Backend..."
cd backend && npm run dev &
BACKEND_PID=$!

# انتظار قليل
sleep 3

# تشغيل Frontend
echo "🎨 تشغيل خادم Frontend..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ تم تشغيل النظام بنجاح!"
echo "🌐 Frontend: http://localhost:3000"
echo "📡 Backend: http://localhost:5000"
echo ""
echo "🔐 بيانات تسجيل الدخول:"
echo "   Email: admin@first-medical-project.com"
echo "   Password: Admin@123456"
echo ""
echo "للإيقاف اضغط Ctrl+C"

# انتظار الإشارة للإيقاف
trap "echo '🛑 إيقاف النظام...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

wait
`;

    try {
        const rootPath = path.join(__dirname, '..', '..');

        // إنشاء السكريپتات
        fs.writeFileSync(path.join(rootPath, 'start-backend.sh'), backendScript);
        fs.writeFileSync(path.join(rootPath, 'start-frontend.sh'), frontendScript);
        fs.writeFileSync(path.join(rootPath, 'start-hospital.sh'), fullScript);

        // جعل السكريپتات قابلة للتنفيذ (في Unix)
        if (process.platform !== 'win32') {
            execSync('chmod +x start-*.sh', { cwd: rootPath });
        }

        log('✅ تم إنشاء سكريپتات التشغيل', 'green');
        log('   - start-backend.sh (تشغيل Backend فقط)', 'blue');
        log('   - start-frontend.sh (تشغيل Frontend فقط)', 'blue');
        log('   - start-hospital.sh (تشغيل النظام كاملاً)', 'blue');

    } catch (error) {
        log('❌ فشل في إنشاء سكريپتات التشغيل', 'red');
        console.error(error.message);
    }
}

// إنشاء ملف تعليمات التشغيل
async function createReadme() {
    header('📚 إنشاء ملف التعليمات');

    const readmeContent = `# 🏥 مستشفى المشروع الأول الطبي

## التشغيل الأولي للمشروع وتعبئة البيانات التجريبية

تم إعداد هذا المشروع بنجاح مع بيانات تجريبية ضخمة للتجربة والاختبار.

## 🚀 طرق التشغيل

### 1. التشغيل الكامل للنظام
\`\`\`bash
./start-hospital.sh
\`\`\`

### 2. تشغيل Backend فقط
\`\`\`bash
./start-backend.sh
\`\`\`

### 3. تشغيل Frontend فقط
\`\`\`bash
./start-frontend.sh
\`\`\`

### 4. التشغيل اليدوي

#### Backend:
\`\`\`bash
cd backend
npm run dev
\`\`\`

#### Frontend:
\`\`\`bash
cd frontend
npm run dev
\`\`\`

## 🔐 بيانات تسجيل الدخول

**مدير النظام:**
- البريد الإلكتروني: \`admin@first-medical-project.com\`
- كلمة المرور: \`Admin@123456\`
- الدور: \`super_admin\`

## 📊 البيانات التجريبية

تم إنشاء البيانات التالية:
- **500 مريض** مع بيانات شخصية وطبية كاملة
- **50 طبيب** في تخصصات مختلفة
- **1000 موعد** بحالات متنوعة
- **25 مستخدم** بأدوار مختلفة
- بيانات أخرى شاملة للاختبار

## 🌐 الروابط

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **قاعدة البيانات:** PRoneHos

## 📝 إعادة إنشاء البيانات

لإعادة إنشاء البيانات التجريبية:

\`\`\`bash
cd backend
node scripts/initialSetup.js
\`\`\`

## 🛠️ إعدادات إضافية

يمكن تعديل الإعدادات في ملف \`.env\`:
- أعداد البيانات التجريبية
- معلومات قاعدة البيانات
- بيانات المدير
- إعدادات أخرى

## 📞 الدعم

للمساعدة أو الاستفسارات، يرجى مراجعة الوثائق أو التواصل مع فريق التطوير.

---
**مستشفى المشروع الأول الطبي** - نظام إدارة طبية متطور
`;

    try {
        const readmePath = path.join(__dirname, '..', '..', 'التشغيل_الاولي_للمشروع.md');
        fs.writeFileSync(readmePath, readmeContent);
        log('✅ تم إنشاء ملف التعليمات: التشغيل_الاولي_للمشروع.md', 'green');
    } catch (error) {
        log('❌ فشل في إنشاء ملف التعليمات', 'red');
        console.error(error.message);
    }
}

// الدالة الرئيسية
async function main() {
    try {
        console.clear();

        log('🏥 مرحباً بك في مستشفى المشروع الأول الطبي', 'bright');
        log('🚀 برنامج التشغيل الأولي وإعداد البيانات التجريبية', 'bright');

        // التحقق من المتطلبات
        const requirementsMet = await checkRequirements();
        if (!requirementsMet) {
            log('❌ يرجى تلبية المتطلبات الأساسية أولاً', 'red');
            process.exit(1);
        }

        // إنشاء ملف .env
        await createEnvFile();

        // تحميل متغيرات البيئة
        require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

        // تثبيت التبعيات
        await installDependencies();

        // اختبار قاعدة البيانات
        const dbConnected = await testDatabaseConnection();
        if (!dbConnected) {
            log('❌ يرجى تشغيل MongoDB والمحاولة مرة أخرى', 'red');
            process.exit(1);
        }

        // إعداد قاعدة البيانات
        await setupDatabase();

        // إنشاء سكريپتات التشغيل
        await createRunScripts();

        // إنشاء ملف التعليمات
        await createReadme();

        // النتيجة النهائية
        header('🎉 تم إعداد المشروع بنجاح!');

        log('✅ تم إنشاء قاعدة البيانات: PRoneHos', 'green');
        log('✅ تم إنشاء البيانات التجريبية الضخمة', 'green');
        log('✅ تم إعداد جميع الملفات والسكريپتات', 'green');

        console.log('\n' + '🔐 بيانات تسجيل الدخول:');
        log(`   البريد: admin@first-medical-project.com`, 'cyan');
        log(`   كلمة المرور: Admin@123456`, 'cyan');

        console.log('\n' + '🚀 لتشغيل النظام:');
        log('   ./start-hospital.sh', 'magenta');

        console.log('\n' + '🌐 بعد التشغيل:');
        log('   Frontend: http://localhost:3000', 'blue');
        log('   Backend: http://localhost:5000', 'blue');

        console.log('\n' + '📚 للمزيد من المعلومات:');
        log('   اقرأ ملف: التشغيل_الاولي_للمشروع.md', 'yellow');

    } catch (error) {
        header('❌ حدث خطأ أثناء الإعداد');
        console.error(error);
        process.exit(1);
    }
}

// تشغيل البرنامج
if (require.main === module) {
    main();
}

module.exports = { main }; 