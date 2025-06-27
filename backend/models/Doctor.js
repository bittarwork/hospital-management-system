const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const DoctorSchema = new mongoose.Schema({
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
        validate: {
            validator: function (v) {
                return !v || v < new Date();
            },
            message: 'Date of birth must be in the past'
        }
    },
    gender: {
        type: String,
        enum: {
            values: ['male', 'female', 'other'],
            message: 'Gender must be either male, female, or other'
        }
    },

    // Professional Information
    specialization: {
        type: String,
        required: [true, 'Specialization is required'],
        enum: {
            values: [
                'طب عام',
                'طب باطني',
                'جراحة عامة',
                'طب أطفال',
                'نساء وولادة',
                'طب عيون',
                'طب أسنان',
                'طب نفسي',
                'طب جلدية',
                'طب عظام',
                'طب قلب',
                'طب أعصاب',
                'طب أنف وأذن',
                'طب مسالك بولية',
                'طب تخدير',
                'General Medicine',
                'Internal Medicine',
                'General Surgery',
                'Pediatrics',
                'Obstetrics and Gynecology',
                'Cardiology',
                'Orthopedics',
                'Dermatology',
                'Ophthalmology',
                'ENT (Ear, Nose, Throat)',
                'Neurology',
                'Psychiatry',
                'Dentistry',
                'Anesthesiology',
                'Radiology',
                'Pathology',
                'Emergency Medicine',
                'Family Medicine',
                'Oncology',
                'Urology',
                'Nephrology',
                'Pulmonology',
                'Gastroenterology',
                'Endocrinology',
                'Rheumatology',
                'Plastic Surgery',
                'Cardiovascular Surgery',
                'Neurosurgery'
            ],
            message: 'Please select a valid specialization'
        }
    },
    subSpecialty: {
        type: String,
        trim: true,
        maxlength: [100, 'Sub-specialty cannot be more than 100 characters']
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
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: 'Please enter a valid email address'
        }
    },

    // Professional Credentials
    licenseNumber: {
        type: String,
        required: [true, 'Medical license number is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    licenseExpiryDate: {
        type: Date,
        validate: {
            validator: function (v) {
                return !v || v > new Date();
            },
            message: 'License expiry date must be in the future'
        }
    },
    nationalId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },

    // Professional Experience
    yearsOfExperience: {
        type: Number,
        min: [0, 'Years of experience cannot be negative'],
        max: [70, 'Years of experience cannot be more than 70']
    },
    experience: {
        type: Number,
        min: [0, 'Experience cannot be negative'],
        max: [70, 'Experience cannot be more than 70']
    },

    // Education and Qualifications
    education: [{
        degree: {
            type: String,
            required: [true, 'Degree is required'],
            trim: true,
            enum: ['MD', 'MBBS', 'DO', 'PhD', 'Masters', 'Bachelor', 'Diploma', 'Certificate', 'Fellowship', 'Residency']
        },
        institution: {
            type: String,
            required: [true, 'Institution is required'],
            trim: true,
            maxlength: [200, 'Institution name cannot be more than 200 characters']
        },
        fieldOfStudy: {
            type: String,
            required: [true, 'Field of study is required'],
            trim: true,
            maxlength: [100, 'Field of study cannot be more than 100 characters']
        },
        graduationYear: {
            type: Number,
            required: [true, 'Graduation year is required'],
            min: [1900, 'Graduation year must be after 1900'],
            max: [new Date().getFullYear(), 'Graduation year cannot be in the future']
        },
        gpa: {
            type: Number,
            min: [0, 'GPA cannot be negative'],
            max: [4.0, 'GPA cannot be more than 4.0']
        }
    }],

    // Certifications and Licenses
    certifications: [{
        name: {
            type: String,
            required: [true, 'Certification name is required'],
            trim: true
        },
        issuingOrganization: {
            type: String,
            required: [true, 'Issuing organization is required'],
            trim: true
        },
        issueDate: {
            type: Date,
            required: [true, 'Issue date is required']
        },
        expiryDate: {
            type: Date
        },
        certificateNumber: {
            type: String,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }],

    // Work Schedule
    schedule: [{
        dayOfWeek: {
            type: String,
            required: [true, 'Day of week is required'],
            enum: {
                values: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
                message: 'Invalid day of week'
            }
        },
        startTime: {
            type: String,
            required: [true, 'Start time is required'],
            validate: {
                validator: function (v) {
                    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                },
                message: 'Start time must be in HH:MM format'
            }
        },
        endTime: {
            type: String,
            required: [true, 'End time is required'],
            validate: {
                validator: function (v) {
                    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                },
                message: 'End time must be in HH:MM format'
            }
        },
        breakStartTime: {
            type: String,
            validate: {
                validator: function (v) {
                    return !v || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                },
                message: 'Break start time must be in HH:MM format'
            }
        },
        breakEndTime: {
            type: String,
            validate: {
                validator: function (v) {
                    return !v || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                },
                message: 'Break end time must be in HH:MM format'
            }
        },
        isAvailable: {
            type: Boolean,
            default: true
        },
        maxPatients: {
            type: Number,
            default: 20,
            min: [1, 'Maximum patients must be at least 1'],
            max: [100, 'Maximum patients cannot exceed 100']
        }
    }],

    // Financial Information
    consultationFee: {
        type: Number,
        min: [0, 'Consultation fee cannot be negative']
    },
    followUpFee: {
        type: Number,
        min: [0, 'Follow-up fee cannot be negative']
    },
    emergencyFee: {
        type: Number,
        min: [0, 'Emergency fee cannot be negative']
    },

    // Department and Role
    department: {
        type: String,
        trim: true,
        maxlength: [100, 'Department name cannot be more than 100 characters']
    },
    position: {
        type: String,
        enum: {
            values: [
                'Chief of Department',
                'Senior Consultant',
                'Consultant',
                'Specialist',
                'Resident',
                'Intern',
                'Attending Physician',
                'Assistant Professor',
                'Associate Professor',
                'Professor'
            ],
            message: 'Please select a valid position'
        },
        default: 'Specialist'
    },

    // Employment Information
    employmentStatus: {
        type: String,
        enum: {
            values: ['full-time', 'part-time', 'contract', 'locum', 'consultant'],
            message: 'Please select a valid employment status'
        },
        default: 'full-time'
    },
    joiningDate: {
        type: Date,
        default: Date.now
    },
    contractEndDate: {
        type: Date
    },

    // Professional Profile
    biography: {
        type: String,
        trim: true,
        maxlength: [1000, 'Biography cannot be more than 1000 characters']
    },
    specialInterests: [{
        type: String,
        trim: true,
        maxlength: [100, 'Special interest cannot be more than 100 characters']
    }],
    languagesSpoken: [{
        language: {
            type: String,
            required: true,
            trim: true
        },
        proficiency: {
            type: String,
            enum: ['native', 'fluent', 'intermediate', 'basic'],
            default: 'intermediate'
        }
    }],

    // Awards and Recognition
    awards: [{
        title: {
            type: String,
            required: true,
            trim: true
        },
        organization: {
            type: String,
            required: true,
            trim: true
        },
        year: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Award description cannot be more than 500 characters']
        }
    }],

    // Research and Publications
    publications: [{
        title: {
            type: String,
            required: true,
            trim: true
        },
        journal: {
            type: String,
            trim: true
        },
        year: {
            type: Number,
            required: true
        },
        doi: {
            type: String,
            trim: true
        },
        authors: [{
            type: String,
            trim: true
        }]
    }],

    // System Information
    doctorId: {
        type: String,
        unique: true,
        sparse: true
    },
    status: {
        type: String,
        enum: {
            values: ['active', 'inactive', 'suspended', 'retired', 'on-leave'],
            message: 'Please select a valid status'
        },
        default: 'active'
    },
    profileImage: {
        type: String,
        trim: true
    },

    // Emergency Contact
    emergencyContact: {
        name: {
            type: String,
            trim: true,
            maxlength: [100, 'Emergency contact name cannot be more than 100 characters']
        },
        relationship: {
            type: String,
            enum: ['spouse', 'parent', 'child', 'sibling', 'friend', 'other']
        },
        phone: {
            type: String,
            validate: {
                validator: function (v) {
                    return !v || /^[\+]?[1-9][\d]{0,15}$/.test(v);
                },
                message: 'Please enter a valid emergency contact phone number'
            }
        }
    },

    // Performance Metrics
    ratings: {
        averageRating: {
            type: Number,
            default: 0,
            min: [0, 'Rating cannot be negative'],
            max: [5, 'Rating cannot be more than 5']
        },
        totalReviews: {
            type: Number,
            default: 0,
            min: [0, 'Total reviews cannot be negative']
        }
    },

    // Notes and Comments
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
DoctorSchema.index({ firstName: 1, lastName: 1 });
DoctorSchema.index({ specialization: 1 });
DoctorSchema.index({ department: 1 });
DoctorSchema.index({ status: 1 });
// Note: doctorId index is automatically created due to unique: true
DoctorSchema.index({ 'schedule.dayOfWeek': 1 });

