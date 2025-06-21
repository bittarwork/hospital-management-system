const MedicalRecord = require('../models/MedicalRecord');

// إنشاء سجل طبي جديد
const createMedicalRecord = async (req, res) => {
    try {
        const medicalRecord = new MedicalRecord(req.body);
        await medicalRecord.save();
        res.status(201).json({
            status: 'success',
            message: 'Medical record created successfully',
            data: { medicalRecord }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// الحصول على جميع السجلات الطبية
const getAllMedicalRecords = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const medicalRecords = await MedicalRecord.find()
            .populate('patient', 'firstName lastName phone')
            .populate('doctor', 'firstName lastName specialization')
            .sort({ visitDate: -1 })
            .skip(skip)
            .limit(limit);

        const total = await MedicalRecord.countDocuments();

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
            .populate('doctor');

        if (!medicalRecord) {
            return res.status(404).json({
                status: 'fail',
                message: 'Medical record not found'
            });
        }

        res.json({
            status: 'success',
            data: { medicalRecord }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// تحديث السجل الطبي
const updateMedicalRecord = async (req, res) => {
    try {
        const medicalRecord = await MedicalRecord.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!medicalRecord) {
            return res.status(404).json({
                status: 'fail',
                message: 'Medical record not found'
            });
        }

        res.json({
            status: 'success',
            message: 'Medical record updated successfully',
            data: { medicalRecord }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Placeholder functions for all missing routes
const deleteMedicalRecord = async (req, res) => {
    res.json({ status: 'success', message: 'Delete medical record endpoint - Coming soon' });
};

const searchMedicalRecords = async (req, res) => {
    res.json({ status: 'success', message: 'Search medical records endpoint - Coming soon' });
};

const getMedicalRecordsByPatient = async (req, res) => {
    res.json({ status: 'success', message: 'Get medical records by patient endpoint - Coming soon' });
};

const getMedicalRecordsByDoctor = async (req, res) => {
    res.json({ status: 'success', message: 'Get medical records by doctor endpoint - Coming soon' });
};

const getMedicalRecordsByDiagnosis = async (req, res) => {
    res.json({ status: 'success', message: 'Get medical records by diagnosis endpoint - Coming soon' });
};

const getMedicalRecordsStats = async (req, res) => {
    res.json({ status: 'success', message: 'Get medical records stats endpoint - Coming soon' });
};

const addDiagnosisToRecord = async (req, res) => {
    res.json({ status: 'success', message: 'Add diagnosis to record endpoint - Coming soon' });
};

const updateDiagnosis = async (req, res) => {
    res.json({ status: 'success', message: 'Update diagnosis endpoint - Coming soon' });
};

const removeDiagnosisFromRecord = async (req, res) => {
    res.json({ status: 'success', message: 'Remove diagnosis from record endpoint - Coming soon' });
};

const addMedicationToRecord = async (req, res) => {
    res.json({ status: 'success', message: 'Add medication to record endpoint - Coming soon' });
};

const updateMedication = async (req, res) => {
    res.json({ status: 'success', message: 'Update medication endpoint - Coming soon' });
};

const removeMedicationFromRecord = async (req, res) => {
    res.json({ status: 'success', message: 'Remove medication from record endpoint - Coming soon' });
};

const addAllergyToRecord = async (req, res) => {
    res.json({ status: 'success', message: 'Add allergy to record endpoint - Coming soon' });
};

const updateAllergy = async (req, res) => {
    res.json({ status: 'success', message: 'Update allergy endpoint - Coming soon' });
};

const removeAllergyFromRecord = async (req, res) => {
    res.json({ status: 'success', message: 'Remove allergy from record endpoint - Coming soon' });
};

const addLabResultToRecord = async (req, res) => {
    res.json({ status: 'success', message: 'Add lab result to record endpoint - Coming soon' });
};

const updateLabResult = async (req, res) => {
    res.json({ status: 'success', message: 'Update lab result endpoint - Coming soon' });
};

const removeLabResultFromRecord = async (req, res) => {
    res.json({ status: 'success', message: 'Remove lab result from record endpoint - Coming soon' });
};

const addRadiologyResultToRecord = async (req, res) => {
    res.json({ status: 'success', message: 'Add radiology result to record endpoint - Coming soon' });
};

const updateRadiologyResult = async (req, res) => {
    res.json({ status: 'success', message: 'Update radiology result endpoint - Coming soon' });
};

const removeRadiologyResultFromRecord = async (req, res) => {
    res.json({ status: 'success', message: 'Remove radiology result from record endpoint - Coming soon' });
};

const getPatientTimeline = async (req, res) => {
    res.json({ status: 'success', message: 'Get patient timeline endpoint - Coming soon' });
};

const signMedicalRecord = async (req, res) => {
    res.json({ status: 'success', message: 'Sign medical record endpoint - Coming soon' });
};

const reviewMedicalRecord = async (req, res) => {
    res.json({ status: 'success', message: 'Review medical record endpoint - Coming soon' });
};

const generateRecordSummary = async (req, res) => {
    res.json({ status: 'success', message: 'Generate record summary endpoint - Coming soon' });
};

const exportMedicalRecord = async (req, res) => {
    res.json({ status: 'success', message: 'Export medical record endpoint - Coming soon' });
};

const duplicateMedicalRecord = async (req, res) => {
    res.json({ status: 'success', message: 'Duplicate medical record endpoint - Coming soon' });
};

const getMedicalRecordsByDateRange = async (req, res) => {
    res.json({ status: 'success', message: 'Get medical records by date range endpoint - Coming soon' });
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