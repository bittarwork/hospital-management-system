const mongoose = require('mongoose');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Invoice = require('../models/Invoice');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_management_db');
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ Database Connection Failed:', error.message);
        process.exit(1);
    }
};

// Sample data
const arabicFirstNames = {
    male: ['أحمد', 'محمد', 'عبدالله', 'علي', 'عبدالرحمن', 'إبراهيم', 'عمر', 'يوسف', 'خالد', 'حسن', 'فيصل', 'سلطان', 'عبدالعزيز', 'ناصر', 'سعد', 'فهد', 'طلال', 'ماجد', 'صالح', 'عبدالمجيد'],
    female: ['فاطمة', 'عائشة', 'خديجة', 'مريم', 'زينب', 'رقية', 'سارة', 'نورا', 'ريم', 'هند', 'منى', 'سمية', 'أسماء', 'حفصة', 'جميلة', 'كريمة', 'لطيفة', 'عزيزة', 'أمل', 'رهف']
};

const arabicLastNames = ['العتيبي', 'المطيري', 'الدوسري', 'القحطاني', 'الغامدي', 'الزهراني', 'الشهري', 'العنزي', 'الحربي', 'آل سعود', 'الأحمدي', 'الجهني', 'البقمي', 'الرشيدي', 'الخالدي', 'السلمي', 'الفيصل', 'المالكي', 'العبدالله', 'الناصر'];

const saudiCities = ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'الطائف', 'بريدة', 'تبوك', 'خميس مشيط', 'حائل', 'المجمعة', 'الجبيل', 'نجران', 'ينبع', 'أبها', 'عرعر', 'سكاكا', 'جازان', 'القطيف'];

const streets = ['شارع الملك فهد', 'شارع العليا', 'شارع الأمير محمد بن عبدالعزيز', 'شارع الملك عبدالعزيز', 'شارع التحلية', 'شارع الأمير سلطان', 'شارع الملك خالد', 'شارع الورود', 'شارع النخيل', 'شارع الاندلس', 'شارع الصحافة', 'شارع الملز', 'شارع الدائري الشرقي', 'شارع الأمير فيصل', 'شارع الملك فيصل', 'شارع البطحاء', 'شارع المعذر', 'شارع السويدي', 'شارع الروضة', 'شارع الملقا'];

const diseases = [
    { name: 'ارتفاع ضغط الدم', icd: 'I10', severity: 'moderate' },
    { name: 'السكري من النوع الثاني', icd: 'E11', severity: 'moderate' },
    { name: 'الربو', icd: 'J45', severity: 'mild' },
    { name: 'التهاب المفاصل', icd: 'M79.3', severity: 'mild' },
    { name: 'أمراض القلب التاجية', icd: 'I25', severity: 'severe' },
    { name: 'الكوليسترول المرتفع', icd: 'E78', severity: 'mild' },
    { name: 'الصداع النصفي', icd: 'G43', severity: 'moderate' },
    { name: 'التهاب الجيوب الأنفية', icd: 'J32', severity: 'mild' },
    { name: 'القلق العام', icd: 'F41.1', severity: 'moderate' },
    { name: 'الاكتئاب', icd: 'F33', severity: 'moderate' }
];

const medications = [
    { name: 'باراسيتامول', dosage: '500mg', frequency: 'كل 8 ساعات' },
    { name: 'ايبوبروفين', dosage: '400mg', frequency: 'كل 6 ساعات' },
    { name: 'أملوديبين', dosage: '5mg', frequency: 'مرة يومياً' },
    { name: 'ميتفورمين', dosage: '500mg', frequency: 'مرتين يومياً' },
    { name: 'أتورفاستاتين', dosage: '20mg', frequency: 'مرة يومياً مساءً' },
    { name: 'ليسينوبريل', dosage: '10mg', frequency: 'مرة يومياً' },
    { name: 'أسبرين', dosage: '81mg', frequency: 'مرة يومياً' },
    { name: 'لوزارتان', dosage: '50mg', frequency: 'مرة يومياً' },
    { name: 'سالبوتامول', dosage: '100mcg', frequency: 'عند الحاجة' },
    { name: 'أوميبرازول', dosage: '20mg', frequency: 'مرة يومياً قبل الإفطار' }
];

