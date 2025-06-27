const mongoose = require('mongoose');
const Patient = require('../models/Patient');
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

// Sample patients data
const samplePatients = [
    {
        nationalId: "1234567890",
        firstName: "أحمد",
        lastName: "محمد",
        dateOfBirth: new Date("1990-05-15"),
        gender: "male",
        phone: "+966501234567",
        email: "ahmed.mohammed@email.com",
        address: "شارع الملك فهد، الرياض",
        emergencyContact: {
            name: "فاطمة محمد",
            relationship: "spouse",
            phone: "+966507654321",
            email: "fatma@email.com"
        },
        bloodType: "O+",
        consentToTreatment: true
    },
    {
        nationalId: "2345678901",
        firstName: "فاطمة",
        lastName: "أحمد",
        dateOfBirth: new Date("1985-08-22"),
        gender: "female",
        phone: "+966502345678",
        email: "fatma.ahmed@email.com",
        address: "طريق الملك عبدالعزيز، جدة",
        emergencyContact: {
            name: "محمد أحمد",
            relationship: "spouse",
            phone: "+966508765432",
        },
        bloodType: "A+",
        consentToTreatment: true
    },
    {
        nationalId: "3456789012",
        firstName: "خالد",
        lastName: "السعد",
        dateOfBirth: new Date("1978-12-10"),
        gender: "male",
        phone: "+966503456789",
        email: "khalid.alsaad@email.com",
        address: "شارع الأمير محمد، الدمام",
        emergencyContact: {
            name: "نورا السعد",
            relationship: "parent",
            phone: "+966509876543",
        },
        bloodType: "B-",
        allergies: [
            {
                allergen: "البنسلين",
                severity: "moderate",
                reaction: "طفح جلدي"
            }
        ],
        consentToTreatment: true
    },
    {
        nationalId: "4567890123",
        firstName: "نورا",
        lastName: "العتيبي",
        dateOfBirth: new Date("1992-03-08"),
        gender: "female",
        phone: "+966504567890",
        email: "nora.alotaibi@email.com",
        address: "حي النخيل، المدينة المنورة",
        emergencyContact: {
            name: "سارة العتيبي",
            relationship: "sibling",
            phone: "+966500987654",
        },
        bloodType: "AB+",
        medicalHistory: [
            {
                condition: "ضغط الدم المرتفع",
                diagnosedDate: new Date("2020-01-15"),
                status: "active",
                severity: "mild"
            }
        ],
        consentToTreatment: true
    },
    {
        nationalId: "5678901234",
        firstName: "عبدالله",
        lastName: "الشهري",
        dateOfBirth: new Date("1995-07-30"),
        gender: "male",
        phone: "+966505678901",
        email: "abdullah.alshehri@email.com",
        address: "شارع الستين، مكة المكرمة",
        emergencyContact: {
            name: "أم عبدالله",
            relationship: "parent",
            phone: "+966501098765",
        },
        bloodType: "O-",
        consentToTreatment: true
    },
    {
        nationalId: "6789012345",
        firstName: "مريم",
        lastName: "القحطاني",
        dateOfBirth: new Date("1988-11-18"),
        gender: "female",
        phone: "+966506789012",
        email: "mariam.alqahtani@email.com",
        address: "طريق الدمام السريع، الخبر",
        emergencyContact: {
            name: "يوسف القحطاني",
            relationship: "spouse",
            phone: "+966502109876",
        },
        bloodType: "A-",
        currentMedications: [
            {
                medicationName: "فيتامين د",
                dosage: "1000 وحدة",
                frequency: "يومياً",
                startDate: new Date("2024-01-01")
            }
        ],
        consentToTreatment: true
    },
    {
        nationalId: "7890123456",
        firstName: "يوسف",
        lastName: "النجار",
        dateOfBirth: new Date("1982-04-25"),
        gender: "male",
        phone: "+966507890123",
        email: "youssef.alnajjar@email.com",
        address: "حي السلامة، الطائف",
        emergencyContact: {
            name: "سلمى النجار",
            relationship: "spouse",
            phone: "+966503210987",
        },
        bloodType: "B+",
        vitals: {
            height: { value: 175, unit: "cm" },
            weight: { value: 78, unit: "kg" },
            bloodPressure: { systolic: 120, diastolic: 80 }
        },
        consentToTreatment: true
    },
    {
        nationalId: "8901234567",
        firstName: "هند",
        lastName: "الرشيد",
        dateOfBirth: new Date("1993-09-12"),
        gender: "female",
        phone: "+966508901234",
        email: "hind.alrasheed@email.com",
        address: "شارع العليا، الرياض",
        emergencyContact: {
            name: "محمد الرشيد",
            relationship: "parent",
            phone: "+966504321098",
        },
        bloodType: "AB-",
        allergies: [
            {
                allergen: "الفول السوداني",
                severity: "severe",
                reaction: "صعوبة التنفس"
            }
        ],
        consentToTreatment: true
    }
];

// Seed function
const seedPatients = async () => {
    try {
        console.log('🌱 Starting to seed patients...');

        // Clear existing patients
        await Patient.deleteMany({});
        console.log('🗑️  Cleared existing patients');

        // Insert sample patients
        const createdPatients = await Patient.insertMany(samplePatients);
        console.log(`✅ Successfully created ${createdPatients.length} patients`);

        // Display created patients
        console.log('\n📋 Created Patients:');
        createdPatients.forEach((patient, index) => {
            console.log(`${index + 1}. ${patient.firstName} ${patient.lastName} - ${patient.nationalId} - ${patient.patientId}`);
        });

    } catch (error) {
        console.error('❌ Error seeding patients:', error.message);
    }
};

// Main execution
const main = async () => {
    await connectDB();
    await seedPatients();

    console.log('\n🎉 Patient seeding completed!');
    console.log('💡 You can now test the patient management system');

    process.exit(0);
};

// Handle errors
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err.message);
    process.exit(1);
});

// Run the script
main(); 