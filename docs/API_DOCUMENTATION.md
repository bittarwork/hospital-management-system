# API Documentation

# Hospital Management System

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

All API requests (except login and registration) require authentication using JWT tokens.

### Headers

```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

## Authentication Endpoints

### Login

**POST** `/auth/login`

Login with username/email and password.

**Request Body:**

```json
{
  "username": "admin@first-medical-project.com",
  "password": "Admin@123456"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "تم تسجيل الدخول بنجاح",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "مدير",
      "lastName": "النظام",
      "username": "admin_system",
      "email": "admin@first-medical-project.com",
      "role": "super_admin",
      "permissions": [...]
    }
  }
}
```

### Get Current User

**GET** `/auth/me`

Get current authenticated user information.

**Response:**

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "مدير",
      "lastName": "النظام",
      "role": "super_admin",
      "permissions": [...]
    }
  }
}
```

### Change Password

**POST** `/auth/change-password`

**Request Body:**

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

### Logout

**POST** `/auth/logout`

Logout current user session.

## Users Endpoints

### Get All Users

**GET** `/users`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role
- `status` (optional): Filter by status
- `search` (optional): Search by name or email

**Response:**

```json
{
  "status": "success",
  "data": {
    "users": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### Create User

**POST** `/users`

**Request Body:**

```json
{
  "firstName": "أحمد",
  "lastName": "محمد",
  "username": "ahmed_mohamed",
  "email": "ahmed@example.com",
  "password": "password123",
  "phone": "+966501234567",
  "role": "doctor",
  "department": "Cardiology"
}
```

### Get User by ID

**GET** `/users/:id`

### Update User

**PUT** `/users/:id`

### Delete User

**DELETE** `/users/:id`

## Patients Endpoints

### Get All Patients

**GET** `/patients`

**Query Parameters:**

- `page`, `limit`: Pagination
- `search`: Search by name, phone, or patient ID
- `gender`: Filter by gender
- `bloodType`: Filter by blood type

### Create Patient

**POST** `/patients`

**Request Body:**

```json
{
  "firstName": "فاطمة",
  "lastName": "أحمد",
  "dateOfBirth": "1990-05-15",
  "gender": "female",
  "phone": "+966501234567",
  "email": "fatima@example.com",
  "address": {
    "street": "شارع الملك فهد",
    "city": "الرياض",
    "state": "الرياض",
    "zipCode": "12345",
    "country": "السعودية"
  },
  "emergencyContact": {
    "name": "محمد أحمد",
    "relationship": "زوج",
    "phone": "+966501234568"
  },
  "insurance": {
    "provider": "شركة التأمين الوطنية",
    "policyNumber": "POL123456",
    "groupNumber": "GRP789"
  },
  "bloodType": "O+",
  "allergies": ["البنسلين", "المكسرات"],
  "chronicConditions": ["السكري النوع الثاني"]
}
```

### Get Patient by ID

**GET** `/patients/:id`

### Update Patient

**PUT** `/patients/:id`

### Delete Patient

**DELETE** `/patients/:id`

## Doctors Endpoints

### Get All Doctors

**GET** `/doctors`

**Query Parameters:**

- `specialization`: Filter by specialization
- `department`: Filter by department
- `available`: Filter by availability status

### Create Doctor

**POST** `/doctors`

**Request Body:**

```json
{
  "firstName": "د. أحمد",
  "lastName": "سالم",
  "specialization": "أمراض القلب",
  "licenseNumber": "LIC123456",
  "phone": "+966501234567",
  "email": "dr.ahmed@hospital.com",
  "department": "Cardiology",
  "experience": 15,
  "qualifications": ["بكالوريوس الطب", "ماجستير أمراض القلب"],
  "languages": ["العربية", "الإنجليزية"],
  "consultationFee": 300,
  "availability": {
    "workDays": ["sunday", "monday", "tuesday", "wednesday", "thursday"],
    "workHours": {
      "start": "08:00",
      "end": "16:00"
    }
  }
}
```

## Appointments Endpoints

### Get All Appointments

**GET** `/appointments`

**Query Parameters:**

- `patientId`: Filter by patient
- `doctorId`: Filter by doctor
- `date`: Filter by date (YYYY-MM-DD)
- `status`: Filter by status
- `type`: Filter by appointment type

### Create Appointment

**POST** `/appointments`

**Request Body:**

```json
{
  "patientId": "507f1f77bcf86cd799439011",
  "doctorId": "507f1f77bcf86cd799439012",
  "appointmentDate": "2024-12-01",
  "appointmentTime": "10:00",
  "duration": 30,
  "type": "consultation",
  "reason": "فحص دوري",
  "priority": "normal",
  "notes": "المريض يشكو من ألم في الصدر"
}
```

### Update Appointment Status

**PATCH** `/appointments/:id/status`

**Request Body:**

```json
{
  "status": "confirmed",
  "notes": "تم تأكيد الموعد"
}
```

### Cancel Appointment

**DELETE** `/appointments/:id`

## Medical Records Endpoints

### Get Medical Records

**GET** `/medical-records`

**Query Parameters:**

- `patientId`: Filter by patient
- `doctorId`: Filter by doctor
- `startDate`, `endDate`: Date range filter

### Create Medical Record

**POST** `/medical-records`

**Request Body:**

```json
{
  "patientId": "507f1f77bcf86cd799439011",
  "doctorId": "507f1f77bcf86cd799439012",
  "appointmentId": "507f1f77bcf86cd799439013",
  "visitDate": "2024-11-28",
  "chiefComplaint": "ألم في الصدر",
  "historyOfPresentIllness": "يشكو المريض من ألم في الصدر منذ 3 أيام",
  "physicalExamination": "فحص القلب والرئتين طبيعي",
  "vitalSigns": {
    "temperature": 37.2,
    "bloodPressure": "120/80",
    "heartRate": 75,
    "respiratoryRate": 18,
    "oxygenSaturation": 98
  },
  "diagnosis": ["ألم صدري غير محدد"],
  "treatment": "راحة ومسكنات",
  "medications": [
    {
      "name": "بارسيتامول",
      "dosage": "500mg",
      "frequency": "كل 8 ساعات",
      "duration": "5 أيام"
    }
  ],
  "followUpInstructions": "مراجعة بعد أسبوع"
}
```

## Invoices Endpoints

### Get All Invoices

**GET** `/invoices`

**Query Parameters:**

- `patientId`: Filter by patient
- `doctorId`: Filter by doctor
- `status`: Filter by status (pending, paid, overdue, cancelled)
- `startDate`, `endDate`: Date range filter
- `invoiceType`: Filter by invoice type

### Create Invoice

**POST** `/invoices`

**Request Body:**

```json
{
  "patientId": "507f1f77bcf86cd799439011",
  "doctorId": "507f1f77bcf86cd799439012",
  "appointmentId": "507f1f77bcf86cd799439013",
  "issueDate": "2024-11-28",
  "dueDate": "2024-12-28",
  "invoiceType": "consultation",
  "currency": "SAR",
  "lineItems": [
    {
      "description": "استشارة طبية",
      "quantity": 1,
      "unitPrice": 300,
      "total": 300,
      "category": "consultation"
    }
  ],
  "discountPercentage": 0,
  "taxPercentage": 15,
  "notes": "فاتورة استشارة طبية",
  "terms": "الدفع خلال 30 يوم"
}
```

### Add Payment to Invoice

**POST** `/invoices/:id/payments`

**Request Body:**

```json
{
  "amount": 345.0,
  "paymentMethod": "cash",
  "transactionId": "TXN123456",
  "notes": "دفع نقدي"
}
```

### Get Invoice Statistics

**GET** `/invoices/stats`

**Response:**

```json
{
  "status": "success",
  "data": {
    "totalInvoices": 150,
    "totalRevenue": 125000.00,
    "paidInvoices": 120,
    "pendingInvoices": 25,
    "overdueInvoices": 5,
    "averageInvoiceValue": 833.33,
    "recentInvoices": [...]
  }
}
```

### Get Revenue Reports

**GET** `/invoices/reports`

**Query Parameters:**

- `period`: daily, weekly, monthly, yearly
- `startDate`, `endDate`: Custom date range
- `doctorId`: Filter by doctor
- `department`: Filter by department

## Error Responses

### Validation Error (422)

```json
{
  "status": "fail",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "phone",
      "message": "Phone number is invalid"
    }
  ]
}
```

### Authentication Error (401)

```json
{
  "status": "fail",
  "message": "Authentication required"
}
```

### Authorization Error (403)

```json
{
  "status": "fail",
  "message": "Insufficient permissions"
}
```

### Not Found Error (404)

```json
{
  "status": "fail",
  "message": "Resource not found"
}
```

### Server Error (500)

```json
{
  "status": "error",
  "message": "Internal server error"
}
```

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authenticated users**: 1000 requests per hour
- **Unauthenticated users**: 100 requests per hour

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Pagination

All list endpoints support pagination:

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response Format:**

```json
{
  "status": "success",
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "pages": 15,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Filtering and Searching

Most endpoints support filtering and searching:

**Common Query Parameters:**

- `search`: Text search across relevant fields
- `sort`: Sort by field (prefix with `-` for descending)
- `fields`: Select specific fields to return
- `filter[field]`: Filter by field value

**Example:**

```
GET /patients?search=ahmed&sort=-createdAt&fields=firstName,lastName,phone&filter[gender]=male
```

---

_This API documentation provides comprehensive information about all available endpoints, request/response formats, and usage examples._
