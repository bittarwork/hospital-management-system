const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const config = require('../config/config');

async function seedInvoices() {
    try {
        // الاتصال بقاعدة البيانات
        await mongoose.connect(config.MONGODB_URI);
        console.log('🔗 Connected to MongoDB');

        // تنظيف الفواتير الموجودة
        await Invoice.deleteMany({});
        console.log('🗑️ Cleared existing invoices');

        // الحصول على المرضى والأطباء الموجودين
        console.log('🔍 Searching for patients and doctors...');
        const patientsCount = await Patient.countDocuments();
        const doctorsCount = await Doctor.countDocuments();

        console.log(`📊 Found ${patientsCount} patients and ${doctorsCount} doctors in database`);

        const patients = await Patient.find({}).limit(10);
        const doctors = await Doctor.find({}).limit(5);

        console.log(`📋 Retrieved ${patients.length} patients and ${doctors.length} doctors for seeding`);

        if (patients.length === 0) {
            console.log('❌ No patients found. Please seed patients first.');
            console.log('💡 Run: node scripts/seedPatients.js');
            return;
        }

        if (doctors.length === 0) {
            console.log('❌ No doctors found. Please seed doctors first.');
            console.log('💡 Run: node scripts/seedDoctors.js');
            return;
        }

        console.log(`👥 Found ${patients.length} patients and ${doctors.length} doctors`);

        // أنواع مختلفة من الخدمات الطبية
        const serviceTypes = [
            {
                itemType: 'consultation',
                itemName: 'استشارة طبية عامة',
                description: 'فحص طبي شامل واستشارة',
                unitPrice: 150
            },
            {
                itemType: 'medical_procedure',
                itemName: 'كشف تخصصي',
                description: 'فحص متخصص مع الطبيب المختص',
                unitPrice: 250
            },
            {
                itemType: 'laboratory_test',
                itemName: 'تحليل دم شامل',
                description: 'فحص دم كامل CBC',
                unitPrice: 80
            },
            {
                itemType: 'laboratory_test',
                itemName: 'تحليل سكر',
                description: 'فحص مستوى السكر في الدم',
                unitPrice: 45
            },
            {
                itemType: 'radiology',
                itemName: 'أشعة سينية',
                description: 'أشعة سينية للصدر',
                unitPrice: 120
            },
            {
                itemType: 'radiology',
                itemName: 'أشعة مقطعية',
                description: 'أشعة مقطعية CT Scan',
                unitPrice: 450
            },
            {
                itemType: 'medication',
                itemName: 'أدوية',
                description: 'أدوية موصوفة من الطبيب',
                unitPrice: 85
            },
            {
                itemType: 'surgery',
                itemName: 'عملية جراحية بسيطة',
                description: 'إجراء جراحي بسيط',
                unitPrice: 800
            },
            {
                itemType: 'diagnostic_test',
                itemName: 'تخطيط قلب',
                description: 'فحص تخطيط القلب ECG',
                unitPrice: 100
            },
            {
                itemType: 'medical_supplies',
                itemName: 'مستلزمات طبية',
                description: 'ضمادات ومستلزمات العلاج',
                unitPrice: 35
            }
        ];

        const invoiceTypes = ['consultation', 'procedure', 'laboratory', 'radiology', 'emergency'];
        const paymentStatuses = ['unpaid', 'partially_paid', 'paid', 'overdue'];
        const statuses = ['draft', 'issued', 'sent'];

        const invoices = [];

        // إنشاء 15 فاتورة متنوعة
        for (let i = 0; i < 15; i++) {
            const patient = patients[Math.floor(Math.random() * patients.length)];
            const doctor = doctors[Math.floor(Math.random() * doctors.length)];

            // تاريخ عشوائي خلال الشهرين الماضيين
            const randomDays = Math.floor(Math.random() * 60);
            const issueDate = new Date();
            issueDate.setDate(issueDate.getDate() - randomDays);

            const dueDate = new Date(issueDate);
            dueDate.setDate(dueDate.getDate() + 30);

            // إنشاء عناصر الفاتورة (1-4 عناصر لكل فاتورة)
            const numberOfItems = Math.floor(Math.random() * 4) + 1;
            const lineItems = [];

            for (let j = 0; j < numberOfItems; j++) {
                const service = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
                const quantity = Math.floor(Math.random() * 3) + 1;
                const unitPrice = service.unitPrice + (Math.random() * 50 - 25); // تنويع في الأسعار
                const discountAmount = Math.random() > 0.7 ? Math.floor(Math.random() * 20) : 0;

                lineItems.push({
                    itemType: service.itemType,
                    itemName: service.itemName,
                    description: service.description,
                    quantity: quantity,
                    unitPrice: Math.round(unitPrice),
                    discountAmount: discountAmount,
                    totalPrice: Math.round((quantity * unitPrice) - discountAmount)
                });
            }

            // حساب المجاميع
            const subtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
            const discountType = Math.random() > 0.8 ? (Math.random() > 0.5 ? 'percentage' : 'fixed_amount') : 'none';
            let discountValue = 0;
            let discountAmount = 0;

            if (discountType === 'percentage') {
                discountValue = Math.floor(Math.random() * 10) + 5; // 5-15%
                discountAmount = subtotal * (discountValue / 100);
            } else if (discountType === 'fixed_amount') {
                discountValue = Math.floor(Math.random() * 50) + 20; // 20-70 ريال
                discountAmount = discountValue;
            }

            const taxRate = 15; // ضريبة القيمة المضافة
            const taxableAmount = subtotal - discountAmount;
            const taxAmount = taxableAmount * (taxRate / 100);
            const totalAmount = taxableAmount + taxAmount;

            // حالة الدفع والمبلغ المدفوع
            const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
            let amountPaid = 0;

            if (paymentStatus === 'paid') {
                amountPaid = totalAmount;
            } else if (paymentStatus === 'partially_paid') {
                amountPaid = Math.floor(totalAmount * (Math.random() * 0.7 + 0.1)); // 10-80% من المبلغ
            } else if (paymentStatus === 'overdue') {
                // فواتير متأخرة (تاريخ الاستحقاق مضى)
                dueDate.setDate(dueDate.getDate() - Math.floor(Math.random() * 30) - 1);
            }

            const invoice = new Invoice({
                patient: patient._id,
                doctor: doctor._id,
                invoiceNumber: `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
                issueDate: issueDate,
                dueDate: dueDate,
                invoiceType: invoiceTypes[Math.floor(Math.random() * invoiceTypes.length)],
                lineItems: lineItems,
                discountType: discountType,
                discountValue: discountValue,
                taxRate: taxRate,
                subtotal: Math.round(subtotal),
                discountAmount: Math.round(discountAmount),
                taxAmount: Math.round(taxAmount),
                totalAmount: Math.round(totalAmount),
                amountPaid: Math.round(amountPaid),
                remainingBalance: Math.round(totalAmount - amountPaid),
                paymentStatus: paymentStatus,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                notes: `فاتورة رقم ${i + 1} - ${patient.firstName} ${patient.lastName}`,
                paymentHistory: amountPaid > 0 ? [{
                    amount: amountPaid,
                    paymentMethod: ['cash', 'card', 'transfer', 'insurance'][Math.floor(Math.random() * 4)],
                    paymentDate: new Date(issueDate.getTime() + Math.random() * (Date.now() - issueDate.getTime())),
                    notes: 'دفعة تجريبية'
                }] : []
            });

            invoices.push(invoice);
        }

        // حفظ الفواتير
        await Invoice.insertMany(invoices);

        console.log(`✅ Successfully created ${invoices.length} invoices`);

        // عرض ملخص
        const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
        const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
        const paidCount = invoices.filter(inv => inv.paymentStatus === 'paid').length;
        const unpaidCount = invoices.filter(inv => inv.paymentStatus === 'unpaid').length;
        const partiallyPaidCount = invoices.filter(inv => inv.paymentStatus === 'partially_paid').length;
        const overdueCount = invoices.filter(inv => inv.paymentStatus === 'overdue').length;

        console.log('\n📊 Invoice Summary:');
        console.log(`💰 Total Revenue: ${totalRevenue.toLocaleString()} SAR`);
        console.log(`💵 Total Paid: ${totalPaid.toLocaleString()} SAR`);
        console.log(`📈 Collection Rate: ${((totalPaid / totalRevenue) * 100).toFixed(1)}%`);
        console.log(`✅ Paid: ${paidCount}`);
        console.log(`🟡 Partially Paid: ${partiallyPaidCount}`);
        console.log(`❌ Unpaid: ${unpaidCount}`);
        console.log(`⚠️ Overdue: ${overdueCount}`);

    } catch (error) {
        console.error('❌ Error seeding invoices:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// تشغيل السكريبت
if (require.main === module) {
    seedInvoices();
}

module.exports = seedInvoices; 