const allergies = [
    { allergen: 'البنسلين', reaction: 'طفح جلدي', severity: 'moderate' },
    { allergen: 'الأسبرين', reaction: 'صعوبة في التنفس', severity: 'severe' },
    { allergen: 'المكسرات', reaction: 'تورم في الوجه', severity: 'severe' },
    { allergen: 'البيض', reaction: 'حكة جلدية', severity: 'mild' },
    { allergen: 'الحليب', reaction: 'مشاكل هضمية', severity: 'mild' },
    { allergen: 'القمح', reaction: 'انتفاخ البطن', severity: 'moderate' },
    { allergen: 'الفراولة', reaction: 'طفح جلدي', severity: 'mild' },
    { allergen: 'الأيودين', reaction: 'تورم موضعي', severity: 'moderate' }
];

const complaints = [
    'ألم في الصدر',
    'صداع مستمر',
    'ضيق في التنفس',
    'ألم في البطن',
    'حمى وقشعريرة',
    'ألم في المفاصل',
    'دوخة ودوار',
    'ألم في الظهر',
    'سعال مستمر',
    'مشاكل في النوم',
    'فقدان الشهية',
    'غثيان وقيء',
    'ألم في الأذن',
    'مشاكل في الهضم',
    'ألم في الأسنان'
];

// Utility functions
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomPhone = () => `+9665${getRandomNumber(10000000, 99999999)}`;
const getRandomEmail = (firstName, lastName) => {
    const randomNames = ['ahmed', 'mohammed', 'fatima', 'sara', 'ali', 'noor', 'omar', 'layla', 'hassan', 'zainab'];
    const randomName = getRandomElement(randomNames);
    const randomSurname = getRandomElement(['smith', 'brown', 'davis', 'miller', 'wilson', 'moore', 'taylor', 'johnson']);
    return `${randomName}${randomSurname}${getRandomNumber(100, 999)}@example.com`;
};

// Clear existing data
const clearDatabase = async () => {
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});
    await MedicalRecord.deleteMany({});
    await Invoice.deleteMany({});
    console.log('✅ Database cleared');
};

