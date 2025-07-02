const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Invoice = require('../models/Invoice');

// إعدادات قاعدة البيانات
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/PRoneHos';

// إعدادات البيانات الضخمة
const CONFIG = {
    TOTAL_PATIENTS: parseInt(process.env.TOTAL_PATIENTS) || 500,
    TOTAL_DOCTORS: parseInt(process.env.TOTAL_DOCTORS) || 50,
    TOTAL_APPOINTMENTS: parseInt(process.env.TOTAL_APPOINTMENTS) || 1000,
    TOTAL_MEDICAL_RECORDS: parseInt(process.env.TOTAL_MEDICAL_RECORDS) || 800,
    TOTAL_INVOICES: parseInt(process.env.TOTAL_INVOICES) || 1200,
};

// بيانات أساسية للتوليد
const ARABIC_FIRST_NAMES = {
    male: ['أحمد', 'محمد', 'عبدالله', 'عبدالرحمن', 'خالد', 'سعد', 'فهد', 'عبدالعزيز', 'نواف', 'بندر', 'سلطان', 'ماجد', 'طلال', 'وليد', 'يوسف', 'إبراهيم', 'حسام', 'عمر', 'علي', 'حسن', 'زياد', 'رامي', 'عادل', 'سامي', 'تركي', 'راشد', 'مساعد', 'منصور', 'صالح', 'فيصل'],
    female: ['فاطمة', 'عائشة', 'خديجة', 'مريم', 'زينب', 'أسماء', 'رقية', 'سارة', 'نورا', 'ريم', 'لينا', 'دانا', 'رهف', 'جود', 'لمى', 'هيا', 'روان', 'شهد', 'غلا', 'أمل', 'نور', 'هند', 'عبير', 'منى', 'ليلى', 'سمر', 'رنا', 'ندى', 'وعد', 'أريج', 'بشاير']
};

const ARABIC_LAST_NAMES = ['العتيبي', 'المطيري', 'الدوسري', 'الشهري', 'الحربي', 'القحطاني', 'العنزي', 'الرشيد', 'الخالدي', 'السديري', 'البقمي', 'الفقيه', 'الزهراني', 'الغامدي', 'العمري', 'الشمري', 'الثقفي', 'الجعفري', 'الهاشمي', 'السلمي', 'التميمي', 'الخزرجي', 'الأموي', 'العباسي', 'الفارسي', 'الكردي', 'التركي', 'المصري', 'الشامي', 'اليمني'];

const SPECIALIZATIONS = [
    'General Medicine', 'Internal Medicine', 'General Surgery', 'Pediatrics',
    'Obstetrics and Gynecology', 'Cardiology', 'Orthopedics', 'Dermatology',
    'Ophthalmology', 'ENT (Ear, Nose, Throat)', 'Neurology', 'Psychiatry',
    'Dentistry', 'Anesthesiology', 'Radiology', 'Emergency Medicine',
    'Family Medicine', 'Urology', 'Gastroenterology'
];

const DEPARTMENTS = ['الطوارئ', 'القلب', 'الأطفال', 'النساء والولادة', 'الجراحة', 'العيون', 'الأسنان', 'الجلدية', 'الأعصاب', 'العظام', 'الطب النفسي', 'الأنف والأذن والحنجرة', 'الكلى', 'الجهاز الهضمي', 'التخدير', 'الأشعة', 'المختبر', 'العلاج الطبيعي'];

const CITIES = ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'تبوك', 'بريدة', 'خميس مشيط', 'الهفوف', 'حفر الباطن', 'الطائف', 'نجران', 'جازان', 'ينبع', 'القطيف', 'عرعر', 'سكاكا', 'أبها', 'الباحة'];

// توليد بيانات عشوائية
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
            .replace(/[^a-zA-Z0-9]/g, ''); // إزالة أي أحرف غير مقبولة
    };

    const firstNameEn = convertArabicToEnglish(firstName.replace(/\s/g, '').toLowerCase());
    const lastNameEn = convertArabicToEnglish(lastName.replace(/\s/g, '').toLowerCase());

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

