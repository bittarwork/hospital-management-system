const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    // Basic Information
    appointmentId: {
        type: String,
        unique: true,
        sparse: true
    },

    // Patient and Doctor References
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Patient is required']
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, 'Doctor is required']
    },

    // Appointment Scheduling
    appointmentDate: {
        type: Date,
        required: [true, 'Appointment date is required'],
        validate: {
            validator: function (v) {
                return v >= new Date().setHours(0, 0, 0, 0);
            },
            message: 'Appointment date cannot be in the past'
        }
    },
    appointmentTime: {
        type: String,
        required: [true, 'Appointment time is required'],
        validate: {
            validator: function (v) {
                return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: 'Appointment time must be in HH:MM format'
        }
    },
    estimatedDuration: {
        type: Number, // in minutes
        default: 30,
        min: [15, 'Estimated duration must be at least 15 minutes'],
        max: [240, 'Estimated duration cannot exceed 4 hours']
    },

    // Appointment Type and Priority
    appointmentType: {
        type: String,
        required: [true, 'Appointment type is required'],
        enum: {
            values: [
                'consultation',
                'follow-up',
                'routine-checkup',
                'emergency',
                'procedure',
                'surgery',
                'diagnostic',
                'screening',
                'vaccination',
                'counseling',
                'second-opinion',
                'referral'
            ],
            message: 'Please select a valid appointment type'
        }
    },
    priority: {
        type: String,
        enum: {
            values: ['low', 'normal', 'high', 'urgent', 'emergency'],
            message: 'Please select a valid priority level'
        },
        default: 'normal'
    },

    // Appointment Status and Workflow
    status: {
        type: String,
        enum: {
            values: [
                'scheduled',
                'confirmed',
                'checked-in',
                'in-progress',
                'completed',
                'cancelled',
                'no-show',
                'rescheduled'
            ],
            message: 'Please select a valid status'
        },
        default: 'scheduled'
    },

    // Reason and Notes
    reasonForVisit: {
        type: String,
        required: [true, 'Reason for visit is required'],
        trim: true,
        maxlength: [500, 'Reason for visit cannot be more than 500 characters']
    },
    symptoms: [{
        symptom: {
            type: String,
            required: true,
            trim: true
        },
        severity: {
            type: String,
            enum: ['mild', 'moderate', 'severe'],
            default: 'mild'
        },
        duration: {
            type: String,
            trim: true
        }
    }],

    // Check-in Information
    checkInTime: {
        type: Date
    },
    checkInBy: {
        type: String,
        trim: true
    },

    // Consultation Details
    consultationStartTime: {
        type: Date
    },
    consultationEndTime: {
        type: Date
    },
    actualDuration: {
        type: Number // in minutes
    },

    // Clinical Information
    vitalSigns: {
        bloodPressure: {
            systolic: Number,
            diastolic: Number,
            recordedAt: { type: Date, default: Date.now }
        },
        heartRate: {
            value: Number,
            recordedAt: { type: Date, default: Date.now }
        },
        temperature: {
            value: Number,
            unit: { type: String, default: '°C' },
            recordedAt: { type: Date, default: Date.now }
        },
        weight: {
            value: Number,
            unit: { type: String, default: 'kg' },
            recordedAt: { type: Date, default: Date.now }
        },
        height: {
            value: Number,
            unit: { type: String, default: 'cm' },
            recordedAt: { type: Date, default: Date.now }
        },
        oxygenSaturation: {
            value: Number,
            recordedAt: { type: Date, default: Date.now }
        }
    },

    // Diagnosis and Treatment
    chiefComplaint: {
        type: String,
        trim: true,
        maxlength: [1000, 'Chief complaint cannot be more than 1000 characters']
    },
    diagnosis: [{
        condition: {
            type: String,
            required: true,
            trim: true
        },
        icdCode: {
            type: String,
            trim: true
        },
        severity: {
            type: String,
            enum: ['mild', 'moderate', 'severe'],
            default: 'mild'
        },
        status: {
            type: String,
            enum: ['primary', 'secondary', 'differential'],
            default: 'primary'
        },
        notes: {
            type: String,
            trim: true
        }
    }],

    // Treatment Plan
    treatmentPlan: {
        type: String,
        trim: true,
        maxlength: [2000, 'Treatment plan cannot be more than 2000 characters']
    },

    // Prescriptions
    prescriptions: [{
        medication: {
            type: String,
            required: true,
            trim: true
        },
        dosage: {
            type: String,
            required: true,
            trim: true
        },
        frequency: {
            type: String,
            required: true,
            trim: true
        },
        duration: {
            type: String,
            required: true,
            trim: true
        },
        instructions: {
            type: String,
            trim: true
        },
        quantity: {
            type: Number,
            min: [1, 'Quantity must be at least 1']
        },
        refills: {
            type: Number,
            default: 0,
            min: [0, 'Refills cannot be negative']
        }
    }],

    // Follow-up and Referrals
    followUpRequired: {
        type: Boolean,
        default: false
    },
    followUpDate: {
        type: Date
    },
    followUpInstructions: {
        type: String,
        trim: true,
        maxlength: [1000, 'Follow-up instructions cannot be more than 1000 characters']
    },

    referrals: [{
        specialization: {
            type: String,
            required: true,
            trim: true
        },
        referredDoctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor'
        },
        urgency: {
            type: String,
            enum: ['routine', 'urgent', 'emergency'],
            default: 'routine'
        },
        reason: {
            type: String,
            required: true,
            trim: true
        },
        notes: {
            type: String,
            trim: true
        }
    }],

    // Lab Tests and Procedures
    labTests: [{
        testName: {
            type: String,
            required: true,
            trim: true
        },
        testCode: {
            type: String,
            trim: true
        },
        urgency: {
            type: String,
            enum: ['routine', 'urgent', 'stat'],
            default: 'routine'
        },
        instructions: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: ['ordered', 'in-progress', 'completed', 'cancelled'],
            default: 'ordered'
        }
    }],

    procedures: [{
        procedureName: {
            type: String,
            required: true,
            trim: true
        },
        procedureCode: {
            type: String,
            trim: true
        },
        scheduledDate: {
            type: Date
        },
        status: {
            type: String,
            enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
            default: 'scheduled'
        },
        notes: {
            type: String,
            trim: true
        }
    }],

    // Billing Information
    consultationFee: {
        type: Number,
        min: [0, 'Consultation fee cannot be negative']
    },
    additionalCharges: [{
        description: {
            type: String,
            required: true,
            trim: true
        },
        amount: {
            type: Number,
            required: true,
            min: [0, 'Amount cannot be negative']
        }
    }],
    totalAmount: {
        type: Number,
        default: 0,
        min: [0, 'Total amount cannot be negative']
    },

    // Insurance and Payment
    insurance: {
        isInsured: {
            type: Boolean,
            default: false
        },
        provider: {
            type: String,
            trim: true
        },
        policyNumber: {
            type: String,
            trim: true
        },
        coveragePercentage: {
            type: Number,
            min: [0, 'Coverage percentage cannot be negative'],
            max: [100, 'Coverage percentage cannot exceed 100%']
        },
        copayAmount: {
            type: Number,
            min: [0, 'Copay amount cannot be negative']
        },
        authorizationRequired: {
            type: Boolean,
            default: false
        },
        authorizationNumber: {
            type: String,
            trim: true
        }
    },

    // Cancellation Information
    cancellationReason: {
        type: String,
        trim: true,
        maxlength: [500, 'Cancellation reason cannot be more than 500 characters']
    },
    cancelledBy: {
        type: String,
        enum: ['patient', 'doctor', 'staff', 'system']
    },
    cancelledAt: {
        type: Date
    },

    // Rescheduling Information
    rescheduledFrom: {
        originalDate: Date,
        originalTime: String,
        reason: String
    },
    rescheduledTo: {
        newDate: Date,
        newTime: String,
        reason: String
    },

    // Communication and Reminders
    remindersSent: [{
        type: {
            type: String,
            enum: ['sms', 'email', 'phone', 'push'],
            required: true
        },
        sentAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['sent', 'delivered', 'failed'],
            default: 'sent'
        }
    }],

    // Quality and Satisfaction
    patientSatisfaction: {
        rating: {
            type: Number,
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot be more than 5']
        },
        feedback: {
            type: String,
            trim: true,
            maxlength: [1000, 'Feedback cannot be more than 1000 characters']
        },
        submittedAt: {
            type: Date
        }
    },

    // Internal Notes
    privateNotes: {
        type: String,
        trim: true,
        maxlength: [2000, 'Private notes cannot be more than 2000 characters']
    },

    // System Information
    createdBy: {
        type: String,
        required: [true, 'Created by is required'],
        trim: true
    },
    lastModifiedBy: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better performance
