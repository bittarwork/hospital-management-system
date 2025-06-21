const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
    // Basic Information
    recordId: {
        type: String,
        unique: true,
        sparse: true,
        uppercase: true
    },

    // References
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
        ref: 'Doctor',
        required: [true, 'Doctor reference is required']
    },

    // Record Type and Category
    recordType: {
        type: String,
        required: [true, 'Record type is required'],
        enum: {
            values: [
                'consultation',
                'emergency_visit',
                'follow_up',
                'surgery',
                'procedure',
                'diagnostic_test',
                'laboratory_result',
                'radiology_result',
                'prescription',
                'discharge_summary',
                'progress_note',
                'nursing_note',
                'operative_note',
                'pathology_report',
                'immunization',
                'vital_signs',
                'assessment',
                'other'
            ],
            message: 'Please select a valid record type'
        }
    },
    category: {
        type: String,
        enum: {
            values: ['inpatient', 'outpatient', 'emergency', 'ambulatory', 'home_care', 'telemedicine'],
            message: 'Please select a valid category'
        },
        default: 'outpatient'
    },

    // Visit Information
    visitDate: {
        type: Date,
        required: [true, 'Visit date is required'],
        default: Date.now
    },
    visitTime: {
        type: String,
        validate: {
            validator: function (v) {
                return !v || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: 'Visit time must be in HH:MM format'
        }
    },
    visitDuration: {
        type: Number, // in minutes
        min: [1, 'Visit duration must be at least 1 minute']
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        trim: true
    },
    facility: {
        type: String,
        trim: true,
        default: 'Maher Al-Ali Hospital'
    },

    // Chief Complaint and History
    chiefComplaint: {
        type: String,
        required: [true, 'Chief complaint is required'],
        trim: true,
        maxlength: [1000, 'Chief complaint cannot be more than 1000 characters']
    },
    historyOfPresentIllness: {
        type: String,
        trim: true,
        maxlength: [2000, 'History of present illness cannot be more than 2000 characters']
    },
    pastMedicalHistory: {
        conditions: [{
            condition: {
                type: String,
                required: true,
                trim: true
            },
            diagnosedDate: {
                type: Date
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
                trim: true
            }
        }],
        surgicalHistory: [{
            procedure: {
                type: String,
                required: true,
                trim: true
            },
            date: {
                type: Date,
                required: true
            },
            surgeon: {
                type: String,
                trim: true
            },
            facility: {
                type: String,
                trim: true
            },
            complications: {
                type: String,
                trim: true
            },
            notes: {
                type: String,
                trim: true
            }
        }]
    },

    // Family and Social History
    familyHistory: [{
        relationship: {
            type: String,
            required: true,
            enum: ['father', 'mother', 'sibling', 'child', 'grandparent', 'aunt', 'uncle', 'cousin', 'other']
        },
        condition: {
            type: String,
            required: true,
            trim: true
        },
        ageAtDiagnosis: {
            type: Number,
            min: [0, 'Age at diagnosis cannot be negative']
        },
        status: {
            type: String,
            enum: ['alive', 'deceased', 'unknown'],
            default: 'alive'
        },
        notes: {
            type: String,
            trim: true
        }
    }],
    socialHistory: {
        smokingStatus: {
            type: String,
            enum: ['never', 'former', 'current', 'unknown'],
            default: 'unknown'
        },
        smokingDetails: {
            packsPerDay: Number,
            yearsSmoked: Number,
            quitDate: Date
        },
        alcoholUse: {
            type: String,
            enum: ['never', 'occasional', 'moderate', 'heavy', 'former', 'unknown'],
            default: 'unknown'
        },
        substanceUse: {
            type: String,
            enum: ['none', 'former', 'current', 'unknown'],
            default: 'unknown'
        },
        occupation: {
            type: String,
            trim: true
        },
        maritalStatus: {
            type: String,
            enum: ['single', 'married', 'divorced', 'widowed', 'separated', 'unknown'],
            default: 'unknown'
        },
        exerciseHabits: {
            type: String,
            trim: true
        }
    },

    // Physical Examination
    physicalExamination: {
        generalAppearance: {
            type: String,
            trim: true,
            maxlength: [500, 'General appearance cannot be more than 500 characters']
        },
        vitalSigns: {
            bloodPressure: {
                systolic: {
                    type: Number,
                    min: [50, 'Systolic BP must be at least 50'],
                    max: [300, 'Systolic BP cannot exceed 300']
                },
                diastolic: {
                    type: Number,
                    min: [30, 'Diastolic BP must be at least 30'],
                    max: [200, 'Diastolic BP cannot exceed 200']
                }
            },
            heartRate: {
                type: Number,
                min: [30, 'Heart rate must be at least 30'],
                max: [220, 'Heart rate cannot exceed 220']
            },
            respiratoryRate: {
                type: Number,
                min: [8, 'Respiratory rate must be at least 8'],
                max: [60, 'Respiratory rate cannot exceed 60']
            },
            temperature: {
                value: {
                    type: Number,
                    min: [30, 'Temperature must be at least 30°C'],
                    max: [45, 'Temperature cannot exceed 45°C']
                },
                unit: {
                    type: String,
                    enum: ['celsius', 'fahrenheit'],
                    default: 'celsius'
                }
            },
            oxygenSaturation: {
                type: Number,
                min: [70, 'Oxygen saturation must be at least 70%'],
                max: [100, 'Oxygen saturation cannot exceed 100%']
            },
            height: {
                value: {
                    type: Number,
                    min: [30, 'Height must be at least 30 cm']
                },
                unit: {
                    type: String,
                    enum: ['cm', 'inches'],
                    default: 'cm'
                }
            },
            weight: {
                value: {
                    type: Number,
                    min: [1, 'Weight must be at least 1 kg']
                },
                unit: {
                    type: String,
                    enum: ['kg', 'lbs'],
                    default: 'kg'
                }
            },
            bmi: {
                type: Number,
                min: [10, 'BMI must be at least 10']
            },
            painScore: {
                type: Number,
                min: [0, 'Pain score must be at least 0'],
                max: [10, 'Pain score cannot exceed 10']
            }
        },
        systemicExamination: {
            cardiovascular: {
                type: String,
                trim: true
            },
            respiratory: {
                type: String,
                trim: true
            },
            gastrointestinal: {
                type: String,
                trim: true
            },
            neurological: {
                type: String,
                trim: true
            },
            musculoskeletal: {
                type: String,
                trim: true
            },
            dermatological: {
                type: String,
                trim: true
            },
            genitourinary: {
                type: String,
                trim: true
            },
            psychiatric: {
                type: String,
                trim: true
            }
        }
    },

    // Allergies and Medications
    allergies: [{
        allergen: {
            type: String,
            required: true,
            trim: true
        },
        allergenType: {
            type: String,
            enum: ['drug', 'food', 'environmental', 'latex', 'other'],
            required: true
        },
        reaction: {
            type: String,
            required: true,
            trim: true
        },
        severity: {
            type: String,
            enum: ['mild', 'moderate', 'severe', 'life_threatening'],
            required: true
        },
        onsetDate: {
            type: Date
        },
        verificationStatus: {
            type: String,
            enum: ['confirmed', 'suspected', 'unlikely', 'refuted'],
            default: 'suspected'
        },
        notes: {
            type: String,
            trim: true
        }
    }],
    currentMedications: [{
        medicationName: {
            type: String,
            required: true,
            trim: true
        },
        genericName: {
            type: String,
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
        route: {
            type: String,
            enum: ['oral', 'iv', 'im', 'sc', 'topical', 'inhalation', 'rectal', 'nasal', 'sublingual', 'other'],
            default: 'oral'
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date
        },
        prescribedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor'
        },
        indication: {
            type: String,
            trim: true
        },
        adherence: {
            type: String,
            enum: ['excellent', 'good', 'fair', 'poor', 'unknown'],
            default: 'unknown'
        },
        sideEffects: [{
            effect: String,
            severity: {
                type: String,
                enum: ['mild', 'moderate', 'severe']
            }
        }],
        notes: {
            type: String,
            trim: true
        }
    }],

    // Diagnostic Information
    assessment: {
        primaryDiagnosis: {
            condition: {
                type: String,
                required: [true, 'Primary diagnosis is required'],
                trim: true
            },
            icdCode: {
                type: String,
                trim: true,
                uppercase: true
            },
            confidence: {
                type: String,
                enum: ['confirmed', 'probable', 'possible', 'rule_out'],
                default: 'probable'
            },
            severity: {
                type: String,
                enum: ['mild', 'moderate', 'severe'],
                default: 'mild'
            }
        },
        secondaryDiagnoses: [{
            condition: {
                type: String,
                required: true,
                trim: true
            },
            icdCode: {
                type: String,
                trim: true,
                uppercase: true
            },
            confidence: {
                type: String,
                enum: ['confirmed', 'probable', 'possible', 'rule_out'],
                default: 'probable'
            },
            severity: {
                type: String,
                enum: ['mild', 'moderate', 'severe'],
                default: 'mild'
            }
        }],
        differentialDiagnosis: [{
            condition: {
                type: String,
                required: true,
                trim: true
            },
            likelihood: {
                type: String,
                enum: ['high', 'medium', 'low'],
                default: 'medium'
            },
            reasoningNotes: {
                type: String,
                trim: true
            }
        }]
    },

    // Treatment Plan
    treatmentPlan: {
        therapeuticGoals: [{
            goal: {
                type: String,
                required: true,
                trim: true
            },
            targetDate: {
                type: Date
            },
            status: {
                type: String,
                enum: ['not_started', 'in_progress', 'achieved', 'modified', 'discontinued'],
                default: 'not_started'
            },
            notes: {
                type: String,
                trim: true
            }
        }],
        medications: [{
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
            duration: {
                type: String,
                required: true,
                trim: true
            },
            route: {
                type: String,
                enum: ['oral', 'iv', 'im', 'sc', 'topical', 'inhalation', 'rectal', 'nasal', 'sublingual', 'other'],
                default: 'oral'
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
            },
            indication: {
                type: String,
                trim: true
            }
        }],
        procedures: [{
            procedureName: {
                type: String,
                required: true,
                trim: true
            },
            cptCode: {
                type: String,
                trim: true,
                uppercase: true
            },
            scheduledDate: {
                type: Date
            },
            urgency: {
                type: String,
                enum: ['routine', 'urgent', 'emergent'],
                default: 'routine'
            },
            instructions: {
                type: String,
                trim: true
            },
            expectedOutcome: {
                type: String,
                trim: true
            }
        }],
        lifestyle: {
            dietaryRecommendations: {
                type: String,
                trim: true
            },
            exerciseRecommendations: {
                type: String,
                trim: true
            },
            lifestyleModifications: {
                type: String,
                trim: true
            },
            activityRestrictions: {
                type: String,
                trim: true
            }
        },
        patientEducation: [{
            topic: {
                type: String,
                required: true,
                trim: true
            },
            materialsProvided: {
                type: String,
                trim: true
            },
            patientUnderstanding: {
                type: String,
                enum: ['excellent', 'good', 'fair', 'poor'],
                default: 'good'
            },
            notes: {
                type: String,
                trim: true
            }
        }]
    },

    // Laboratory and Diagnostic Tests
    diagnosticTests: {
        laboratoryTests: [{
            testName: {
                type: String,
                required: true,
                trim: true
            },
            testCode: {
                type: String,
                trim: true,
                uppercase: true
            },
            orderDate: {
                type: Date,
                default: Date.now
            },
            completionDate: {
                type: Date
            },
            results: [{
                parameter: {
                    type: String,
                    required: true,
                    trim: true
                },
                value: {
                    type: String,
                    required: true,
                    trim: true
                },
                unit: {
                    type: String,
                    trim: true
                },
                referenceRange: {
                    type: String,
                    trim: true
                },
                abnormalFlag: {
                    type: String,
                    enum: ['normal', 'high', 'low', 'critical_high', 'critical_low', 'abnormal']
                }
            }],
            interpretation: {
                type: String,
                trim: true
            },
            clinicalSignificance: {
                type: String,
                trim: true
            }
        }],
        radiologyTests: [{
            studyType: {
                type: String,
                required: true,
                trim: true
            },
            bodyPart: {
                type: String,
                required: true,
                trim: true
            },
            orderDate: {
                type: Date,
                default: Date.now
            },
            studyDate: {
                type: Date
            },
            modality: {
                type: String,
                enum: ['X-ray', 'CT', 'MRI', 'Ultrasound', 'Mammography', 'Nuclear Medicine', 'PET', 'Other']
            },
            contrast: {
                type: Boolean,
                default: false
            },
            findings: {
                type: String,
                trim: true
            },
            impression: {
                type: String,
                trim: true
            },
            recommendation: {
                type: String,
                trim: true
            },
            radiologist: {
                type: String,
                trim: true
            }
        }]
    },

    // Follow-up and Referrals
    followUp: {
        required: {
            type: Boolean,
            default: false
        },
        timeframe: {
            type: String,
            enum: ['1_week', '2_weeks', '1_month', '3_months', '6_months', '1_year', 'as_needed', 'custom']
        },
        customTimeframe: {
            type: String,
            trim: true
        },
        instructions: {
            type: String,
            trim: true
        },
        appointmentScheduled: {
            type: Boolean,
            default: false
        },
        appointmentDate: {
            type: Date
        }
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
        facility: {
            type: String,
            trim: true
        },
        urgency: {
            type: String,
            enum: ['routine', 'urgent', 'emergent'],
            default: 'routine'
        },
        reason: {
            type: String,
            required: true,
            trim: true
        },
        clinicalQuestion: {
            type: String,
            trim: true
        },
        expectedOutcome: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: ['pending', 'scheduled', 'completed', 'cancelled'],
            default: 'pending'
        },
        referralDate: {
            type: Date,
            default: Date.now
        },
        appointmentDate: {
            type: Date
        },
        notes: {
            type: String,
            trim: true
        }
    }],

    // Quality and Outcomes
    qualityMetrics: {
        patientSatisfaction: {
            rating: {
                type: Number,
                min: [1, 'Rating must be at least 1'],
                max: [5, 'Rating cannot exceed 5']
            },
            feedback: {
                type: String,
                trim: true
            }
        },
        clinicalOutcomes: {
            symptomsResolved: {
                type: Boolean
            },
            functionalImprovement: {
                type: String,
                enum: ['significant', 'moderate', 'minimal', 'none', 'worsened']
            },
            qualityOfLifeImpact: {
                type: String,
                enum: ['greatly_improved', 'improved', 'unchanged', 'worsened', 'greatly_worsened']
            },
            complications: [{
                complication: {
                    type: String,
                    required: true,
                    trim: true
                },
                severity: {
                    type: String,
                    enum: ['mild', 'moderate', 'severe', 'life_threatening'],
                    required: true
                },
                onset: {
                    type: Date,
                    required: true
                },
                resolution: {
                    type: Date
                },
                treatment: {
                    type: String,
                    trim: true
                }
            }]
        }
    },

    // Administrative Information
    recordStatus: {
        type: String,
        enum: ['draft', 'final', 'amended', 'corrected', 'archived'],
        default: 'draft'
    },
    confidentialityLevel: {
        type: String,
        enum: ['normal', 'restricted', 'very_restricted'],
        default: 'normal'
    },
    accessLog: [{
        accessedBy: {
            type: String,
            required: true,
            trim: true
        },
        accessDate: {
            type: Date,
            default: Date.now
        },
        accessType: {
            type: String,
            enum: ['view', 'edit', 'print', 'export'],
            required: true
        },
        purpose: {
            type: String,
            trim: true
        }
    }],

    // Notes and Documentation
    clinicalNotes: {
        type: String,
        trim: true,
        maxlength: [5000, 'Clinical notes cannot be more than 5000 characters']
    },
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
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    reviewDate: {
        type: Date
    },
    signedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    signatureDate: {
        type: Date
    },
    electronicSignature: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better performance