const generateRandomInsurance = () => {
    const companies = ['الشركة السعودية للتأمين', 'تكافل الراجحي', 'شركة الأهلي للتأمين', 'شركة ساب للتأمين', 'شركة اتحاد الخليج للتأمين', 'شركة سلامة للتأمين', 'بدون تأمين'];
    return companies[Math.floor(Math.random() * companies.length)];
};

// إنشاء مدير النظام
async function createSuperAdmin() {
    console.log('🔐 إنشاء حساب مدير النظام...');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@first-medical-project.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    // التحقق من وجود المدير
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
        console.log('✅ مدير النظام موجود بالفعل');
        return existingAdmin;
    }

    const adminUser = new User({
        firstName: 'مدير',
        lastName: 'النظام',
        username: 'admin_system',
        email: adminEmail,
        password: adminPassword, // سيتم تشفيرها تلقائياً بواسطة pre-save middleware
        phone: process.env.ADMIN_PHONE || '+966501234567',
        role: 'super_admin',
        department: 'Administration',
        status: 'active',
        isVerified: true,
        mustChangePassword: false,
        permissions: [
            { module: 'users', actions: ['manage'] },
            { module: 'patients', actions: ['manage'] },
            { module: 'doctors', actions: ['manage'] },
            { module: 'appointments', actions: ['manage'] },
            { module: 'medical_records', actions: ['manage'] },
            { module: 'invoices', actions: ['manage'] },
            { module: 'reports', actions: ['manage'] },
            { module: 'settings', actions: ['manage'] }
        ]
    });

    await adminUser.save();
    console.log(`✅ تم إنشاء مدير النظام: ${adminEmail}`);
    console.log(`🔑 كلمة المرور: ${adminPassword}`);

    return adminUser;
}

// إنشاء المستخدمين
async function createUsers() {
    console.log('👥 إنشاء المستخدمين...');

    const users = [];
    const roles = ['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_technician'];

    for (let i = 0; i < 25; i++) {
        const gender = Math.random() > 0.6 ? 'male' : 'female';
        const firstName = ARABIC_FIRST_NAMES[gender][Math.floor(Math.random() * ARABIC_FIRST_NAMES[gender].length)];
        const lastName = ARABIC_LAST_NAMES[Math.floor(Math.random() * ARABIC_LAST_NAMES.length)];
        const fullName = `${firstName} ${lastName}`;
        const role = roles[Math.floor(Math.random() * roles.length)];

        const departmentMap = {
            'الطوارئ': 'Emergency',
            'القلب': 'Cardiology',
            'الأطفال': 'Pediatrics',
            'النساء والولادة': 'Obstetrics and Gynecology',
            'الجراحة': 'Surgery',
            'العيون': 'Ophthalmology',
            'الأسنان': 'ENT',
            'الجلدية': 'Dermatology',
            'الأعصاب': 'Neurology',
            'العظام': 'Orthopedics',
            'الطب النفسي': 'Psychiatry',
            'الأنف والأذن والحنجرة': 'ENT',
            'الكلى': 'Internal Medicine',
            'الجهاز الهضمي': 'Internal Medicine',
            'التخدير': 'Anesthesiology',
            'الأشعة': 'Radiology',
            'المختبر': 'Laboratory',
            'العلاج الطبيعي': 'Internal Medicine'
        };

        const arabicDept = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
        const englishDept = departmentMap[arabicDept] || 'Internal Medicine';

        // تحويل الأسماء العربية إلى أحرف إنجليزية للـ username
        const arabicToEnglish = {
            'أ': 'a', 'ا': 'a', 'آ': 'a', 'إ': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
            'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'th',
            'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w',
            'ي': 'y', 'ى': 'y', 'ة': 'h', 'ء': 'a', 'ئ': 'a', 'ؤ': 'o'
        };

        const convertArabicToEnglish = (text) => {
            return text.split('').map(char => arabicToEnglish[char] || char).join('')
                .replace(/[^a-zA-Z0-9]/g, ''); // إزالة أي أحرف غير مقبولة
        };

        const firstNameEn = convertArabicToEnglish(firstName.replace(/\s/g, '').toLowerCase());
        const lastNameEn = convertArabicToEnglish(lastName.replace(/\s/g, '').toLowerCase());
        const username = `${firstNameEn}${lastNameEn}${Math.floor(Math.random() * 999) + 1}`;

        const user = new User({
            firstName,
            lastName,
            username,
            email: generateRandomEmail(firstName, lastName),
            password: 'password123', // سيتم تشفيرها تلقائياً
            phone: generateRandomPhone(),
            role: role,
            department: englishDept,
            status: Math.random() > 0.1 ? 'active' : 'inactive',
            isVerified: true,
            mustChangePassword: Math.random() > 0.5,
            permissions: User.getDefaultPermissions(role)
        });

        users.push(user);
    }

    await User.insertMany(users);
    console.log(`✅ تم إنشاء ${users.length} مستخدم`);

    return users;
}

