const express = require('express');
const router = express.Router();

// Import middleware
const {
    authenticate,
    checkPermission
} = require('../middleware/auth');

// Import all controller functions
const {
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
} = require('../controllers/patientController');

// Apply authentication to all routes
router.use(authenticate);

// Patient CRUD Operations
router.post('/', checkPermission('patients', 'create'), createPatient);                              // Create new patient
router.get('/', checkPermission('patients', 'read'), getAllPatients);                              // Get all patients with pagination
router.get('/search', checkPermission('patients', 'read'), searchPatients);                        // Search patients by various criteria
router.get('/stats', checkPermission('patients', 'read'), getPatientsStats);                       // Get patient statistics
router.get('/age-range', checkPermission('patients', 'read'), getPatientsByAgeRange);              // Get patients by age range

// Individual Patient Operations (parameterized routes at the end)
router.get('/:id', checkPermission('patients', 'read'), getPatientById);                           // Get patient by ID
router.put('/:id', checkPermission('patients', 'update'), updatePatient);                            // Update patient information
router.delete('/:id', checkPermission('patients', 'delete'), deletePatient);                         // Delete patient (soft delete)

// Patient Medical Records
router.get('/:id/medical-records', checkPermission('medical_records', 'read'), getPatientMedicalRecords); // Get patient's medical records
router.post('/:id/medical-history', checkPermission('patients', 'update'), addMedicalHistory);       // Add medical history entry

// Patient Appointments  
router.get('/:id/appointments', checkPermission('appointments', 'read'), getPatientAppointments);      // Get patient's appointments

// Patient Vitals
router.get('/:id/vitals', checkPermission('patients', 'read'), getPatientVitals);                  // Get patient's vital signs
router.post('/:id/vitals', checkPermission('patients', 'update'), updatePatientVitals);              // Update patient's vital signs

// Patient Allergies
router.get('/:id/allergies', checkPermission('patients', 'read'), getPatientAllergies);            // Get patient's allergies
router.post('/:id/allergies', checkPermission('patients', 'update'), addPatientAllergy);             // Add new allergy
router.put('/:id/allergies/:allergyId', checkPermission('patients', 'update'), updatePatientAllergy); // Update allergy
router.delete('/:id/allergies/:allergyId', checkPermission('patients', 'update'), removePatientAllergy); // Remove allergy

// Patient Medications
router.get('/:id/medications', checkPermission('patients', 'read'), getPatientMedications);        // Get patient's current medications
router.post('/:id/medications', checkPermission('patients', 'update'), addPatientMedication);        // Add new medication
router.put('/:id/medications/:medicationId', checkPermission('patients', 'update'), updatePatientMedication); // Update medication
router.delete('/:id/medications/:medicationId', checkPermission('patients', 'update'), removePatientMedication); // Remove medication

module.exports = router; 