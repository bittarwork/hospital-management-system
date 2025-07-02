@echo off
echo.
echo 🏥 مستشفى المشروع الأول الطبي
echo 🚀 تشغيل النظام...
echo.

echo 📡 تشغيل خادم Backend...
start "Backend Server" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo 🎨 تشغيل خادم Frontend...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ تم تشغيل النظام بنجاح!
echo.
echo 🌐 الروابط:
echo    Frontend: http://localhost:3000
echo    Backend: http://localhost:5000
echo.
echo 🔐 بيانات تسجيل الدخول:
echo    Email: admin@first-medical-project.com
echo    Password: Admin@123456
echo.
echo سيتم فتح نافذتين منفصلتين للخوادم
echo اضغط أي مفتاح للخروج...
pause >nul 