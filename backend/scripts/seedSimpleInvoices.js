const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const config = require('../config/config');

async function seedSimpleInvoices() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(config.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing invoices
        await Invoice.deleteMany({});
        console.log('🗑️ Cleared existing invoices');

        // Get patients and doctors
        const patients = await Patient.find({}).limit(10);
        const doctors = await Doctor.find({}).limit(10);

        console.log(`📋 Found ${patients.length} patients and ${doctors.length} doctors`);

        if (patients.length === 0 || doctors.length === 0) {
            console.log('❌ Need patients and doctors first');
            return;
        }

        // Try to get an existing user, or use doctor as createdBy
        let adminUser = await User.findOne({});
        if (!adminUser) {
            // If no user exists, try to use the first doctor as createdBy
            adminUser = doctors[0];
            console.log('👤 Using first doctor as createdBy');
        } else {
            console.log('👤 Found existing user');
        }

        const invoices = [];

        // Create 10 simple invoices
        for (let i = 0; i < 10; i++) {
            const patient = patients[i % patients.length];
            const doctor = doctors[i % doctors.length];

            const issueDate = new Date();
            issueDate.setDate(issueDate.getDate() - Math.floor(Math.random() * 30));

            const servicePeriod = {
                startDate: issueDate,
                endDate: new Date(issueDate.getTime() + 60 * 60 * 1000) // 1 hour later
            };

            const invoice = {
                patient: patient._id,
                doctor: doctor._id,
                createdBy: adminUser._id,
                invoiceNumber: `INV-2024-${String(i + 1).padStart(3, '0')}`,
                issueDate: issueDate,
                dueDate: new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days later
                servicePeriod: servicePeriod,
                invoiceType: 'consultation',
                lineItems: [{
                    itemType: 'consultation',
                    itemName: 'استشارة طبية',
                    description: `استشارة طبية مع د. ${doctor.firstName} ${doctor.lastName}`,
                    quantity: 1,
                    unitPrice: 200,
                    discountAmount: 0,
                    totalPrice: 200
                }],
                subtotal: 200,
                taxRate: 15,
                taxAmount: 30,
                totalAmount: 230,
                amountPaid: Math.random() > 0.5 ? 230 : Math.floor(Math.random() * 230),
                paymentStatus: ['unpaid', 'paid', 'partially_paid'][Math.floor(Math.random() * 3)],
                status: 'draft'
            };

            // Calculate remaining balance
            invoice.remainingBalance = invoice.totalAmount - invoice.amountPaid;

            // Add payment history if amount paid > 0
            if (invoice.amountPaid > 0) {
                invoice.paymentHistory = [{
                    amount: invoice.amountPaid,
                    paymentMethod: 'cash',
                    paymentDate: new Date(issueDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
                    notes: 'دفعة تجريبية'
                }];
            }

            invoices.push(invoice);
        }

        // Insert invoices
        const createdInvoices = await Invoice.insertMany(invoices);
        console.log(`✅ Successfully created ${createdInvoices.length} invoices`);

        // Summary
        const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
        const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);

        console.log('\n📊 Invoice Summary:');
        console.log(`💰 Total Revenue: ${totalRevenue.toLocaleString()} SAR`);
        console.log(`💵 Total Paid: ${totalPaid.toLocaleString()} SAR`);
        console.log(`📈 Collection Rate: ${((totalPaid / totalRevenue) * 100).toFixed(1)}%`);

        const paidCount = invoices.filter(inv => inv.paymentStatus === 'paid').length;
        const unpaidCount = invoices.filter(inv => inv.paymentStatus === 'unpaid').length;
        const partialCount = invoices.filter(inv => inv.paymentStatus === 'partially_paid').length;

        console.log(`✅ Paid: ${paidCount}`);
        console.log(`❌ Unpaid: ${unpaidCount}`);
        console.log(`🟡 Partially Paid: ${partialCount}`);

    } catch (error) {
        console.error('❌ Error seeding invoices:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

if (require.main === module) {
    seedSimpleInvoices();
}

module.exports = seedSimpleInvoices; 