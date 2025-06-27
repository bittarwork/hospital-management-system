const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Invoice = require('../models/Invoice');
const config = require('../config/config');

async function checkDatabase() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        console.log('📍 MongoDB URI:', config.MONGODB_URI);

        await mongoose.connect(config.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // عرض معلومات قاعدة البيانات
        const dbName = mongoose.connection.db.databaseName;
        console.log('🗄️ Database Name:', dbName);

        // التحقق من المجموعات
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📚 Collections in database:');
        collections.forEach((collection, index) => {
            console.log(`   ${index + 1}. ${collection.name}`);
        });

        // عد المستندات في كل مجموعة
        console.log('\n📊 Document counts:');

        try {
            const patientCount = await Patient.countDocuments();
            console.log(`👥 Patients: ${patientCount}`);

            if (patientCount > 0) {
                const samplePatients = await Patient.find({}).limit(3);
                console.log('   Sample patients:');
                samplePatients.forEach((patient, index) => {
                    console.log(`   ${index + 1}. ${patient.firstName} ${patient.lastName} (${patient._id})`);
                });
            }
        } catch (error) {
            console.log('❌ Error counting patients:', error.message);
        }

        try {
            const doctorCount = await Doctor.countDocuments();
            console.log(`👨‍⚕️ Doctors: ${doctorCount}`);

            if (doctorCount > 0) {
                const sampleDoctors = await Doctor.find({}).limit(3);
                console.log('   Sample doctors:');
                sampleDoctors.forEach((doctor, index) => {
                    console.log(`   ${index + 1}. د. ${doctor.firstName} ${doctor.lastName} - ${doctor.specialization} (${doctor._id})`);
                });
            }
        } catch (error) {
            console.log('❌ Error counting doctors:', error.message);
        }

        try {
            const invoiceCount = await Invoice.countDocuments();
            console.log(`🧾 Invoices: ${invoiceCount}`);
        } catch (error) {
            console.log('❌ Error counting invoices:', error.message);
        }

        console.log('\n🔍 Checking collection names directly:');
        const db = mongoose.connection.db;

        // فحص مباشر للمجموعات
        try {
            const patientsCollection = db.collection('patients');
            const patientsDirectCount = await patientsCollection.countDocuments();
            console.log(`📋 'patients' collection: ${patientsDirectCount} documents`);
        } catch (error) {
            console.log('❌ Error with patients collection:', error.message);
        }

        try {
            const doctorsCollection = db.collection('doctors');
            const doctorsDirectCount = await doctorsCollection.countDocuments();
            console.log(`👨‍⚕️ 'doctors' collection: ${doctorsDirectCount} documents`);
        } catch (error) {
            console.log('❌ Error with doctors collection:', error.message);
        }

        try {
            const invoicesCollection = db.collection('invoices');
            const invoicesDirectCount = await invoicesCollection.countDocuments();
            console.log(`🧾 'invoices' collection: ${invoicesDirectCount} documents`);
        } catch (error) {
            console.log('❌ Error with invoices collection:', error.message);
        }

    } catch (error) {
        console.error('❌ Error checking database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// تشغيل السكريبت
if (require.main === module) {
    checkDatabase();
}

module.exports = checkDatabase; 