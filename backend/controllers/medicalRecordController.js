const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// إنشاء سجل طبي جديد
const createMedicalRecord = async (req, res) => {
    try {
        const recordData = {
            ...req.body,
            createdBy: req.user?.username || 'system'
        };

        const medicalRecord = new MedicalRecord(recordData);
        await medicalRecord.save();

        // Populate the response
        const populatedRecord = await MedicalRecord.findById(medicalRecord._id)
            .populate('patient', 'firstName lastName phone email nationalId')
            .populate('doctor', 'firstName lastName specialization')
            .populate('appointment');

        res.status(201).json({
            status: 'success',
            message: 'تم إنشاء السجل الطبي بنجاح',
            data: { medicalRecord: populatedRecord }
        });
    } catch (error) {
        console.error('❌ Error creating medical record:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// الحصول على جميع السجلات الطبية مع فلترة متقدمة
const getAllMedicalRecords = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // بناء الاستعلام
        let query = {};

        // فلترة حسب المريض
        if (req.query.patient) {
            query.patient = req.query.patient;
        }

        // فلترة حسب الطبيب
        if (req.query.doctor) {
            query.doctor = req.query.doctor;
        }

        // فلترة حسب نوع السجل
        if (req.query.recordType) {
            query.recordType = req.query.recordType;
        }

        // فلترة حسب القسم
        if (req.query.department) {
            query.department = new RegExp(req.query.department, 'i');
        }

        // فلترة حسب حالة السجل
        if (req.query.recordStatus) {
            query.recordStatus = req.query.recordStatus;
        }

        // فلترة حسب التاريخ
        if (req.query.startDate || req.query.endDate) {
            query.visitDate = {};
            if (req.query.startDate) {
                query.visitDate.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                query.visitDate.$lte = new Date(req.query.endDate);
            }
        }

        const medicalRecords = await MedicalRecord.find(query)
            .populate('patient', 'firstName lastName phone email nationalId dateOfBirth gender')
            .populate('doctor', 'firstName lastName specialization department')
            .populate('appointment')
            .sort({ visitDate: -1 })
            .skip(skip)
            .limit(limit);

        const total = await MedicalRecord.countDocuments(query);

        res.json({
            status: 'success',
            data: {
                medicalRecords,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalRecords: total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        console.error('❌ Error getting medical records:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// الحصول على سجل طبي واحد
const getMedicalRecordById = async (req, res) => {
    try {
        const medicalRecord = await MedicalRecord.findById(req.params.id)
            .populate('patient')
            .populate('doctor')
            .populate('appointment')
            .populate('currentMedications.prescribedBy', 'firstName lastName')
            .populate('referrals.referredDoctor', 'firstName lastName specialization');

        if (!medicalRecord) {
            return res.status(404).json({
                status: 'fail',
                message: 'السجل الطبي غير موجود'
            });
        }

        // Log access
        await medicalRecord.logAccess({
            accessedBy: req.user?.username || 'anonymous',
            accessType: 'view',
            purpose: 'Medical record review'
        });

        res.json({
            status: 'success',
            data: { medicalRecord }
        });
    } catch (error) {
        console.error('❌ Error getting medical record:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// تحديث السجل الطبي
const updateMedicalRecord = async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            lastModifiedBy: req.user?.username || 'system'
        };

        const medicalRecord = await MedicalRecord.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('patient', 'firstName lastName')
            .populate('doctor', 'firstName lastName');

        if (!medicalRecord) {
            return res.status(404).json({
                status: 'fail',
                message: 'السجل الطبي غير موجود'
            });
        }

        // Log access
        await medicalRecord.logAccess({
            accessedBy: req.user?.username || 'anonymous',
            accessType: 'edit',
            purpose: 'Medical record update'
        });

        res.json({
            status: 'success',
            message: 'تم تحديث السجل الطبي بنجاح',
            data: { medicalRecord }
        });
    } catch (error) {
        console.error('❌ Error updating medical record:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// حذف السجل الطبي
const deleteMedicalRecord = async (req, res) => {
    try {
        const medicalRecord = await MedicalRecord.findByIdAndDelete(req.params.id);

        if (!medicalRecord) {
            return res.status(404).json({
                status: 'fail',
                message: 'السجل الطبي غير موجود'
            });
        }

        res.json({
            status: 'success',
            message: 'تم حذف السجل الطبي بنجاح'
        });
    } catch (error) {
        console.error('❌ Error deleting medical record:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// البحث المتقدم في السجلات الطبية
const searchMedicalRecords = async (req, res) => {
    try {
        const { query, diagnosis, medication, allergy } = req.query;

        let searchQuery = {};

        if (query) {
            // البحث في النصوص
            const textSearch = {
                $or: [
                    { chiefComplaint: new RegExp(query, 'i') },
                    { 'assessment.primaryDiagnosis.condition': new RegExp(query, 'i') },
                    { clinicalNotes: new RegExp(query, 'i') },
                    { recordId: new RegExp(query, 'i') }
                ]
            };

            // البحث في بيانات المريض والطبيب
            const patients = await Patient.find({
                $or: [
                    { firstName: new RegExp(query, 'i') },
                    { lastName: new RegExp(query, 'i') },
                    { nationalId: new RegExp(query, 'i') }
                ]
            }).select('_id');

            const doctors = await Doctor.find({
                $or: [
                    { firstName: new RegExp(query, 'i') },
                    { lastName: new RegExp(query, 'i') },
                    { specialization: new RegExp(query, 'i') }
                ]
            }).select('_id');

            if (patients.length > 0 || doctors.length > 0) {
                textSearch.$or.push(
                    { patient: { $in: patients.map(p => p._id) } },
                    { doctor: { $in: doctors.map(d => d._id) } }
                );
            }

            searchQuery = { ...searchQuery, ...textSearch };
        }

        // فلترة حسب التشخيص
        if (diagnosis) {
            searchQuery['assessment.primaryDiagnosis.condition'] = new RegExp(diagnosis, 'i');
        }

        // فلترة حسب الدواء
        if (medication) {
            searchQuery['currentMedications.medicationName'] = new RegExp(medication, 'i');
        }

        // فلترة حسب الحساسية
        if (allergy) {
            searchQuery['allergies.allergen'] = new RegExp(allergy, 'i');
        }

        const records = await MedicalRecord.find(searchQuery)
            .populate('patient', 'firstName lastName phone nationalId')
            .populate('doctor', 'firstName lastName specialization')
            .sort({ visitDate: -1 })
            .limit(50);

        res.json({
            status: 'success',
            data: { medicalRecords: records },
            count: records.length
        });
    } catch (error) {
        console.error('❌ Error searching medical records:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// الحصول على السجلات الطبية للمريض
const getMedicalRecordsByPatient = async (req, res) => {
    try {
        const { patientId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const records = await MedicalRecord.find({ patient: patientId })
            .populate('doctor', 'firstName lastName specialization')
            .populate('appointment')
            .sort({ visitDate: -1 })
            .skip(skip)
            .limit(limit);

        const total = await MedicalRecord.countDocuments({ patient: patientId });

        res.json({
            status: 'success',
            data: {
                medicalRecords: records,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalRecords: total
                }
            }
        });
    } catch (error) {
        console.error('❌ Error getting patient records:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// الحصول على السجلات الطبية للطبيب
const getMedicalRecordsByDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const records = await MedicalRecord.find({ doctor: doctorId })
            .populate('patient', 'firstName lastName phone nationalId')
            .populate('appointment')
            .sort({ visitDate: -1 })
            .skip(skip)
            .limit(limit);

        const total = await MedicalRecord.countDocuments({ doctor: doctorId });

        res.json({
            status: 'success',
            data: {
                medicalRecords: records,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalRecords: total
                }
            }
        });
    } catch (error) {
        console.error('❌ Error getting doctor records:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// الحصول على السجلات حسب التشخيص
const getMedicalRecordsByDiagnosis = async (req, res) => {
    try {
        const { icdCode } = req.params;

        const records = await MedicalRecord.findByDiagnosis(icdCode)
            .populate('patient', 'firstName lastName')
            .populate('doctor', 'firstName lastName')
            .sort({ visitDate: -1 });

        res.json({
            status: 'success',
            data: { medicalRecords: records },
            count: records.length
        });
    } catch (error) {
        console.error('❌ Error getting diagnosis records:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// إحصائيات السجلات الطبية
const getMedicalRecordsStats = async (req, res) => {
    try {
        const totalRecords = await MedicalRecord.countDocuments();
        const todayRecords = await MedicalRecord.countDocuments({
            visitDate: {
                $gte: new Date().setHours(0, 0, 0, 0),
                $lt: new Date().setHours(23, 59, 59, 999)
            }
        });

        // إحصائيات حسب نوع السجل
        const recordTypeStats = await MedicalRecord.aggregate([
            {
                $group: {
                    _id: '$recordType',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // إحصائيات حسب القسم
        const departmentStats = await MedicalRecord.aggregate([
            {
                $group: {
                    _id: '$department',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // السجلات التي تحتاج مراجعة
        const needsReview = await MedicalRecord.countDocuments({
            recordStatus: 'draft',
            reviewedBy: { $exists: false }
        });

        // أكثر التشخيصات شيوعاً
        const topDiagnoses = await MedicalRecord.aggregate([
            {
                $group: {
                    _id: '$assessment.primaryDiagnosis.condition',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            status: 'success',
            data: {
                total: totalRecords,
                today: todayRecords,
                needsReview,
                recordTypes: recordTypeStats,
                departments: departmentStats,
                topDiagnoses
            }
        });
    } catch (error) {
        console.error('❌ Error getting stats:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// إضافة تشخيص للسجل
const addDiagnosisToRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const diagnosisData = req.body;

        const medicalRecord = await MedicalRecord.findById(id);
        if (!medicalRecord) {
            return res.status(404).json({
                status: 'fail',
                message: 'السجل الطبي غير موجود'
            });
        }

        medicalRecord.assessment.secondaryDiagnoses.push(diagnosisData);
        await medicalRecord.save();

        res.json({
            status: 'success',
            message: 'تم إضافة التشخيص بنجاح',
            data: { medicalRecord }
        });
    } catch (error) {
        console.error('❌ Error adding diagnosis:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// إضافة دواء للسجل
const addMedicationToRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const medicationData = {
            ...req.body,
            prescribedBy: req.user?.id
        };

        const medicalRecord = await MedicalRecord.findById(id);
        if (!medicalRecord) {
            return res.status(404).json({
                status: 'fail',
                message: 'السجل الطبي غير موجود'
            });
        }

        medicalRecord.currentMedications.push(medicationData);
        await medicalRecord.save();

        res.json({
            status: 'success',
            message: 'تم إضافة الدواء بنجاح',
            data: { medicalRecord }
        });
    } catch (error) {
        console.error('❌ Error adding medication:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// إضافة حساسية للسجل
const addAllergyToRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const allergyData = req.body;

        const medicalRecord = await MedicalRecord.findById(id);
        if (!medicalRecord) {
            return res.status(404).json({
                status: 'fail',
                message: 'السجل الطبي غير موجود'
            });
        }

        medicalRecord.allergies.push(allergyData);
        await medicalRecord.save();

        res.json({
            status: 'success',
            message: 'تم إضافة الحساسية بنجاح',
            data: { medicalRecord }
        });
    } catch (error) {
        console.error('❌ Error adding allergy:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// إضافة نتيجة مختبر للسجل
const addLabResultToRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const labData = req.body;

        const medicalRecord = await MedicalRecord.findById(id);
        if (!medicalRecord) {
            return res.status(404).json({
                status: 'fail',
                message: 'السجل الطبي غير موجود'
            });
        }

        medicalRecord.diagnosticTests.laboratoryTests.push(labData);
        await medicalRecord.save();

        res.json({
            status: 'success',
            message: 'تم إضافة نتيجة المختبر بنجاح',
            data: { medicalRecord }
        });
    } catch (error) {
        console.error('❌ Error adding lab result:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// الحصول على الخط الزمني للمريض
const getPatientTimeline = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // آخر سنة
        const end = endDate ? new Date(endDate) : new Date();

        const timeline = await MedicalRecord.getPatientTimeline(patientId, start, end);

        res.json({
            status: 'success',
            data: {
                timeline,
                period: { startDate: start, endDate: end }
            }
        });
    } catch (error) {
        console.error('❌ Error getting patient timeline:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// توقيع السجل الطبي
const signMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { electronicSignature } = req.body;

        const medicalRecord = await MedicalRecord.findByIdAndUpdate(
            id,
            {
                signedBy: req.user?.id,
                signatureDate: new Date(),
                electronicSignature,
                recordStatus: 'final'
            },
            { new: true }
        );

        if (!medicalRecord) {
            return res.status(404).json({
                status: 'fail',
                message: 'السجل الطبي غير موجود'
            });
        }

        res.json({
            status: 'success',
            message: 'تم توقيع السجل الطبي بنجاح',
            data: { medicalRecord }
        });
    } catch (error) {
        console.error('❌ Error signing record:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// مراجعة السجل الطبي
const reviewMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { reviewNotes } = req.body;

        const medicalRecord = await MedicalRecord.findByIdAndUpdate(
            id,
            {
                reviewedBy: req.user?.id,
                reviewDate: new Date(),
                privateNotes: reviewNotes
            },
            { new: true }
        );

        if (!medicalRecord) {
            return res.status(404).json({
                status: 'fail',
                message: 'السجل الطبي غير موجود'
            });
        }

        res.json({
            status: 'success',
            message: 'تم مراجعة السجل الطبي بنجاح',
            data: { medicalRecord }
        });
    } catch (error) {
        console.error('❌ Error reviewing record:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// تحديث التشخيص
const updateDiagnosis = async (req, res) => {
    try {
        const { id, diagnosisId } = req.params;
        const updateData = req.body;

        const medicalRecord = await MedicalRecord.findById(id);
        if (!medicalRecord) {
            return res.status(404).json({
                status: 'fail',
                message: 'السجل الطبي غير موجود'
            });
        }

        const diagnosis = medicalRecord.assessment.secondaryDiagnoses.id(diagnosisId);
        if (!diagnosis) {
            return res.status(404).json({
                status: 'fail',
                message: 'التشخيص غير موجود'
            });
        }

        Object.assign(diagnosis, updateData);
        await medicalRecord.save();

        res.json({
            status: 'success',
            message: 'تم تحديث التشخيص بنجاح',
            data: { medicalRecord }
        });
    } catch (error) {
        console.error('❌ Error updating diagnosis:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// باقي الوظائف المطلوبة
const removeDiagnosisFromRecord = async (req, res) => {
    try {
        const { id, diagnosisId } = req.params;

        const medicalRecord = await MedicalRecord.findById(id);
        if (!medicalRecord) {
            return res.status(404).json({
                status: 'fail',
                message: 'السجل الطبي غير موجود'
            });
        }

        medicalRecord.assessment.secondaryDiagnoses.pull(diagnosisId);
        await medicalRecord.save();

        res.json({
            status: 'success',
            message: 'تم حذف التشخيص بنجاح'
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const updateMedication = async (req, res) => {
    try {
        const { id, medicationId } = req.params;
        const updateData = req.body;

        const medicalRecord = await MedicalRecord.findById(id);
        if (!medicalRecord) {
            return res.status(404).json({
                status: 'fail',
                message: 'السجل الطبي غير موجود'
            });
        }

        const medication = medicalRecord.currentMedications.id(medicationId);
        if (!medication) {
            return res.status(404).json({
                status: 'fail',
                message: 'الدواء غير موجود'
            });
        }

        Object.assign(medication, updateData);
        await medicalRecord.save();

        res.json({
            status: 'success',
            message: 'تم تحديث الدواء بنجاح',
            data: { medicalRecord }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const removeMedicationFromRecord = async (req, res) => {
    try {
        const { id, medicationId } = req.params;

        const medicalRecord = await MedicalRecord.findById(id);
        if (!medicalRecord) {
            return res.status(404).json({
                status: 'fail',
                message: 'السجل الطبي غير موجود'
            });
        }

        medicalRecord.currentMedications.pull(medicationId);
        await medicalRecord.save();

        res.json({
            status: 'success',
            message: 'تم حذف الدواء بنجاح'
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// تحديث الحساسية
const updateAllergy = async (req, res) => {
    try {
        const { id, allergyId } = req.params;
        const updateData = req.body;

        const medicalRecord = await MedicalRecord.findById(id);
        if (!medicalRecord) {
            return res.status(404).json({
                status: 'fail',
                message: 'السجل الطبي غير موجود'
            });
        }

        const allergy = medicalRecord.allergies.id(allergyId);
        if (!allergy) {
            return res.status(404).json({
                status: 'fail',
                message: 'الحساسية غير موجودة'
            });
        }

        Object.assign(allergy, updateData);
        await medicalRecord.save();

        res.json({
            status: 'success',
            message: 'تم تحديث الحساسية بنجاح',
            data: { medicalRecord }
        });
    } catch (error) {
        console.error('❌ Error updating allergy:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const removeAllergyFromRecord = async (req, res) => {
    try {
        const { id, allergyId } = req.params;

        const medicalRecord = await MedicalRecord.findById(id);
        if (!medicalRecord) {
            return res.status(404).json({
                status: 'fail',
                message: 'السجل الطبي غير موجود'
            });
        }

        medicalRecord.allergies.pull(allergyId);
        await medicalRecord.save();

        res.json({
            status: 'success',
            message: 'تم حذف الحساسية بنجاح'
        });
    } catch (error) {
        console.error('❌ Error removing allergy:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const updateLabResult = async (req, res) => {
    try {
        const { id, resultId } = req.params;
        const updateData = req.body;

        const medicalRecord = await MedicalRecord.findById(id);
        if (!medicalRecord) {
            return res.status(404).json({
                status: 'fail',
                message: 'السجل الطبي غير موجود'
            });
        }

        const labTest = medicalRecord.diagnosticTests.laboratoryTests.id(resultId);
        if (!labTest) {
            return res.status(404).json({
                status: 'fail',
                message: 'نتيجة المختبر غير موجودة'
            });
        }

        Object.assign(labTest, updateData);
        await medicalRecord.save();

        res.json({
            status: 'success',
            message: 'تم تحديث نتيجة المختبر بنجاح',
            data: { medicalRecord }
        });
    } catch (error) {
        console.error('❌ Error updating lab result:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const removeLabResultFromRecord = async (req, res) => {
    try {
        const { id, resultId } = req.params;

        const medicalRecord = await MedicalRecord.findById(id);
        if (!medicalRecord) {
            return res.status(404).json({
                status: 'fail',
                message: 'السجل الطبي غير موجود'
            });
        }

        medicalRecord.diagnosticTests.laboratoryTests.pull(resultId);
        await medicalRecord.save();

        res.json({
            status: 'success',
            message: 'تم حذف نتيجة المختبر بنجاح'
        });
    } catch (error) {
        console.error('❌ Error removing lab result:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const addRadiologyResultToRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const radiologyData = req.body;

        const medicalRecord = await MedicalRecord.findById(id);
        if (!medicalRecord) {
            return res.status(404).json({
                status: 'fail',
                message: 'السجل الطبي غير موجود'
            });
        }

        medicalRecord.diagnosticTests.radiologyTests.push(radiologyData);
        await medicalRecord.save();

        res.json({
            status: 'success',
            message: 'تم إضافة نتيجة الأشعة بنجاح',
            data: { medicalRecord }
        });
    } catch (error) {
        console.error('❌ Error adding radiology result:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const updateRadiologyResult = async (req, res) => {
    try {
        const { id, resultId } = req.params;
        const updateData = req.body;

        const medicalRecord = await MedicalRecord.findById(id);
        if (!medicalRecord) {
            return res.status(404).json({
                status: 'fail',
                message: 'السجل الطبي غير موجود'
            });
        }

        const radiologyTest = medicalRecord.diagnosticTests.radiologyTests.id(resultId);
        if (!radiologyTest) {
            return res.status(404).json({
                status: 'fail',
                message: 'نتيجة الأشعة غير موجودة'
            });
        }

        Object.assign(radiologyTest, updateData);
        await medicalRecord.save();

        res.json({
            status: 'success',
            message: 'تم تحديث نتيجة الأشعة بنجاح',
            data: { medicalRecord }
        });
    } catch (error) {
        console.error('❌ Error updating radiology result:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const removeRadiologyResultFromRecord = async (req, res) => {
    try {
        const { id, resultId } = req.params;

        const medicalRecord = await MedicalRecord.findById(id);
        if (!medicalRecord) {
            return res.status(404).json({
                status: 'fail',
                message: 'السجل الطبي غير موجود'
            });
        }

        medicalRecord.diagnosticTests.radiologyTests.pull(resultId);
        await medicalRecord.save();

        res.json({
            status: 'success',
            message: 'تم حذف نتيجة الأشعة بنجاح'
        });
    } catch (error) {
        console.error('❌ Error removing radiology result:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const generateRecordSummary = async (req, res) => {
    try {
        const { id } = req.params;

        const medicalRecord = await MedicalRecord.findById(id)
            .populate('patient', 'firstName lastName dateOfBirth gender')
            .populate('doctor', 'firstName lastName specialization');

        if (!medicalRecord) {
            return res.status(404).json({
                status: 'fail',
                message: 'السجل الطبي غير موجود'
            });
        }

        // إنشاء ملخص شامل للسجل
        const summary = {
            recordInfo: {
                recordId: medicalRecord.recordId,
                recordType: medicalRecord.recordType,
                visitDate: medicalRecord.visitDate,
                department: medicalRecord.department
            },
            patient: {
                name: `${medicalRecord.patient.firstName} ${medicalRecord.patient.lastName}`,
                age: medicalRecord.patient.dateOfBirth
                    ? Math.floor((new Date() - new Date(medicalRecord.patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
                    : null,
                gender: medicalRecord.patient.gender
            },
            doctor: {
                name: `د. ${medicalRecord.doctor.firstName} ${medicalRecord.doctor.lastName}`,
                specialization: medicalRecord.doctor.specialization
            },
            chiefComplaint: medicalRecord.chiefComplaint,
            primaryDiagnosis: medicalRecord.assessment?.primaryDiagnosis?.condition,
            medications: medicalRecord.currentMedications?.map(med => ({
                name: med.medicationName,
                dosage: med.dosage,
                frequency: med.frequency
            })),
            allergies: medicalRecord.allergies?.map(allergy => ({
                allergen: allergy.allergen,
                severity: allergy.severity,
                reaction: allergy.reaction
            })),
            vitalSigns: medicalRecord.physicalExamination?.vitalSigns,
            criticalAlerts: {
                lifeThreatening: medicalRecord.allergies?.some(a => a.severity === 'life_threatening'),
                criticalLabs: medicalRecord.getCriticalLabValues?.()
            }
        };

        res.json({
            status: 'success',
            data: { summary }
        });
    } catch (error) {
        console.error('❌ Error generating summary:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

const exportMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { format = 'json' } = req.query;

        const medicalRecord = await MedicalRecord.findById(id)
            .populate('patient')
            .populate('doctor')
            .populate('appointment');

        if (!medicalRecord) {
            return res.status(404).json({
                status: 'fail',
                message: 'السجل الطبي غير موجود'
            });
        }

        // Log access for export
        await medicalRecord.logAccess({
            accessedBy: req.user?.username || 'anonymous',
            accessType: 'export',
            purpose: `Export in ${format} format`
        });

        if (format === 'pdf') {
            // هنا يمكن إضافة تصدير PDF لاحقاً
            res.json({
                status: 'success',
                message: 'تصدير PDF سيكون متاحاً قريباً',
                data: { downloadUrl: null }
            });
        } else {
            // تصدير JSON
            res.json({
                status: 'success',
                data: { medicalRecord },
                exportedAt: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('❌ Error exporting record:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

const duplicateMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params;

        const originalRecord = await MedicalRecord.findById(id);
        if (!originalRecord) {
            return res.status(404).json({
                status: 'fail',
                message: 'السجل الطبي غير موجود'
            });
        }

        // إنشاء نسخة من السجل مع تعديل بعض الحقول
        const duplicatedData = originalRecord.toObject();
        delete duplicatedData._id;
        delete duplicatedData.recordId;
        delete duplicatedData.createdAt;
        delete duplicatedData.updatedAt;
        delete duplicatedData.signatureDate;
        delete duplicatedData.signedBy;
        delete duplicatedData.electronicSignature;

        // تعديل البيانات للنسخة الجديدة
        duplicatedData.visitDate = new Date();
        duplicatedData.recordStatus = 'draft';
        duplicatedData.createdBy = req.user?.username || 'system';
        duplicatedData.clinicalNotes = `[نسخة من السجل ${originalRecord.recordId}]\n\n${duplicatedData.clinicalNotes || ''}`;

        const duplicatedRecord = new MedicalRecord(duplicatedData);
        await duplicatedRecord.save();

        const populatedRecord = await MedicalRecord.findById(duplicatedRecord._id)
            .populate('patient', 'firstName lastName')
            .populate('doctor', 'firstName lastName');

        res.json({
            status: 'success',
            message: 'تم إنشاء نسخة من السجل الطبي بنجاح',
            data: { medicalRecord: populatedRecord }
        });
    } catch (error) {
        console.error('❌ Error duplicating record:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

const getMedicalRecordsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                status: 'fail',
                message: 'تاريخ البداية والنهاية مطلوبان'
            });
        }

        const records = await MedicalRecord.find({
            visitDate: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        })
            .populate('patient', 'firstName lastName')
            .populate('doctor', 'firstName lastName')
            .sort({ visitDate: -1 });

        res.json({
            status: 'success',
            data: { medicalRecords: records },
            count: records.length,
            period: { startDate, endDate }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

module.exports = {
    createMedicalRecord,
    getAllMedicalRecords,
    getMedicalRecordById,
    updateMedicalRecord,
    deleteMedicalRecord,
    searchMedicalRecords,
    getMedicalRecordsByPatient,
    getMedicalRecordsByDoctor,
    getMedicalRecordsByDiagnosis,
    getMedicalRecordsStats,
    addDiagnosisToRecord,
    updateDiagnosis,
    removeDiagnosisFromRecord,
    addMedicationToRecord,
    updateMedication,
    removeMedicationFromRecord,
    addAllergyToRecord,
    updateAllergy,
    removeAllergyFromRecord,
    addLabResultToRecord,
    updateLabResult,
    removeLabResultFromRecord,
    addRadiologyResultToRecord,
    updateRadiologyResult,
    removeRadiologyResultFromRecord,
    getPatientTimeline,
    signMedicalRecord,
    reviewMedicalRecord,
    generateRecordSummary,
    exportMedicalRecord,
    duplicateMedicalRecord,
    getMedicalRecordsByDateRange
}; 