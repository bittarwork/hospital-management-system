const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PatientSchema = new mongoose.Schema({
    // Personal Information
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot be more than 50 characters'],
        minlength: [2, 'First name must be at least 2 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot be more than 50 characters'],
        minlength: [2, 'Last name must be at least 2 characters']
    },
    middleName: {
        type: String,
        trim: true,
        maxlength: [50, 'Middle name cannot be more than 50 characters']
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required'],
        validate: {
            validator: function (v) {
                return v < new Date();
            },
            message: 'Date of birth must be in the past'
        }
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: {
            values: ['male', 'female', 'other'],
            message: 'Gender must be either male, female, or other'
        }
    },

    // Contact Information
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        validate: {
            validator: function (v) {
                return /^[\+]?[1-9][\d]{0,15}$/.test(v);
            },
            message: 'Please enter a valid phone number'
        }
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        sparse: true, // Allow null values but ensure uniqueness when present
        validate: {
            validator: function (v) {
                return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: 'Please enter a valid email address'
        }
    },
    address: {
        street: {
            type: String,
            required: [true, 'Street address is required'],
            trim: true,
            maxlength: [100, 'Street address cannot be more than 100 characters']
        },
        city: {
            type: String,
            required: [true, 'City is required'],
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
            validate: {
                validator: function (v) {
                    return !v || /^\d{5}(-\d{4})?$/.test(v);
                },
                message: 'Please enter a valid zip code'
            }
        },
        country: {
            type: String,
            required: [true, 'Country is required'],
            trim: true,
            default: 'Saudi Arabia'
        }
    },

    // Emergency Contact
    emergencyContact: {
        name: {
            type: String,
            required: [true, 'Emergency contact name is required'],
            trim: true,
            maxlength: [100, 'Emergency contact name cannot be more than 100 characters']
        },
        relationship: {
            type: String,
            required: [true, 'Emergency contact relationship is required'],
            trim: true,
            enum: ['spouse', 'parent', 'child', 'sibling', 'friend', 'other']
        },
        phone: {
            type: String,
            required: [true, 'Emergency contact phone is required'],
            validate: {
                validator: function (v) {
                    return /^[\+]?[1-9][\d]{0,15}$/.test(v);
                },
                message: 'Please enter a valid emergency contact phone number'
            }
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            validate: {
                validator: function (v) {
                    return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
                },
                message: 'Please enter a valid emergency contact email'
            }
        }
    },

    // Medical Information
    bloodType: {
        type: String,
        enum: {
            values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
            message: 'Invalid blood type'
        },
        default: 'unknown'
    },
    allergies: [{
        allergen: {
            type: String,
            required: true,
            trim: true
        },
        severity: {
            type: String,
            enum: ['mild', 'moderate', 'severe'],
            default: 'mild'
        },
        reaction: {
            type: String,
            trim: true
        },
        diagnosedDate: {
            type: Date,
            default: Date.now
        }
    }],

    // Medical History
    medicalHistory: [{
        condition: {
            type: String,
            required: [true, 'Medical condition is required'],
            trim: true
        },
        diagnosedDate: {
            type: Date,
            required: [true, 'Diagnosis date is required']
        },
        status: {
            type: String,
            enum: ['active', 'resolved', 'chronic', 'in_remission'],
            default: 'active'
        },
        severity: {
            type: String,
            enum: ['mild', 'moderate', 'severe'],
            default: 'mild'
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [500, 'Medical history notes cannot be more than 500 characters']
        },
        treatingPhysician: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor'
        }
    }],

    // Current Medications
    currentMedications: [{
        medicationName: {
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
        prescribedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor'
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date
        },
        notes: {
            type: String,
            trim: true
        }
    }],

    // Insurance Information
    insurance: {
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
        expirationDate: {
            type: Date
        },
        copayAmount: {
            type: Number,
            min: [0, 'Copay amount cannot be negative']
        }
    },

    // Vital Signs (Latest)
    vitals: {
        height: {
            value: Number, // in cm
            unit: { type: String, default: 'cm' },
            recordedDate: { type: Date, default: Date.now }
        },
        weight: {
            value: Number, // in kg
            unit: { type: String, default: 'kg' },
            recordedDate: { type: Date, default: Date.now }
        },
        bloodPressure: {
            systolic: Number,
            diastolic: Number,
            unit: { type: String, default: 'mmHg' },
            recordedDate: { type: Date, default: Date.now }
        },
        heartRate: {
            value: Number, // bpm
            unit: { type: String, default: 'bpm' },
            recordedDate: { type: Date, default: Date.now }
        },
        temperature: {
            value: Number, // in Celsius
            unit: { type: String, default: '°C' },
            recordedDate: { type: Date, default: Date.now }
        }
    },

    // System Information
    patientId: {
        type: String,
        unique: true,
        sparse: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'deceased', 'transferred'],
        default: 'active'
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    lastVisit: {
        type: Date
    },
    preferredLanguage: {
        type: String,
        enum: ['english', 'arabic', 'french', 'spanish', 'other'],
        default: 'english'
    },

    // Privacy and Consent
    consentToTreatment: {
        type: Boolean,
        required: [true, 'Consent to treatment is required'],
        default: false
    },
    consentToDataSharing: {
        type: Boolean,
        default: false
    },

    // Notes
    notes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Notes cannot be more than 1000 characters']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better performance
