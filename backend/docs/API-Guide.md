# دليل استخدام API - نظام إدارة مستشفى ماهر العلي

## 🔗 URL الأساسي

```
http://localhost:5000/api
```

## 🔐 المصادقة

جميع المسارات محمية باستثناء مسارات المصادقة العامة. يجب إرسال JWT token في:

- **Header:** `Authorization: Bearer <token>`
- **Cookie:** `jwt=<token>`

## 📋 مسارات المصادقة

### 1. تسجيل الدخول

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**الاستجابة الناجحة (200):**

```json
{
  "status": "success",
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": "60d5ec49f8b4c72a3c8b4567",
      "firstName": "System",
      "lastName": "Administrator",
      "username": "admin",
      "email": "admin@maherhospital.com",
      "role": "super_admin",
      "department": "Administration",
      "employeeId": "SUP20240001",
      "permissions": [...],
      "mustChangePassword": false
    }
  }
}
```

### 2. تسجيل الخروج

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### 3. التحقق من التوكن

```http
GET /api/auth/verify-token
Authorization: Bearer <token>
```

### 4. تغيير كلمة المرور

```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "admin123",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

### 5. بيانات المستخدم الحالي

```http
GET /api/auth/me
Authorization: Bearer <token>
```

## 👥 إدارة المستخدمين

### 1. إنشاء مستخدم جديد

```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "أحمد",
  "lastName": "محمد",
  "username": "doctor1",
  "email": "doctor1@maherhospital.com",
  "password": "doctor123",
  "phone": "+966501234568",
  "role": "doctor",
  "department": "Internal Medicine",
  "position": "Senior Consultant"
}
```

**الأدوار المتاحة:**

- `super_admin`, `admin`, `doctor`, `nurse`, `receptionist`
- `pharmacist`, `lab_technician`, `radiologist`, `accountant`, `manager`

### 2. جميع المستخدمين

```http
GET /api/users?page=1&limit=10&role=doctor&department=Emergency
Authorization: Bearer <token>
```

### 3. مستخدم محدد

```http
GET /api/users/:id
Authorization: Bearer <token>
```

### 4. تحديث مستخدم

```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "department": "Emergency",
  "position": "Head of Department"
}
```

### 5. حذف مستخدم

```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

### 6. تغيير حالة المستخدم

```http
PATCH /api/users/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "active"
}
```

**الحالات المتاحة:** `active`, `inactive`, `suspended`

### 7. إعادة تعيين كلمة المرور

```http
POST /api/users/:id/reset-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "newPassword": "newPassword123"
}
```

### 8. فتح حساب مقفل

```http
POST /api/users/:id/unlock
Authorization: Bearer <token>
```

### 9. إحصائيات المستخدمين

```http
GET /api/users/stats
Authorization: Bearer <token>
```

### 10. البحث عن المستخدمين

```http
GET /api/users/search?query=أحمد&role=doctor&department=Emergency
Authorization: Bearer <token>
```

## 🏥 إدارة المرضى

### 1. إنشاء مريض جديد

```http
POST /api/patients
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "علي",
  "lastName": "أحمد",
  "dateOfBirth": "1990-05-15",
  "gender": "male",
  "phone": "+966501234567",
  "email": "ali@example.com",
  "address": {
    "street": "شارع الملك فهد",
    "city": "الرياض",
    "country": "Saudi Arabia"
  },
  "emergencyContact": {
    "name": "فاطمة أحمد",
    "relationship": "spouse",
    "phone": "+966501234568"
  },
  "bloodType": "A+"
}
```

### 2. جميع المرضى

```http
GET /api/patients?page=1&limit=10
Authorization: Bearer <token>
```

### 3. مريض محدد

```http
GET /api/patients/:id
Authorization: Bearer <token>
```

### 4. تحديث بيانات المريض

```http
PUT /api/patients/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "phone": "+966501234569",
  "bloodType": "B+"
}
```

### 5. البحث عن المرضى

```http
GET /api/patients/search?query=علي&status=active
Authorization: Bearer <token>
```

### 6. العلامات الحيوية للمريض

```http
GET /api/patients/:id/vitals
POST /api/patients/:id/vitals
Authorization: Bearer <token>
Content-Type: application/json

{
  "bloodPressure": {
    "systolic": 120,
    "diastolic": 80
  },
  "heartRate": {
    "value": 72
  },
  "temperature": {
    "value": 36.5
  },
  "weight": {
    "value": 70
  },
  "height": {
    "value": 175
  }
}
```

### 7. حساسيات المريض

```http
GET /api/patients/:id/allergies
POST /api/patients/:id/allergies
Authorization: Bearer <token>
Content-Type: application/json

{
  "allergen": "Penicillin",
  "severity": "severe",
  "reaction": "Rash and difficulty breathing"
}
```

### 8. أدوية المريض

