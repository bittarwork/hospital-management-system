# مستشفى المشروع الأول الطبي
# سكريپت تشغيل النظام - Windows PowerShell

Write-Host "🏥 مستشفى المشروع الأول الطبي" -ForegroundColor Cyan
Write-Host "🚀 بدء تشغيل النظام..." -ForegroundColor Yellow
Write-Host ""

# التحقق من Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js غير مثبت. يرجى تثبيته من https://nodejs.org" -ForegroundColor Red
    exit 1
}

# التحقق من npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm غير متوفر" -ForegroundColor Red
    exit 1
}

# التحقق من MongoDB
$mongoRunning = Get-Process -Name "mongod" -ErrorAction SilentlyContinue
if ($mongoRunning) {
    Write-Host "✅ MongoDB: يعمل" -ForegroundColor Green
} else {
    Write-Host "⚠️  MongoDB: غير مشغل" -ForegroundColor Yellow
    Write-Host "   يرجى تشغيل MongoDB أولاً:" -ForegroundColor Yellow
    Write-Host "   - من خلال MongoDB Compass" -ForegroundColor Yellow
    Write-Host "   - أو تشغيل: mongod" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "هل تريد المتابعة؟ (y/n): " -ForegroundColor Yellow -NoNewline
    $continue = Read-Host
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

Write-Host ""
Write-Host "🚀 تشغيل الخوادم..." -ForegroundColor Cyan

# تشغيل Backend
Write-Host "📡 تشغيل خادم Backend..." -ForegroundColor Blue
Start-Process -FilePath "cmd" -ArgumentList "/c", "cd backend && npm run dev" -WindowStyle Normal

# انتظار قصير
Start-Sleep -Seconds 3

# تشغيل Frontend
Write-Host "🎨 تشغيل خادم Frontend..." -ForegroundColor Blue
Start-Process -FilePath "cmd" -ArgumentList "/c", "cd frontend && npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "✅ تم تشغيل النظام بنجاح!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 الروابط:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Blue
Write-Host "   Backend API: http://localhost:5000" -ForegroundColor Blue
Write-Host ""
Write-Host "🔐 بيانات تسجيل الدخول:" -ForegroundColor Cyan
Write-Host "   Email: admin@first-medical-project.com" -ForegroundColor Green
Write-Host "   Password: Admin@123456" -ForegroundColor Green
Write-Host ""
Write-Host "📝 ملاحظات:" -ForegroundColor Yellow
Write-Host "   - سيتم فتح نافذتين جديدتين للخوادم" -ForegroundColor Yellow
Write-Host "   - لإيقاف النظام، أغلق النوافذ أو اضغط Ctrl+C" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎉 النظام جاهز للاستخدام!" -ForegroundColor Green
Write-Host ""
Write-Host "اضغط أي مفتاح للخروج من هذه النافذة..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 