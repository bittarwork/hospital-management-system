import axios from 'axios';

// Base API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data);
        return Promise.reject(error);
    }
);

// API Services
export const patientsAPI = {
    getAll: (params = {}) => api.get('/patients', { params }),
    getById: (id) => api.get(`/patients/${id}`),
    create: (data) => api.post('/patients', data),
    update: (id, data) => api.put(`/patients/${id}`, data),
    delete: (id) => api.delete(`/patients/${id}`),
    search: (query) => api.get('/patients/search', { params: { query } }),
    getStats: () => api.get('/patients/stats'),
    getMedicalRecords: (id) => api.get(`/patients/${id}/medical-records`),
    getAppointments: (id) => api.get(`/patients/${id}/appointments`),
    getVitals: (id) => api.get(`/patients/${id}/vitals`),
    updateVitals: (id, data) => api.post(`/patients/${id}/vitals`, data),
    getAllergies: (id) => api.get(`/patients/${id}/allergies`),
    addAllergy: (id, data) => api.post(`/patients/${id}/allergies`, data),
    updateAllergy: (id, allergyId, data) => api.put(`/patients/${id}/allergies/${allergyId}`, data),
    removeAllergy: (id, allergyId) => api.delete(`/patients/${id}/allergies/${allergyId}`),
    getMedications: (id) => api.get(`/patients/${id}/medications`),
    addMedication: (id, data) => api.post(`/patients/${id}/medications`, data),
    updateMedication: (id, medicationId, data) => api.put(`/patients/${id}/medications/${medicationId}`, data),
    removeMedication: (id, medicationId) => api.delete(`/patients/${id}/medications/${medicationId}`)
};

export const doctorsAPI = {
    getAll: (params = {}) => api.get('/doctors', { params }),
    getById: (id) => api.get(`/doctors/${id}`),
    create: (data) => api.post('/doctors', data),
    update: (id, data) => api.put(`/doctors/${id}`, data),
    delete: (id) => api.delete(`/doctors/${id}`),
    search: (query) => api.get('/doctors/search', { params: { query } }),
    getStats: () => api.get('/doctors/stats'),
    getSchedule: (id) => api.get(`/doctors/${id}/schedule`),
    updateSchedule: (id, data) => api.put(`/doctors/${id}/schedule`, data),
    addSchedule: (id, data) => api.post(`/doctors/${id}/schedule`, data),
    removeSchedule: (id, scheduleId) => api.delete(`/doctors/${id}/schedule/${scheduleId}`),
    getAvailability: (id, date) => api.get(`/doctors/${id}/availability`, { params: { date } }),
    getAppointments: (id) => api.get(`/doctors/${id}/appointments`),
    getPatients: (id) => api.get(`/doctors/${id}/patients`),
    getWorkload: (id) => api.get(`/doctors/${id}/workload`),
    updateStatus: (id, status) => api.patch(`/doctors/${id}/status`, { status }),
    getRatings: (id) => api.get(`/doctors/${id}/ratings`),
    addRating: (id, data) => api.post(`/doctors/${id}/ratings`, data),
    getCertifications: (id) => api.get(`/doctors/${id}/certifications`),
    addCertification: (id, data) => api.post(`/doctors/${id}/certifications`, data),
    updateCertification: (id, certId, data) => api.put(`/doctors/${id}/certifications/${certId}`, data),
    removeCertification: (id, certId) => api.delete(`/doctors/${id}/certifications/${certId}`)
};

