const mongoose = require('mongoose');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Invoice = require('../models/Invoice');
const dotenv = require('dotenv');

// تحميل متغيرات البيئة
dotenv.config();

// إعدادات قاعدة البيانات
const DB_NAME = process.env.DB_NAME || 'hospital_management_system_demo';
const MONGODB_URI = process.env.MONGODB_URI || `mongodb://localhost:27017/${DB_NAME}`;

// إعدادات البيانات
const CONFIG = {
    TOTAL_PATIENTS: 100,
    TOTAL_DOCTORS: 25,
    TOTAL_USERS: 15,
    TOTAL_APPOINTMENTS: 200,
    TOTAL_MEDICAL_RECORDS: 150,
    TOTAL_INVOICES: 180,
};

// بيانات أساسية للتوليد
const ARABIC_NAMES = {
    male: ['أحمد', 'محمد', 'عبدالله', 'عبدالرحمن', 'خالد', 'سعد', 'فهد', 'عبدالعزيز', 'نواف', 'بندر', 'سلطان', 'ماجد', 'طلال', 'وليد', 'يوسف', 'إبراهيم', 'حسام', 'عمر', 'علي', 'حسن', 'زياد', 'رامي', 'عادل', 'سامي', 'تركي', 'راشد', 'منصور', 'صالح', 'فيصل'],
    female: ['فاطمة', 'عائشة', 'خديجة', 'مريم', 'زينب', 'أسماء', 'رقية', 'سارة', 'نورا', 'ريم', 'لينا', 'دانا', 'رهف', 'جود', 'لمى', 'هيا', 'روان', 'شهد', 'غلا', 'أمل', 'نور', 'هند', 'عبير', 'منى', 'ليلى', 'سمر', 'رنا', 'ندى', 'وعد', 'أريج', 'بشاير']
};

const FAMILY_NAMES = ['العتيبي', 'المطيري', 'الدوسري', 'الشهري', 'الحربي', 'القحطاني', 'العنزي', 'الرشيد', 'الخالدي', 'السديري', 'البقمي', 'الفقيه', 'الزهراني', 'الغامدي', 'العمري', 'الشمري', 'الثقفي', 'الجعفري', 'الهاشمي', 'السلمي', 'التميمي', 'الخزرجي', 'الأموي', 'العباسي', 'الفارسي', 'الكردي', 'التركي', 'المصري', 'الشامي', 'اليمني'];

const SPECIALIZATIONS = [
    'General Medicine',
    'Internal Medicine',
    'General Surgery',
    'Pediatrics',
    'Obstetrics and Gynecology',
    'Cardiology',
    'Orthopedics',
    'Dermatology',
    'Ophthalmology',
    'ENT (Ear, Nose, Throat)',
    'Neurology',
    'Psychiatry',
    'Dentistry',
    'Anesthesiology',
    'Radiology',
    'Emergency Medicine',
    'Family Medicine',
    'Urology',
    'Gastroenterology'
];

const CITIES = ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'تبوك', 'بريدة', 'خميس مشيط', 'الهفوف', 'حفر الباطن', 'الطائف', 'نجران', 'جازان', 'ينبع', 'القطيف', 'عرعر', 'سكاكا', 'أبها', 'الباحة'];

// دوال مساعدة
const generateRandomPhone = () => {
    const prefixes = ['050', '053', '054', '055', '056', '058', '059'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 9000000) + 1000000;
    return `+966${prefix.substring(1)}${number}`;
};

const generateRandomEmail = (firstName, lastName) => {
    const domains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const randomNum = Math.floor(Math.random() * 999) + 1;

    // تحويل الأسماء العربية إلى أحرف إنجليزية
    const arabicToEnglish = {
        'أ': 'a', 'ا': 'a', 'آ': 'a', 'إ': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
        'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'th',
        'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w',
        'ي': 'y', 'ى': 'y', 'ة': 'h', 'ء': 'a', 'ئ': 'a', 'ؤ': 'o'
    };

    const convertArabicToEnglish = (text) => {
        return text.split('').map(char => arabicToEnglish[char] || char).join('')
            .replace(/[^a-zA-Z0-9]/g, '');
    };

    const firstNameEn = convertArabicToEnglish(firstName.toLowerCase());
    const lastNameEn = convertArabicToEnglish(lastName.toLowerCase());

    return `${firstNameEn}${lastNameEn}${randomNum}@${domain}`;
};

