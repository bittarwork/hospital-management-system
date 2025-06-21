const express = require('express');
const router = express.Router();

// Import all controller functions (we'll create these next)
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

// Patient CRUD Operations
router.post('/', createPatient);                              // Create new patient
router.get('/', getAllPatients);                              // Get all patients with pagination
router.get('/search', searchPatients);                        // Search patients by various criteria
router.get('/stats', getPatientsStats);                       // Get patient statistics
router.get('/age-range', getPatientsByAgeRange);              // Get patients by age range

// Individual Patient Operations (parameterized routes at the end)
router.get('/:id', getPatientById);                           // Get patient by ID
router.put('/:id', updatePatient);                            // Update patient information
router.delete('/:id', deletePatient);                         // Delete patient (soft delete)

// Patient Medical Records
router.get('/:id/medical-records', getPatientMedicalRecords); // Get patient's medical records
router.post('/:id/medical-history', addMedicalHistory);       // Add medical history entry

// Patient Appointments  
router.get('/:id/appointments', getPatientAppointments);      // Get patient's appointments

// Patient Vitals
router.get('/:id/vitals', getPatientVitals);                  // Get patient's vital signs
router.post('/:id/vitals', updatePatientVitals);              // Update patient's vital signs

// Patient Allergies
router.get('/:id/allergies', getPatientAllergies);            // Get patient's allergies
router.post('/:id/allergies', addPatientAllergy);             // Add new allergy
router.put('/:id/allergies/:allergyId', updatePatientAllergy); // Update allergy
router.delete('/:id/allergies/:allergyId', removePatientAllergy); // Remove allergy

// Patient Medications
router.get('/:id/medications', getPatientMedications);        // Get patient's current medications
router.post('/:id/medications', addPatientMedication);        // Add new medication
router.put('/:id/medications/:medicationId', updatePatientMedication); // Update medication
router.delete('/:id/medications/:medicationId', removePatientMedication); // Remove medication

module.exports = router; 