const express = require('express');
const router = express.Router();

// Import all controller functions
const {
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
} = require('../controllers/invoiceController');

// Invoice CRUD Operations
router.post('/', createInvoice);                               // Create new invoice
router.get('/', getAllInvoices);                               // Get all invoices with pagination
router.get('/search', searchInvoices);                         // Search invoices by criteria
router.get('/stats', getInvoicesStats);                        // Get invoice statistics

// Invoice Queries
router.get('/overdue', getOverdueInvoices);                    // Get overdue invoices
router.get('/status/:status', getInvoicesByStatus);            // Get invoices by status
router.get('/patient/:patientId', getInvoicesByPatient);       // Get invoices by patient
router.get('/date-range', getInvoicesByDateRange); // Get invoices by date range (use query params)

// Reports
router.get('/reports/revenue', getRevenueReport);              // Get revenue report
router.get('/reports/payments', getPaymentReport);             // Get payment report

// Individual Invoice Operations (parameterized routes at the end)
router.get('/:id', getInvoiceById);                            // Get invoice by ID
router.put('/:id', updateInvoice);                             // Update invoice
router.delete('/:id', deleteInvoice);                          // Delete invoice

// Invoice Actions
router.post('/:id/duplicate', duplicateInvoice);               // Duplicate invoice
router.patch('/:id/calculate', calculateInvoiceTotal);         // Recalculate invoice total
router.patch('/:id/discount', applyDiscount);                  // Apply discount to invoice
router.patch('/:id/paid', markInvoiceAsPaid);                  // Mark invoice as paid
router.patch('/:id/void', voidInvoice);                        // Void invoice

// Line Items Management
router.post('/:id/line-items', addLineItem);                   // Add line item to invoice
router.put('/:id/line-items/:itemId', updateLineItem);         // Update line item
router.delete('/:id/line-items/:itemId', removeLineItem);      // Remove line item

// Payment Management
router.post('/:id/payments', addPayment);                      // Add payment to invoice
router.get('/:id/payments', getPaymentHistory);                // Get payment history

// Communication and Documents
router.post('/:id/send-reminder', sendInvoiceReminder);        // Send payment reminder
router.post('/:id/send-email', sendInvoiceEmail);              // Send invoice via email
router.get('/:id/pdf', generateInvoicePDF);                    // Generate invoice PDF

// Bulk Operations
router.post('/bulk/payments', bulkProcessPayments);            // Process bulk payments
router.post('/export', exportInvoices);                        // Export invoices to file

module.exports = router; 