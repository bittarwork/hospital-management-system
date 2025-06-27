import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with default config
const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Add auth token if available
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    toast.error('انتهت صلاحية تسجيل الدخول - يرجى تسجيل الدخول مرة أخرى');
                    // Clear all auth data
                    localStorage.removeItem('token');
                    sessionStorage.removeItem('token');
                    localStorage.removeItem('user');
                    sessionStorage.removeItem('user');

                    // Redirect to login with delay
                    setTimeout(() => {
                        window.location.href = '/auth/login';
                    }, 2000);
                    break;
                case 403:
                    toast.error('ليس لديك صلاحية للوصول');
                    break;
                case 404:
                    toast.error('البيانات غير موجودة');
                    break;
                case 500:
                    toast.error('خطأ في الخادم، حاول مرة أخرى');
                    break;
                default:
                    toast.error(data?.message || 'حدث خطأ غير متوقع');
            }
        } else if (error.request) {
            // Network error
            toast.error('تعذر الاتصال بالخادم - تحقق من الاتصال');
        } else {
            // Other error
            toast.error('حدث خطأ غير متوقع');
        }

        return Promise.reject(error);
    }
);

// API endpoints
export const patientsAPI = {
    getAll: () => api.get('/patients'),
    getById: (id) => api.get(`/patients/${id}`),
    create: (data) => api.post('/patients', data),
    update: (id, data) => api.put(`/patients/${id}`, data),
    delete: (id) => api.delete(`/patients/${id}`),
    search: (query) => api.get(`/patients/search?q=${query}`),
};

export const doctorsAPI = {
    getAll: () => api.get('/doctors'),
    getById: (id) => api.get(`/doctors/${id}`),
    create: (data) => api.post('/doctors', data),
    update: (id, data) => api.put(`/doctors/${id}`, data),
    delete: (id) => api.delete(`/doctors/${id}`),
    search: (query) => api.get(`/doctors/search?q=${query}`),
};

export const appointmentsAPI = {
    // Basic CRUD operations
    getAll: () => api.get('/appointments'),
    getById: (id) => api.get(`/appointments/${id}`),
    create: (data) => api.post('/appointments', data),
    update: (id, data) => api.put(`/appointments/${id}`, data),
    delete: (id) => api.delete(`/appointments/${id}`),

    // Search and filtering
    search: (params) => api.get('/appointments/search', { params }),
    getByPatient: (patientId, params = {}) => api.get(`/appointments/patient/${patientId}`, { params }),
    getByDoctor: (doctorId, params = {}) => api.get(`/appointments/doctor/${doctorId}`, { params }),
    getByDate: (date) => api.get(`/appointments/date/${date}`),
    getByStatus: (status, params = {}) => api.get(`/appointments/status/${status}`, { params }),

    // Status management
    updateStatus: (id, data) => api.patch(`/appointments/${id}/status`, data),
    cancel: (id, data) => api.patch(`/appointments/${id}/cancel`, data),
    reschedule: (id, data) => api.patch(`/appointments/${id}/reschedule`, data),
    confirm: (id) => api.patch(`/appointments/${id}/confirm`),
    checkIn: (id) => api.patch(`/appointments/${id}/check-in`),
    checkOut: (id) => api.patch(`/appointments/${id}/check-out`),
    complete: (id, data = {}) => api.patch(`/appointments/${id}/complete`, data),

    // Statistics and reports
    getStats: () => api.get('/appointments/stats'),
    getUpcoming: (params = {}) => api.get('/appointments/upcoming', { params }),
    getOverdue: () => api.get('/appointments/overdue'),
    getTodays: () => api.get('/appointments/today'),
    getHistory: (params = {}) => api.get('/appointments/history', { params }),

    // Scheduling utilities
    getAvailableSlots: (params) => api.get('/appointments/available-slots', { params }),

    // Notes and reminders
    addNote: (id, data) => api.post(`/appointments/${id}/notes`, data),
    sendReminder: (id, data) => api.post(`/appointments/${id}/reminder`, data),

    // Bulk operations
    bulkUpdate: (data) => api.patch('/appointments/bulk/update', data),
};

