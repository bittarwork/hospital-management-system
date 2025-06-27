const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticate);

// Import all controller functions
const {
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
} = require('../controllers/doctorController');

// Doctor CRUD Operations
router.post('/', createDoctor);                                // Create new doctor
router.get('/', getAllDoctors);                                // Get all doctors with pagination
router.get('/search', searchDoctors);                          // Search doctors by various criteria
router.get('/stats', getDoctorsStats);                         // Get doctor statistics
router.get('/available', getAvailableDoctors);                 // Get available doctors
router.get('/specialization/:specialization', getDoctorsBySpecialization); // Get doctors by specialization

// Individual Doctor Operations (parameterized routes at the end)
router.get('/:id', getDoctorById);                             // Get doctor by ID
router.put('/:id', updateDoctor);                              // Update doctor information
router.delete('/:id', deleteDoctor);                           // Delete doctor (soft delete)
router.patch('/:id/status', updateDoctorStatus);               // Update doctor status

// Doctor Schedule Management
router.get('/:id/schedule', getDoctorSchedule);                // Get doctor's schedule
router.post('/:id/schedule', addDoctorSchedule);               // Add schedule entry
router.put('/:id/schedule', updateDoctorSchedule);             // Update entire schedule
router.delete('/:id/schedule/:scheduleId', removeDoctorSchedule); // Remove schedule entry

// Doctor Availability
router.get('/:id/availability', getDoctorAvailability);        // Check doctor availability
router.get('/:id/workload', getDoctorWorkload);                // Get doctor workload statistics

// Doctor Appointments and Patients
router.get('/:id/appointments', getDoctorAppointments);        // Get doctor's appointments
router.get('/:id/patients', getDoctorPatients);                // Get doctor's patients

// Doctor Ratings and Reviews
router.get('/:id/ratings', getDoctorRatings);                  // Get doctor ratings
router.post('/:id/ratings', addDoctorRating);                  // Add doctor rating

// Doctor Certifications
router.get('/:id/certifications', getDoctorCertifications);    // Get doctor certifications
router.post('/:id/certifications', addDoctorCertification);    // Add certification
router.put('/:id/certifications/:certificationId', updateDoctorCertification); // Update certification
router.delete('/:id/certifications/:certificationId', removeDoctorCertification); // Remove certification

module.exports = router; 