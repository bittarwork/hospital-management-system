const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Invoice = require('../models/Invoice');
const config = require('../config/config');

async function seedAllData() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(config.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // مسح البيانات الموجودة
        console.log('🗑️ Clearing existing data...');
        await Promise.all([
            Patient.deleteMany({}),
            Doctor.deleteMany({}),
            Invoice.deleteMany({})
        ]);
        console.log('✅ Cleared all existing data');

        // إضافة المرضى
        console.log('\n👥 Adding patients...');
        const patients = [
            {
                firstName: 'أحمد',
                lastName: 'محمد',
                dateOfBirth: new Date('1985-03-15'),
                gender: 'male',
                phone: '+966501234567',
                email: 'ahmed.mohamed@email.com',
                nationalId: '1234567890',
                address: 'الرياض، حي النخيل',
                emergencyContact: {
                    name: 'فاطمة محمد',
                    relationship: 'spouse',
                    phone: '+966507777777'
                },
                consentToTreatment: true
            },
            {
                firstName: 'فاطمة',
                lastName: 'أحمد',
                dateOfBirth: new Date('1990-07-22'),
                gender: 'female',
                phone: '+966507654321',
                email: 'fatima.ahmed@email.com',
                nationalId: '2345678901',
                address: 'جدة، حي الروضة',
                emergencyContact: {
                    name: 'علي أحمد',
                    relationship: 'parent',
                    phone: '+966508888888'
                },
                consentToTreatment: true
            },
            {
                firstName: 'خالد',
                lastName: 'السعد',
                dateOfBirth: new Date('1978-11-08'),
                gender: 'male',
                phone: '+966509876543',
                email: 'khalid.alsaad@email.com',
                nationalId: '3456789012',
                address: 'الدمام، حي الفيصلية',
                emergencyContact: {
                    name: 'سارة السعد',
                    relationship: 'spouse',
                    phone: '+966509999999'
                },
                consentToTreatment: true
            },
            {
                firstName: 'نورا',
                lastName: 'العتيبي',
                dateOfBirth: new Date('1995-02-14'),
                gender: 'female',
                phone: '+966502468135',
                email: 'nora.alotaibi@email.com',
                nationalId: '4567890123',
                address: 'مكة، حي العزيزية',
                emergencyContact: {
                    name: 'محمد العتيبي',
                    relationship: 'parent',
                    phone: '+966501111111'
                },
                consentToTreatment: true
            },
            {
                firstName: 'عبدالله',
                lastName: 'الشهري',
                dateOfBirth: new Date('1982-09-30'),
                gender: 'male',
                phone: '+966505555555',
                email: 'abdullah.alshahri@email.com',
                nationalId: '5678901234',
                address: 'المدينة المنورة، حي قباء',
                emergencyContact: {
                    name: 'أم عبدالله',
                    relationship: 'parent',
                    phone: '+966502222222'
                },
                consentToTreatment: true
            },
            {
                firstName: 'مريم',
                lastName: 'القحطاني',
                dateOfBirth: new Date('1988-12-05'),
                gender: 'female',
                phone: '+966501357924',
                email: 'mariam.alqahtani@email.com',
                nationalId: '6789012345',
                address: 'الطائف، حي الشفا',
                emergencyContact: {
                    name: 'عبدالرحمن القحطاني',
                    relationship: 'spouse',
                    phone: '+966503333333'
                },
                consentToTreatment: true
            }
        ];

        const createdPatients = await Patient.insertMany(patients);
        console.log(`✅ Added ${createdPatients.length} patients`);

        // إضافة الأطباء
        console.log('\n👨‍⚕️ Adding doctors...');
        const doctors = [
            {
                firstName: 'أحمد',
                lastName: 'الخالدي',
                specialization: 'طب قلب',
                phone: '+966511111111',
                email: 'dr.ahmed.khaldi@hospital.com',
                licenseNumber: 'LIC-001-2020',
                consultationFee: 300,
                workingHours: {
                    start: '08:00',
                    end: '16:00'
                },
                availableDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday']
            },
            {
                firstName: 'فاطمة',
                lastName: 'السالم',
                specialization: 'نساء وولادة',
                phone: '+966512222222',
                email: 'dr.fatima.salem@hospital.com',
                licenseNumber: 'LIC-002-2019',
                consultationFee: 350,
                workingHours: {
                    start: '09:00',
                    end: '17:00'
                },
                availableDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday']
            },
            {
                firstName: 'خالد',
                lastName: 'النمر',
                specialization: 'طب أطفال',
                phone: '+966513333333',
                email: 'dr.khalid.alnamir@hospital.com',
                licenseNumber: 'LIC-003-2021',
                consultationFee: 250,
                workingHours: {
                    start: '08:00',
                    end: '15:00'
                },
                availableDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday']
            },
            {
                firstName: 'سارة',
                lastName: 'العتيبي',
                specialization: 'طب عيون',
                phone: '+966514444444',
                email: 'dr.sara.alotaibi@hospital.com',
                licenseNumber: 'LIC-004-2018',
                consultationFee: 280,
                workingHours: {
                    start: '10:00',
                    end: '18:00'
                },
                availableDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday']
            }
        ];

        const createdDoctors = await Doctor.insertMany(doctors);
        console.log(`✅ Added ${createdDoctors.length} doctors`);

        // إضافة الفواتير
        console.log('\n🧾 Adding invoices...');
        const invoices = [];

        const serviceTypes = [
            { name: 'استشارة طبية عامة', price: 150, type: 'consultation' },
            { name: 'فحص تخصصي', price: 250, type: 'medical_procedure' },
            { name: 'تحليل دم شامل', price: 80, type: 'laboratory_test' },
            { name: 'أشعة سينية', price: 120, type: 'radiology' },
            { name: 'تخطيط قلب', price: 100, type: 'diagnostic_test' },
            { name: 'أدوية', price: 85, type: 'medication' }
        ];

        const paymentStatuses = ['unpaid', 'partially_paid', 'paid', 'overdue'];

        // إنشاء 12 فاتورة
        for (let i = 0; i < 12; i++) {
            const patient = createdPatients[Math.floor(Math.random() * createdPatients.length)];
            const doctor = createdDoctors[Math.floor(Math.random() * createdDoctors.length)];

            // تاريخ عشوائي خلال الشهرين الماضيين
            const issueDate = new Date();
            issueDate.setDate(issueDate.getDate() - Math.floor(Math.random() * 60));

            const dueDate = new Date(issueDate);
            dueDate.setDate(dueDate.getDate() + 30);

            // إنشاء عناصر الفاتورة
            const numberOfItems = Math.floor(Math.random() * 3) + 1;
            const lineItems = [];

            for (let j = 0; j < numberOfItems; j++) {
                const service = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
                const quantity = Math.floor(Math.random() * 2) + 1;
                const unitPrice = service.price + (Math.random() * 50 - 25);

                lineItems.push({
                    itemType: service.type,
                    itemName: service.name,
                    description: `${service.name} للمريض ${patient.firstName} ${patient.lastName}`,
                    quantity: quantity,
                    unitPrice: Math.round(unitPrice),
                    discountAmount: 0,
                    totalPrice: Math.round(quantity * unitPrice)
                });
            }

            // حساب المجاميع
            const subtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
            const taxRate = 15;
            const taxAmount = subtotal * (taxRate / 100);
            const totalAmount = subtotal + taxAmount;

            // حالة الدفع
            const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
            let amountPaid = 0;

            if (paymentStatus === 'paid') {
                amountPaid = totalAmount;
            } else if (paymentStatus === 'partially_paid') {
                amountPaid = Math.floor(totalAmount * 0.5);
            } else if (paymentStatus === 'overdue') {
                dueDate.setDate(dueDate.getDate() - 15);
            }

            const invoice = {
                patient: patient._id,
                doctor: doctor._id,
                invoiceNumber: `INV-2024${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
                issueDate: issueDate,
                dueDate: dueDate,
                invoiceType: 'consultation',
                lineItems: lineItems,
                discountType: 'none',
                discountValue: 0,
                taxRate: taxRate,
                subtotal: Math.round(subtotal),
                discountAmount: 0,
                taxAmount: Math.round(taxAmount),
                totalAmount: Math.round(totalAmount),
                amountPaid: Math.round(amountPaid),
                remainingBalance: Math.round(totalAmount - amountPaid),
                paymentStatus: paymentStatus,
                status: 'issued',
                notes: `فاتورة رقم ${i + 1} للمريض ${patient.firstName} ${patient.lastName}`,
                paymentHistory: amountPaid > 0 ? [{
                    amount: amountPaid,
                    paymentMethod: ['cash', 'card', 'transfer'][Math.floor(Math.random() * 3)],
                    paymentDate: new Date(issueDate.getTime() + Math.random() * (Date.now() - issueDate.getTime())),
                    notes: 'دفعة تجريبية'
                }] : []
            };

            invoices.push(invoice);
        }

        const createdInvoices = await Invoice.insertMany(invoices);
        console.log(`✅ Added ${createdInvoices.length} invoices`);

        // عرض ملخص
        const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
        const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);

        console.log('\n📊 Summary:');
        console.log(`👥 Patients: ${createdPatients.length}`);
        console.log(`👨‍⚕️ Doctors: ${createdDoctors.length}`);
        console.log(`🧾 Invoices: ${createdInvoices.length}`);
        console.log(`💰 Total Revenue: ${totalRevenue.toLocaleString()} SAR`);
        console.log(`💵 Total Paid: ${totalPaid.toLocaleString()} SAR`);
        console.log(`📈 Collection Rate: ${((totalPaid / totalRevenue) * 100).toFixed(1)}%`);

        console.log('\n🎉 All data seeded successfully!');

        // فحص نهائي
        console.log('\n🔍 Final verification:');
        const finalPatientCount = await Patient.countDocuments();
        const finalDoctorCount = await Doctor.countDocuments();
        const finalInvoiceCount = await Invoice.countDocuments();

        console.log(`👥 Patients in DB: ${finalPatientCount}`);
        console.log(`👨‍⚕️ Doctors in DB: ${finalDoctorCount}`);
        console.log(`🧾 Invoices in DB: ${finalInvoiceCount}`);

    } catch (error) {
        console.error('❌ Error seeding data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// تشغيل السكريبت
if (require.main === module) {
    seedAllData();
}

module.exports = seedAllData; 