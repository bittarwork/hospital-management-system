const mongoose = require('mongoose');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const dotenv = require('dotenv');

// تحميل متغيرات البيئة
dotenv.config();

// إعدادات قاعدة البيانات (تجاهل متغيرات البيئة لضمان الاتصال الصحيح)
const DB_NAME = 'hospital_management_db';
const MONGODB_URI = `mongodb://localhost:27017/${DB_NAME}`;

// بيانات أساسية
const ARABIC_NAMES = {
    male: ['أحمد', 'محمد', 'عبدالله', 'خالد', 'سعد', 'فهد', 'عبدالعزيز', 'نواف', 'علي', 'حسن'],
    female: ['فاطمة', 'عائشة', 'مريم', 'زينب', 'سارة', 'نورا', 'ريم', 'لينا', 'هيا', 'أمل']
};

const FAMILY_NAMES = ['العتيبي', 'المطيري', 'الدوسري', 'الشهري', 'الحربي', 'القحطاني', 'العنزي', 'الرشيد', 'الخالدي', 'السديري'];

const SPECIALIZATIONS = [
    'General Medicine',
    'Internal Medicine',
    'General Surgery',
    'Pediatrics',
    'Cardiology',
    'Dermatology'
];

const CITIES = ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر'];

// دوال مساعدة
const generateRandomPhone = () => {
    const prefixes = ['050', '053', '054', '055'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 9000000) + 1000000;
    return `+966${prefix.substring(1)}${number}`;
};

const generateRandomEmail = (firstName, lastName) => {
    const domains = ['gmail.com', 'hotmail.com', 'yahoo.com'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const randomNum = Math.floor(Math.random() * 999) + 1;

    // استخدام أسماء إنجليزية بسيطة بدلاً من التحويل
    const englishNames = ['ahmed', 'mohammed', 'sara', 'fatima', 'ali', 'nora', 'khalid', 'maryam'];
    const randomFirstName = englishNames[Math.floor(Math.random() * englishNames.length)];
    const randomLastName = englishNames[Math.floor(Math.random() * englishNames.length)];

    return `${randomFirstName}${randomLastName}${randomNum}@${domain}`;
};

const generateRandomDate = (startYear, endYear) => {
    const start = new Date(startYear, 0, 1);
    const end = new Date(endYear, 11, 31);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateRandomNationalId = () => {
    return '1' + Math.floor(Math.random() * 999999999).toString().padStart(9, '0');
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
            Doctor.deleteMany({})
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
        const roles = ['doctor', 'nurse', 'receptionist'];

        for (let i = 0; i < 10; i++) {
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
                department: 'Administration',
                position: role,
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

        for (let i = 0; i < 15; i++) {
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
                licenseNumber: `DR${Date.now()}${i}`,
                yearsOfExperience: Math.floor(Math.random() * 15) + 5,
                education: [
                    {
                        degree: 'MBBS',
                        institution: 'جامعة الملك سعود',
                        fieldOfStudy: 'الطب والجراحة',
                        graduationYear: 2010 + Math.floor(Math.random() * 10)
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
                    }
                ],
                consultationFee: Math.floor(Math.random() * 200) + 100,
                followUpFee: Math.floor(Math.random() * 100) + 50,
                status: 'active'
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

        for (let i = 0; i < 50; i++) {
            const gender = Math.random() > 0.5 ? 'female' : 'male';
            const firstName = ARABIC_NAMES[gender][Math.floor(Math.random() * ARABIC_NAMES[gender].length)];
            const lastName = FAMILY_NAMES[Math.floor(Math.random() * FAMILY_NAMES.length)];

            const patient = new Patient({
                firstName,
                lastName,
                email: generateRandomEmail(firstName, lastName),
                phone: generateRandomPhone(),
                nationalId: generateRandomNationalId(),
                dateOfBirth: generateRandomDate(1950, 2010),
                gender,
                addressDetails: {
                    street: `شارع ${Math.floor(Math.random() * 100) + 1}`,
                    city: CITIES[Math.floor(Math.random() * CITIES.length)],
                    zipCode: (Math.floor(Math.random() * 90000) + 10000).toString(),
                    country: 'Saudi Arabia'
                },
                emergencyContact: {
                    name: `${ARABIC_NAMES[gender === 'male' ? 'female' : 'male'][Math.floor(Math.random() * 5)]} ${lastName}`,
                    relationship: Math.random() > 0.5 ? 'spouse' : 'parent',
                    phone: generateRandomPhone()
                },
                bloodType: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'][Math.floor(Math.random() * 8)],
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

        // عرض النتائج
        console.log('\n🎉 تم إنشاء قاعدة البيانات بنجاح!');
        console.log('=====================================');
        console.log('📊 ملخص البيانات:');
        console.log(`   👑 حساب الادمن: 1`);
        console.log(`   👥 المستخدمين: ${users.length}`);
        console.log(`   👨‍⚕️ الأطباء: ${doctors.length}`);
        console.log(`   🏥 المرضى: ${patients.length}`);

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