export const appointmentsAPI = {
    getAll: (params = {}) => api.get('/appointments', { params }),
    getById: (id) => api.get(`/appointments/${id}`),
    create: (data) => api.post('/appointments', data),
    update: (id, data) => api.put(`/appointments/${id}`, data),
    delete: (id) => api.delete(`/appointments/${id}`),
    search: (query) => api.get('/appointments/search', { params: { query } }),
    getStats: () => api.get('/appointments/stats'),
    getToday: () => api.get('/appointments/today'),
    getUpcoming: () => api.get('/appointments/upcoming'),
    getOverdue: () => api.get('/appointments/overdue'),
    getHistory: () => api.get('/appointments/history'),
    getByStatus: (status) => api.get(`/appointments/status/${status}`),
    getByDate: (date) => api.get(`/appointments/date/${date}`),
    getByDoctor: (doctorId) => api.get(`/appointments/doctor/${doctorId}`),
    getByPatient: (patientId) => api.get(`/appointments/patient/${patientId}`),
    getAvailableSlots: (doctorId, date) => api.get('/appointments/available-slots', { params: { doctorId, date } }),
    updateStatus: (id, status, data = {}) => api.patch(`/appointments/${id}/status`, { status, ...data }),
    confirm: (id) => api.patch(`/appointments/${id}/confirm`),
    cancel: (id, reason) => api.patch(`/appointments/${id}/cancel`, { reason }),
    reschedule: (id, data) => api.patch(`/appointments/${id}/reschedule`, data),
    checkIn: (id) => api.patch(`/appointments/${id}/check-in`),
    checkOut: (id) => api.patch(`/appointments/${id}/check-out`),
    addNote: (id, note) => api.post(`/appointments/${id}/notes`, { note }),
    sendReminder: (id) => api.post(`/appointments/${id}/reminder`),
    bulkUpdate: (data) => api.patch('/appointments/bulk/update', data)
};

export const medicalRecordsAPI = {
    getAll: (params = {}) => api.get('/medical-records', { params }),
    getById: (id) => api.get(`/medical-records/${id}`),
    create: (data) => api.post('/medical-records', data),
    update: (id, data) => api.put(`/medical-records/${id}`, data),
    delete: (id) => api.delete(`/medical-records/${id}`),
    search: (query) => api.get('/medical-records/search', { params: { query } }),
    getStats: () => api.get('/medical-records/stats'),
    getByPatient: (patientId) => api.get(`/medical-records/patient/${patientId}`),
    getByDoctor: (doctorId) => api.get(`/medical-records/doctor/${doctorId}`),
    getByDiagnosis: (icdCode) => api.get(`/medical-records/diagnosis/${icdCode}`),
    getByDateRange: (startDate, endDate) => api.get('/medical-records/date-range', { params: { startDate, endDate } }),
    getPatientTimeline: (patientId) => api.get(`/medical-records/patient/${patientId}/timeline`),
    duplicate: (id) => api.post(`/medical-records/${id}/duplicate`),
    sign: (id, signature) => api.patch(`/medical-records/${id}/sign`, { signature }),
    review: (id, review) => api.patch(`/medical-records/${id}/review`, review),
    generateSummary: (id) => api.get(`/medical-records/${id}/summary`),
    export: (id, format = 'pdf') => api.get(`/medical-records/${id}/export`, { params: { format } }),
    addDiagnosis: (id, data) => api.post(`/medical-records/${id}/diagnosis`, data),
    updateDiagnosis: (id, diagnosisId, data) => api.put(`/medical-records/${id}/diagnosis/${diagnosisId}`, data),
    removeDiagnosis: (id, diagnosisId) => api.delete(`/medical-records/${id}/diagnosis/${diagnosisId}`),
    addMedication: (id, data) => api.post(`/medical-records/${id}/medications`, data),
    updateMedication: (id, medicationId, data) => api.put(`/medical-records/${id}/medications/${medicationId}`, data),
    removeMedication: (id, medicationId) => api.delete(`/medical-records/${id}/medications/${medicationId}`),
    addAllergy: (id, data) => api.post(`/medical-records/${id}/allergies`, data),
    updateAllergy: (id, allergyId, data) => api.put(`/medical-records/${id}/allergies/${allergyId}`, data),
    removeAllergy: (id, allergyId) => api.delete(`/medical-records/${id}/allergies/${allergyId}`),
    addLabResult: (id, data) => api.post(`/medical-records/${id}/lab-results`, data),
    updateLabResult: (id, resultId, data) => api.put(`/medical-records/${id}/lab-results/${resultId}`, data),
    removeLabResult: (id, resultId) => api.delete(`/medical-records/${id}/lab-results/${resultId}`),
    addRadiologyResult: (id, data) => api.post(`/medical-records/${id}/radiology-results`, data),
    updateRadiologyResult: (id, resultId, data) => api.put(`/medical-records/${id}/radiology-results/${resultId}`, data),
    removeRadiologyResult: (id, resultId) => api.delete(`/medical-records/${id}/radiology-results/${resultId}`)
};

