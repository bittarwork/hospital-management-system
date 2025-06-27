const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
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

    // Authentication Information
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot be more than 30 characters'],
        validate: {
            validator: function (v) {
                return /^[a-zA-Z0-9_]+$/.test(v);
            },
            message: 'Username can only contain letters, numbers, and underscores'
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
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },

    // Contact Information
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        validate: {
            validator: function (v) {
                return /^[\+]?[1-9][\d]{0,15}$/.test(v);
            },
            message: 'Please enter a valid phone number'
        }
    },

    // Role and Permissions
    role: {
        type: String,
        required: [true, 'User role is required'],
        enum: {
            values: [
                'super_admin',    // مدير النظام الرئيسي
                'admin',          // مدير المستشفى
                'doctor',         // طبيب
                'nurse',          // ممرض/ممرضة
                'receptionist',   // موظف استقبال
                'pharmacist',     // صيدلي
                'lab_technician', // فني مختبر
                'radiologist',    // أخصائي أشعة
                'accountant',     // محاسب
                'manager'         // مدير قسم
            ],
            message: 'Please select a valid role'
        }
    },
    permissions: [{
        module: {
            type: String,
            required: true,
            enum: [
                'patients',
                'doctors',
                'appointments',
                'medical_records',
                'invoices',
                'users',
                'reports',
                'settings'
            ]
        },
        actions: [{
            type: String,
            enum: ['create', 'read', 'update', 'delete', 'manage']
        }]
    }],

    // Professional Information (if applicable)
    employeeId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        uppercase: true
    },
    department: {
        type: String,
        trim: true,
        enum: [
            'Administration',
            'Emergency',
            'Internal Medicine',
            'Surgery',
            'Pediatrics',
            'Obstetrics and Gynecology',
            'Cardiology',
            'Orthopedics',
            'Dermatology',
            'Ophthalmology',
            'ENT',
            'Neurology',
            'Psychiatry',
            'Anesthesiology',
            'Radiology',
            'Pathology',
            'Laboratory',
            'Pharmacy',
            'Nursing',
            'Reception',
            'Accounting',
            'IT'
        ]
    },
    position: {
        type: String,
        trim: true
    },

    // Doctor Reference (if user is linked to a doctor)
    doctorProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },

    // Account Status
    status: {
        type: String,
        enum: {
            values: ['active', 'inactive', 'suspended', 'pending'],
            message: 'Please select a valid status'
        },
        default: 'active'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    mustChangePassword: {
        type: Boolean,
        default: true
    },

    // Security Information
    lastLogin: {
        type: Date
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date
    },

    // Audit Information
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Additional Settings
    preferences: {
        language: {
            type: String,
            enum: ['arabic', 'english'],
            default: 'arabic'
        },
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        },
        notifications: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: false },
            push: { type: Boolean, default: true }
        }
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.passwordResetToken;
            delete ret.passwordResetExpires;
            return ret;
        }
    },
    toObject: { virtuals: true }
});

// Indexes for better performance
// Note: username, email, and employeeId indexes are automatically created due to unique: true
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ department: 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for account locked status
UserSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function (next) {
    // Only hash password if it's modified
    if (!this.isModified('password')) return next();

    try {
        // Hash password with cost of 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Pre-save middleware to generate employee ID
UserSchema.pre('save', async function (next) {
    if (!this.employeeId && this.isNew) {
        const year = new Date().getFullYear();
        const rolePrefix = this.role.toUpperCase().substring(0, 3);

        const lastUser = await this.constructor.findOne(
            { employeeId: new RegExp(`^${rolePrefix}${year}`) },
            { employeeId: 1 },
            { sort: { employeeId: -1 } }
        );

        let nextNumber = 1;
        if (lastUser && lastUser.employeeId) {
            const lastNumber = parseInt(lastUser.employeeId.slice(-4));
            nextNumber = lastNumber + 1;
        }

        this.employeeId = `${rolePrefix}${year}${nextNumber.toString().padStart(4, '0')}`;
    }
    next();
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if user has permission
UserSchema.methods.hasPermission = function (module, action) {
    // Super admin has all permissions
    if (this.role === 'super_admin') return true;

    // Check specific permissions
    const modulePermission = this.permissions.find(p => p.module === module);
    if (!modulePermission) return false;

    return modulePermission.actions.includes(action) || modulePermission.actions.includes('manage');
};

// Instance method to increment login attempts
UserSchema.methods.incLoginAttempts = function () {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
    }

    const updates = { $inc: { loginAttempts: 1 } };

    // If we've reached max attempts and it's not locked already, lock the account
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // Lock for 2 hours
    }

    return this.updateOne(updates);
};

// Instance method to reset login attempts
UserSchema.methods.resetLoginAttempts = function () {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
    });
};

// Static method to get default permissions by role
UserSchema.statics.getDefaultPermissions = function (role) {
    const defaultPermissions = {
        super_admin: [
            { module: 'patients', actions: ['manage'] },
            { module: 'doctors', actions: ['manage'] },
            { module: 'appointments', actions: ['manage'] },
            { module: 'medical_records', actions: ['manage'] },
            { module: 'invoices', actions: ['manage'] },
            { module: 'users', actions: ['manage'] },
            { module: 'reports', actions: ['manage'] },
            { module: 'settings', actions: ['manage'] }
        ],
        admin: [
            { module: 'patients', actions: ['manage'] },
            { module: 'doctors', actions: ['manage'] },
            { module: 'appointments', actions: ['manage'] },
            { module: 'medical_records', actions: ['read', 'update'] },
            { module: 'invoices', actions: ['manage'] },
            { module: 'users', actions: ['create', 'read', 'update'] },
            { module: 'reports', actions: ['read'] }
        ],
        doctor: [
            { module: 'patients', actions: ['read', 'update'] },
            { module: 'appointments', actions: ['read', 'update'] },
            { module: 'medical_records', actions: ['manage'] }
        ],
        nurse: [
            { module: 'patients', actions: ['read', 'update'] },
            { module: 'appointments', actions: ['read'] },
            { module: 'medical_records', actions: ['create', 'read', 'update'] }
        ],
        receptionist: [
            { module: 'patients', actions: ['manage'] },
            { module: 'appointments', actions: ['manage'] },
            { module: 'invoices', actions: ['create', 'read'] }
        ],
        pharmacist: [
            { module: 'patients', actions: ['read'] },
            { module: 'medical_records', actions: ['read'] }
        ],
        lab_technician: [
            { module: 'patients', actions: ['read'] },
            { module: 'medical_records', actions: ['create', 'read', 'update'] }
        ],
        radiologist: [
            { module: 'patients', actions: ['read'] },
            { module: 'medical_records', actions: ['create', 'read', 'update'] }
        ],
        accountant: [
            { module: 'invoices', actions: ['manage'] },
            { module: 'reports', actions: ['read'] }
        ],
        manager: [
            { module: 'patients', actions: ['read'] },
            { module: 'doctors', actions: ['read', 'update'] },
            { module: 'appointments', actions: ['read'] },
            { module: 'reports', actions: ['read'] }
        ]
    };

    return defaultPermissions[role] || [];
};

module.exports = mongoose.model('User', UserSchema); 