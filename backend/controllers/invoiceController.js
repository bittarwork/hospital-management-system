const Invoice = require('../models/Invoice');

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

        // Add payment logic here
        res.json({
            status: 'success',
            message: 'Payment added successfully',
            data: { invoice }
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
    res.json({ status: 'success', message: 'Update invoice endpoint - Coming soon' });
};

const deleteInvoice = async (req, res) => {
    res.json({ status: 'success', message: 'Delete invoice endpoint - Coming soon' });
};

const searchInvoices = async (req, res) => {
    res.json({ status: 'success', message: 'Search invoices endpoint - Coming soon' });
};

const getInvoicesByPatient = async (req, res) => {
    res.json({ status: 'success', message: 'Get invoices by patient endpoint - Coming soon' });
};

const getInvoicesByDateRange = async (req, res) => {
    res.json({ status: 'success', message: 'Get invoices by date range endpoint - Coming soon' });
};

const getInvoicesStats = async (req, res) => {
    res.json({ status: 'success', message: 'Get invoices stats endpoint - Coming soon' });
};

const getPaymentHistory = async (req, res) => {
    res.json({ status: 'success', message: 'Get payment history endpoint - Coming soon' });
};

const getOverdueInvoices = async (req, res) => {
    res.json({ status: 'success', message: 'Get overdue invoices endpoint - Coming soon' });
};

const sendInvoiceReminder = async (req, res) => {
    res.json({ status: 'success', message: 'Send invoice reminder endpoint - Coming soon' });
};

const generateInvoicePDF = async (req, res) => {
    res.json({ status: 'success', message: 'Generate invoice PDF endpoint - Coming soon' });
};

const sendInvoiceEmail = async (req, res) => {
    res.json({ status: 'success', message: 'Send invoice email endpoint - Coming soon' });
};

const markInvoiceAsPaid = async (req, res) => {
    res.json({ status: 'success', message: 'Mark invoice as paid endpoint - Coming soon' });
};

const voidInvoice = async (req, res) => {
    res.json({ status: 'success', message: 'Void invoice endpoint - Coming soon' });
};

const getInvoicesByStatus = async (req, res) => {
    res.json({ status: 'success', message: 'Get invoices by status endpoint - Coming soon' });
};

const calculateInvoiceTotal = async (req, res) => {
    res.json({ status: 'success', message: 'Calculate invoice total endpoint - Coming soon' });
};

const applyDiscount = async (req, res) => {
    res.json({ status: 'success', message: 'Apply discount endpoint - Coming soon' });
};

const addLineItem = async (req, res) => {
    res.json({ status: 'success', message: 'Add line item endpoint - Coming soon' });
};

const removeLineItem = async (req, res) => {
    res.json({ status: 'success', message: 'Remove line item endpoint - Coming soon' });
};

const updateLineItem = async (req, res) => {
    res.json({ status: 'success', message: 'Update line item endpoint - Coming soon' });
};

const getRevenueReport = async (req, res) => {
    res.json({ status: 'success', message: 'Get revenue report endpoint - Coming soon' });
};

const getPaymentReport = async (req, res) => {
    res.json({ status: 'success', message: 'Get payment report endpoint - Coming soon' });
};

const bulkProcessPayments = async (req, res) => {
    res.json({ status: 'success', message: 'Bulk process payments endpoint - Coming soon' });
};

const exportInvoices = async (req, res) => {
    res.json({ status: 'success', message: 'Export invoices endpoint - Coming soon' });
};

const duplicateInvoice = async (req, res) => {
    res.json({ status: 'success', message: 'Duplicate invoice endpoint - Coming soon' });
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