Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🏥 نظام إدارة المستشفى" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📋 إنشاء حساب الادمن" -ForegroundColor Yellow
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

Write-Host "🚀 تشغيل سكريبت إنشاء حساب الادمن..." -ForegroundColor Blue
Write-Host ""

try {
    node scripts/create-admin-simple.js
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "✅ تم الانتهاء من العملية" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 ملاحظة: إذا كان الخادم يعمل، يمكنك الآن:" -ForegroundColor Yellow
    Write-Host "   - فتح المتصفح والذهاب للموقع" -ForegroundColor White
    Write-Host "   - تسجيل الدخول باستخدام:" -ForegroundColor White
    Write-Host "     اسم المستخدم: admin" -ForegroundColor Cyan
    Write-Host "     كلمة المرور: admin123" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ خطأ في تشغيل السكريبت: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Read-Host "اضغط Enter للمتابعة..." 