MedicalRecordSchema.index({ patient: 1, visitDate: -1 });
MedicalRecordSchema.index({ doctor: 1, visitDate: -1 });
MedicalRecordSchema.index({ appointment: 1 });
MedicalRecordSchema.index({ recordType: 1 });
MedicalRecordSchema.index({ department: 1 });
MedicalRecordSchema.index({ recordStatus: 1 });
MedicalRecordSchema.index({ visitDate: -1 });
MedicalRecordSchema.index({ 'assessment.primaryDiagnosis.icdCode': 1 });

// Virtual for record summary
MedicalRecordSchema.virtual('recordSummary').get(function () {
    return {
        id: this.recordId,
        type: this.recordType,
        date: this.visitDate,
        doctor: this.doctor,
        primaryDiagnosis: this.assessment?.primaryDiagnosis?.condition,
        status: this.recordStatus
    };
});

// Generate unique record ID
MedicalRecordSchema.pre('save', async function (next) {
    if (!this.recordId && this.isNew) {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');

        const lastRecord = await this.constructor.findOne(
            { recordId: new RegExp(`^MR${year}${month}`) },
            { recordId: 1 },
            { sort: { recordId: -1 } }
        );

        let nextNumber = 1;
        if (lastRecord && lastRecord.recordId) {
            const lastNumber = parseInt(lastRecord.recordId.slice(-6));
            nextNumber = lastNumber + 1;
        }

        this.recordId = `MR${year}${month}${nextNumber.toString().padStart(6, '0')}`;
    }
    next();
});