// Virtual for full name
DoctorSchema.virtual('fullName').get(function () {
    const middle = this.middleName ? ` ${this.middleName}` : '';
    return `${this.firstName}${middle} ${this.lastName}`;
});

// Virtual for display name with title
DoctorSchema.virtual('displayName').get(function () {
    return `Dr. ${this.fullName}`;
});

// Virtual for professional title
DoctorSchema.virtual('professionalTitle').get(function () {
    return `Dr. ${this.fullName} - ${this.specialization}`;
});

// Virtual for age calculation
DoctorSchema.virtual('age').get(function () {
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

// Generate unique doctor ID
DoctorSchema.pre('save', async function (next) {
    if (!this.doctorId && this.isNew) {
        const year = new Date().getFullYear();
        const lastDoctor = await this.constructor.findOne(
            { doctorId: new RegExp(`^D${year}`) },
            { doctorId: 1 },
            { sort: { doctorId: -1 } }
        );

        let nextNumber = 1;
        if (lastDoctor && lastDoctor.doctorId) {
            const lastNumber = parseInt(lastDoctor.doctorId.slice(-4));
            nextNumber = lastNumber + 1;
        }

        this.doctorId = `D${year}${nextNumber.toString().padStart(4, '0')}`;
    }
    next();
});

// Instance method to check availability on a specific day
DoctorSchema.methods.isAvailableOnDay = function (dayOfWeek) {
    const daySchedule = this.schedule.find(s => s.dayOfWeek === dayOfWeek.toLowerCase());
    return daySchedule && daySchedule.isAvailable;
};

// Instance method to get schedule for a specific day
DoctorSchema.methods.getDaySchedule = function (dayOfWeek) {
    return this.schedule.find(s => s.dayOfWeek === dayOfWeek.toLowerCase());
};

// Instance method to get active certifications
DoctorSchema.methods.getActiveCertifications = function () {
    const now = new Date();
    return this.certifications.filter(cert =>
        cert.isActive && (!cert.expiryDate || cert.expiryDate > now)
    );
};

// Instance method to check if license is valid
DoctorSchema.methods.isLicenseValid = function () {
    return this.licenseExpiryDate > new Date();
};

// Instance method to get total working hours per week
DoctorSchema.methods.getWeeklyWorkingHours = function () {
    return this.schedule.reduce((total, day) => {
        if (!day.isAvailable) return total;

        const start = new Date(`1970-01-01T${day.startTime}:00`);
        const end = new Date(`1970-01-01T${day.endTime}:00`);
        let hours = (end - start) / (1000 * 60 * 60);

        // Subtract break time if exists
        if (day.breakStartTime && day.breakEndTime) {
            const breakStart = new Date(`1970-01-01T${day.breakStartTime}:00`);
            const breakEnd = new Date(`1970-01-01T${day.breakEndTime}:00`);
            const breakHours = (breakEnd - breakStart) / (1000 * 60 * 60);
            hours -= breakHours;
        }

        return total + hours;
    }, 0);
};

// Static method to find doctors by specialization
DoctorSchema.statics.findBySpecialization = function (specialization) {
    return this.find({
        specialization: specialization,
        status: 'active'
    });
};

// Static method to find available doctors for a specific day and time
DoctorSchema.statics.findAvailableForDateTime = function (dayOfWeek, time) {
    return this.find({
        status: 'active',
        'schedule.dayOfWeek': dayOfWeek.toLowerCase(),
        'schedule.isAvailable': true,
        'schedule.startTime': { $lte: time },
        'schedule.endTime': { $gte: time }
    });
};

module.exports = mongoose.model('Doctor', DoctorSchema); 