const generateRandomDate = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateRandomNationalId = () => {
    return '1' + Math.floor(Math.random() * 999999999).toString().padStart(9, '0');
};

const generateRandomBloodType = () => {
    const types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return types[Math.floor(Math.random() * types.length)];
};

// الاتصال بقاعدة البيانات
const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log(`✅ تم الاتصال بقاعدة البيانات: ${DB_NAME}`);
        console.log(`📍 عنوان قاعدة البيانات: ${MONGODB_URI}`);
    } catch (error) {
        console.error('❌ فشل الاتصال بقاعدة البيانات:', error.message);
        process.exit(1);
    }
};

// مسح البيانات الموجودة
const clearDatabase = async () => {
    try {
        console.log('🗑️ مسح البيانات الموجودة...');
        await Promise.all([
            User.deleteMany({}),
            Patient.deleteMany({}),
            Doctor.deleteMany({}),
            Appointment.deleteMany({}),
            MedicalRecord.deleteMany({}),
            Invoice.deleteMany({})
        ]);
        console.log('✅ تم مسح البيانات الموجودة');
    } catch (error) {
        console.error('❌ خطأ في مسح البيانات:', error);
        throw error;
    }
};

// إنشاء حساب الادمن
const createAdminUser = async () => {
    try {
        console.log('👑 إنشاء حساب الادمن...');

        const adminUser = new User({
            firstName: 'مدير',
            lastName: 'النظام',
            username: 'admin',
            email: 'admin@hospital.com',
            password: 'admin123',
            phone: '+966501234567',
            role: 'super_admin',
            department: 'Administration',
            position: 'مدير النظام الرئيسي',
            status: 'active',
            isVerified: true,
            mustChangePassword: false,
            permissions: User.getDefaultPermissions('super_admin')
        });

        await adminUser.save();
        console.log('✅ تم إنشاء حساب الادمن بنجاح');
        console.log('📧 الايميل: admin@hospital.com');
        console.log('👤 اسم المستخدم: admin');
        console.log('🔒 كلمة المرور: admin123');

        return adminUser;
    } catch (error) {
        console.error('❌ خطأ في إنشاء حساب الادمن:', error);
        throw error;
    }
};