// Create admin user
const createAdminUser = async () => {
    console.log('👤 Creating admin user...');

    const adminUser = new User({
        firstName: 'مدير',
        lastName: 'النظام',
        username: 'admin',
        email: 'admin@maherhospital.com',
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
    console.log('✅ Admin user created');
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   Password: admin123`);
    console.log(`   Employee ID: ${adminUser.employeeId}`);

    return adminUser;
};

// Create users
const createUsers = async () => {
    console.log('👥 Creating users...');
    const users = [];

    // Create doctor users
    const doctorUsers = [
        { firstName: 'د. أحمد', lastName: 'محمد', username: 'dr_ahmed', role: 'doctor', department: 'Internal Medicine', specialization: 'Internal Medicine' },
        { firstName: 'د. فاطمة', lastName: 'علي', username: 'dr_fatima', role: 'doctor', department: 'Pediatrics', specialization: 'Pediatrics' },
        { firstName: 'د. محمد', lastName: 'الغامدي', username: 'dr_mohammed', role: 'doctor', department: 'Cardiology', specialization: 'Cardiology' },
        { firstName: 'د. سارة', lastName: 'العتيبي', username: 'dr_sarah', role: 'doctor', department: 'Dermatology', specialization: 'Dermatology' },
        { firstName: 'د. عبدالله', lastName: 'الدوسري', username: 'dr_abdullah', role: 'doctor', department: 'Orthopedics', specialization: 'Orthopedics' },
        { firstName: 'د. منى', lastName: 'المطيري', username: 'dr_mona', role: 'doctor', department: 'Obstetrics and Gynecology', specialization: 'Obstetrics and Gynecology' },
        { firstName: 'د. خالد', lastName: 'الزهراني', username: 'dr_khalid', role: 'doctor', department: 'Emergency', specialization: 'Emergency Medicine' },
        { firstName: 'د. نورا', lastName: 'القحطاني', username: 'dr_nora', role: 'doctor', department: 'Ophthalmology', specialization: 'Ophthalmology' }
    ];

    for (const userData of doctorUsers) {
        const user = new User({
            ...userData,
            email: `${userData.username}@maherhospital.com`,
            password: 'doctor123',
            phone: getRandomPhone(),
            position: 'استشاري',
            status: 'active',
            isVerified: true,
            mustChangePassword: false,
            permissions: User.getDefaultPermissions('doctor')
        });
        await user.save();
        users.push(user);
    }

    // Create staff users  
    const staffUsers = [
        { firstName: 'سمية', lastName: 'الحربي', username: 'nurse_sumaya', role: 'nurse', department: 'Emergency' },
        { firstName: 'هند', lastName: 'الرشيدي', username: 'nurse_hind', role: 'nurse', department: 'Internal Medicine' },
        { firstName: 'أمل', lastName: 'البقمي', username: 'reception_amal', role: 'receptionist', department: 'Reception' },
        { firstName: 'زينب', lastName: 'الجهني', username: 'reception_zainab', role: 'receptionist', department: 'Reception' },
        { firstName: 'كريمة', lastName: 'السلمي', username: 'accountant_karima', role: 'accountant', department: 'Accounting' },
        { firstName: 'لطيفة', lastName: 'المالكي', username: 'pharmacy_latifa', role: 'pharmacist', department: 'Pharmacy' }
    ];

    for (const userData of staffUsers) {
        const user = new User({
            ...userData,
            email: `${userData.username}@maherhospital.com`,
            password: 'staff123',
            phone: getRandomPhone(),
            position: userData.role === 'nurse' ? 'ممرضة' : userData.role === 'receptionist' ? 'موظفة استقبال' : userData.role === 'accountant' ? 'محاسبة' : 'صيدلانية',
            status: 'active',
            isVerified: true,
            mustChangePassword: false,
            permissions: User.getDefaultPermissions(userData.role)
        });
        await user.save();
        users.push(user);
    }

    console.log(`✅ Created ${users.length} users`);
    return users;
};

// Create doctors
const createDoctors = async (doctorUsers) => {
    console.log('👨‍⚕️ Creating doctors...');
    const doctors = [];

    const doctorData = [
        {
            user: doctorUsers[0],
            specialization: 'Internal Medicine',
            licenseNumber: 'MED001234',
            consultationFee: 300
        },
        {
            user: doctorUsers[1],
            specialization: 'Pediatrics',
            licenseNumber: 'MED001235',
            consultationFee: 250
        },
        {
            user: doctorUsers[2],
            specialization: 'Cardiology',
            licenseNumber: 'MED001236',
            consultationFee: 400
        },
        {
            user: doctorUsers[3],
            specialization: 'Dermatology',
            licenseNumber: 'MED001237',
            consultationFee: 280
        },
        {
            user: doctorUsers[4],
            specialization: 'Orthopedics',
            licenseNumber: 'MED001238',
            consultationFee: 350
        },
        {
            user: doctorUsers[5],
            specialization: 'Obstetrics and Gynecology',
            licenseNumber: 'MED001239',
            consultationFee: 320
        },
        {
            user: doctorUsers[6],
            specialization: 'Emergency Medicine',
            licenseNumber: 'MED001240',
            consultationFee: 200
        },
        {
            user: doctorUsers[7],
            specialization: 'Ophthalmology',
            licenseNumber: 'MED001241',
            consultationFee: 300
        }
    ];

    for (const data of doctorData) {
        const doctor = new Doctor({
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            specialization: data.specialization,
            phone: data.user.phone,
            email: data.user.email,
            licenseNumber: data.licenseNumber,
            licenseExpiryDate: new Date('2025-12-31'),
            yearsOfExperience: getRandomNumber(5, 20),
            education: [{
                degree: 'MBBS',
                institution: 'جامعة الملك سعود',
                fieldOfStudy: 'الطب',
                graduationYear: getRandomNumber(2000, 2015)
            }],
            department: data.user.department,
            consultationFee: data.consultationFee,
            followUpFee: data.consultationFee * 0.7,
            schedule: [
                { dayOfWeek: 'sunday', startTime: '08:00', endTime: '14:00', maxPatients: 15 },
                { dayOfWeek: 'monday', startTime: '08:00', endTime: '14:00', maxPatients: 15 },
                { dayOfWeek: 'tuesday', startTime: '08:00', endTime: '14:00', maxPatients: 15 }
            ],
            status: 'active'
        });

        await doctor.save();

        // Update user with doctor profile reference
        data.user.doctorProfile = doctor._id;
        await data.user.save();

        doctors.push(doctor);
    }

    console.log(`✅ Created ${doctors.length} doctors`);
    return doctors;
};

// Create patients  
const createPatients = async () => {
    console.log('🏥 Creating patients...');
    const patients = [];

    for (let i = 0; i < 50; i++) {
        const gender = Math.random() > 0.5 ? 'male' : 'female';
        const firstName = getRandomElement(arabicFirstNames[gender]);
        const lastName = getRandomElement(arabicLastNames);
        const birthYear = getRandomNumber(1950, 2010);
        const city = getRandomElement(saudiCities);

        const patient = new Patient({
            firstName,
            lastName,
            dateOfBirth: new Date(birthYear, getRandomNumber(0, 11), getRandomNumber(1, 28)),
            gender,
            phone: getRandomPhone(),
            email: Math.random() > 0.3 ? getRandomEmail(firstName, lastName) : undefined,
            address: {
                street: getRandomElement(streets),
                city,
                country: 'Saudi Arabia'
            },
            emergencyContact: {
                name: `${getRandomElement(arabicFirstNames[gender === 'male' ? 'female' : 'male'])} ${lastName}`,
                relationship: getRandomElement(['spouse', 'parent', 'child', 'sibling']),
                phone: getRandomPhone()
            },
            bloodType: getRandomElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
            allergies: Math.random() > 0.6 ? [getRandomElement(allergies)] : [],
            medicalHistory: Math.random() > 0.4 ? [{
                condition: getRandomElement(diseases).name,
                diagnosedDate: getRandomDate(new Date(2020, 0, 1), new Date()),
                status: getRandomElement(['active', 'resolved', 'chronic']),
                severity: getRandomElement(['mild', 'moderate', 'severe'])
            }] : [],
            currentMedications: Math.random() > 0.5 ? [{
                medicationName: getRandomElement(medications).name,
                dosage: getRandomElement(medications).dosage,
                frequency: getRandomElement(medications).frequency,
                startDate: getRandomDate(new Date(2023, 0, 1), new Date())
            }] : [],
            vitals: {
                height: { value: getRandomNumber(150, 190) },
                weight: { value: getRandomNumber(50, 120) },
                bloodPressure: {
                    systolic: getRandomNumber(110, 140),
                    diastolic: getRandomNumber(70, 90)
                },
                heartRate: { value: getRandomNumber(60, 100) },
                temperature: { value: parseFloat((36.5 + Math.random()).toFixed(1)) }
            },
            status: 'active',
            registrationDate: getRandomDate(new Date(2023, 0, 1), new Date())
        });

        await patient.save();
        patients.push(patient);
    }

    console.log(`✅ Created ${patients.length} patients`);
    return patients;
};

// Create appointments
const createAppointments = async (patients, doctors) => {
    console.log('📅 Creating appointments...');
    const appointments = [];

    // Create appointments for the last 30 days and next 30 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    for (let i = 0; i < 80; i++) {
        const patient = getRandomElement(patients);
        const doctor = getRandomElement(doctors);
        const appointmentDate = getRandomDate(startDate, endDate);
        const appointmentTime = `${getRandomNumber(8, 17).toString().padStart(2, '0')}:${getRandomElement(['00', '30'])}`;

        const isHistorical = appointmentDate < new Date();
        const appointmentStatus = isHistorical ?
            getRandomElement(['completed', 'cancelled', 'no-show']) :
            getRandomElement(['scheduled', 'confirmed']);

        const appointment = new Appointment({
            patient: patient._id,
            doctor: doctor._id,
            appointmentDate,
            appointmentTime,
            appointmentType: getRandomElement(['consultation', 'follow-up', 'routine-checkup', 'emergency']),
            priority: getRandomElement(['normal', 'high', 'urgent']),
            reasonForVisit: getRandomElement(complaints),
            status: appointmentStatus,
            consultationFee: doctor.consultationFee,
            createdBy: 'system'
        });

        // Add clinical data for completed appointments
        if (appointment.status === 'completed') {
            appointment.vitalSigns = {
                bloodPressure: {
                    systolic: getRandomNumber(110, 140),
                    diastolic: getRandomNumber(70, 90)
                },
                heartRate: { value: getRandomNumber(60, 100) },
                temperature: { value: parseFloat((36.5 + Math.random()).toFixed(1)) }
            };

            appointment.diagnosis = [{
                condition: getRandomElement(diseases).name,
                icdCode: getRandomElement(diseases).icd,
                severity: getRandomElement(diseases).severity,
                status: 'primary'
            }];

            if (Math.random() > 0.6) {
                appointment.prescriptions = [{
                    medication: getRandomElement(medications).name,
                    dosage: getRandomElement(medications).dosage,
                    frequency: getRandomElement(medications).frequency,
                    duration: getRandomElement(['7 أيام', '14 يوم', '30 يوم']),
                    quantity: getRandomNumber(1, 3),
                    instructions: 'تناول مع الطعام'
                }];
            }

            appointment.consultationStartTime = new Date(appointmentDate);
            appointment.consultationEndTime = new Date(appointmentDate.getTime() + (30 * 60000));
            appointment.actualDuration = 30;
        }

        // Save appointment (skip validation for historical appointments)
        if (isHistorical) {
            await appointment.save({ validateBeforeSave: false });
        } else {
            await appointment.save();
        }

        appointments.push(appointment);
    }

    console.log(`✅ Created ${appointments.length} appointments`);
    return appointments;
};

// Create medical records
const createMedicalRecords = async (patients, doctors, appointments) => {
    console.log('📋 Creating medical records...');
    const records = [];

    // Create records for completed appointments
    const completedAppointments = appointments.filter(apt => apt.status === 'completed');

    for (const appointment of completedAppointments) {
        const patient = patients.find(p => p._id.toString() === appointment.patient.toString());
        const doctor = doctors.find(d => d._id.toString() === appointment.doctor.toString());

        const record = new MedicalRecord({
            patient: appointment.patient,
            doctor: appointment.doctor,
            appointment: appointment._id,
            recordType: 'consultation',
            visitDate: appointment.appointmentDate,
            department: doctor.department,
            chiefComplaint: appointment.reasonForVisit,
            physicalExamination: {
                generalAppearance: 'المريض بحالة عامة جيدة، يبدو مرتاح',
                vitalSigns: {
                    bloodPressure: {
                        systolic: appointment.vitalSigns.bloodPressure.systolic,
                        diastolic: appointment.vitalSigns.bloodPressure.diastolic
                    },
                    heartRate: appointment.vitalSigns.heartRate.value,
                    temperature: {
                        value: appointment.vitalSigns.temperature.value,
                        unit: 'celsius'
                    }
                }
            },
            assessment: {
                primaryDiagnosis: appointment.diagnosis[0],
                secondaryDiagnoses: []
            },
            treatmentPlan: 'خطة علاجية شاملة مع متابعة دورية',
            prescriptions: appointment.prescriptions || [],
            followUpRequired: Math.random() > 0.4,
            followUpDate: Math.random() > 0.4 ?
                new Date(appointment.appointmentDate.getTime() + (14 * 24 * 60 * 60 * 1000)) :
                undefined,
            createdBy: doctor._id
        });

        await record.save();
        records.push(record);
    }

    console.log(`✅ Created ${records.length} medical records`);
    return records;
};

// Create invoices
const createInvoices = async (patients, appointments) => {
    console.log('💰 Creating invoices...');
    const invoices = [];

    // Create invoices for completed appointments
    const completedAppointments = appointments.filter(apt => apt.status === 'completed');

    for (let i = 0; i < completedAppointments.length; i++) {
        const appointment = completedAppointments[i];
        const invoiceNumber = `INV${new Date().getFullYear()}${(i + 1).toString().padStart(4, '0')}`;

        const lineItems = [{
            itemType: 'consultation',
            itemName: 'رسوم الاستشارة الطبية',
            quantity: 1,
            unitPrice: appointment.consultationFee,
            totalPrice: appointment.consultationFee,
            serviceDate: appointment.appointmentDate
        }];

        // Add medication costs randomly
        if (appointment.prescriptions && appointment.prescriptions.length > 0) {
            appointment.prescriptions.forEach(prescription => {
                lineItems.push({
                    itemType: 'medication',
                    itemName: prescription.medication,
                    quantity: prescription.quantity || 1,
                    unitPrice: getRandomNumber(20, 150),
                    totalPrice: (prescription.quantity || 1) * getRandomNumber(20, 150),
                    serviceDate: appointment.appointmentDate
                });
            });
        }

        const subtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const taxRate = 15; // VAT in Saudi Arabia
        const taxAmount = subtotal * (taxRate / 100);
        const totalAmount = subtotal + taxAmount;

        const invoice = new Invoice({
            invoiceNumber,
            patient: appointment.patient,
            appointment: appointment._id,
            invoiceType: 'consultation',
            issueDate: appointment.appointmentDate,
            dueDate: new Date(appointment.appointmentDate.getTime() + (30 * 24 * 60 * 60 * 1000)),
            servicePeriod: {
                startDate: appointment.appointmentDate,
                endDate: appointment.appointmentDate
            },
            lineItems,
            subtotal,
            taxRate,
            taxAmount,
            totalAmount,
            paymentStatus: getRandomElement(['paid', 'unpaid', 'partially_paid']),
            paymentMethod: getRandomElement(['cash', 'credit_card', 'insurance']),
            currency: 'SAR',
            createdBy: 'system'
        });

        // Add payment history for paid invoices
        if (invoice.paymentStatus === 'paid') {
            invoice.payments = [{
                paymentDate: new Date(appointment.appointmentDate.getTime() + (getRandomNumber(1, 5) * 24 * 60 * 60 * 1000)),
                amount: totalAmount,
                paymentMethod: invoice.paymentMethod,
                transactionId: `TXN${Date.now()}${i}`,
                receivedBy: 'نظام الدفع الإلكتروني',
                status: 'completed'
            }];
            invoice.amountPaid = totalAmount;
            invoice.remainingBalance = 0;
        } else if (invoice.paymentStatus === 'partially_paid') {
            const partialAmount = Math.floor(totalAmount * 0.5);
            invoice.payments = [{
                paymentDate: new Date(appointment.appointmentDate.getTime() + (getRandomNumber(1, 5) * 24 * 60 * 60 * 1000)),
                amount: partialAmount,
                paymentMethod: invoice.paymentMethod,
                transactionId: `TXN${Date.now()}${i}`,
                receivedBy: 'نظام الدفع الإلكتروني',
                status: 'completed'
            }];
            invoice.amountPaid = partialAmount;
            invoice.remainingBalance = totalAmount - partialAmount;
        }

        await invoice.save();
        invoices.push(invoice);
    }

    console.log(`✅ Created ${invoices.length} invoices`);
    return invoices;
};

// Main seeding function
const seedDatabase = async () => {
    console.log('🌱 Starting database seeding...');
    console.log('================================\n');

    try {
        await connectDB();

        // Clear existing data
        await clearDatabase();

        // Create data in order
        const adminUser = await createAdminUser();
        const users = await createUsers();
        const doctorUsers = users.filter(u => u.role === 'doctor');
        const doctors = await createDoctors(doctorUsers);
        const patients = await createPatients();
        const appointments = await createAppointments(patients, doctors);
        const medicalRecords = await createMedicalRecords(patients, doctors, appointments);
        const invoices = await createInvoices(patients, appointments);

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('==========================================');
        console.log(`📊 Summary:`);
        console.log(`   👤 Users: ${users.length + 1} (including admin)`);
        console.log(`   👨‍⚕️ Doctors: ${doctors.length}`);
        console.log(`   🏥 Patients: ${patients.length}`);
        console.log(`   📅 Appointments: ${appointments.length}`);
        console.log(`   📋 Medical Records: ${medicalRecords.length}`);
        console.log(`   💰 Invoices: ${invoices.length}`);
        console.log(`   📈 Total Records: ${users.length + 1 + doctors.length + patients.length + appointments.length + medicalRecords.length + invoices.length}`);

        console.log('\n🔑 Admin Login Credentials:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        console.log('   Email: admin@maherhospital.com');

        console.log('\n📝 Sample Login Credentials:');
        console.log('   Doctor - Username: dr_ahmed, Password: doctor123');
        console.log('   Staff - Username: reception_amal, Password: staff123');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n👋 Database connection closed');
        process.exit(0);
    }
};

// Handle process termination
process.on('SIGINT', () => {
    mongoose.connection.close();
    console.log('\n👋 Process terminated');
    process.exit(0);
});

// Run the seeding
seedDatabase().catch(error => {
    console.error('❌ Seeding failed:', error);
    mongoose.connection.close();
    process.exit(1);
}); 