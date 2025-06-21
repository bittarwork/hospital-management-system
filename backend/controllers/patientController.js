const Patient = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');

// إنشاء مريض جديد
const createPatient = async (req, res) => {
    try {
        const patient = new Patient(req.body);
        await patient.save();
        res.status(201).json({
            status: 'success',
            message: 'Patient created successfully',
            data: { patient }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// الحصول على جميع المرضى
const getAllPatients = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const patients = await Patient.find({ status: 'active' })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Patient.countDocuments({ status: 'active' });

        res.json({
            status: 'success',
            data: {
                patients,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalPatients: total,
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

// الحصول على مريض واحد
const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({
                status: 'fail',
                message: 'Patient not found'
            });
        }
        res.json({
            status: 'success',
            data: { patient }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// تحديث بيانات المريض
const updatePatient = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(
            req.params.id,
            { ...req.body, lastModifiedBy: req.user?.name || 'System' },
            { new: true, runValidators: true }
        );
        if (!patient) {
            return res.status(404).json({
                status: 'fail',
                message: 'Patient not found'
            });
        }
        res.json({
            status: 'success',
            message: 'Patient updated successfully',
            data: { patient }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// حذف المريض (إلغاء تفعيل)
const deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(
            req.params.id,
            { status: 'inactive' },
            { new: true }
        );
        if (!patient) {
            return res.status(404).json({
                status: 'fail',
                message: 'Patient not found'
            });
        }
        res.json({
            status: 'success',
            message: 'Patient deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// البحث عن المرضى
const searchPatients = async (req, res) => {
    try {
        const { query, specialty, status } = req.query;
        let searchCriteria = {};

        if (query) {
            searchCriteria.$or = [
                { firstName: { $regex: query, $options: 'i' } },
                { lastName: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
                { patientId: { $regex: query, $options: 'i' } }
            ];
        }

        if (status) searchCriteria.status = status;

        const patients = await Patient.find(searchCriteria).limit(20);

        res.json({
            status: 'success',
            data: { patients, count: patients.length }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// الحصول على السجلات الطبية للمريض
const getPatientMedicalRecords = async (req, res) => {
    try {
        const records = await MedicalRecord.find({ patient: req.params.id }).sort({ createdAt: -1 });
        res.json({
            status: 'success',
            data: { records }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// الحصول على مواعيد المريض
const getPatientAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patient: req.params.id })
            .populate('doctor', 'firstName lastName specialization')
            .sort({ appointmentDate: -1 });

        res.json({
            status: 'success',
            data: { appointments }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// إضافة تاريخ طبي للمريض
const addMedicalHistory = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({
                status: 'fail',
                message: 'Patient not found'
            });
        }

        patient.medicalHistory.push(req.body);
        await patient.save();

        res.json({
            status: 'success',
            message: 'Medical history added successfully',
            data: { patient }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// إحصائيات المرضى
const getPatientsStats = async (req, res) => {
    try {
        const totalPatients = await Patient.countDocuments({ status: 'active' });
        const newPatientsThisMonth = await Patient.countDocuments({
            status: 'active',
            registrationDate: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
        });

        res.json({
            status: 'success',
            data: {
                totalPatients,
                newPatientsThisMonth,
                activePatients: totalPatients
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get patients by age range
const getPatientsByAgeRange = async (req, res) => {
    try {
        const { minAge, maxAge } = req.query;
        const patients = await Patient.find({
            age: { $gte: minAge || 0, $lte: maxAge || 200 },
            status: 'active'
        });

        res.json({
            status: 'success',
            data: { patients, count: patients.length }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get patient vitals
const getPatientVitals = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({
                status: 'fail',
                message: 'Patient not found'
            });
        }

        res.json({
            status: 'success',
            data: { vitals: patient.vitals }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Update patient vitals
const updatePatientVitals = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(
            req.params.id,
            { $set: { vitals: req.body } },
            { new: true, runValidators: true }
        );

        if (!patient) {
            return res.status(404).json({
                status: 'fail',
                message: 'Patient not found'
            });
        }

        res.json({
            status: 'success',
            message: 'Patient vitals updated successfully',
            data: { vitals: patient.vitals }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Get patient allergies
const getPatientAllergies = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({
                status: 'fail',
                message: 'Patient not found'
            });
        }

        res.json({
            status: 'success',
            data: { allergies: patient.allergies }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Add patient allergy
const addPatientAllergy = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({
                status: 'fail',
                message: 'Patient not found'
            });
        }

        patient.allergies.push(req.body);
        await patient.save();

        res.json({
            status: 'success',
            message: 'Allergy added successfully',
            data: { allergies: patient.allergies }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Update patient allergy
const updatePatientAllergy = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({
                status: 'fail',
                message: 'Patient not found'
            });
        }

        const allergyIndex = patient.allergies.findIndex(a => a._id.toString() === req.params.allergyId);
        if (allergyIndex === -1) {
            return res.status(404).json({
                status: 'fail',
                message: 'Allergy not found'
            });
        }

        patient.allergies[allergyIndex] = { ...patient.allergies[allergyIndex].toObject(), ...req.body };
        await patient.save();

        res.json({
            status: 'success',
            message: 'Allergy updated successfully',
            data: { allergies: patient.allergies }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Remove patient allergy
const removePatientAllergy = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({
                status: 'fail',
                message: 'Patient not found'
            });
        }

        patient.allergies.id(req.params.allergyId).remove();
        await patient.save();

        res.json({
            status: 'success',
            message: 'Allergy removed successfully'
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Get patient medications
const getPatientMedications = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({
                status: 'fail',
                message: 'Patient not found'
            });
        }

        const activeMedications = patient.getActiveMedications();
        res.json({
            status: 'success',
            data: { medications: activeMedications }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Add patient medication
const addPatientMedication = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({
                status: 'fail',
                message: 'Patient not found'
            });
        }

        patient.medications.push(req.body);
        await patient.save();

        res.json({
            status: 'success',
            message: 'Medication added successfully',
            data: { medications: patient.medications }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Update patient medication
const updatePatientMedication = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({
                status: 'fail',
                message: 'Patient not found'
            });
        }

        const medicationIndex = patient.medications.findIndex(m => m._id.toString() === req.params.medicationId);
        if (medicationIndex === -1) {
            return res.status(404).json({
                status: 'fail',
                message: 'Medication not found'
            });
        }

        patient.medications[medicationIndex] = { ...patient.medications[medicationIndex].toObject(), ...req.body };
        await patient.save();

        res.json({
            status: 'success',
            message: 'Medication updated successfully',
            data: { medications: patient.medications }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Remove patient medication
const removePatientMedication = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({
                status: 'fail',
                message: 'Patient not found'
            });
        }

        patient.medications.id(req.params.medicationId).remove();
        await patient.save();

        res.json({
            status: 'success',
            message: 'Medication removed successfully'
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

module.exports = {
    createPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    searchPatients,
    getPatientMedicalRecords,
    getPatientAppointments,
    addMedicalHistory,
    getPatientsStats,
    getPatientsByAgeRange,
    getPatientVitals,
    updatePatientVitals,
    getPatientAllergies,
    addPatientAllergy,
    updatePatientAllergy,
    removePatientAllergy,
    getPatientMedications,
    addPatientMedication,
    updatePatientMedication,
    removePatientMedication
}; 