```http
GET /api/patients/:id/medications
POST /api/patients/:id/medications
Authorization: Bearer <token>
Content-Type: application/json

{
  "medicationName": "Paracetamol",
  "dosage": "500mg",
  "frequency": "Every 6 hours",
  "startDate": "2024-01-15"
}
```

### 9. مواعيد المريض

```http
GET /api/patients/:id/appointments
Authorization: Bearer <token>
```

### 10. السجلات الطبية للمريض

```http
GET /api/patients/:id/medical-records
Authorization: Bearer <token>
```

## 👨‍⚕️ إدارة الأطباء

### 1. إنشاء طبيب جديد

```http
POST /api/doctors
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "د. محمد",
  "lastName": "عبدالله",
  "specialization": "Internal Medicine",
  "phone": "+966501234570",
  "email": "dr.mohammed@maherhospital.com",
  "licenseNumber": "MED123456",
  "licenseExpiryDate": "2025-12-31",
  "yearsOfExperience": 10,
  "department": "Internal Medicine",
  "consultationFee": 200
}
```

### 2. جميع الأطباء

```http
GET /api/doctors?page=1&limit=10&specialization=Cardiology
Authorization: Bearer <token>
```

### 3. طبيب محدد

```http
GET /api/doctors/:id
Authorization: Bearer <token>
```

## 📅 إدارة المواعيد

### 1. إنشاء موعد جديد

```http
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "patient": "60d5ec49f8b4c72a3c8b4567",
  "doctor": "60d5ec49f8b4c72a3c8b4568",
  "appointmentDate": "2024-02-15",
  "appointmentTime": "10:00",
  "appointmentType": "consultation",
  "reasonForVisit": "Regular checkup",
  "priority": "normal"
}
```

### 2. جميع المواعيد

```http
GET /api/appointments?page=1&limit=10&status=scheduled
Authorization: Bearer <token>
```

### 3. موعد محدد

```http
GET /api/appointments/:id
Authorization: Bearer <token>
```

## 💰 إدارة الفواتير

### 1. إنشاء فاتورة جديدة

```http
POST /api/invoices
Authorization: Bearer <token>
Content-Type: application/json

{
  "patient": "60d5ec49f8b4c72a3c8b4567",
  "appointment": "60d5ec49f8b4c72a3c8b4569",
  "invoiceType": "consultation",
  "lineItems": [
    {
      "itemName": "Consultation Fee",
      "quantity": 1,
      "unitPrice": 200,
      "totalPrice": 200
    }
  ],
  "subtotal": 200,
  "totalAmount": 200
}
```

### 2. جميع الفواتير

```http
GET /api/invoices?page=1&limit=10&paymentStatus=unpaid
Authorization: Bearer <token>
```

## 📋 السجلات الطبية

### 1. إنشاء سجل طبي جديد

```http
POST /api/medical-records
Authorization: Bearer <token>
Content-Type: application/json

{
  "patient": "60d5ec49f8b4c72a3c8b4567",
  "doctor": "60d5ec49f8b4c72a3c8b4568",
  "appointment": "60d5ec49f8b4c72a3c8b4569",
  "recordType": "consultation",
  "chiefComplaint": "Chest pain",
  "assessment": {
    "primaryDiagnosis": {
      "condition": "Hypertension",
      "icdCode": "I10"
    }
  }
}
```

### 2. جميع السجلات الطبية

```http
GET /api/medical-records?page=1&limit=10
Authorization: Bearer <token>
```

## ❌ رموز الخطأ الشائعة

- **400** - طلب غير صحيح (بيانات مفقودة أو خاطئة)
- **401** - غير مصرح (توكن مفقود أو منتهي الصلاحية)
- **403** - ممنوع (صلاحيات غير كافية)
- **404** - غير موجود
- **429** - كثرة الطلبات (Rate limiting)
- **500** - خطأ في الخادم

## 📝 ملاحظات مهمة

1. **جميع التواريخ** بصيغة ISO 8601: `YYYY-MM-DD`
2. **جميع الأوقات** بصيغة 24 ساعة: `HH:MM`
3. **أرقام الهاتف** يجب أن تبدأ بـ `+` وتتضمن رمز البلد
4. **كلمات المرور** يجب أن تكون 6 أحرف على الأقل
5. **التوكن** صالح لمدة 7 أيام افتراضياً
6. **Rate Limiting** محدود بـ 100 طلب كل 15 دقيقة

## 🔧 أدوات الاختبار المفيدة

- **Postman** - لاختبار APIs
- **Thunder Client** (VS Code Extension)
- **curl** - من terminal
- **httpie** - أداة CLI سهلة الاستخدام

## 📞 الدعم

في حالة وجود مشاكل أو استفسارات:

- تحقق من رسائل الخطأ في الاستجابة
- راجع logs الخادم
- تأكد من صحة التوكن والصلاحيات
