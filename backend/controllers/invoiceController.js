const Invoice = require('../models/Invoice');
const mongoose = require('mongoose');

// إنشاء فاتورة جديدة
const createInvoice = async (req, res) => {
    try {
        const invoice = new Invoice(req.body);
        await invoice.save();
        res.status(201).json({
            status: 'success',
            message: 'Invoice created successfully',
            data: { invoice }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// الحصول على جميع الفواتير
const getAllInvoices = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const invoices = await Invoice.find()
            .populate('patient', 'firstName lastName phone')
            .populate('doctor', 'firstName lastName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Invoice.countDocuments();

        res.json({
            status: 'success',
            data: {
                invoices,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalInvoices: total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// الحصول على فاتورة واحدة
const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('patient')
            .populate('doctor');

        if (!invoice) {
            return res.status(404).json({
                status: 'fail',
                message: 'Invoice not found'
            });
        }

        res.json({
            status: 'success',
            data: { invoice }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// إضافة دفعة للفاتورة
const addPayment = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                status: 'fail',
                message: 'Invoice not found'
            });
        }

        const { amount, paymentMethod, transactionId, notes, receivedBy } = req.body;

        // التحقق من صحة المبلغ
        if (!amount || amount <= 0) {
            return res.status(400).json({
                status: 'fail',
                message: 'Payment amount must be greater than 0'
            });
        }

        if (amount > invoice.remainingBalance) {
            return res.status(400).json({
                status: 'fail',
                message: 'Payment amount cannot exceed remaining balance'
            });
        }

        // إضافة الدفعة الجديدة
        const newPayment = {
            amount: parseFloat(amount),
            paymentMethod: paymentMethod || 'cash',
            transactionId: transactionId || '',
            notes: notes || '',
            receivedBy: receivedBy || 'system',
            paymentDate: new Date(),
            status: 'completed'
        };

        invoice.payments.push(newPayment);

        // تحديث المبالغ
        invoice.amountPaid = invoice.payments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + p.amount, 0);

        invoice.remainingBalance = invoice.totalAmount - invoice.amountPaid;

        // تحديث حالة الدفع
        if (invoice.remainingBalance <= 0) {
            invoice.paymentStatus = 'paid';
            invoice.status = 'paid';
        } else if (invoice.amountPaid > 0) {
            invoice.paymentStatus = 'partially_paid';
        }

        await invoice.save();

        await invoice.populate(['patient', 'doctor']);

        res.json({
            status: 'success',
            message: 'Payment added successfully',
            data: {
                invoice,
                payment: newPayment
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Placeholder functions for all missing routes
const updateInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                status: 'fail',
                message: 'Invoice not found'
            });
        }

        // فصل البيانات المختلفة للتحديث
        const {
            invoiceNumber,
            issueDate,
            dueDate,
            invoiceType,
            lineItems,
            discountType,
            discountValue,
            taxRate,
            notes,
            patient,
            doctor,
            appointment,
            ...otherFields
        } = req.body;

        // تحديث البيانات الأساسية
        if (invoiceNumber !== undefined) invoice.invoiceNumber = invoiceNumber;
        if (issueDate !== undefined) invoice.issueDate = new Date(issueDate);
        if (dueDate !== undefined) invoice.dueDate = new Date(dueDate);
        if (invoiceType !== undefined) invoice.invoiceType = invoiceType;
        if (notes !== undefined) invoice.notes = notes;
        if (patient !== undefined) invoice.patient = patient;
        if (doctor !== undefined) invoice.doctor = doctor;
        if (appointment !== undefined) invoice.appointment = appointment;

        // تحديث عناصر الفاتورة
        if (lineItems && Array.isArray(lineItems)) {
            invoice.lineItems = lineItems.map(item => ({
                itemType: item.itemType || 'other',
                itemName: item.itemName || '',
                description: item.description || '',
                quantity: parseFloat(item.quantity) || 1,
                unitPrice: parseFloat(item.unitPrice) || 0,
                discountAmount: parseFloat(item.discountAmount) || 0,
                totalPrice: (parseFloat(item.quantity) || 1) * (parseFloat(item.unitPrice) || 0) - (parseFloat(item.discountAmount) || 0),
                serviceDate: item.serviceDate || new Date(),
                isActive: item.isActive !== false
            }));
        }

        // تحديث معلومات الخصم
        if (discountType !== undefined) invoice.discountType = discountType;
        if (discountValue !== undefined) invoice.discountValue = parseFloat(discountValue) || 0;
        if (taxRate !== undefined) invoice.taxRate = parseFloat(taxRate) || 0;

        // إعادة حساب الإجماليات
        let subtotal = 0;
        if (invoice.lineItems && invoice.lineItems.length > 0) {
            invoice.lineItems.forEach(item => {
                if (item.isActive !== false) {
                    subtotal += item.totalPrice || 0;
                }
            });
        }

        invoice.subtotal = subtotal;

        // حساب الخصم
        let discountAmount = 0;
        if (invoice.discountType === 'percentage') {
            discountAmount = subtotal * (invoice.discountValue / 100);
        } else if (invoice.discountType === 'fixed_amount') {
            discountAmount = invoice.discountValue;
        }
        invoice.discountAmount = discountAmount;

        // حساب الضريبة
        const taxableAmount = subtotal - discountAmount;
        invoice.taxAmount = taxableAmount * (invoice.taxRate / 100);

        // حساب المجموع النهائي
        invoice.totalAmount = taxableAmount + invoice.taxAmount;
        invoice.remainingBalance = invoice.totalAmount - (invoice.amountPaid || 0);

        // تحديث أي حقول أخرى
        Object.keys(otherFields).forEach(key => {
            if (otherFields[key] !== undefined) {
                invoice[key] = otherFields[key];
            }
        });

        await invoice.save();

        await invoice.populate(['patient', 'doctor', 'appointment']);

        res.json({
            status: 'success',
            message: 'Invoice updated successfully',
            data: { invoice }
        });
    } catch (error) {
        console.error('Update invoice error:', error);

        // رسائل خطأ أكثر تفصيلاً
        let errorMessage = error.message;
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            errorMessage = `Validation failed: ${validationErrors.join(', ')}`;
        } else if (error.name === 'CastError') {
            errorMessage = `Invalid data type for field: ${error.path}`;
        }

        res.status(400).json({
            status: 'fail',
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

const deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                status: 'fail',
                message: 'Invoice not found'
            });
        }

        // التحقق من إمكانية الحذف
        if (invoice.paymentStatus === 'paid') {
            return res.status(400).json({
                status: 'fail',
                message: 'Cannot delete paid invoice'
            });
        }

        await Invoice.findByIdAndDelete(req.params.id);

        res.json({
            status: 'success',
            message: 'Invoice deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

const searchInvoices = async (req, res) => {
    try {
        const {
            query,
            patientName,
            invoiceNumber,
            status,
            dateFrom,
            dateTo,
            amountFrom,
            amountTo,
            page = 1,
            limit = 10
        } = req.query;

        const skip = (page - 1) * limit;
        let searchCriteria = {};

        // البحث العام
        if (query) {
            searchCriteria.$or = [
                { invoiceNumber: { $regex: query, $options: 'i' } },
                { notes: { $regex: query, $options: 'i' } }
            ];
        }

        // البحث برقم الفاتورة
        if (invoiceNumber) {
            searchCriteria.invoiceNumber = { $regex: invoiceNumber, $options: 'i' };
        }

        // فلترة حسب الحالة
        if (status) {
            searchCriteria.paymentStatus = status;
        }

        // فلترة حسب التاريخ
        if (dateFrom || dateTo) {
            searchCriteria.issueDate = {};
            if (dateFrom) searchCriteria.issueDate.$gte = new Date(dateFrom);
            if (dateTo) searchCriteria.issueDate.$lte = new Date(dateTo);
        }

        // فلترة حسب المبلغ
        if (amountFrom || amountTo) {
            searchCriteria.totalAmount = {};
            if (amountFrom) searchCriteria.totalAmount.$gte = parseFloat(amountFrom);
            if (amountTo) searchCriteria.totalAmount.$lte = parseFloat(amountTo);
        }

        const invoices = await Invoice.find(searchCriteria)
            .populate('patient', 'firstName lastName phone nationalId')
            .populate('doctor', 'firstName lastName specialization')
            .populate('appointment', 'appointmentDate appointmentTime')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // فلترة حسب اسم المريض بعد populate
        let filteredInvoices = invoices;
        if (patientName) {
            filteredInvoices = invoices.filter(invoice => {
                if (!invoice.patient) return false;
                const fullName = `${invoice.patient.firstName} ${invoice.patient.lastName}`.toLowerCase();
                return fullName.includes(patientName.toLowerCase());
            });
        }

        const total = await Invoice.countDocuments(searchCriteria);

        res.json({
            status: 'success',
            data: {
                invoices: filteredInvoices,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalInvoices: total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

const getInvoicesByPatient = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;

        let searchCriteria = { patient: patientId };
        if (status) {
            searchCriteria.paymentStatus = status;
        }

        const invoices = await Invoice.find(searchCriteria)
            .populate('doctor', 'firstName lastName specialization')
            .populate('appointment', 'appointmentDate appointmentTime')
            .sort({ issueDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Invoice.countDocuments(searchCriteria);

        // إحصائيات المريض
        const patientStats = await Invoice.aggregate([
            { $match: { patient: mongoose.Types.ObjectId(patientId) } },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$totalAmount' },
                    totalPaid: { $sum: '$amountPaid' },
                    totalOutstanding: { $sum: '$remainingBalance' },
                    invoiceCount: { $sum: 1 }
                }
            }
        ]);

        res.json({
            status: 'success',
            data: {
                invoices,
                statistics: patientStats[0] || {},
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalInvoices: total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

const getInvoicesByDateRange = async (req, res) => {
    res.json({ status: 'success', message: 'Get invoices by date range endpoint - Coming soon' });
};

const getInvoicesStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let matchCriteria = {};
        if (startDate && endDate) {
            matchCriteria.issueDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // إحصائيات عامة
        const totalInvoices = await Invoice.countDocuments(matchCriteria);

        // إحصائيات حسب الحالة
        const statusStats = await Invoice.aggregate([
            { $match: matchCriteria },
            {
                $group: {
                    _id: '$paymentStatus',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' },
                    paidAmount: { $sum: '$amountPaid' }
                }
            }
        ]);

        // إحصائيات مالية
        const financialStats = await Invoice.aggregate([
            { $match: matchCriteria },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalPaid: { $sum: '$amountPaid' },
                    totalOutstanding: { $sum: '$remainingBalance' },
                    averageInvoiceAmount: { $avg: '$totalAmount' }
                }
            }
        ]);

        // الفواتير المتأخرة
        const overdueCount = await Invoice.countDocuments({
            ...matchCriteria,
            dueDate: { $lt: new Date() },
            paymentStatus: { $nin: ['paid', 'cancelled'] }
        });

        // إحصائيات شهرية
        const monthlyStats = await Invoice.aggregate([
            { $match: matchCriteria },
            {
                $group: {
                    _id: {
                        year: { $year: '$issueDate' },
                        month: { $month: '$issueDate' }
                    },
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' },
                    paidAmount: { $sum: '$amountPaid' }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
        ]);

        // أهم المرضى (حسب القيمة)
        const topPatients = await Invoice.aggregate([
            { $match: matchCriteria },
            {
                $group: {
                    _id: '$patient',
                    totalAmount: { $sum: '$totalAmount' },
                    invoiceCount: { $sum: 1 }
                }
            },
            { $sort: { totalAmount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'patients',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'patientInfo'
                }
            }
        ]);

        res.json({
            status: 'success',
            data: {
                summary: {
                    totalInvoices,
                    overdueCount,
                    ...financialStats[0]
                },
                statusBreakdown: statusStats,
                monthlyTrends: monthlyStats,
                topPatients: topPatients
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

const getPaymentHistory = async (req, res) => {
    res.json({ status: 'success', message: 'Get payment history endpoint - Coming soon' });
};

const getOverdueInvoices = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const currentDate = new Date();

        const overdueInvoices = await Invoice.find({
            dueDate: { $lt: currentDate },
            paymentStatus: { $nin: ['paid', 'cancelled'] }
        })
            .populate('patient', 'firstName lastName phone email nationalId')
            .populate('doctor', 'firstName lastName specialization')
            .sort({ dueDate: 1 }) // الأقدم أولاً
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Invoice.countDocuments({
            dueDate: { $lt: currentDate },
            paymentStatus: { $nin: ['paid', 'cancelled'] }
        });

        // حساب الأيام المتأخرة لكل فاتورة
        const invoicesWithOverdueDays = overdueInvoices.map(invoice => {
            const overdueDays = Math.floor(
                (currentDate - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24)
            );
            return {
                ...invoice.toObject(),
                overdueDays
            };
        });

        res.json({
            status: 'success',
            data: {
                overdueInvoices: invoicesWithOverdueDays,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalOverdue: total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

const sendInvoiceReminder = async (req, res) => {
    res.json({ status: 'success', message: 'Send invoice reminder endpoint - Coming soon' });
};

const generateInvoicePDF = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('patient')
            .populate('doctor')
            .populate('appointment');

        if (!invoice) {
            return res.status(404).json({
                status: 'fail',
                message: 'Invoice not found'
            });
        }

        // هنا يمكن إضافة مكتبة PDF مثل PDFKit أو Puppeteer
        // لكن الآن سنرجع البيانات المطلوبة لإنشاء PDF في Frontend

        const pdfData = {
            invoice: {
                number: invoice.invoiceNumber,
                issueDate: invoice.issueDate,
                dueDate: invoice.dueDate,
                status: invoice.paymentStatus
            },
            hospital: {
                name: 'مستشفى ماهر العلي',
                address: 'الرياض، المملكة العربية السعودية',
                phone: '+966-11-1234567',
                email: 'info@maherhospital.com'
            },
            patient: {
                name: `${invoice.patient.firstName} ${invoice.patient.lastName}`,
                phone: invoice.patient.phone,
                email: invoice.patient.email,
                nationalId: invoice.patient.nationalId
            },
            doctor: invoice.doctor ? {
                name: `${invoice.doctor.firstName} ${invoice.doctor.lastName}`,
                specialization: invoice.doctor.specialization
            } : null,
            lineItems: invoice.lineItems,
            totals: {
                subtotal: invoice.subtotal,
                discountAmount: invoice.discountAmount,
                taxAmount: invoice.taxAmount,
                totalAmount: invoice.totalAmount,
                amountPaid: invoice.amountPaid,
                remainingBalance: invoice.remainingBalance
            },
            payments: invoice.payments,
            notes: invoice.notes
        };

        res.json({
            status: 'success',
            message: 'Invoice PDF data generated successfully',
            data: { pdfData }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

const sendInvoiceEmail = async (req, res) => {
    res.json({ status: 'success', message: 'Send invoice email endpoint - Coming soon' });
};

const markInvoiceAsPaid = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                status: 'fail',
                message: 'Invoice not found'
            });
        }

        if (invoice.paymentStatus === 'paid') {
            return res.status(400).json({
                status: 'fail',
                message: 'Invoice is already paid'
            });
        }

        const { paymentMethod = 'cash', notes = '', receivedBy = 'system' } = req.body;
        const remainingAmount = invoice.remainingBalance;

        // إضافة دفعة للمبلغ المتبقي
        const paymentEntry = {
            amount: remainingAmount,
            paymentMethod,
            notes,
            receivedBy,
            paymentDate: new Date(),
            status: 'completed'
        };

        invoice.payments.push(paymentEntry);
        invoice.amountPaid = invoice.totalAmount;
        invoice.remainingBalance = 0;
        invoice.paymentStatus = 'paid';
        invoice.status = 'paid';

        await invoice.save();

        await invoice.populate(['patient', 'doctor']);

        res.json({
            status: 'success',
            message: 'Invoice marked as paid successfully',
            data: { invoice }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

const voidInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                status: 'fail',
                message: 'Invoice not found'
            });
        }

        if (invoice.paymentStatus === 'paid') {
            return res.status(400).json({
                status: 'fail',
                message: 'Cannot void a paid invoice'
            });
        }

        const { reason } = req.body;

        // إلغاء الفاتورة
        invoice.status = 'cancelled';
        invoice.paymentStatus = 'cancelled';
        invoice.notes = invoice.notes + `\n\nFATURA İPTAL EDİLDİ - تاريخ: ${new Date().toISOString()}\nسبب الإلغاء: ${reason || 'غير محدد'}`;

        await invoice.save();

        res.json({
            status: 'success',
            message: 'Invoice voided successfully',
            data: { invoice }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

const getInvoicesByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const validStatuses = ['unpaid', 'partially_paid', 'paid', 'overdue', 'cancelled', 'refunded', 'pending'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid payment status'
            });
        }

        const invoices = await Invoice.find({ paymentStatus: status })
            .populate('patient', 'firstName lastName phone email')
            .populate('doctor', 'firstName lastName specialization')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Invoice.countDocuments({ paymentStatus: status });

        res.json({
            status: 'success',
            data: {
                invoices,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalInvoices: total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

const calculateInvoiceTotal = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                status: 'fail',
                message: 'Invoice not found'
            });
        }

        // حساب المجموع الفرعي
        let subtotal = 0;
        invoice.lineItems.forEach(item => {
            if (item.isActive) {
                item.totalPrice = (item.quantity * item.unitPrice) - item.discountAmount;
                subtotal += item.totalPrice;
            }
        });

        // حساب الخصم الإجمالي
        let totalDiscountAmount = 0;
        if (invoice.discountType === 'percentage') {
            totalDiscountAmount = subtotal * (invoice.discountValue / 100);
        } else if (invoice.discountType === 'fixed_amount') {
            totalDiscountAmount = invoice.discountValue;
        }

        // حساب الضريبة
        const taxableAmount = subtotal - totalDiscountAmount;
        const taxAmount = taxableAmount * (invoice.taxRate / 100);

        // حساب المجموع النهائي
        const totalAmount = taxableAmount + taxAmount;

        // تحديث الفاتورة
        invoice.subtotal = subtotal;
        invoice.discountAmount = totalDiscountAmount;
        invoice.taxAmount = taxAmount;
        invoice.totalAmount = totalAmount;
        invoice.remainingBalance = totalAmount - invoice.amountPaid;

        await invoice.save();

        res.json({
            status: 'success',
            message: 'Invoice total calculated successfully',
            data: {
                invoice,
                calculations: {
                    subtotal,
                    discountAmount: totalDiscountAmount,
                    taxAmount,
                    totalAmount,
                    remainingBalance: invoice.remainingBalance
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

const applyDiscount = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                status: 'fail',
                message: 'Invoice not found'
            });
        }

        const { discountType, discountValue, discountReason } = req.body;

        if (!discountType || !discountValue) {
            return res.status(400).json({
                status: 'fail',
                message: 'Discount type and value are required'
            });
        }

        if (!['percentage', 'fixed_amount'].includes(discountType)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid discount type. Must be percentage or fixed_amount'
            });
        }

        // التحقق من صحة قيمة الخصم
        if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Percentage discount must be between 0 and 100'
            });
        }

        if (discountType === 'fixed_amount' && discountValue < 0) {
            return res.status(400).json({
                status: 'fail',
                message: 'Fixed amount discount cannot be negative'
            });
        }

        // تطبيق الخصم
        invoice.discountType = discountType;
        invoice.discountValue = parseFloat(discountValue);
        invoice.discountReason = discountReason || '';

        // إعادة حساب المبالغ
        let discountAmount = 0;
        if (discountType === 'percentage') {
            discountAmount = invoice.subtotal * (discountValue / 100);
        } else {
            discountAmount = discountValue;
        }

        invoice.discountAmount = discountAmount;
        const taxableAmount = invoice.subtotal - discountAmount;
        invoice.taxAmount = taxableAmount * (invoice.taxRate / 100);
        invoice.totalAmount = taxableAmount + invoice.taxAmount;
        invoice.remainingBalance = invoice.totalAmount - invoice.amountPaid;

        await invoice.save();

        res.json({
            status: 'success',
            message: 'Discount applied successfully',
            data: {
                invoice,
                appliedDiscount: {
                    type: discountType,
                    value: discountValue,
                    amount: discountAmount,
                    reason: discountReason
                }
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const addLineItem = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                status: 'fail',
                message: 'Invoice not found'
            });
        }

        const { itemType, itemName, description, quantity = 1, unitPrice, discountAmount = 0 } = req.body;

        if (!itemType || !itemName || !unitPrice) {
            return res.status(400).json({
                status: 'fail',
                message: 'Item type, name, and unit price are required'
            });
        }

        const totalPrice = (quantity * unitPrice) - discountAmount;

        const newLineItem = {
            itemType,
            itemName,
            description: description || '',
            quantity: parseFloat(quantity),
            unitPrice: parseFloat(unitPrice),
            discountAmount: parseFloat(discountAmount),
            totalPrice,
            serviceDate: new Date(),
            isActive: true
        };

        invoice.lineItems.push(newLineItem);

        // إعادة حساب الإجماليات
        let subtotal = 0;
        invoice.lineItems.forEach(item => {
            if (item.isActive) {
                subtotal += item.totalPrice;
            }
        });

        invoice.subtotal = subtotal;
        invoice.totalAmount = subtotal - invoice.discountAmount + invoice.taxAmount;
        invoice.remainingBalance = invoice.totalAmount - invoice.amountPaid;

        await invoice.save();

        res.json({
            status: 'success',
            message: 'Line item added successfully',
            data: {
                invoice,
                addedItem: newLineItem
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const removeLineItem = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                status: 'fail',
                message: 'Invoice not found'
            });
        }

        const { itemId } = req.params;
        const lineItemIndex = invoice.lineItems.findIndex(
            item => item._id.toString() === itemId
        );

        if (lineItemIndex === -1) {
            return res.status(404).json({
                status: 'fail',
                message: 'Line item not found'
            });
        }

        // إزالة العنصر
        invoice.lineItems.splice(lineItemIndex, 1);

        // إعادة حساب الإجماليات
        let subtotal = 0;
        invoice.lineItems.forEach(item => {
            if (item.isActive) {
                subtotal += item.totalPrice;
            }
        });

        invoice.subtotal = subtotal;
        invoice.totalAmount = subtotal - invoice.discountAmount + invoice.taxAmount;
        invoice.remainingBalance = invoice.totalAmount - invoice.amountPaid;

        await invoice.save();

        res.json({
            status: 'success',
            message: 'Line item removed successfully',
            data: { invoice }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

const updateLineItem = async (req, res) => {
    res.json({ status: 'success', message: 'Update line item endpoint - Coming soon' });
};

const getRevenueReport = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'month' } = req.query;

        let matchCriteria = {};
        if (startDate && endDate) {
            matchCriteria.issueDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        let groupStage = {};
        let sortStage = {};

        switch (groupBy) {
            case 'day':
                groupStage = {
                    _id: {
                        year: { $year: '$issueDate' },
                        month: { $month: '$issueDate' },
                        day: { $dayOfMonth: '$issueDate' }
                    }
                };
                sortStage = { '_id.year': -1, '_id.month': -1, '_id.day': -1 };
                break;
            case 'week':
                groupStage = {
                    _id: {
                        year: { $year: '$issueDate' },
                        week: { $week: '$issueDate' }
                    }
                };
                sortStage = { '_id.year': -1, '_id.week': -1 };
                break;
            case 'month':
            default:
                groupStage = {
                    _id: {
                        year: { $year: '$issueDate' },
                        month: { $month: '$issueDate' }
                    }
                };
                sortStage = { '_id.year': -1, '_id.month': -1 };
                break;
        }

        const revenueData = await Invoice.aggregate([
            { $match: matchCriteria },
            {
                $group: {
                    ...groupStage,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalPaid: { $sum: '$amountPaid' },
                    totalOutstanding: { $sum: '$remainingBalance' },
                    invoiceCount: { $sum: 1 },
                    averageInvoiceValue: { $avg: '$totalAmount' }
                }
            },
            { $sort: sortStage },
            { $limit: 100 }
        ]);

        // إحصائيات حسب نوع الخدمة
        const serviceTypeRevenue = await Invoice.aggregate([
            { $match: matchCriteria },
            {
                $group: {
                    _id: '$invoiceType',
                    totalRevenue: { $sum: '$totalAmount' },
                    totalPaid: { $sum: '$amountPaid' },
                    invoiceCount: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        // إحصائيات حسب الطبيب
        const doctorRevenue = await Invoice.aggregate([
            { $match: { ...matchCriteria, doctor: { $exists: true } } },
            {
                $group: {
                    _id: '$doctor',
                    totalRevenue: { $sum: '$totalAmount' },
                    invoiceCount: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'doctors',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'doctorInfo'
                }
            }
        ]);

        // الإجماليات
        const totals = await Invoice.aggregate([
            { $match: matchCriteria },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalPaid: { $sum: '$amountPaid' },
                    totalOutstanding: { $sum: '$remainingBalance' },
                    totalInvoices: { $sum: 1 }
                }
            }
        ]);

        res.json({
            status: 'success',
            data: {
                summary: totals[0] || {},
                revenueByPeriod: revenueData,
                revenueByServiceType: serviceTypeRevenue,
                revenueByDoctor: doctorRevenue,
                period: {
                    startDate: startDate || 'all-time',
                    endDate: endDate || 'all-time',
                    groupBy
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

const getPaymentReport = async (req, res) => {
    res.json({ status: 'success', message: 'Get payment report endpoint - Coming soon' });
};

const bulkProcessPayments = async (req, res) => {
    res.json({ status: 'success', message: 'Bulk process payments endpoint - Coming soon' });
};

const exportInvoices = async (req, res) => {
    try {
        const {
            format = 'json',
            startDate,
            endDate,
            status,
            paymentStatus,
            patientId,
            doctorId,
            invoiceType
        } = req.query;

        let searchCriteria = {};

        // فلترة حسب التاريخ
        if (startDate && endDate) {
            searchCriteria.issueDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // فلترة حسب حالة الفاتورة
        if (status) {
            const statusArray = status.split(',').map(s => s.trim());
            searchCriteria.status = { $in: statusArray };
        }

        // فلترة حسب حالة الدفع
        if (paymentStatus) {
            const paymentStatusArray = paymentStatus.split(',').map(s => s.trim());
            searchCriteria.paymentStatus = { $in: paymentStatusArray };
        }

        // فلترة حسب نوع الفاتورة
        if (invoiceType) {
            searchCriteria.invoiceType = invoiceType;
        }

        // فلترة حسب المريض
        if (patientId) {
            searchCriteria.patient = patientId;
        }

        // فلترة حسب الطبيب
        if (doctorId) {
            searchCriteria.doctor = doctorId;
        }

        const invoices = await Invoice.find(searchCriteria)
            .populate('patient', 'firstName lastName phone email nationalId')
            .populate('doctor', 'firstName lastName specialization')
            .populate('appointment', 'appointmentDate appointmentTime')
            .sort({ issueDate: -1 })
            .limit(5000); // حد أقصى للأمان

        // دالة مساعدة لتنسيق التاريخ
        const formatDate = (date) => {
            if (!date) return '';
            return new Date(date).toLocaleDateString('ar-SA');
        };

        // دالة مساعدة لتنسيق الحالة
        const formatStatus = (status) => {
            const statusMap = {
                'draft': 'مسودة',
                'issued': 'صادرة',
                'sent': 'مرسلة',
                'cancelled': 'ملغية',
                'void': 'باطلة',
                'unpaid': 'غير مدفوعة',
                'partially_paid': 'مدفوعة جزئياً',
                'paid': 'مدفوعة',
                'overdue': 'متأخرة',
                'refunded': 'مسترجعة'
            };
            return statusMap[status] || status;
        };

        if (format === 'csv') {
            // تحويل البيانات لصيغة CSV
            const csvData = invoices.map(invoice => ({
                'رقم الفاتورة': invoice.invoiceNumber || '',
                'تاريخ الإصدار': formatDate(invoice.issueDate),
                'تاريخ الاستحقاق': formatDate(invoice.dueDate),
                'اسم المريض': invoice.patient ? `${invoice.patient.firstName || ''} ${invoice.patient.lastName || ''}`.trim() : '',
                'هاتف المريض': invoice.patient?.phone || '',
                'اسم الطبيب': invoice.doctor ? `د. ${invoice.doctor.firstName || ''} ${invoice.doctor.lastName || ''}`.trim() : '',
                'التخصص': invoice.doctor?.specialization || '',
                'نوع الفاتورة': invoice.invoiceType || '',
                'المبلغ الفرعي': invoice.subtotal || 0,
                'مبلغ الخصم': invoice.discountAmount || 0,
                'مبلغ الضريبة': invoice.taxAmount || 0,
                'المبلغ الإجمالي': invoice.totalAmount || 0,
                'المبلغ المدفوع': invoice.amountPaid || 0,
                'المبلغ المتبقي': invoice.remainingBalance || 0,
                'حالة الفاتورة': formatStatus(invoice.status),
                'حالة الدفع': formatStatus(invoice.paymentStatus),
                'عدد العناصر': invoice.lineItems?.length || 0,
                'ملاحظات': invoice.notes || ''
            }));

            // تحويل إلى نص CSV
            if (csvData.length > 0) {
                const headers = Object.keys(csvData[0]);
                const csvContent = [
                    headers.join(','),
                    ...csvData.map(row =>
                        headers.map(header => {
                            const value = row[header];
                            // إضافة علامات اقتباس إذا كانت القيمة تحتوي على فاصلة أو نص
                            return typeof value === 'string' && (value.includes(',') || value.includes('"'))
                                ? `"${value.replace(/"/g, '""')}"`
                                : value;
                        }).join(',')
                    )
                ].join('\n');

                res.json({
                    status: 'success',
                    message: 'Invoices exported successfully as CSV',
                    data: csvContent,
                    count: csvData.length,
                    format: 'csv'
                });
            } else {
                res.json({
                    status: 'success',
                    message: 'No invoices found for export',
                    data: '',
                    count: 0,
                    format: 'csv'
                });
            }
        } else {
            // إرجاع البيانات كـ JSON
            res.json({
                status: 'success',
                message: 'Invoices exported successfully',
                data: {
                    format: 'json',
                    count: invoices.length,
                    invoices,
                    exportDate: new Date().toISOString(),
                    filters: {
                        startDate: startDate || null,
                        endDate: endDate || null,
                        status: status || null,
                        paymentStatus: paymentStatus || null,
                        invoiceType: invoiceType || null,
                        patientId: patientId || null,
                        doctorId: doctorId || null
                    }
                }
            });
        }
    } catch (error) {
        console.error('Export invoices error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

const duplicateInvoice = async (req, res) => {
    try {
        const originalInvoice = await Invoice.findById(req.params.id);

        if (!originalInvoice) {
            return res.status(404).json({
                status: 'fail',
                message: 'Original invoice not found'
            });
        }

        // إنشاء رقم فاتورة جديد
        const generateInvoiceNumber = () => {
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            return `INV-${year}${month}-${random}`;
        };

        // إنشاء نسخة من الفاتورة
        const duplicateData = {
            ...originalInvoice.toObject(),
            _id: undefined,
            invoiceNumber: generateInvoiceNumber(),
            issueDate: new Date(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 يوم من الآن
            paymentStatus: 'unpaid',
            status: 'draft',
            amountPaid: 0,
            remainingBalance: originalInvoice.totalAmount,
            payments: [],
            createdAt: undefined,
            updatedAt: undefined,
            notes: `نسخة من الفاتورة رقم: ${originalInvoice.invoiceNumber}\n${originalInvoice.notes || ''}`
        };

        const duplicatedInvoice = new Invoice(duplicateData);
        await duplicatedInvoice.save();

        await duplicatedInvoice.populate(['patient', 'doctor', 'appointment']);

        res.json({
            status: 'success',
            message: 'Invoice duplicated successfully',
            data: {
                originalInvoice: originalInvoice.invoiceNumber,
                duplicatedInvoice
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

module.exports = {
    createInvoice,
    getAllInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
    searchInvoices,
    getInvoicesByPatient,
    getInvoicesByDateRange,
    getInvoicesStats,
    addPayment,
    getPaymentHistory,
    getOverdueInvoices,
    sendInvoiceReminder,
    generateInvoicePDF,
    sendInvoiceEmail,
    markInvoiceAsPaid,
    voidInvoice,
    getInvoicesByStatus,
    calculateInvoiceTotal,
    applyDiscount,
    addLineItem,
    removeLineItem,
    updateLineItem,
    getRevenueReport,
    getPaymentReport,
    bulkProcessPayments,
    exportInvoices,
    duplicateInvoice
}; 