// إنشاء الأطباء
async function createDoctors() {
    console.log('👨‍⚕️ إنشاء الأطباء...');

    const doctors = [];

    for (let i = 0; i < CONFIG.TOTAL_DOCTORS; i++) {
        const gender = Math.random() > 0.7 ? 'female' : 'male';
        const firstName = ARABIC_FIRST_NAMES[gender][Math.floor(Math.random() * ARABIC_FIRST_NAMES[gender].length)];
        const lastName = ARABIC_LAST_NAMES[Math.floor(Math.random() * ARABIC_LAST_NAMES.length)];
        const specialization = SPECIALIZATIONS[Math.floor(Math.random() * SPECIALIZATIONS.length)];

        const doctor = new Doctor({
            firstName,
            lastName,
            email: generateRandomEmail(firstName, lastName),
            phone: generateRandomPhone(),
            gender: gender,
            specialization,
            department: DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)],
            licenseNumber: `DR${Date.now()}${i}`,
            yearsOfExperience: Math.floor(Math.random() * 25) + 2,
            education: [
                {
                    degree: 'MBBS',
                    institution: 'King Saud University',
                    fieldOfStudy: 'Medicine and Surgery',
                    graduationYear: 2010 + Math.floor(Math.random() * 10)
                },
                {
                    degree: 'Fellowship',
                    institution: 'King Fahd Medical City',
                    fieldOfStudy: specialization,
                    graduationYear: 2015 + Math.floor(Math.random() * 8)
                }
            ],
            schedule: [
                {
                    dayOfWeek: 'saturday',
                    startTime: '08:00',
                    endTime: '16:00',
                    breakStartTime: '12:00',
                    breakEndTime: '13:00',
                    isAvailable: true,
                    maxPatients: Math.floor(Math.random() * 20) + 10
                },
                {
                    dayOfWeek: 'sunday',
                    startTime: '08:00',
                    endTime: '16:00',
                    breakStartTime: '12:00',
                    breakEndTime: '13:00',
                    isAvailable: true,
                    maxPatients: Math.floor(Math.random() * 20) + 10
                },
                {
                    dayOfWeek: 'monday',
                    startTime: '08:00',
                    endTime: '16:00',
                    breakStartTime: '12:00',
                    breakEndTime: '13:00',
                    isAvailable: true,
                    maxPatients: Math.floor(Math.random() * 20) + 10
                },
                {
                    dayOfWeek: 'tuesday',
                    startTime: '08:00',
                    endTime: '16:00',
                    breakStartTime: '12:00',
                    breakEndTime: '13:00',
                    isAvailable: true,
                    maxPatients: Math.floor(Math.random() * 20) + 10
                },
                {
                    dayOfWeek: 'wednesday',
                    startTime: '08:00',
                    endTime: '16:00',
                    breakStartTime: '12:00',
                    breakEndTime: '13:00',
                    isAvailable: true,
                    maxPatients: Math.floor(Math.random() * 20) + 10
                },
                {
                    dayOfWeek: 'thursday',
                    startTime: '08:00',
                    endTime: '14:00',
                    breakStartTime: '12:00',
                    breakEndTime: '13:00',
                    isAvailable: true,
                    maxPatients: Math.floor(Math.random() * 15) + 8
                }
            ],
            consultationFee: Math.floor(Math.random() * 300) + 100,
            followUpFee: Math.floor(Math.random() * 150) + 50,
            emergencyFee: Math.floor(Math.random() * 500) + 200,
            status: Math.random() > 0.05 ? 'active' : 'inactive',
            ratings: {
                averageRating: Math.random() * 2 + 3,
                totalReviews: Math.floor(Math.random() * 100) + 5
            },
            languagesSpoken: [
                { language: 'Arabic', proficiency: 'native' },
                { language: 'English', proficiency: Math.random() > 0.5 ? 'fluent' : 'intermediate' }
            ]
        });

        doctors.push(doctor);
    }

    await Doctor.insertMany(doctors);
    console.log(`✅ تم إنشاء ${doctors.length} طبيب`);

    return doctors;
}

