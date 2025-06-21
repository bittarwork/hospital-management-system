const express = require('express');
const router = express.Router();

// Import all controller functions
const {
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
} = require('../controllers/medicalRecordController');

// Medical Record CRUD Operations
router.post('/', createMedicalRecord);                         // Create new medical record
router.get('/', getAllMedicalRecords);                         // Get all medical records with pagination
router.get('/search', searchMedicalRecords);                   // Search medical records by criteria
router.get('/stats', getMedicalRecordsStats);                  // Get medical records statistics

// Medical Record Queries
router.get('/patient/:patientId', getMedicalRecordsByPatient); // Get records by patient
router.get('/doctor/:doctorId', getMedicalRecordsByDoctor);    // Get records by doctor
router.get('/diagnosis/:icdCode', getMedicalRecordsByDiagnosis); // Get records by diagnosis
router.get('/date-range', getMedicalRecordsByDateRange); // Get records by date range (use query params)
router.get('/patient/:patientId/timeline', getPatientTimeline); // Get patient medical timeline

// Individual Medical Record Operations (parameterized routes at the end)
router.get('/:id', getMedicalRecordById);                      // Get medical record by ID
router.put('/:id', updateMedicalRecord);                       // Update medical record
router.delete('/:id', deleteMedicalRecord);                    // Delete medical record

// Record Actions
router.post('/:id/duplicate', duplicateMedicalRecord);         // Duplicate medical record
router.patch('/:id/sign', signMedicalRecord);                  // Sign medical record
router.patch('/:id/review', reviewMedicalRecord);              // Review medical record
router.get('/:id/summary', generateRecordSummary);             // Generate record summary
router.get('/:id/export', exportMedicalRecord);                // Export medical record

// Diagnosis Management
router.post('/:id/diagnosis', addDiagnosisToRecord);           // Add diagnosis to record
router.put('/:id/diagnosis/:diagnosisId', updateDiagnosis);    // Update diagnosis
router.delete('/:id/diagnosis/:diagnosisId', removeDiagnosisFromRecord); // Remove diagnosis

// Medication Management
router.post('/:id/medications', addMedicationToRecord);        // Add medication to record
router.put('/:id/medications/:medicationId', updateMedication); // Update medication
router.delete('/:id/medications/:medicationId', removeMedicationFromRecord); // Remove medication

// Allergy Management
router.post('/:id/allergies', addAllergyToRecord);             // Add allergy to record
router.put('/:id/allergies/:allergyId', updateAllergy);        // Update allergy
router.delete('/:id/allergies/:allergyId', removeAllergyFromRecord); // Remove allergy

// Lab Results Management
router.post('/:id/lab-results', addLabResultToRecord);         // Add lab result to record
router.put('/:id/lab-results/:resultId', updateLabResult);     // Update lab result
router.delete('/:id/lab-results/:resultId', removeLabResultFromRecord); // Remove lab result

// Radiology Results Management
router.post('/:id/radiology-results', addRadiologyResultToRecord); // Add radiology result to record
router.put('/:id/radiology-results/:resultId', updateRadiologyResult); // Update radiology result
router.delete('/:id/radiology-results/:resultId', removeRadiologyResultFromRecord); // Remove radiology result

module.exports = router; 