@echo off
chcp 65001 > nul
echo.
echo ========================================
echo 🏥 نظام إدارة المستشفى
echo ========================================
echo 📋 إنشاء حساب الادمن
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

echo 🚀 تشغيل سكريبت إنشاء حساب الادمن...
echo.
node scripts/create-admin-simple.js

echo.
echo ========================================
echo ✅ تم الانتهاء من العملية
echo ========================================
echo.
echo 💡 ملاحظة: إذا كان الخادم يعمل، يمكنك الآن:
echo    - فتح المتصفح والذهاب للموقع
echo    - تسجيل الدخول باستخدام:
echo      اسم المستخدم: admin
echo      كلمة المرور: admin123
echo.
pause 