AppointmentSchema.index({ patient: 1, appointmentDate: 1 });
AppointmentSchema.index({ doctor: 1, appointmentDate: 1 });
AppointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ appointmentId: 1 });
AppointmentSchema.index({ appointmentType: 1 });
AppointmentSchema.index({ priority: 1 });

// Compound index to prevent double booking
AppointmentSchema.index(
    {
        doctor: 1,
        appointmentDate: 1,
        appointmentTime: 1
    },
    {
        unique: true,
        partialFilterExpression: {
            status: { $in: ['scheduled', 'confirmed', 'checked-in', 'in-progress'] }
        }
    }
);

// Virtual for appointment duration in hours
AppointmentSchema.virtual('durationInHours').get(function () {
    if (this.actualDuration) {
        return Math.round((this.actualDuration / 60) * 100) / 100;
    }
    return Math.round((this.estimatedDuration / 60) * 100) / 100;
});

// Virtual for appointment date and time combined
AppointmentSchema.virtual('dateTimeString').get(function () {
    const date = this.appointmentDate.toISOString().split('T')[0];
    return `${date} ${this.appointmentTime}`;
});

// Virtual for full appointment datetime
AppointmentSchema.virtual('fullDateTime').get(function () {
    const datePart = this.appointmentDate.toISOString().split('T')[0];
    return new Date(`${datePart}T${this.appointmentTime}:00`);
});