export const invoicesAPI = {
    getAll: (params = {}) => api.get('/invoices', { params }),
    getById: (id) => api.get(`/invoices/${id}`),
    create: (data) => api.post('/invoices', data),
    update: (id, data) => api.put(`/invoices/${id}`, data),
    delete: (id) => api.delete(`/invoices/${id}`),
    search: (query) => api.get('/invoices/search', { params: { query } }),
    getStats: () => api.get('/invoices/stats'),
    getOverdue: () => api.get('/invoices/overdue'),
    getByStatus: (status) => api.get(`/invoices/status/${status}`),
    getByPatient: (patientId) => api.get(`/invoices/patient/${patientId}`),
    getByDateRange: (startDate, endDate) => api.get('/invoices/date-range', { params: { startDate, endDate } }),
    getRevenueReport: (params = {}) => api.get('/invoices/reports/revenue', { params }),
    getPaymentReport: (params = {}) => api.get('/invoices/reports/payments', { params }),
    duplicate: (id) => api.post(`/invoices/${id}/duplicate`),
    calculate: (id) => api.patch(`/invoices/${id}/calculate`),
    applyDiscount: (id, discount) => api.patch(`/invoices/${id}/discount`, discount),
    markAsPaid: (id) => api.patch(`/invoices/${id}/paid`),
    void: (id, reason) => api.patch(`/invoices/${id}/void`, { reason }),
    addLineItem: (id, item) => api.post(`/invoices/${id}/line-items`, item),
    updateLineItem: (id, itemId, item) => api.put(`/invoices/${id}/line-items/${itemId}`, item),
    removeLineItem: (id, itemId) => api.delete(`/invoices/${id}/line-items/${itemId}`),
    addPayment: (id, payment) => api.post(`/invoices/${id}/payments`, payment),
    getPaymentHistory: (id) => api.get(`/invoices/${id}/payments`),
    sendReminder: (id) => api.post(`/invoices/${id}/send-reminder`),
    sendEmail: (id, email) => api.post(`/invoices/${id}/send-email`, { email }),
    generatePDF: (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
    bulkProcessPayments: (data) => api.post('/invoices/bulk/payments', data),
    export: (params = {}) => api.post('/invoices/export', params)
};

// Generic API helper functions
export const apiHelper = {
    handleError: (error) => {
        if (error.response) {
            // Server error
            const message = error.response.data?.message || 'خطأ في الخادم';
            const status = error.response.status;
            console.error(`API Error ${status}: ${message}`);
            return { message, status };
        } else if (error.request) {
            // Network error
            console.error('Network Error:', error.request);
            return { message: 'خطأ في الاتصال بالخادم', status: null };
        } else {
            // Other error
            console.error('Error:', error.message);
            return { message: 'حدث خطأ غير متوقع', status: null };
        }
    },

    formatResponse: (response) => {
        return {
            data: response.data?.data || response.data,
            message: response.data?.message || 'تمت العملية بنجاح',
            status: response.status
        };
    },

    // Health check
    healthCheck: () => api.get('/health', { baseURL: 'http://localhost:5000' }),

    // File upload helper
    uploadFile: (file, endpoint) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }
};

// Export the main api instance as well
export default api; 