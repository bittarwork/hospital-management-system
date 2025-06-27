#!/bin/bash

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