// إنشاء المرضى
async function createPatients() {
    console.log('🏥 إنشاء المرضى...');

    const patients = [];

    for (let i = 0; i < CONFIG.TOTAL_PATIENTS; i++) {
        const gender = Math.random() > 0.5 ? 'female' : 'male';
        const firstName = ARABIC_FIRST_NAMES[gender][Math.floor(Math.random() * ARABIC_FIRST_NAMES[gender].length)];
        const lastName = ARABIC_LAST_NAMES[Math.floor(Math.random() * ARABIC_LAST_NAMES.length)];

        const patient = new Patient({
            firstName,
            lastName,
            email: Math.random() > 0.3 ? generateRandomEmail(firstName, lastName) : undefined,
            phone: generateRandomPhone(),
            nationalId: generateRandomNationalId(),
            dateOfBirth: generateRandomDate('1950-01-01', '2020-12-31'),
            gender,
            addressDetails: {
                street: `شارع ${Math.floor(Math.random() * 50) + 1}`,
                city: CITIES[Math.floor(Math.random() * CITIES.length)],
                zipCode: (Math.floor(Math.random() * 90000) + 10000).toString(),
                country: 'Saudi Arabia'
            },
            emergencyContact: {
                name: `${ARABIC_FIRST_NAMES[gender === 'male' ? 'female' : 'male'][Math.floor(Math.random() * 10)]} ${lastName}`,
                relationship: Math.random() > 0.5 ? 'spouse' : 'parent',
                phone: generateRandomPhone()
            },
            bloodType: generateRandomBloodType(),
            allergies: Math.random() > 0.7 ? [
                { allergen: 'Penicillin', severity: 'moderate', reaction: 'Rash' },
                { allergen: 'Seafood', severity: 'mild', reaction: 'Nausea' }
            ].slice(0, Math.floor(Math.random() * 2) + 1) : [],
            medicalHistory: Math.random() > 0.8 ? [
                { condition: 'Diabetes', diagnosedDate: generateRandomDate('2010-01-01', '2023-12-31'), status: 'chronic' },
                { condition: 'Hypertension', diagnosedDate: generateRandomDate('2015-01-01', '2023-12-31'), status: 'active' }
            ].slice(0, Math.floor(Math.random() * 2) + 1) : [],
            currentMedications: Math.random() > 0.7 ? [
                {
                    medicationName: 'Metformin',
                    dosage: '500mg',
                    frequency: 'Twice daily',
                    startDate: generateRandomDate('2022-01-01', '2023-12-31')
                },
                {
                    medicationName: 'Aspirin',
                    dosage: '75mg',
                    frequency: 'Once daily',
                    startDate: generateRandomDate('2022-01-01', '2023-12-31')
                }
            ].slice(0, Math.floor(Math.random() * 2) + 1) : [],
            insurance: {
                provider: generateRandomInsurance(),
                policyNumber: `POL${Math.floor(Math.random() * 999999) + 100000}`,
                expirationDate: generateRandomDate('2024-06-01', '2026-12-31'),
                copayAmount: [50, 100, 150, 200][Math.floor(Math.random() * 4)]
            },
            status: Math.random() > 0.02 ? 'active' : 'inactive',
            consentToTreatment: true,
            consentToDataSharing: Math.random() > 0.3
        });

        patients.push(patient);
    }

    await Patient.insertMany(patients);
    console.log(`✅ تم إنشاء ${patients.length} مريض`);

    return patients;
}