// إنشاء المستخدمين
const createUsers = async () => {
    try {
        console.log('👥 إنشاء المستخدمين...');

        const users = [];
        const roles = ['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'accountant'];

        for (let i = 0; i < CONFIG.TOTAL_USERS; i++) {
            const gender = Math.random() > 0.5 ? 'male' : 'female';
            const firstName = ARABIC_NAMES[gender][Math.floor(Math.random() * ARABIC_NAMES[gender].length)];
            const lastName = FAMILY_NAMES[Math.floor(Math.random() * FAMILY_NAMES.length)];
            const role = roles[Math.floor(Math.random() * roles.length)];

            const user = new User({
                firstName,
                lastName,
                username: `user_${i + 1}`,
                email: generateRandomEmail(firstName, lastName),
                password: 'password123',
                phone: generateRandomPhone(),
                role: role,
                department: ['Administration', 'Emergency', 'Internal Medicine', 'Surgery', 'Pediatrics'][Math.floor(Math.random() * 5)],
                position: `${role} مساعد`,
                status: 'active',
                isVerified: true,
                mustChangePassword: false,
                permissions: User.getDefaultPermissions(role)
            });

            users.push(user);
        }

        await User.insertMany(users);
        console.log(`✅ تم إنشاء ${users.length} مستخدم`);

        return users;
    } catch (error) {
        console.error('❌ خطأ في إنشاء المستخدمين:', error);
        throw error;
    }
};

// إنشاء الأطباء
const createDoctors = async () => {
    try {
        console.log('👨‍⚕️ إنشاء الأطباء...');

        const doctors = [];

        for (let i = 0; i < CONFIG.TOTAL_DOCTORS; i++) {
            const gender = Math.random() > 0.7 ? 'female' : 'male';
            const firstName = ARABIC_NAMES[gender][Math.floor(Math.random() * ARABIC_NAMES[gender].length)];
            const lastName = FAMILY_NAMES[Math.floor(Math.random() * FAMILY_NAMES.length)];
            const specialization = SPECIALIZATIONS[Math.floor(Math.random() * SPECIALIZATIONS.length)];

            const doctor = new Doctor({
                firstName,
                lastName,
                email: generateRandomEmail(firstName, lastName),
                phone: generateRandomPhone(),
                gender: gender,
                specialization,
                department: ['Emergency', 'Internal Medicine', 'Surgery', 'Pediatrics', 'Cardiology'][Math.floor(Math.random() * 5)],
                licenseNumber: `DR${Date.now()}${i}`,
                yearsOfExperience: Math.floor(Math.random() * 20) + 5,
                education: [
                    {
                        degree: 'MBBS',
                        institution: 'جامعة الملك سعود',
                        fieldOfStudy: 'الطب والجراحة',
                        graduationYear: 2005 + Math.floor(Math.random() * 15)
                    }
                ],
                schedule: [
                    {
                        dayOfWeek: 'sunday',
                        startTime: '08:00',
                        endTime: '16:00',
                        isAvailable: true,
                        maxPatients: 20
                    },
                    {
                        dayOfWeek: 'monday',
                        startTime: '08:00',
                        endTime: '16:00',
                        isAvailable: true,
                        maxPatients: 20
                    },
                    {
                        dayOfWeek: 'tuesday',
                        startTime: '08:00',
                        endTime: '16:00',
                        isAvailable: true,
                        maxPatients: 20
                    },
                    {
                        dayOfWeek: 'wednesday',
                        startTime: '08:00',
                        endTime: '16:00',
                        isAvailable: true,
                        maxPatients: 20
                    },
                    {
                        dayOfWeek: 'thursday',
                        startTime: '08:00',
                        endTime: '14:00',
                        isAvailable: true,
                        maxPatients: 15
                    }
                ],
                consultationFee: Math.floor(Math.random() * 200) + 100,
                followUpFee: Math.floor(Math.random() * 100) + 50,
                status: 'active',
                ratings: {
                    averageRating: Math.random() * 2 + 3,
                    totalReviews: Math.floor(Math.random() * 50) + 5
                }
            });

            doctors.push(doctor);
        }

        await Doctor.insertMany(doctors);
        console.log(`✅ تم إنشاء ${doctors.length} طبيب`);

        return doctors;
    } catch (error) {
        console.error('❌ خطأ في إنشاء الأطباء:', error);
        throw error;
    }
};

// إنشاء المرضى
const createPatients = async () => {
    try {
        console.log('🏥 إنشاء المرضى...');

        const patients = [];

        for (let i = 0; i < CONFIG.TOTAL_PATIENTS; i++) {
            const gender = Math.random() > 0.5 ? 'female' : 'male';
            const firstName = ARABIC_NAMES[gender][Math.floor(Math.random() * ARABIC_NAMES[gender].length)];
            const lastName = FAMILY_NAMES[Math.floor(Math.random() * FAMILY_NAMES.length)];

            const patient = new Patient({
                firstName,
                lastName,
                email: generateRandomEmail(firstName, lastName),
                phone: generateRandomPhone(),
                nationalId: generateRandomNationalId(),
                dateOfBirth: generateRandomDate('1950-01-01', '2010-12-31'),
                gender,
                addressDetails: {
                    street: `شارع ${Math.floor(Math.random() * 100) + 1}`,
                    city: CITIES[Math.floor(Math.random() * CITIES.length)],
                    zipCode: (Math.floor(Math.random() * 90000) + 10000).toString(),
                    country: 'Saudi Arabia'
                },
                emergencyContact: {
                    name: `${ARABIC_NAMES[gender === 'male' ? 'female' : 'male'][Math.floor(Math.random() * 10)]} ${lastName}`,
                    relationship: Math.random() > 0.5 ? 'spouse' : 'parent',
                    phone: generateRandomPhone()
                },
                bloodType: generateRandomBloodType(),
                allergies: Math.random() > 0.8 ? [
                    { allergen: 'Penicillin', severity: 'moderate', reaction: 'Rash' }
                ] : [],
                insurance: {
                    provider: ['الشركة السعودية للتأمين', 'تكافل الراجحي', 'شركة الأهلي للتأمين'][Math.floor(Math.random() * 3)],
                    policyNumber: `POL${Math.floor(Math.random() * 999999) + 100000}`,
                    expirationDate: generateRandomDate('2024-06-01', '2025-12-31'),
                    copayAmount: [50, 100, 150][Math.floor(Math.random() * 3)]
                },
                status: 'active',
                consentToTreatment: true,
                consentToDataSharing: true
            });

            patients.push(patient);
        }

        await Patient.insertMany(patients);
        console.log(`✅ تم إنشاء ${patients.length} مريض`);

        return patients;
    } catch (error) {
        console.error('❌ خطأ في إنشاء المرضى:', error);
        throw error;
    }
};

// إنشاء المواعيد
const createAppointments = async (doctors, patients, adminUser) => {
    try {
        console.log('📅 إنشاء المواعيد...');

        const appointments = [];
        const statuses = ['scheduled', 'confirmed', 'completed', 'cancelled'];
        const types = ['consultation', 'follow-up', 'routine-checkup', 'emergency'];

        for (let i = 0; i < CONFIG.TOTAL_APPOINTMENTS; i++) {
            const doctor = doctors[Math.floor(Math.random() * doctors.length)];
            const patient = patients[Math.floor(Math.random() * patients.length)];

            // إنشاء تاريخ في المستقبل (من اليوم إلى 6 شهور قادمة)
            const today = new Date();
            const futureDate = new Date(today);
            futureDate.setDate(today.getDate() + Math.floor(Math.random() * 180) + 1);

            const appointment = new Appointment({
                patient: patient._id,
                doctor: doctor._id,
                appointmentDate: futureDate,
                appointmentTime: `${Math.floor(Math.random() * 8) + 9}:00`,
                appointmentType: types[Math.floor(Math.random() * types.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                reasonForVisit: 'فحص طبي عام',
                estimatedDuration: 30,
                consultationFee: doctor.consultationFee,
                priority: 'normal',
                createdBy: adminUser._id,
                totalAmount: doctor.consultationFee,
                insurance: {
                    isInsured: Math.random() > 0.3,
                    provider: 'الشركة السعودية للتأمين',
                    coveragePercentage: 80
                }
            });

            appointments.push(appointment);
        }

        await Appointment.insertMany(appointments);
        console.log(`✅ تم إنشاء ${appointments.length} موعد`);

        return appointments;
    } catch (error) {
        console.error('❌ خطأ في إنشاء المواعيد:', error);
        throw error;
    }
};

// إنشاء السجلات الطبية
const createMedicalRecords = async (doctors, patients, adminUser) => {
    try {
        console.log('📋 إنشاء السجلات الطبية...');

        const medicalRecords = [];

        for (let i = 0; i < CONFIG.TOTAL_MEDICAL_RECORDS; i++) {
            const doctor = doctors[Math.floor(Math.random() * doctors.length)];
            const patient = patients[Math.floor(Math.random() * patients.length)];

            const record = new MedicalRecord({
                patient: patient._id,
                doctor: doctor._id,
                visitDate: generateRandomDate('2023-01-01', '2024-12-31'),
                visitType: 'consultation',
                chiefComplaint: 'ألم في الرأس',
                presentIllness: 'المريض يشكو من ألم في الرأس منذ أسبوع',
                diagnosis: [
                    {
                        code: 'R51',
                        description: 'صداع',
                        type: 'primary'
                    }
                ],
                treatment: [
                    {
                        type: 'medication',
                        description: 'مسكن للألم',
                        dosage: '500mg',
                        frequency: 'مرتين يومياً',
                        duration: '5 أيام'
                    }
                ],
                vitalSigns: {
                    bloodPressure: {
                        systolic: 120,
                        diastolic: 80,
                        recordedAt: new Date()
                    },
                    heartRate: {
                        rate: 75,
                        recordedAt: new Date()
                    },
                    temperature: {
                        value: 36.5,
                        unit: 'celsius',
                        recordedAt: new Date()
                    }
                },
                followUpInstructions: 'مراجعة بعد أسبوع في حالة عدم التحسن',
                createdBy: adminUser._id
            });

            medicalRecords.push(record);
        }

        await MedicalRecord.insertMany(medicalRecords);
        console.log(`✅ تم إنشاء ${medicalRecords.length} سجل طبي`);

        return medicalRecords;
    } catch (error) {
        console.error('❌ خطأ في إنشاء السجلات الطبية:', error);
        throw error;
    }
};

// إنشاء الفواتير
const createInvoices = async (patients, appointments, adminUser) => {
    try {
        console.log('💰 إنشاء الفواتير...');

        const invoices = [];

        for (let i = 0; i < CONFIG.TOTAL_INVOICES; i++) {
            const patient = patients[Math.floor(Math.random() * patients.length)];
            const appointment = appointments[Math.floor(Math.random() * appointments.length)];

            const invoice = new Invoice({
                patient: patient._id,
                appointment: appointment._id,
                invoiceNumber: `INV${Date.now()}${i}`,
                issueDate: generateRandomDate('2023-01-01', '2024-12-31'),
                dueDate: generateRandomDate('2024-01-01', '2024-12-31'),
                services: [
                    {
                        description: 'استشارة طبية',
                        quantity: 1,
                        unitPrice: 200,
                        totalPrice: 200
                    }
                ],
                subtotal: 200,
                taxAmount: 30,
                totalAmount: 230,
                status: ['pending', 'paid', 'overdue'][Math.floor(Math.random() * 3)],
                paymentMethod: 'cash',
                createdBy: adminUser._id,
                insurance: {
                    isInsuranceCovered: Math.random() > 0.5,
                    insuranceProvider: 'الشركة السعودية للتأمين',
                    coverageAmount: 160,
                    patientResponsibility: 70
                }
            });

            invoices.push(invoice);
        }

        await Invoice.insertMany(invoices);
        console.log(`✅ تم إنشاء ${invoices.length} فاتورة`);

        return invoices;
    } catch (error) {
        console.error('❌ خطأ في إنشاء الفواتير:', error);
        throw error;
    }
};

// الوظيفة الرئيسية
const main = async () => {
    try {
        console.log('🏥 نظام إدارة المستشفى - إعداد قاعدة البيانات الكاملة');
        console.log('========================================================\n');

        // الاتصال بقاعدة البيانات
        await connectDB();

        // مسح البيانات الموجودة
        await clearDatabase();

        // إنشاء البيانات الجديدة
        const adminUser = await createAdminUser();
        const users = await createUsers();
        const doctors = await createDoctors();
        const patients = await createPatients();
        const appointments = await createAppointments(doctors, patients, adminUser);
        const medicalRecords = await createMedicalRecords(doctors, patients, adminUser);
        const invoices = await createInvoices(patients, appointments, adminUser);

        // عرض النتائج
        console.log('\n🎉 تم إنشاء قاعدة البيانات بنجاح!');
        console.log('=====================================');
        console.log('📊 ملخص البيانات:');
        console.log(`   👑 حساب الادمن: 1`);
        console.log(`   👥 المستخدمين: ${users.length}`);
        console.log(`   👨‍⚕️ الأطباء: ${doctors.length}`);
        console.log(`   🏥 المرضى: ${patients.length}`);
        console.log(`   📅 المواعيد: ${appointments.length}`);
        console.log(`   📋 السجلات الطبية: ${medicalRecords.length}`);
        console.log(`   💰 الفواتير: ${invoices.length}`);

        console.log('\n🔑 بيانات تسجيل الدخول:');
        console.log(`   👤 اسم المستخدم: admin`);
        console.log(`   🔒 كلمة المرور: admin123`);
        console.log(`   📧 الايميل: admin@hospital.com`);

        console.log('\n🗃️ معلومات قاعدة البيانات:');
        console.log(`   📁 اسم قاعدة البيانات: ${DB_NAME}`);
        console.log(`   🌐 عنوان الاتصال: ${MONGODB_URI}`);

        console.log('\n📖 تعليمات الاستخدام:');
        console.log('1. تشغيل الخادم: npm run dev');
        console.log('2. فتح المتصفح والذهاب للموقع');
        console.log('3. تسجيل الدخول باستخدام بيانات الادمن أعلاه');

        // إغلاق الاتصال
        await mongoose.disconnect();
        console.log('\n✅ تم إغلاق الاتصال بقاعدة البيانات');

    } catch (error) {
        console.error('❌ خطأ في إعداد قاعدة البيانات:', error);
        process.exit(1);
    }
};

// التعامل مع إنهاء العملية
process.on('SIGINT', async () => {
    console.log('\n👋 جاري إيقاف العملية...');
    await mongoose.disconnect();
    process.exit(0);
});

// تشغيل السكريبت
main().catch(error => {
    console.error('❌ فشل في تشغيل السكريبت:', error);
    process.exit(1);
}); 