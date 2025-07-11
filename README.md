# 🏥 First Medical Project - Hospital Management System

A comprehensive, modern hospital management system built with Node.js, React, and MongoDB. This system provides complete healthcare facility management including patient records, appointments, medical records, invoicing, and administrative functions.

## 🌟 Features

### 👥 User Management

- **Multi-role Authentication System** (10 different roles)
- **JWT-based Security** with refresh tokens
- **Role-based Access Control** (RBAC)
- **User Permissions Management**
- **Session Management** with automatic logout
- **Password Reset Functionality**

### 🏥 Core Healthcare Modules

#### 👨‍⚕️ Doctor Management

- Doctor profiles with specializations
- Schedule management
- Performance tracking
- Department assignments

#### 🧑‍🤝‍🧑 Patient Management

- Comprehensive patient records
- Medical history tracking
- Insurance information management
- Emergency contact details

#### 📅 Appointment System

- Real-time appointment scheduling
- Calendar integration
- Appointment status tracking
- Automated notifications
- Bulk appointment management

#### 📋 Medical Records

- Electronic Health Records (EHR)
- Diagnosis tracking
- Medication management
- Allergy management
- Vital signs monitoring
- Lab results integration
- Radiology reports

#### 💰 Advanced Invoicing System

- **13 Different Invoice Types** (Consultation, Surgery, Lab, Radiology, etc.)
- **7 Payment Methods** (Cash, Card, Bank Transfer, Insurance, etc.)
- **Automated Tax Calculation** (15% VAT)
- **Discount Management**
- **Payment Tracking** with balance calculations
- **Financial Reports** and analytics
- **Export Functionality** (PDF, CSV, JSON)
- **Insurance Integration**

### 📊 Dashboard & Analytics

- **Real-time Hospital Status**
- **Revenue Analytics** with trend analysis
- **Patient Flow Monitoring**
- **Department Occupancy Rates**
- **Quick Actions Panel**
- **Activity Timeline**
- **Performance Metrics**

### 🔧 System Features

- **Responsive Design** for all devices
- **Real-time Updates** with WebSocket integration
- **Data Export/Import** capabilities
- **Advanced Search & Filtering**
- **Multi-language Support** (Arabic/English)
- **Theme Management** (Light/Dark modes)
- **Comprehensive Logging**
- **Error Handling & Recovery**

## 🚀 Technology Stack

### Backend

- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **Node-cron** - Task scheduling

### Frontend

- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **React Hot Toast** - Notifications

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **PostCSS** - CSS processing
- **Git** - Version control

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **MongoDB** (v5.0.0 or higher)
- **Git** (latest version)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/[your-username]/hospital-management-system.git
cd hospital-management-system
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env file with your configurations
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Database Setup

```bash
# Make sure MongoDB is running
# Default connection: mongodb://localhost:27017/PRoneHos

cd ../backend
# Run the massive data seeder (creates 175+ records)
npm run seed:massive
```

### 5. Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/PRoneHos
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@first-medical-project.com
ADMIN_PASSWORD=Admin@123456
ADMIN_PHONE=+966501234567
```

## 🚀 Running the Application

### Development Mode

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Production Mode

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

### Quick Start (Automated)

```bash
# Windows PowerShell
.\تشغيل_النظام.ps1

# Windows Batch
.\تشغيل_بسيط.bat