// إنشاء المواعيد
async function createAppointments(doctors, patients) {
    console.log('📅 إنشاء المواعيد...');

    const appointments = [];
    const statuses = ['scheduled', 'confirmed', 'checked-in', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled'];
    const types = ['consultation', 'follow-up', 'routine-checkup', 'emergency', 'procedure', 'diagnostic'];

    for (let i = 0; i < CONFIG.TOTAL_APPOINTMENTS; i++) {
        const doctor = doctors[Math.floor(Math.random() * doctors.length)];
        const patient = patients[Math.floor(Math.random() * patients.length)];
        // إنشاء تاريخ آمن في المستقبل
        const today = new Date();
        const futureDate = new Date(today.getTime() + (Math.random() * 365 * 24 * 60 * 60 * 1000)); // في السنة القادمة
        const appointmentDate = futureDate;
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        const appointment = new Appointment({
            patient: patient._id,
            doctor: doctor._id,
            appointmentDate,
            appointmentTime: `${Math.floor(Math.random() * 12) + 8}:${['00', '30'][Math.floor(Math.random() * 2)]}`,
            appointmentType: types[Math.floor(Math.random() * types.length)],
            status,
            reasonForVisit: `${Math.random() > 0.5 ? 'فحص دوري' : 'استشارة طبية'} في تخصص ${doctor.specialization}`,
            estimatedDuration: [15, 30, 45, 60][Math.floor(Math.random() * 4)],
            consultationFee: doctor.consultationFee,
            priority: ['low', 'normal', 'high', 'urgent'][Math.floor(Math.random() * 4)],
            createdBy: 'النظام',
            privateNotes: Math.random() > 0.5 ? 'ملاحظات إضافية للموعد' : '',
            totalAmount: doctor.consultationFee,
            insurance: {
                isInsured: Math.random() > 0.5,
                provider: Math.random() > 0.5 ? generateRandomInsurance() : undefined,
                coveragePercentage: Math.random() > 0.5 ? [70, 80, 90, 100][Math.floor(Math.random() * 4)] : undefined
            }
        });

        appointments.push(appointment);
    }

    await Appointment.insertMany(appointments);
    console.log(`✅ تم إنشاء ${appointments.length} موعد`);

    return appointments;
}

// تصدير الدالة الرئيسية
module.exports = {
    seedMassiveData: async () => {
        try {
            console.log('🚀 بدء إنشاء البيانات التجريبية الضخمة...');
            console.log(`📊 الإعدادات: ${CONFIG.TOTAL_PATIENTS} مريض، ${CONFIG.TOTAL_DOCTORS} طبيب، ${CONFIG.TOTAL_APPOINTMENTS} موعد`);

            // الاتصال بقاعدة البيانات
            await mongoose.connect(MONGODB_URI);
            console.log('✅ تم الاتصال بقاعدة البيانات PRoneHos');

            // مسح البيانات الموجودة
            console.log('🗑️ مسح البيانات الموجودة...');
            await Promise.all([
                User.deleteMany({}),
                Patient.deleteMany({}),
                Doctor.deleteMany({}),
                Appointment.deleteMany({}),
                MedicalRecord.deleteMany({}),
                Invoice.deleteMany({})
            ]);

            // إنشاء البيانات الجديدة
            const adminUser = await createSuperAdmin();
            const users = await createUsers();
            const doctors = await createDoctors();
            const patients = await createPatients();
            const appointments = await createAppointments(doctors, patients);

            console.log('\n🎉 تم إنشاء البيانات التجريبية بنجاح!');
            console.log('📊 ملخص البيانات:');
            console.log(`   👑 مدير النظام: 1`);
            console.log(`   👥 المستخدمين: ${users.length}`);
            console.log(`   👨‍⚕️ الأطباء: ${doctors.length}`);
            console.log(`   🏥 المرضى: ${patients.length}`);
            console.log(`   📅 المواعيد: ${appointments.length}`);

            console.log('\n🔐 بيانات تسجيل الدخول:');
            console.log(`   البريد الإلكتروني: ${adminUser.email}`);
            console.log(`   كلمة المرور: ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);

            await mongoose.disconnect();
            console.log('✅ تم قطع الاتصال بقاعدة البيانات');

        } catch (error) {
            console.error('❌ خطأ في إنشاء البيانات:', error);
            throw error;
        }
    }
}; 