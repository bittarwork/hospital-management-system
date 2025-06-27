const express = require('express');
const router = express.Router();

// Import all controller functions
const {
    createAppointment,
    getAllAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment,
    cancelAppointment,
    rescheduleAppointment,
    searchAppointments,
    getAppointmentsByDate,
    getAppointmentsByDoctor,
    getAppointmentsByPatient,
    getAppointmentsStats,
    checkInPatient,
    checkOutPatient,
    getAvailableTimeSlots,
    confirmAppointment,
    getUpcomingAppointments,
    getOverdueAppointments,
    getTodaysAppointments,
    getAppointmentHistory,
    addAppointmentNote,
    updateAppointmentStatus,
    getAppointmentsByStatus,
    sendAppointmentReminder,
    bulkUpdateAppointments
} = require('../controllers/appointmentController');

// Appointment CRUD Operations
router.post('/', createAppointment);                           // Create new appointment
router.get('/', getAllAppointments);                           // Get all appointments with pagination
router.get('/search', searchAppointments);                     // Search appointments by criteria
router.get('/stats', getAppointmentsStats);                    // Get appointment statistics

// Appointment Queries
router.get('/today', getTodaysAppointments);                   // Get today's appointments
router.get('/upcoming', getUpcomingAppointments);              // Get upcoming appointments
router.get('/overdue', getOverdueAppointments);                // Get overdue appointments
router.get('/history', getAppointmentHistory);                 // Get appointment history
router.get('/status/:status', getAppointmentsByStatus);        // Get appointments by status
router.get('/date/:date', getAppointmentsByDate);              // Get appointments by specific date
router.get('/doctor/:doctorId', getAppointmentsByDoctor);      // Get appointments by doctor
router.get('/patient/:patientId', getAppointmentsByPatient);   // Get appointments by patient

// Availability and Scheduling
router.get('/available-slots', getAvailableTimeSlots); // Get available time slots (use query params)

// Individual Appointment Operations (parameterized routes at the end)
router.get('/:id', getAppointmentById);                        // Get appointment by ID
router.put('/:id', updateAppointment);                         // Update appointment
router.delete('/:id', deleteAppointment);                      // Delete appointment
router.patch('/:id/status', updateAppointmentStatus);          // Update appointment status

// Appointment Actions
router.patch('/:id/confirm', confirmAppointment);              // Confirm appointment
router.patch('/:id/cancel', cancelAppointment);                // Cancel appointment
router.patch('/:id/reschedule', rescheduleAppointment);        // Reschedule appointment
router.patch('/:id/check-in', checkInPatient);                 // Check in patient
router.patch('/:id/check-out', checkOutPatient);               // Check out patient

// Appointment Communication
router.post('/:id/reminder', sendAppointmentReminder);         // Send appointment reminder
router.post('/:id/notes', addAppointmentNote);                 // Add appointment note

// Bulk Operations
router.patch('/bulk/update', bulkUpdateAppointments);          // Bulk update appointments

module.exports = router; 