# Linux/Mac
./تشغيل_النظام.sh
```

## 👥 Default Users & Credentials

After running the seeder, you can login with:

### Super Admin

- **Email:** admin@first-medical-project.com
- **Password:** Admin@123456
- **Role:** Super Admin (Full Access)

### Sample Staff Users

- **Username:** dr_ahmad_salem
- **Password:** password123
- **Role:** Doctor

### Available Roles

1. **super_admin** - Complete system access
2. **admin** - Administrative functions
3. **doctor** - Medical and patient management
4. **nurse** - Patient care and basic records
5. **receptionist** - Appointments and patient check-in
6. **pharmacist** - Medication management
7. **lab_technician** - Laboratory results
8. **radiologist** - Radiology reports
9. **accountant** - Financial management
10. **it_support** - System maintenance

## 📁 Project Structure

```
hospital-management-system/
├── backend/
│   ├── config/           # Database and app configuration
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Authentication & validation
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── scripts/         # Database seeders & utilities
│   ├── docs/            # Backend documentation
│   └── server.js        # Main application file
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Application pages
│   │   ├── contexts/    # React contexts
│   │   ├── services/    # API services
│   │   ├── utils/       # Utility functions
│   │   └── hooks/       # Custom React hooks
│   ├── public/          # Static assets
│   └── package.json     # Frontend dependencies
└── docs/                # Project documentation
```

## 🔌 API Documentation

### Authentication Endpoints

```
POST /api/auth/login          # User login
POST /api/auth/logout         # User logout
GET  /api/auth/me            # Get current user
POST /api/auth/change-password # Change password
POST /api/auth/forgot-password # Password reset request
POST /api/auth/reset-password  # Reset password
```

### Core Resource Endpoints

```
# Users
GET    /api/users            # Get all users
POST   /api/users            # Create user
GET    /api/users/:id        # Get user by ID
PUT    /api/users/:id        # Update user
DELETE /api/users/:id        # Delete user

# Patients
GET    /api/patients         # Get all patients
POST   /api/patients         # Create patient
GET    /api/patients/:id     # Get patient by ID
PUT    /api/patients/:id     # Update patient
DELETE /api/patients/:id     # Delete patient

# Doctors
GET    /api/doctors          # Get all doctors
POST   /api/doctors          # Create doctor
GET    /api/doctors/:id      # Get doctor by ID
PUT    /api/doctors/:id      # Update doctor
DELETE /api/doctors/:id      # Delete doctor

# Appointments
GET    /api/appointments     # Get all appointments
POST   /api/appointments     # Create appointment
GET    /api/appointments/:id # Get appointment by ID
PUT    /api/appointments/:id # Update appointment
DELETE /api/appointments/:id # Delete appointment

# Medical Records
GET    /api/medical-records  # Get all records
POST   /api/medical-records  # Create record
GET    /api/medical-records/:id # Get record by ID
PUT    /api/medical-records/:id # Update record
DELETE /api/medical-records/:id # Delete record