PatientSchema.index({ firstName: 1, lastName: 1 });
PatientSchema.index({ patientId: 1 });
PatientSchema.index({ status: 1 });
PatientSchema.index({ registrationDate: -1 });
PatientSchema.index({ 'emergencyContact.phone': 1 });

// Virtual for full name
PatientSchema.virtual('fullName').get(function () {
    const middle = this.middleName ? ` ${this.middleName}` : '';
    return `${this.firstName}${middle} ${this.lastName}`;
});

// Virtual for age calculation
PatientSchema.virtual('age').get(function () {
    if (!this.dateOfBirth) return null;

    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
});

// Virtual for BMI calculation
PatientSchema.virtual('bmi').get(function () {
    if (!this.vitals.height?.value || !this.vitals.weight?.value) return null;

    const heightInMeters = this.vitals.height.value / 100;
    const bmi = this.vitals.weight.value / (heightInMeters * heightInMeters);
    return Math.round(bmi * 10) / 10;
});

// Generate unique patient ID
PatientSchema.pre('save', async function (next) {
    if (!this.patientId && this.isNew) {
        const year = new Date().getFullYear();
        const lastPatient = await this.constructor.findOne(
            { patientId: new RegExp(`^P${year}`) },
            { patientId: 1 },
            { sort: { patientId: -1 } }
        );

        let nextNumber = 1;
        if (lastPatient && lastPatient.patientId) {
            const lastNumber = parseInt(lastPatient.patientId.slice(-4));
            nextNumber = lastNumber + 1;
        }

        this.patientId = `P${year}${nextNumber.toString().padStart(4, '0')}`;
    }
    next();
});

// Instance method to get active allergies
PatientSchema.methods.getActiveAllergies = function () {
    return this.allergies.filter(allergy => allergy.severity !== 'resolved');
};

// Instance method to get active medications
PatientSchema.methods.getActiveMedications = function () {
    const now = new Date();
    return this.currentMedications.filter(med =>
        !med.endDate || med.endDate > now
    );
};

// Instance method to check if patient has specific allergy
PatientSchema.methods.hasAllergy = function (allergen) {
    return this.allergies.some(allergy =>
        allergy.allergen.toLowerCase().includes(allergen.toLowerCase())
    );
};

// Static method to find patients by age range
PatientSchema.statics.findByAgeRange = function (minAge, maxAge) {
    const currentDate = new Date();
    const maxBirthDate = new Date(currentDate.getFullYear() - minAge, currentDate.getMonth(), currentDate.getDate());
    const minBirthDate = new Date(currentDate.getFullYear() - maxAge, currentDate.getMonth(), currentDate.getDate());

    return this.find({
        dateOfBirth: {
            $gte: minBirthDate,
            $lte: maxBirthDate
        }
    });
};

module.exports = mongoose.model('Patient', PatientSchema); 