// Pre-save middleware to calculate BMI
MedicalRecordSchema.pre('save', function (next) {
    const height = this.physicalExamination?.vitalSigns?.height?.value;
    const weight = this.physicalExamination?.vitalSigns?.weight?.value;

    if (height && weight) {
        const heightInMeters = height / 100; // Convert cm to meters
        const bmi = weight / (heightInMeters * heightInMeters);
        this.physicalExamination.vitalSigns.bmi = Math.round(bmi * 10) / 10;
    }

    next();
});

// Instance method to add access log entry
MedicalRecordSchema.methods.logAccess = function (accessData) {
    this.accessLog.push(accessData);
    return this.save();
};

// Instance method to get active medications
MedicalRecordSchema.methods.getActiveMedications = function () {
    const now = new Date();
    return this.currentMedications.filter(med =>
        !med.endDate || med.endDate > now
    );
};

// Instance method to get critical lab values
MedicalRecordSchema.methods.getCriticalLabValues = function () {
    const criticalValues = [];

    this.diagnosticTests.laboratoryTests.forEach(test => {
        test.results.forEach(result => {
            if (result.abnormalFlag && result.abnormalFlag.includes('critical')) {
                criticalValues.push({
                    test: test.testName,
                    parameter: result.parameter,
                    value: result.value,
                    flag: result.abnormalFlag
                });
            }
        });
    });

    return criticalValues;
};

// Instance method to check if record needs review
MedicalRecordSchema.methods.needsReview = function () {
    return this.recordStatus === 'draft' && !this.reviewedBy;
};

// Static method to find records by diagnosis
MedicalRecordSchema.statics.findByDiagnosis = function (icdCode) {
    return this.find({
        $or: [
            { 'assessment.primaryDiagnosis.icdCode': icdCode },
            { 'assessment.secondaryDiagnoses.icdCode': icdCode }
        ]
    });
};

// Static method to get patient timeline
MedicalRecordSchema.statics.getPatientTimeline = function (patientId, startDate, endDate) {
    const matchCondition = { patient: patientId };

    if (startDate && endDate) {
        matchCondition.visitDate = { $gte: startDate, $lte: endDate };
    }

    return this.find(matchCondition)
        .sort({ visitDate: -1 })
        .populate('doctor', 'firstName lastName specialization')
        .populate('appointment');
};

// Static method to get department statistics
MedicalRecordSchema.statics.getDepartmentStats = function (department, startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                department: department,
                visitDate: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$recordType',
                count: { $sum: 1 },
                avgDuration: { $avg: '$visitDuration' }
            }
        }
    ]);
};

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema); 