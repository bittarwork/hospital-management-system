const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// إنشاء موعد جديد
const createAppointment = async (req, res) => {
    try {
        const appointment = new Appointment(req.body);
        await appointment.save();
        res.status(201).json({
            status: 'success',
            message: 'Appointment created successfully',
            data: { appointment }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// الحصول على جميع المواعيد
const getAllAppointments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const appointments = await Appointment.find()
            .populate('patient', 'firstName lastName phone')
            .populate('doctor', 'firstName lastName specialization')
            .skip(skip)
            .limit(limit)
            .sort({ appointmentDate: -1 });

        const total = await Appointment.countDocuments();

        res.json({
            status: 'success',
            data: {
                appointments,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalAppointments: total,
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

// الحصول على موعد واحد
const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patient')
            .populate('doctor');
        if (!appointment) {
            return res.status(404).json({
                status: 'fail',
                message: 'Appointment not found'
            });
        }
        res.json({
            status: 'success',
            data: { appointment }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// تحديث الموعد
const updateAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!appointment) {
            return res.status(404).json({
                status: 'fail',
                message: 'Appointment not found'
            });
        }
        res.json({
            status: 'success',
            message: 'Appointment updated successfully',
            data: { appointment }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// إلغاء الموعد
const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!appointment) {
            return res.status(404).json({
                status: 'fail',
                message: 'Appointment not found'
            });
        }
        res.json({
            status: 'success',
            message: 'Appointment deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// إلغاء الموعد
const cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: 'cancelled', cancellationReason: req.body.reason },
            { new: true }
        );
        if (!appointment) {
            return res.status(404).json({
                status: 'fail',
                message: 'Appointment not found'
            });
        }
        res.json({
            status: 'success',
            message: 'Appointment cancelled successfully',
            data: { appointment }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Reschedule appointment
const rescheduleAppointment = async (req, res) => {
    try {
        const { appointmentDate, appointmentTime } = req.body;
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { appointmentDate, appointmentTime, status: 'rescheduled' },
            { new: true }
        );
        if (!appointment) {
            return res.status(404).json({
                status: 'fail',
                message: 'Appointment not found'
            });
        }
        res.json({
            status: 'success',
            message: 'Appointment rescheduled successfully',
            data: { appointment }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Search appointments
const searchAppointments = async (req, res) => {
    res.json({ status: 'success', message: 'Search appointments endpoint - Coming soon' });
};

// Get appointments by date
const getAppointmentsByDate = async (req, res) => {
    res.json({ status: 'success', message: 'Get appointments by date endpoint - Coming soon' });
};

// Get appointments by doctor
const getAppointmentsByDoctor = async (req, res) => {
    res.json({ status: 'success', message: 'Get appointments by doctor endpoint - Coming soon' });
};

// Get appointments by patient
const getAppointmentsByPatient = async (req, res) => {
    res.json({ status: 'success', message: 'Get appointments by patient endpoint - Coming soon' });
};

// Get appointments statistics
const getAppointmentsStats = async (req, res) => {
    res.json({ status: 'success', message: 'Get appointments stats endpoint - Coming soon' });
};

// تسجيل وصول المريض
const checkInPatient = async (req, res) => {
    res.json({ status: 'success', message: 'Check in patient endpoint - Coming soon' });
};

// إنهاء الموعد
const completeAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            {
                status: 'مكتمل',
                consultationEndTime: new Date()
            },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'الموعد غير موجود'
            });
        }

        // حساب وقت الانتظار
        appointment.calculateWaitingTime();
        await appointment.save();

        res.json({
            success: true,
            message: 'تم إنهاء الموعد بنجاح',
            data: appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في إنهاء الموعد',
            error: error.message
        });
    }
};

// إنهاء الموعد
const checkOutPatient = async (req, res) => {
    res.json({ status: 'success', message: 'Check out patient endpoint - Coming soon' });
};

// إنهاء الموعد
const getAvailableTimeSlots = async (req, res) => {
    res.json({ status: 'success', message: 'Get available time slots endpoint - Coming soon' });
};

// إنهاء الموعد
const confirmAppointment = async (req, res) => {
    res.json({ status: 'success', message: 'Confirm appointment endpoint - Coming soon' });
};

// إنهاء الموعد
const getUpcomingAppointments = async (req, res) => {
    res.json({ status: 'success', message: 'Get upcoming appointments endpoint - Coming soon' });
};

// إنهاء الموعد
const getOverdueAppointments = async (req, res) => {
    res.json({ status: 'success', message: 'Get overdue appointments endpoint - Coming soon' });
};

// إنهاء الموعد
const getTodaysAppointments = async (req, res) => {
    res.json({ status: 'success', message: 'Get todays appointments endpoint - Coming soon' });
};

// إنهاء الموعد
const getAppointmentHistory = async (req, res) => {
    res.json({ status: 'success', message: 'Get appointment history endpoint - Coming soon' });
};

// إنهاء الموعد
const addAppointmentNote = async (req, res) => {
    res.json({ status: 'success', message: 'Add appointment note endpoint - Coming soon' });
};

// إنهاء الموعد
const updateAppointmentStatus = async (req, res) => {
    res.json({ status: 'success', message: 'Update appointment status endpoint - Coming soon' });
};

// إنهاء الموعد
const getAppointmentsByStatus = async (req, res) => {
    res.json({ status: 'success', message: 'Get appointments by status endpoint - Coming soon' });
};

// إنهاء الموعد
const sendAppointmentReminder = async (req, res) => {
    res.json({ status: 'success', message: 'Send appointment reminder endpoint - Coming soon' });
};

// إنهاء الموعد
const bulkUpdateAppointments = async (req, res) => {
    res.json({ status: 'success', message: 'Bulk update appointments endpoint - Coming soon' });
};

module.exports = {
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
}; 