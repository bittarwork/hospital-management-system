const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');

// Create new doctor
const createDoctor = async (req, res) => {
    try {
        const doctor = new Doctor(req.body);
        await doctor.save();
        res.status(201).json({
            status: 'success',
            message: 'Doctor created successfully',
            data: { doctor }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Get all doctors
const getAllDoctors = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const doctors = await Doctor.find({ status: 'active' })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Doctor.countDocuments({ status: 'active' });

        res.json({
            status: 'success',
            data: {
                doctors,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalDoctors: total,
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

// Get doctor by ID
const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({
                status: 'fail',
                message: 'Doctor not found'
            });
        }
        res.json({
            status: 'success',
            data: { doctor }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Update doctor
const updateDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!doctor) {
            return res.status(404).json({
                status: 'fail',
                message: 'Doctor not found'
            });
        }
        res.json({
            status: 'success',
            message: 'Doctor updated successfully',
            data: { doctor }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Delete doctor (soft delete)
const deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            { status: 'inactive' },
            { new: true }
        );
        if (!doctor) {
            return res.status(404).json({
                status: 'fail',
                message: 'Doctor not found'
            });
        }
        res.json({
            status: 'success',
            message: 'Doctor deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Search doctors  
const searchDoctors = async (req, res) => {
    res.json({ status: 'success', message: 'Search doctors endpoint - Coming soon' });
};

// Get doctor schedule
const getDoctorSchedule = async (req, res) => {
    res.json({ status: 'success', message: 'Get doctor schedule endpoint - Coming soon' });
};

// Update doctor schedule
const updateDoctorSchedule = async (req, res) => {
    res.json({ status: 'success', message: 'Update doctor schedule endpoint - Coming soon' });
};

// Get doctor appointments
const getDoctorAppointments = async (req, res) => {
    res.json({ status: 'success', message: 'Get doctor appointments endpoint - Coming soon' });
};

// Get doctor patients
const getDoctorPatients = async (req, res) => {
    res.json({ status: 'success', message: 'Get doctor patients endpoint - Coming soon' });
};

// Get doctors by specialization
const getDoctorsBySpecialization = async (req, res) => {
    res.json({ status: 'success', message: 'Get doctors by specialization endpoint - Coming soon' });
};

// Get available doctors
const getAvailableDoctors = async (req, res) => {
    res.json({ status: 'success', message: 'Get available doctors endpoint - Coming soon' });
};

// Get doctors statistics
const getDoctorsStats = async (req, res) => {
    res.json({ status: 'success', message: 'Get doctors stats endpoint - Coming soon' });
};

// Get doctor availability
const getDoctorAvailability = async (req, res) => {
    res.json({ status: 'success', message: 'Get doctor availability endpoint - Coming soon' });
};

// Add doctor schedule
const addDoctorSchedule = async (req, res) => {
    res.json({ status: 'success', message: 'Add doctor schedule endpoint - Coming soon' });
};

// Remove doctor schedule
const removeDoctorSchedule = async (req, res) => {
    res.json({ status: 'success', message: 'Remove doctor schedule endpoint - Coming soon' });
};

// Get doctor workload
const getDoctorWorkload = async (req, res) => {
    res.json({ status: 'success', message: 'Get doctor workload endpoint - Coming soon' });
};

// Update doctor status
const updateDoctorStatus = async (req, res) => {
    res.json({ status: 'success', message: 'Update doctor status endpoint - Coming soon' });
};

// Get doctor ratings
const getDoctorRatings = async (req, res) => {
    res.json({ status: 'success', message: 'Get doctor ratings endpoint - Coming soon' });
};

// Add doctor rating
const addDoctorRating = async (req, res) => {
    res.json({ status: 'success', message: 'Add doctor rating endpoint - Coming soon' });
};

// Get doctor certifications
const getDoctorCertifications = async (req, res) => {
    res.json({ status: 'success', message: 'Get doctor certifications endpoint - Coming soon' });
};

// Add doctor certification
const addDoctorCertification = async (req, res) => {
    res.json({ status: 'success', message: 'Add doctor certification endpoint - Coming soon' });
};

// Update doctor certification
const updateDoctorCertification = async (req, res) => {
    res.json({ status: 'success', message: 'Update doctor certification endpoint - Coming soon' });
};

// Remove doctor certification
const removeDoctorCertification = async (req, res) => {
    res.json({ status: 'success', message: 'Remove doctor certification endpoint - Coming soon' });
};

module.exports = {
    createDoctor,
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor,
    searchDoctors,
    getDoctorSchedule,
    updateDoctorSchedule,
    getDoctorAppointments,
    getDoctorPatients,
    getDoctorsBySpecialization,
    getAvailableDoctors,
    getDoctorsStats,
    getDoctorAvailability,
    addDoctorSchedule,
    removeDoctorSchedule,
    getDoctorWorkload,
    updateDoctorStatus,
    getDoctorRatings,
    addDoctorRating,
    getDoctorCertifications,
    addDoctorCertification,
    updateDoctorCertification,
    removeDoctorCertification
};