// Generate unique appointment ID
AppointmentSchema.pre('save', async function (next) {
    if (!this.appointmentId && this.isNew) {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');

        const lastAppointment = await this.constructor.findOne(
            { appointmentId: new RegExp(`^A${year}${month}`) },
            { appointmentId: 1 },
            { sort: { appointmentId: -1 } }
        );

        let nextNumber = 1;
        if (lastAppointment && lastAppointment.appointmentId) {
            const lastNumber = parseInt(lastAppointment.appointmentId.slice(-4));
            nextNumber = lastNumber + 1;
        }

        this.appointmentId = `A${year}${month}${nextNumber.toString().padStart(4, '0')}`;
    }
    next();
});

// Pre-save middleware to calculate total amount
AppointmentSchema.pre('save', function (next) {
    let total = this.consultationFee || 0;

    if (this.additionalCharges && this.additionalCharges.length > 0) {
        total += this.additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
    }

    this.totalAmount = total;
    next();
});

// Pre-save middleware to calculate actual duration
AppointmentSchema.pre('save', function (next) {
    if (this.consultationStartTime && this.consultationEndTime) {
        const durationMs = this.consultationEndTime - this.consultationStartTime;
        this.actualDuration = Math.round(durationMs / (1000 * 60)); // Convert to minutes
    }
    next();
});

// Instance method to check if appointment is overdue
AppointmentSchema.methods.isOverdue = function () {
    const now = new Date();
    const appointmentDateTime = this.fullDateTime;
    return now > appointmentDateTime && !['completed', 'cancelled', 'no-show'].includes(this.status);
};

// Instance method to check if appointment can be cancelled
AppointmentSchema.methods.canBeCancelled = function () {
    return ['scheduled', 'confirmed'].includes(this.status);
};

// Instance method to check if appointment can be rescheduled
AppointmentSchema.methods.canBeRescheduled = function () {
    return ['scheduled', 'confirmed'].includes(this.status);
};

// Instance method to get appointment summary
AppointmentSchema.methods.getSummary = function () {
    return {
        id: this.appointmentId,
        date: this.appointmentDate,
        time: this.appointmentTime,
        type: this.appointmentType,
        status: this.status,
        patient: this.patient,
        doctor: this.doctor,
        duration: this.estimatedDuration,
        reason: this.reasonForVisit
    };
};

// Static method to find appointments by date range
AppointmentSchema.statics.findByDateRange = function (startDate, endDate, options = {}) {
    const query = {
        appointmentDate: {
            $gte: startDate,
            $lte: endDate
        }
    };

    if (options.doctor) query.doctor = options.doctor;
    if (options.patient) query.patient = options.patient;
    if (options.status) query.status = options.status;

    return this.find(query).populate('patient doctor');
};

// Static method to find available time slots
AppointmentSchema.statics.findAvailableSlots = async function (doctorId, date, duration = 30) {
    const appointments = await this.find({
        doctor: doctorId,
        appointmentDate: date,
        status: { $in: ['scheduled', 'confirmed', 'checked-in', 'in-progress'] }
    }).sort({ appointmentTime: 1 });

    // This would need to be implemented based on doctor's schedule
    // and existing appointments to return available time slots
    return appointments;
};

module.exports = mongoose.model('Appointment', AppointmentSchema); 