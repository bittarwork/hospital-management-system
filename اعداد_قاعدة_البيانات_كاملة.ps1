Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🏥 نظام إدارة المستشفى" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📁 إعداد قاعدة البيانات الكاملة" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📍 الانتقال لمجلد الخادم..." -ForegroundColor Blue
$backendPath = Join-Path $PSScriptRoot "backend"
Set-Location $backendPath

Write-Host "🔍 التحقق من وجود Node.js..." -ForegroundColor Blue
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js متوفر: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ خطأ: Node.js غير مثبت على النظام" -ForegroundColor Red
    Write-Host "📥 يرجى تحميل وتثبيت Node.js من: https://nodejs.org" -ForegroundColor Yellow
    Read-Host "اضغط Enter للمتابعة..."
    exit 1
}

Write-Host "📦 التحقق من وجود npm..." -ForegroundColor Blue
try {
    $npmVersion = npm --version
    Write-Host "✅ npm متوفر: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ خطأ: npm غير متاح" -ForegroundColor Red
    Read-Host "اضغط Enter للمتابعة..."
    exit 1
}

Write-Host "🔧 التحقق من وجود MongoDB..." -ForegroundColor Blue
Write-Host "⚠️  تأكد من أن MongoDB يعمل على النظام" -ForegroundColor Yellow
Write-Host ""

Write-Host "🚀 بدء إعداد قاعدة البيانات..." -ForegroundColor Blue
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "📊 سيتم إنشاء البيانات التالية:" -ForegroundColor Yellow
Write-Host "   👑 حساب الادمن (admin / admin123)" -ForegroundColor White
Write-Host "   👥 15 مستخدم" -ForegroundColor White
Write-Host "   👨‍⚕️ 25 طبيب" -ForegroundColor White
Write-Host "   🏥 100 مريض" -ForegroundColor White
Write-Host "   📅 200 موعد" -ForegroundColor White
Write-Host "   📋 150 سجل طبي" -ForegroundColor White
Write-Host "   💰 180 فاتورة" -ForegroundColor White
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

$confirm = Read-Host "هل تريد المتابعة؟ (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "❌ تم إلغاء العملية" -ForegroundColor Red
    Read-Host "اضغط Enter للمتابعة..."
    exit 0
}

Write-Host ""
Write-Host "🏃‍♂️ تشغيل سكريبت الإعداد..." -ForegroundColor Blue
Write-Host ""

try {
    node scripts/setup-complete-database.js
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "✅ تم الانتهاء من إعداد قاعدة البيانات" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 تعليمات الاستخدام:" -ForegroundColor Yellow
    Write-Host "   1. تشغيل الخادم: npm run dev" -ForegroundColor White
    Write-Host "   2. فتح المتصفح والذهاب للموقع" -ForegroundColor White
    Write-Host "   3. تسجيل الدخول باستخدام:" -ForegroundColor White
    Write-Host "      👤 اسم المستخدم: admin" -ForegroundColor Cyan
    Write-Host "      🔒 كلمة المرور: admin123" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🗃️ اسم قاعدة البيانات: hospital_management_system_demo" -ForegroundColor Green
    Write-Host "🌐 عنوان قاعدة البيانات: mongodb://localhost:27017/hospital_management_system_demo" -ForegroundColor Green
    
} catch {
    Write-Host "❌ خطأ في تشغيل السكريبت: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Read-Host "اضغط Enter للمتابعة..." 