@echo off
chcp 65001 > nul
echo.
echo ========================================
echo 🏥 نظام إدارة المستشفى
echo ========================================
echo 📁 إعداد قاعدة البيانات الكاملة
echo ========================================
echo.

echo 📍 الانتقال لمجلد الخادم...
cd /d "%~dp0backend"

echo 🔍 التحقق من وجود Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ خطأ: Node.js غير مثبت على النظام
    echo 📥 يرجى تحميل وتثبيت Node.js من: https://nodejs.org
    pause
    exit /b 1
)

echo 📦 التحقق من وجود npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ خطأ: npm غير متاح
    pause
    exit /b 1
)

echo 🔧 التحقق من وجود MongoDB...
echo ⚠️  تأكد من أن MongoDB يعمل على النظام
echo.

echo 🚀 بدء إعداد قاعدة البيانات...
echo =======================================
echo 📊 سيتم إنشاء البيانات التالية:
echo    👑 حساب الادمن (admin / admin123)
echo    👥 15 مستخدم
echo    👨‍⚕️ 25 طبيب
echo    🏥 100 مريض
echo    📅 200 موعد
echo    📋 150 سجل طبي
echo    💰 180 فاتورة
echo =======================================
echo.

set /p confirm=هل تريد المتابعة؟ (Y/N): 
if /i "%confirm%" neq "Y" (
    echo ❌ تم إلغاء العملية
    pause
    exit /b 0
)

echo.
echo 🏃‍♂️ تشغيل سكريبت الإعداد...
echo.

node scripts/setup-complete-database.js

echo.
echo ========================================
echo ✅ تم الانتهاء من إعداد قاعدة البيانات
echo ========================================
echo.
echo 💡 تعليمات الاستخدام:
echo    1. تشغيل الخادم: npm run dev
echo    2. فتح المتصفح والذهاب للموقع
echo    3. تسجيل الدخول باستخدام:
echo       👤 اسم المستخدم: admin
echo       🔒 كلمة المرور: admin123
echo.
echo 🗃️ اسم قاعدة البيانات: hospital_management_system_demo
echo 🌐 عنوان قاعدة البيانات: mongodb://localhost:27017/hospital_management_system_demo
echo.
pause 