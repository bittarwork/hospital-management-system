const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
require('dotenv').config();

// Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_management_db');
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ Database Connection Failed:', error.message);
        process.exit(1);
    }
};

// Sample doctors data
const sampleDoctors = [
    {
        firstName: 'أحمد',
        lastName: 'محمد الخالدي',
        specialization: 'طب قلب',
        phone: '+966501234001',
        email: 'ahmed.khaldi@maherhospital.com',
        licenseNumber: 'DOC20240001',
        dateOfBirth: new Date('1980-03-15'),
        gender: 'male',
        consultationFee: 300,
        experience: 15,
        department: 'Cardiology',
        position: 'Senior Consultant',
        status: 'active',
        workingHours: {
            start: '08:00',
            end: '16:00',
            workingDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday']
        },
        qualifications: 'دكتوراه في طب القلب من جامعة الملك سعود، زمالة أمراض القلب من المملكة المتحدة',
        education: [{
            degree: 'MD',
            institution: 'جامعة الملك سعود',
            fieldOfStudy: 'طب القلب',
            graduationYear: 2005
        }],
        schedule: [
            { dayOfWeek: 'sunday', startTime: '08:00', endTime: '16:00', isAvailable: true, maxPatients: 15 },
            { dayOfWeek: 'monday', startTime: '08:00', endTime: '16:00', isAvailable: true, maxPatients: 15 },
            { dayOfWeek: 'tuesday', startTime: '08:00', endTime: '16:00', isAvailable: true, maxPatients: 15 },
            { dayOfWeek: 'wednesday', startTime: '08:00', endTime: '16:00', isAvailable: true, maxPatients: 15 },
            { dayOfWeek: 'thursday', startTime: '08:00', endTime: '16:00', isAvailable: true, maxPatients: 15 }
        ]
    },
    {
        firstName: 'فاطمة',
        lastName: 'علي السالم',
        specialization: 'نساء وولادة',
        phone: '+966501234002',
        email: 'fatima.salem@maherhospital.com',
        licenseNumber: 'DOC20240002',
        dateOfBirth: new Date('1985-07-22'),
        gender: 'female',
        consultationFee: 280,
        experience: 12,
        department: 'Obstetrics and Gynecology',
        position: 'Consultant',
        status: 'active',
        workingHours: {
            start: '09:00',
            end: '17:00',
            workingDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday']
        },
        qualifications: 'بكالوريوس الطب والجراحة، تخصص في أمراض النساء والولادة',
        education: [{
            degree: 'MBBS',
            institution: 'جامعة الملك عبدالعزيز',
            fieldOfStudy: 'أمراض النساء والولادة',
            graduationYear: 2009
        }],
        schedule: [
            { dayOfWeek: 'sunday', startTime: '09:00', endTime: '17:00', isAvailable: true, maxPatients: 12 },
            { dayOfWeek: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: true, maxPatients: 12 },
            { dayOfWeek: 'tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true, maxPatients: 12 },
            { dayOfWeek: 'wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true, maxPatients: 12 },
            { dayOfWeek: 'thursday', startTime: '09:00', endTime: '17:00', isAvailable: true, maxPatients: 12 }
        ]
    },
    {
        firstName: 'خالد',
        lastName: 'عبدالله النمر',
        specialization: 'طب أطفال',
        phone: '+966501234003',
        email: 'khalid.alnamir@maherhospital.com',
        licenseNumber: 'DOC20240003',
        dateOfBirth: new Date('1982-11-10'),
        gender: 'male',
        consultationFee: 250,
        experience: 10,
        department: 'Pediatrics',
        position: 'Specialist',
        status: 'active',
        workingHours: {
            start: '07:00',
            end: '15:00',
            workingDays: ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday']
        },
        qualifications: 'دكتوراه في طب الأطفال، دبلوم عناية مركزة للأطفال',
        education: [{
            degree: 'MD',
            institution: 'جامعة الدمام',
            fieldOfStudy: 'طب الأطفال',
            graduationYear: 2007
        }],
        schedule: [
            { dayOfWeek: 'saturday', startTime: '07:00', endTime: '15:00', isAvailable: true, maxPatients: 20 },
            { dayOfWeek: 'sunday', startTime: '07:00', endTime: '15:00', isAvailable: true, maxPatients: 20 },
            { dayOfWeek: 'monday', startTime: '07:00', endTime: '15:00', isAvailable: true, maxPatients: 20 },
            { dayOfWeek: 'tuesday', startTime: '07:00', endTime: '15:00', isAvailable: true, maxPatients: 20 },
            { dayOfWeek: 'wednesday', startTime: '07:00', endTime: '15:00', isAvailable: true, maxPatients: 20 }
        ]
    },
    {
        firstName: 'سارة',
        lastName: 'محمد العتيبي',
        specialization: 'طب عيون',
        phone: '+966501234004',
        email: 'sara.alotaibi@maherhospital.com',
        licenseNumber: 'DOC20240004',
        dateOfBirth: new Date('1987-04-18'),
        gender: 'female',
        consultationFee: 320,
        experience: 8,
        department: 'Ophthalmology',
        position: 'Specialist',
        status: 'active',
        workingHours: {
            start: '10:00',
            end: '18:00',
            workingDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday']
        },
        qualifications: 'بكالوريوس الطب، زمالة طب العيون من كندا',
        education: [{
            degree: 'MBBS',
            institution: 'جامعة أم القرى',
            fieldOfStudy: 'طب العيون',
            graduationYear: 2011
        }],
        schedule: [
            { dayOfWeek: 'sunday', startTime: '10:00', endTime: '18:00', isAvailable: true, maxPatients: 10 },
            { dayOfWeek: 'monday', startTime: '10:00', endTime: '18:00', isAvailable: true, maxPatients: 10 },
            { dayOfWeek: 'tuesday', startTime: '10:00', endTime: '18:00', isAvailable: true, maxPatients: 10 },
            { dayOfWeek: 'wednesday', startTime: '10:00', endTime: '18:00', isAvailable: true, maxPatients: 10 },
            { dayOfWeek: 'thursday', startTime: '10:00', endTime: '18:00', isAvailable: true, maxPatients: 10 }
        ]
    },
    {
        firstName: 'عبدالرحمن',
        lastName: 'سليمان الدوسري',
        specialization: 'جراحة عامة',
        phone: '+966501234005',
        email: 'abdulrahman.aldosari@maherhospital.com',
        licenseNumber: 'DOC20240005',
        dateOfBirth: new Date('1978-09-05'),
        gender: 'male',
        consultationFee: 400,
        experience: 18,
        department: 'Surgery',
        position: 'Senior Consultant',
        status: 'active',
        workingHours: {
            start: '06:00',
            end: '14:00',
            workingDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday']
        },
        qualifications: 'دكتوراه في الجراحة العامة، زمالة جراحة المناظير',
        education: [{
            degree: 'MD',
            institution: 'جامعة الملك فيصل',
            fieldOfStudy: 'الجراحة العامة',
            graduationYear: 2002
        }],
        schedule: [
            { dayOfWeek: 'sunday', startTime: '06:00', endTime: '14:00', isAvailable: true, maxPatients: 8 },
            { dayOfWeek: 'monday', startTime: '06:00', endTime: '14:00', isAvailable: true, maxPatients: 8 },
            { dayOfWeek: 'tuesday', startTime: '06:00', endTime: '14:00', isAvailable: true, maxPatients: 8 },
            { dayOfWeek: 'wednesday', startTime: '06:00', endTime: '14:00', isAvailable: true, maxPatients: 8 },
            { dayOfWeek: 'thursday', startTime: '06:00', endTime: '14:00', isAvailable: true, maxPatients: 8 }
        ]
    },
    {
        firstName: 'نوال',
        lastName: 'أحمد الشهري',
        specialization: 'طب جلدية',
        phone: '+966501234006',
        email: 'nawal.alshahri@maherhospital.com',
        licenseNumber: 'DOC20240006',
        dateOfBirth: new Date('1984-12-28'),
        gender: 'female',
        consultationFee: 200,
        experience: 9,
        department: 'Dermatology',
        position: 'Specialist',
        status: 'active',
        workingHours: {
            start: '13:00',
            end: '21:00',
            workingDays: ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday']
        },
        qualifications: 'بكالوريوس الطب، دبلوم أمراض الجلدية والتناسلية',
        education: [{
            degree: 'MBBS',
            institution: 'جامعة الطائف',
            fieldOfStudy: 'طب الجلدية',
            graduationYear: 2010
        }],
        schedule: [
            { dayOfWeek: 'saturday', startTime: '13:00', endTime: '21:00', isAvailable: true, maxPatients: 18 },
            { dayOfWeek: 'sunday', startTime: '13:00', endTime: '21:00', isAvailable: true, maxPatients: 18 },
            { dayOfWeek: 'monday', startTime: '13:00', endTime: '21:00', isAvailable: true, maxPatients: 18 },
            { dayOfWeek: 'tuesday', startTime: '13:00', endTime: '21:00', isAvailable: true, maxPatients: 18 },
            { dayOfWeek: 'wednesday', startTime: '13:00', endTime: '21:00', isAvailable: true, maxPatients: 18 }
        ]
    }
];

// Seed doctors
const seedDoctors = async () => {
    try {
        console.log('🌱 Starting to seed doctors...');

        // Clear existing doctors
        await Doctor.deleteMany({});
        console.log('🗑️  Cleared existing doctors');

        // Insert sample doctors
        const insertedDoctors = await Doctor.insertMany(sampleDoctors);
        console.log(`✅ Successfully inserted ${insertedDoctors.length} doctors:`);

        insertedDoctors.forEach((doctor, index) => {
            console.log(`   ${index + 1}. د. ${doctor.firstName} ${doctor.lastName} - ${doctor.specialization}`);
        });

        console.log('\n📊 Doctor Summary:');
        console.log('==================');

        // Group by specialization
        const specializationCounts = {};
        insertedDoctors.forEach(doctor => {
            specializationCounts[doctor.specialization] = (specializationCounts[doctor.specialization] || 0) + 1;
        });

        Object.entries(specializationCounts).forEach(([spec, count]) => {
            console.log(`   • ${spec}: ${count} طبيب`);
        });

        console.log(`\n💰 Consultation Fees Range: ${Math.min(...insertedDoctors.map(d => d.consultationFee))} - ${Math.max(...insertedDoctors.map(d => d.consultationFee))} ر.س`);
        console.log(`👨‍⚕️ Male Doctors: ${insertedDoctors.filter(d => d.gender === 'male').length}`);
        console.log(`👩‍⚕️ Female Doctors: ${insertedDoctors.filter(d => d.gender === 'female').length}`);

    } catch (error) {
        console.error('❌ Error seeding doctors:', error.message);
        throw error;
    }
};

// Main execution
const main = async () => {
    console.log('🏥 Hospital Management System - Doctor Seeding');
    console.log('==============================================\n');

    await connectDB();
    await seedDoctors();

    console.log('\n🎉 Doctor seeding completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('1. Start the server: npm start');
    console.log('2. Access doctors page in frontend');
    console.log('3. Test all doctor management features');

    process.exit(0);
};

// Handle errors
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err.message);
    process.exit(1);
});

// Run the script
main(); 