export const medicalRecordsAPI = {
    // Basic CRUD operations
    getAll: (params = {}) => api.get('/medical-records', { params }),
    getById: (id) => api.get(`/medical-records/${id}`),
    create: (data) => api.post('/medical-records', data),
    update: (id, data) => api.put(`/medical-records/${id}`, data),
    delete: (id) => api.delete(`/medical-records/${id}`),

    // Search and filtering
    search: (params) => api.get('/medical-records/search', { params }),
    getByPatient: (patientId, params = {}) => api.get(`/medical-records/patient/${patientId}`, { params }),
    getByDoctor: (doctorId, params = {}) => api.get(`/medical-records/doctor/${doctorId}`, { params }),
    getByDiagnosis: (icdCode) => api.get(`/medical-records/diagnosis/${icdCode}`),
    getByDateRange: (params) => api.get('/medical-records/date-range', { params }),

    // Statistics and reports
    getStats: () => api.get('/medical-records/stats'),
    getPatientTimeline: (patientId, params = {}) => api.get(`/medical-records/patient/${patientId}/timeline`, { params }),

    // Record management
    duplicate: (id) => api.post(`/medical-records/${id}/duplicate`),
    sign: (id, data) => api.patch(`/medical-records/${id}/sign`, data),
    review: (id, data) => api.patch(`/medical-records/${id}/review`, data),
    generateSummary: (id) => api.get(`/medical-records/${id}/summary`),
    export: (id, format = 'pdf') => api.get(`/medical-records/${id}/export?format=${format}`),

    // Diagnosis management
    addDiagnosis: (id, data) => api.post(`/medical-records/${id}/diagnosis`, data),
    updateDiagnosis: (id, diagnosisId, data) => api.put(`/medical-records/${id}/diagnosis/${diagnosisId}`, data),
    removeDiagnosis: (id, diagnosisId) => api.delete(`/medical-records/${id}/diagnosis/${diagnosisId}`),

    // Medication management
    addMedication: (id, data) => api.post(`/medical-records/${id}/medications`, data),
    updateMedication: (id, medicationId, data) => api.put(`/medical-records/${id}/medications/${medicationId}`, data),
    removeMedication: (id, medicationId) => api.delete(`/medical-records/${id}/medications/${medicationId}`),

    // Allergy management
    addAllergy: (id, data) => api.post(`/medical-records/${id}/allergies`, data),
    updateAllergy: (id, allergyId, data) => api.put(`/medical-records/${id}/allergies/${allergyId}`, data),
    removeAllergy: (id, allergyId) => api.delete(`/medical-records/${id}/allergies/${allergyId}`),

    // Lab results management
    addLabResult: (id, data) => api.post(`/medical-records/${id}/lab-results`, data),
    updateLabResult: (id, resultId, data) => api.put(`/medical-records/${id}/lab-results/${resultId}`, data),
    removeLabResult: (id, resultId) => api.delete(`/medical-records/${id}/lab-results/${resultId}`),

    // Radiology results management
    addRadiologyResult: (id, data) => api.post(`/medical-records/${id}/radiology-results`, data),
    updateRadiologyResult: (id, resultId, data) => api.put(`/medical-records/${id}/radiology-results/${resultId}`, data),
    removeRadiologyResult: (id, resultId) => api.delete(`/medical-records/${id}/radiology-results/${resultId}`),
};

export const invoicesAPI = {
    // العمليات الأساسية
    getAll: (params = {}) => api.get('/invoices', { params }),
    getById: (id) => api.get(`/invoices/${id}`),
    create: (data) => api.post('/invoices', data),
    update: (id, data) => api.put(`/invoices/${id}`, data),
    delete: (id) => api.delete(`/invoices/${id}`),

    // البحث والفلترة
    search: (params) => api.get('/invoices/search', { params }),
    getByStatus: (status, params = {}) => api.get(`/invoices/status/${status}`, { params }),
    getByPatient: (patientId, params = {}) => api.get(`/invoices/patient/${patientId}`, { params }),
    getByDateRange: (params) => api.get('/invoices/date-range', { params }),
    getOverdue: (params = {}) => api.get('/invoices/overdue', { params }),

    // المدفوعات
    addPayment: (id, paymentData) => api.post(`/invoices/${id}/payments`, paymentData),
    getPaymentHistory: (id) => api.get(`/invoices/${id}/payments`),
    markAsPaid: (id, data = {}) => api.patch(`/invoices/${id}/paid`, data),

    // إدارة العناصر
    addLineItem: (id, itemData) => api.post(`/invoices/${id}/line-items`, itemData),
    updateLineItem: (id, itemId, itemData) => api.put(`/invoices/${id}/line-items/${itemId}`, itemData),
    removeLineItem: (id, itemId) => api.delete(`/invoices/${id}/line-items/${itemId}`),

    // العمليات المالية
    applyDiscount: (id, discountData) => api.patch(`/invoices/${id}/discount`, discountData),
    calculateTotal: (id) => api.patch(`/invoices/${id}/calculate`),
    voidInvoice: (id, data) => api.patch(`/invoices/${id}/void`, data),

    // التقارير والإحصائيات
    getStats: (params = {}) => api.get('/invoices/stats', { params }),
    getInvoicesStats: (params = {}) => api.get('/invoices/stats', { params }),
    getRevenueReport: (params = {}) => api.get('/invoices/reports/revenue', { params }),
    getPaymentReport: (params = {}) => api.get('/invoices/reports/payments', { params }),

    // العمليات المتقدمة
    duplicate: (id) => api.post(`/invoices/${id}/duplicate`),
    generatePDF: (id) => api.get(`/invoices/${id}/pdf`),
    sendEmail: (id, emailData) => api.post(`/invoices/${id}/send-email`, emailData),
    sendReminder: (id, reminderData) => api.post(`/invoices/${id}/send-reminder`, reminderData),

    // التصدير والاستيراد
    export: (params = {}) => api.post('/invoices/export', params),
    exportInvoices: (params = {}) => api.get('/invoices/export', { params }),
    bulkProcessPayments: (data) => api.post('/invoices/bulk/payments', data),

    // للتوافق مع النظام القديم
    pay: (id, paymentData) => api.post(`/invoices/${id}/payments`, paymentData),
};

// Utility functions
export const handleApiError = (error, customMessage) => {
    console.error('API Error:', error);
    if (customMessage) {
        toast.error(customMessage);
    }
};

export const showSuccessMessage = (message) => {
    toast.success(message);
};

export default api; 