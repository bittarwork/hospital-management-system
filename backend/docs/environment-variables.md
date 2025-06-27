# متغيرات البيئة المطلوبة

## إعداد ملف .env

قم بإنشاء ملف `.env` في المجلد الجذر للمشروع وإضافة المتغيرات التالية:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/hospital_management_db

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-for-hospital-system-2024
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Hospital Information
HOSPITAL_NAME=مستشفى ماهر العلي
HOSPITAL_ADDRESS=المملكة العربية السعودية
HOSPITAL_PHONE=+966-11-1234567
HOSPITAL_EMAIL=info@maherhospital.com
```

## وصف المتغيرات

### إعدادات الخادم

- `NODE_ENV`: بيئة التشغيل (development/production)
- `PORT`: منفذ الخادم (افتراضي: 5000)

### إعدادات قاعدة البيانات

- `MONGODB_URI`: رابط الاتصال بقاعدة بيانات MongoDB

### إعدادات الواجهة الأمامية

- `FRONTEND_URL`: رابط الواجهة الأمامية للنظام

### إعدادات JWT

- `JWT_SECRET`: المفتاح السري لتشفير JWT (يجب تغييره في الإنتاج)
- `JWT_EXPIRES_IN`: مدة صلاحية التوكن

### إعدادات CORS

- `CORS_ORIGIN`: النطاق المسموح له بالوصول للـ API

### إعدادات Rate Limiting

- `RATE_LIMIT_WINDOW_MS`: مدة النافذة الزمنية بالميللي ثانية
- `RATE_LIMIT_MAX_REQUESTS`: الحد الأقصى للطلبات في النافزة الزمنية

### إعدادات البريد الإلكتروني (اختيارية)

- `EMAIL_HOST`: خادم البريد الإلكتروني
- `EMAIL_PORT`: منفذ البريد الإلكتروني
- `EMAIL_USER`: اسم المستخدم للبريد الإلكتروني
- `EMAIL_PASSWORD`: كلمة مرور البريد الإلكتروني

### معلومات المستشفى

- `HOSPITAL_NAME`: اسم المستشفى
- `HOSPITAL_ADDRESS`: عنوان المستشفى
- `HOSPITAL_PHONE`: هاتف المستشفى
- `HOSPITAL_EMAIL`: بريد المستشفى الإلكتروني

## ملاحظات مهمة

1. **لا تضع معلومات حساسة في الكود**: استخدم متغيرات البيئة دائماً
2. **غيّر JWT_SECRET**: استخدم مفتاح سري قوي ومعقد في الإنتاج
3. **احم ملف .env**: لا تضعه في version control
4. **استخدم HTTPS في الإنتاج**: لحماية البيانات المنقولة
