const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    // Basic Information
    invoiceNumber: {
        type: String,
        required: [true, 'Invoice number is required'],
        unique: true,
        trim: true,
        uppercase: true
    },

    // Reference Information
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Patient reference is required']
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },

    // Date Information
    issueDate: {
        type: Date,
        default: Date.now,
        required: [true, 'Issue date is required']
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required'],
        validate: {
            validator: function (v) {
                return v >= this.issueDate;
            },
            message: 'Due date must be on or after issue date'
        }
    },
    servicePeriod: {
        startDate: {
            type: Date,
            required: [true, 'Service start date is required']
        },
        endDate: {
            type: Date,
            required: [true, 'Service end date is required']
        }
    },

    // Invoice Type and Category
    invoiceType: {
        type: String,
        required: [true, 'Invoice type is required'],
        enum: {
            values: [
                'consultation',
                'procedure',
                'surgery',
                'laboratory',
                'radiology',
                'pharmacy',
                'hospitalization',
                'emergency',
                'outpatient',
                'inpatient',
                'equipment',
                'supplies',
                'miscellaneous'
            ],
            message: 'Please select a valid invoice type'
        }
    },
    category: {
        type: String,
        enum: {
            values: ['medical', 'administrative', 'facility', 'equipment', 'other'],
            message: 'Please select a valid category'
        },
        default: 'medical'
    },

    // Services and Items
    lineItems: [{
        itemType: {
            type: String,
            required: [true, 'Item type is required'],
            enum: {
                values: [
                    'consultation',
                    'medical_procedure',
                    'diagnostic_test',
                    'laboratory_test',
                    'radiology',
                    'surgery',
                    'medication',
                    'medical_supplies',
                    'room_charges',
                    'equipment_usage',
                    'professional_fee',
                    'facility_fee',
                    'other'
                ],
                message: 'Please select a valid item type'
            }
        },
        itemName: {
            type: String,
            required: [true, 'Item name is required'],
            trim: true,
            maxlength: [200, 'Item name cannot be more than 200 characters']
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Item description cannot be more than 500 characters']
        },
        itemCode: {
            type: String,
            trim: true,
            uppercase: true
        },
        cptCode: {
            type: String,
            trim: true,
            uppercase: true
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [0.01, 'Quantity must be greater than 0'],
            default: 1
        },
        unitOfMeasure: {
            type: String,
            default: 'each',
            trim: true
        },
        unitPrice: {
            type: Number,
            required: [true, 'Unit price is required'],
            min: [0, 'Unit price cannot be negative']
        },
        discountPercentage: {
            type: Number,
            default: 0,
            min: [0, 'Discount percentage cannot be negative'],
            max: [100, 'Discount percentage cannot exceed 100%']
        },
        discountAmount: {
            type: Number,
            default: 0,
            min: [0, 'Discount amount cannot be negative']
        },
        totalPrice: {
            type: Number,
            required: [true, 'Total price is required'],
            min: [0, 'Total price cannot be negative']
        },
        serviceDate: {
            type: Date,
            default: Date.now
        },
        providedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor'
        },
        department: {
            type: String,
            trim: true
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [300, 'Item notes cannot be more than 300 characters']
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }],

    // Financial Calculations
    subtotal: {
        type: Number,
        required: [true, 'Subtotal is required'],
        min: [0, 'Subtotal cannot be negative']
    },

    // Tax Information
    taxRate: {
        type: Number,
        default: 0,
        min: [0, 'Tax rate cannot be negative'],
        max: [100, 'Tax rate cannot exceed 100%']
    },
    taxAmount: {
        type: Number,
        default: 0,
        min: [0, 'Tax amount cannot be negative']
    },
    taxExempt: {
        type: Boolean,
        default: false
    },
    taxExemptReason: {
        type: String,
        trim: true,
        maxlength: [200, 'Tax exempt reason cannot be more than 200 characters']
    },

    // Discount Information
    discountType: {
        type: String,
        enum: {
            values: ['fixed_amount', 'percentage', 'none'],
            message: 'Please select a valid discount type'
        },
        default: 'none'
    },
    discountValue: {
        type: Number,
        default: 0,
        min: [0, 'Discount value cannot be negative']
    },
    discountAmount: {
        type: Number,
        default: 0,
        min: [0, 'Discount amount cannot be negative']
    },
    discountReason: {
        type: String,
        trim: true,
        maxlength: [200, 'Discount reason cannot be more than 200 characters']
    },

    // Total Amount
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Total amount cannot be negative']
    },

    // Payment Information
    paymentStatus: {
        type: String,
        enum: {
            values: ['unpaid', 'partially_paid', 'paid', 'overpaid', 'refunded', 'cancelled', 'pending'],
            message: 'Please select a valid payment status'
        },
        default: 'unpaid'
    },
    paymentTerms: {
        type: String,
        enum: ['immediate', 'net_15', 'net_30', 'net_45', 'net_60', 'custom'],
        default: 'net_30'
    },
    paymentMethod: {
        type: String,
        enum: {
            values: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'check', 'insurance', 'online', 'other'],
            message: 'Please select a valid payment method'
        }
    },

    // Payment History
    payments: [{
        paymentDate: {
            type: Date,
            required: [true, 'Payment date is required'],
            default: Date.now
        },
        amount: {
            type: Number,
            required: [true, 'Payment amount is required'],
            min: [0.01, 'Payment amount must be greater than 0']
        },
        paymentMethod: {
            type: String,
            required: [true, 'Payment method is required'],
            enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'check', 'insurance', 'online', 'other']
        },
        transactionId: {
            type: String,
            trim: true,
            maxlength: [100, 'Transaction ID cannot be more than 100 characters']
        },
        referenceNumber: {
            type: String,
            trim: true,
            maxlength: [100, 'Reference number cannot be more than 100 characters']
        },
        paymentProcessor: {
            type: String,
            trim: true
        },
        processingFee: {
            type: Number,
            default: 0,
            min: [0, 'Processing fee cannot be negative']
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [500, 'Payment notes cannot be more than 500 characters']
        },
        receivedBy: {
            type: String,
            required: [true, 'Received by is required'],
            trim: true,
            maxlength: [100, 'Received by cannot be more than 100 characters']
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'completed'
        }
    }],

    // Amount Tracking
    amountPaid: {
        type: Number,
        default: 0,
        min: [0, 'Amount paid cannot be negative']
    },
    remainingBalance: {
        type: Number,
        default: 0,
        min: [0, 'Remaining balance cannot be negative']
    },

    // Insurance Information
    insurance: {
        isInsured: {
            type: Boolean,
            default: false
        },
        provider: {
            type: String,
            trim: true,
            maxlength: [100, 'Insurance provider name cannot be more than 100 characters']
        },
        policyNumber: {
            type: String,
            trim: true,
            maxlength: [50, 'Policy number cannot be more than 50 characters']
        },
        groupNumber: {
            type: String,
            trim: true,
            maxlength: [50, 'Group number cannot be more than 50 characters']
        },
        memberNumber: {
            type: String,
            trim: true,
            maxlength: [50, 'Member number cannot be more than 50 characters']
        },
        coveragePercentage: {
            type: Number,
            min: [0, 'Coverage percentage cannot be negative'],
            max: [100, 'Coverage percentage cannot exceed 100%']
        },
        coveredAmount: {
            type: Number,
            default: 0,
            min: [0, 'Covered amount cannot be negative']
        },
        copayAmount: {
            type: Number,
            default: 0,
            min: [0, 'Copay amount cannot be negative']
        },
        deductibleAmount: {
            type: Number,
            default: 0,
            min: [0, 'Deductible amount cannot be negative']
        },
        claimNumber: {
            type: String,
            trim: true,
            maxlength: [50, 'Claim number cannot be more than 50 characters']
        },
        claimStatus: {
            type: String,
            enum: ['pending', 'approved', 'denied', 'processed', 'appealed'],
            default: 'pending'
        },
        preAuthorizationNumber: {
            type: String,
            trim: true,
            maxlength: [50, 'Pre-authorization number cannot be more than 50 characters']
        },
        claimSubmissionDate: {
            type: Date
        },
        claimResponseDate: {
            type: Date
        }
    },

    // Currency and Localization
    currency: {
        type: String,
        default: 'SAR',
        enum: ['SAR', 'USD', 'EUR', 'GBP', 'AED'],
        uppercase: true
    },
    exchangeRate: {
        type: Number,
        default: 1,
        min: [0.001, 'Exchange rate must be greater than 0']
    },

    // Status and Workflow
    status: {
        type: String,
        enum: {
            values: ['draft', 'sent', 'viewed', 'overdue', 'paid', 'cancelled', 'refunded'],
            message: 'Please select a valid status'
        },
        default: 'draft'
    },

    // Communication History
    communicationLog: [{
        date: {
            type: Date,
            default: Date.now
        },
        type: {
            type: String,
            enum: ['email', 'sms', 'phone', 'mail', 'in_person'],
            required: true
        },
        subject: {
            type: String,
            trim: true
        },
        message: {
            type: String,
            trim: true
        },
        sentBy: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: ['sent', 'delivered', 'read', 'failed'],
            default: 'sent'
        }
    }],

    // Billing Address
    billingAddress: {
        name: {
            type: String,
            trim: true,
            maxlength: [100, 'Billing name cannot be more than 100 characters']
        },
        street: {
            type: String,
            trim: true,
            maxlength: [200, 'Street address cannot be more than 200 characters']
        },
        city: {
            type: String,
            trim: true,
            maxlength: [50, 'City cannot be more than 50 characters']
        },
        state: {
            type: String,
            trim: true,
            maxlength: [50, 'State cannot be more than 50 characters']
        },
        zipCode: {
            type: String,
            trim: true,
            maxlength: [20, 'Zip code cannot be more than 20 characters']
        },
        country: {
            type: String,
            trim: true,
            default: 'Saudi Arabia'
        }
    },

    // Additional Information
    notes: {
        type: String,
        trim: true,
        maxlength: [2000, 'Notes cannot be more than 2000 characters']
    },
    internalNotes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Internal notes cannot be more than 1000 characters']
    },
    termsAndConditions: {
        type: String,
        trim: true,
        maxlength: [2000, 'Terms and conditions cannot be more than 2000 characters']
    },

    // System Information
    createdBy: {
        type: String,
        required: [true, 'Created by is required'],
        trim: true,
        maxlength: [100, 'Created by cannot be more than 100 characters']
    },
    lastModifiedBy: {
        type: String,
        trim: true,
        maxlength: [100, 'Last modified by cannot be more than 100 characters']
    },
    department: {
        type: String,
        trim: true,
        maxlength: [100, 'Department cannot be more than 100 characters']
    },
    isActive: {
        type: Boolean,
        default: true
    },

    // Audit Trail
    auditLog: [{
        action: {
            type: String,
            required: true,
            enum: ['created', 'modified', 'sent', 'paid', 'cancelled', 'refunded']
        },
        performedBy: {
            type: String,
            required: true,
            trim: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        details: {
            type: String,
            trim: true
        }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better performance
InvoiceSchema.index({ patient: 1 });
InvoiceSchema.index({ issueDate: -1 });
InvoiceSchema.index({ dueDate: 1 });
InvoiceSchema.index({ paymentStatus: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ appointment: 1 });
InvoiceSchema.index({ doctor: 1 });
InvoiceSchema.index({ invoiceType: 1 });
InvoiceSchema.index({ createdBy: 1 });

// Compound indexes
InvoiceSchema.index({ patient: 1, issueDate: -1 });
InvoiceSchema.index({ paymentStatus: 1, dueDate: 1 });

// Virtual for total payments made
InvoiceSchema.virtual('totalPayments').get(function () {
    return this.payments.reduce((total, payment) => {
        return payment.status === 'completed' ? total + payment.amount : total;
    }, 0);
});

// Virtual for overdue status
InvoiceSchema.virtual('isOverdue').get(function () {
    return new Date() > this.dueDate && this.paymentStatus !== 'paid' && this.status !== 'cancelled';
});

// Virtual for days overdue
InvoiceSchema.virtual('daysOverdue').get(function () {
    if (!this.isOverdue) return 0;
    const timeDiff = new Date() - this.dueDate;
    return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
});

// Virtual for payment percentage
InvoiceSchema.virtual('paymentPercentage').get(function () {
    if (this.totalAmount === 0) return 0;
    return Math.round((this.amountPaid / this.totalAmount) * 100);
});

// Generate unique invoice number
InvoiceSchema.pre('save', async function (next) {
    if (!this.invoiceNumber && this.isNew) {
        const currentYear = new Date().getFullYear();
        const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

        const lastInvoice = await this.constructor.findOne(
            { invoiceNumber: new RegExp(`^INV-${currentYear}${currentMonth}`) },
            { invoiceNumber: 1 },
            { sort: { invoiceNumber: -1 } }
        );

        let nextNumber = 1;
        if (lastInvoice && lastInvoice.invoiceNumber) {
            const lastNumber = parseInt(lastInvoice.invoiceNumber.slice(-4));
            nextNumber = lastNumber + 1;
        }

        this.invoiceNumber = `INV-${currentYear}${currentMonth}${nextNumber.toString().padStart(4, '0')}`;
    }
    next();
});

// Pre-save middleware to calculate totals
InvoiceSchema.pre('save', function (next) {
    // Calculate subtotal from line items
    this.subtotal = this.lineItems.reduce((sum, item) => {
        if (item.isActive) {
            return sum + item.totalPrice;
        }
        return sum;
    }, 0);

    // Calculate tax amount
    if (!this.taxExempt) {
        this.taxAmount = (this.subtotal * this.taxRate) / 100;
    } else {
        this.taxAmount = 0;
    }

    // Calculate discount amount
    if (this.discountType === 'fixed_amount') {
        this.discountAmount = this.discountValue;
    } else if (this.discountType === 'percentage') {
        this.discountAmount = (this.subtotal * this.discountValue) / 100;
    } else {
        this.discountAmount = 0;
    }

    // Calculate total amount
    this.totalAmount = this.subtotal + this.taxAmount - this.discountAmount;

    // Ensure total amount is not negative
    if (this.totalAmount < 0) {
        this.totalAmount = 0;
    }

    // Calculate remaining balance
    this.remainingBalance = this.totalAmount - this.amountPaid;
    if (this.remainingBalance < 0) {
        this.remainingBalance = 0;
    }

    next();
});

// Pre-save middleware to update payment status
InvoiceSchema.pre('save', function (next) {
    if (this.amountPaid === 0) {
        this.paymentStatus = 'unpaid';
    } else if (this.amountPaid >= this.totalAmount) {
        this.paymentStatus = 'paid';
        this.remainingBalance = 0;
    } else {
        this.paymentStatus = 'partially_paid';
    }
    next();
});

// Instance method to add payment
InvoiceSchema.methods.addPayment = function (paymentData) {
    this.payments.push(paymentData);
    this.amountPaid += paymentData.amount;

    // Add to audit log
    this.auditLog.push({
        action: 'paid',
        performedBy: paymentData.receivedBy,
        details: `Payment of ${paymentData.amount} ${this.currency} received via ${paymentData.paymentMethod}`
    });

    return this.save();
};

// Instance method to calculate insurance coverage
InvoiceSchema.methods.calculateInsuranceCoverage = function () {
    if (!this.insurance.isInsured || !this.insurance.coveragePercentage) {
        return 0;
    }

    const coverableAmount = this.totalAmount - this.insurance.deductibleAmount;
    return Math.max(0, (coverableAmount * this.insurance.coveragePercentage) / 100);
};

// Instance method to send reminder
InvoiceSchema.methods.sendReminder = function (reminderData) {
    this.communicationLog.push({
        type: reminderData.type,
        subject: reminderData.subject,
        message: reminderData.message,
        sentBy: reminderData.sentBy
    });

    return this.save();
};

// Static method to find overdue invoices
InvoiceSchema.statics.findOverdueInvoices = function (daysOverdue = 0) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOverdue);

    return this.find({
        dueDate: { $lt: cutoffDate },
        paymentStatus: { $in: ['unpaid', 'partially_paid'] },
        status: { $ne: 'cancelled' }
    });
};

// Static method to get revenue analytics
InvoiceSchema.statics.getRevenueAnalytics = function (startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                issueDate: { $gte: startDate, $lte: endDate },
                status: { $ne: 'cancelled' }
            }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$totalAmount' },
                totalPaid: { $sum: '$amountPaid' },
                totalOutstanding: { $sum: '$remainingBalance' },
                invoiceCount: { $sum: 1 },
                averageInvoiceAmount: { $avg: '$totalAmount' }
            }
        }
    ]);
};

module.exports = mongoose.model('Invoice', InvoiceSchema); 