# Invoices (Advanced System)
GET    /api/invoices         # Get all invoices
POST   /api/invoices         # Create invoice
GET    /api/invoices/:id     # Get invoice by ID
PUT    /api/invoices/:id     # Update invoice
DELETE /api/invoices/:id     # Delete invoice
POST   /api/invoices/:id/payments # Add payment
GET    /api/invoices/stats   # Get invoice statistics
GET    /api/invoices/reports # Get revenue reports
POST   /api/invoices/:id/pdf # Generate PDF
```

## 🎨 UI/UX Features

### Modern Design

- **Gradient Backgrounds** with professional color schemes
- **Glass Morphism Effects** for modern appearance
- **Smooth Animations** using Framer Motion
- **Responsive Layout** for all screen sizes
- **Interactive Elements** with hover effects
- **Loading States** and error handling
- **Toast Notifications** for user feedback

### Dashboard Features

- **Real-time Metrics** with animated counters
- **Progress Bars** for visual data representation
- **Status Indicators** with color coding
- **Quick Action Buttons** for common tasks
- **Activity Timeline** for recent actions
- **Hospital Status Overview** with occupancy rates

### Advanced Invoice Interface

- **Dynamic Form Handling** with real-time calculations
- **Service Type Selection** with specialized categories
- **Payment Method Integration** with validation
- **Tax and Discount Management** with visual feedback
- **Payment History Tracking** with detailed records
- **Export Options** with multiple formats

## 📊 Database Schema

### Core Collections

- **users** - System users with roles and permissions
- **patients** - Patient information and medical history
- **doctors** - Doctor profiles and specializations
- **appointments** - Appointment scheduling and tracking
- **medicalrecords** - Electronic health records
- **invoices** - Billing and payment management

### Sample Data

The system includes comprehensive sample data:

- **15 Users** across different roles
- **50+ Patients** with complete profiles
- **80+ Appointments** with various statuses
- **25+ Medical Records** with detailed information
- **30+ Invoices** with payment histories
- **11 Doctors** with specializations

## 🔒 Security Features

### Authentication & Authorization

- **JWT Token Management** with secure storage
- **Role-based Access Control** with granular permissions
- **Password Encryption** using bcrypt
- **Session Management** with automatic expiration
- **CORS Configuration** for secure API access
- **Input Validation** and sanitization

### Data Protection

- **MongoDB Security** best practices
- **Environment Variables** for sensitive data
- **Error Handling** without data exposure
- **Audit Logging** for critical operations

## 🧪 Testing & Quality

### Code Quality

- **ESLint Configuration** for consistent code style
- **Error Boundaries** for React components
- **Input Validation** on both frontend and backend
- **Error Handling** with user-friendly messages
- **Performance Optimization** with lazy loading

## 🚀 Deployment

### Environment Setup

```bash
# Production environment variables
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
```

### Build Commands

```bash
# Backend
cd backend
npm install --production

# Frontend
cd frontend
npm run build
```

## 📖 Usage Guide

### Getting Started

1. **Login** with provided credentials
2. **Explore Dashboard** for system overview
3. **Manage Patients** - Add and update patient records
4. **Schedule Appointments** - Book and track appointments
5. **Create Medical Records** - Document patient visits
6. **Generate Invoices** - Bill for services provided
7. **Process Payments** - Track and manage payments
8. **View Reports** - Analyze system performance

### Advanced Features

- **Bulk Operations** for managing multiple records
- **Advanced Search** with multiple criteria
- **Data Export** in various formats
- **System Analytics** with detailed reports
- **User Management** with role assignments

## 🤝 Contributing

We welcome contributions to improve the Hospital Management System!

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow existing code style
- Add comments for complex functions
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📞 Support & Contact

### Issues & Bugs

- Create an issue on GitHub
- Provide detailed description and steps to reproduce
- Include system information and error messages

### Feature Requests

- Open a GitHub issue with the "enhancement" label
- Describe the feature and its benefits
- Provide mockups or examples if applicable

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Healthcare Professionals** for domain expertise and requirements
- **Open Source Community** for the amazing tools and libraries
- **Beta Testers** for their valuable feedback
- **Contributors** who helped improve the system

## 📈 Future Roadmap

### Planned Features

- [ ] **Mobile Application** (React Native)
- [ ] **Telemedicine Integration** with video calling
- [ ] **Laboratory Integration** with equipment APIs
- [ ] **Pharmacy Management** with inventory tracking
- [ ] **Insurance Claims** automated processing
- [ ] **Multi-language Support** expansion
- [ ] **AI-powered Analytics** for predictive insights
- [ ] **Integration APIs** for third-party systems

### Performance Improvements

- [ ] **Caching System** with Redis
- [ ] **Database Optimization** with indexing
- [ ] **API Rate Limiting** for better performance
- [ ] **Background Jobs** with queue management
- [ ] **Real-time Notifications** with WebSocket

---

## 🏥 About First Medical Project

The First Medical Project Hospital Management System represents a modern approach to healthcare facility management, combining cutting-edge technology with practical healthcare workflows. Designed by healthcare professionals and software engineers, this system addresses real-world challenges in hospital administration while maintaining ease of use and reliability.

**Built with ❤️ for the healthcare community**

---

_For detailed technical documentation, please refer to the `/docs` directory in the repository._
