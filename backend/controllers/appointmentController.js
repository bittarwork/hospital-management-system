const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// إنشاء موعد جديد
const createAppointment = async (req, res) => {
    try {
        // التحقق من وجود المريض والطبيب
        const patient = await Patient.findById(req.body.patient);
        const doctor = await Doctor.findById(req.body.doctor);

        if (!patient) {
            return res.status(404).json({
                status: 'fail',
                message: 'المريض غير موجود'
            });
        }

        if (!doctor) {
            return res.status(404).json({
                status: 'fail',
                message: 'الطبيب غير موجود'
            });
        }

        // التحقق من توفر الوقت
        const existingAppointment = await Appointment.findOne({
            doctor: req.body.doctor,
            appointmentDate: req.body.appointmentDate,
            appointmentTime: req.body.appointmentTime,
            status: { $nin: ['cancelled', 'no-show'] }
        });

        if (existingAppointment) {
            return res.status(400).json({
                status: 'fail',
                message: 'هذا الموعد محجوز مسبقاً'
            });
        }

        // إنشاء الموعد
        const appointmentData = {
            ...req.body,
            createdBy: req.user?.username || 'admin',
            consultationFee: doctor.consultationFee
        };

        const appointment = new Appointment(appointmentData);
        await appointment.save();

        // إرجاع الموعد مع البيانات الكاملة
        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('patient', 'firstName lastName phone email dateOfBirth gender')
            .populate('doctor', 'firstName lastName specialization consultationFee');

        res.status(201).json({
            status: 'success',
            message: 'تم إنشاء الموعد بنجاح',
            data: { appointment: populatedAppointment }
        });
    } catch (error) {
        console.error('❌ Error creating appointment:', error);
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
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // بناء الاستعلام
        let query = {};

        // فلترة حسب التاريخ
        if (req.query.startDate || req.query.endDate) {
            query.appointmentDate = {};
            if (req.query.startDate) {
                query.appointmentDate.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                query.appointmentDate.$lte = new Date(req.query.endDate);
            }
        }

        // فلترة حسب الحالة
        if (req.query.status) {
            query.status = req.query.status;
        }

        // فلترة حسب الطبيب
        if (req.query.doctor) {
            query.doctor = req.query.doctor;
        }

        // فلترة حسب المريض
        if (req.query.patient) {
            query.patient = req.query.patient;
        }

        // فلترة حسب نوع الموعد
        if (req.query.appointmentType) {
            query.appointmentType = req.query.appointmentType;
        }

        const appointments = await Appointment.find(query)
            .populate('patient', 'firstName lastName phone email nationalId dateOfBirth gender')
            .populate('doctor', 'firstName lastName specialization consultationFee department')
            .skip(skip)
            .limit(limit)
            .sort({ appointmentDate: -1, appointmentTime: 1 });

        const total = await Appointment.countDocuments(query);

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
        console.error('❌ Error getting appointments:', error);
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
                message: 'الموعد غير موجود'
            });
        }

        res.json({
            status: 'success',
            data: { appointment }
        });
    } catch (error) {
        console.error('❌ Error getting appointment:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// تحديث الموعد
const updateAppointment = async (req, res) => {
    try {
        // التحقق من توفر الوقت الجديد إذا تم تغيير التوقيت
        if (req.body.appointmentDate || req.body.appointmentTime || req.body.doctor) {
            const currentAppointment = await Appointment.findById(req.params.id);

            const existingAppointment = await Appointment.findOne({
                _id: { $ne: req.params.id },
                doctor: req.body.doctor || currentAppointment.doctor,
                appointmentDate: req.body.appointmentDate || currentAppointment.appointmentDate,
                appointmentTime: req.body.appointmentTime || currentAppointment.appointmentTime,
                status: { $nin: ['cancelled', 'no-show'] }
            });

            if (existingAppointment) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'هذا الموعد محجوز مسبقاً'
                });
            }
        }

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { ...req.body, lastModifiedBy: req.user?.username || 'admin' },
            { new: true, runValidators: true }
        ).populate('patient', 'firstName lastName phone')
            .populate('doctor', 'firstName lastName specialization');

        if (!appointment) {
            return res.status(404).json({
                status: 'fail',
                message: 'الموعد غير موجود'
            });
        }

        res.json({
            status: 'success',
            message: 'تم تحديث الموعد بنجاح',
            data: { appointment }
        });
    } catch (error) {
        console.error('❌ Error updating appointment:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// حذف الموعد
const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!appointment) {
            return res.status(404).json({
                status: 'fail',
                message: 'الموعد غير موجود'
            });
        }
        res.json({
            status: 'success',
            message: 'تم حذف الموعد بنجاح'
        });
    } catch (error) {
        console.error('❌ Error deleting appointment:', error);
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
            {
                status: 'cancelled',
                cancellationReason: req.body.reason,
                cancelledBy: req.body.cancelledBy || 'staff',
                cancelledAt: new Date()
            },
            { new: true }
        ).populate('patient', 'firstName lastName phone')
            .populate('doctor', 'firstName lastName specialization');

        if (!appointment) {
            return res.status(404).json({
                status: 'fail',
                message: 'الموعد غير موجود'
            });
        }

        res.json({
            status: 'success',
            message: 'تم إلغاء الموعد بنجاح',
            data: { appointment }
        });
    } catch (error) {
        console.error('❌ Error cancelling appointment:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// إعادة جدولة الموعد
const rescheduleAppointment = async (req, res) => {
    try {
        const { appointmentDate, appointmentTime, reason } = req.body;

        // التحقق من توفر الوقت الجديد
        const currentAppointment = await Appointment.findById(req.params.id);

        const existingAppointment = await Appointment.findOne({
            _id: { $ne: req.params.id },
            doctor: currentAppointment.doctor,
            appointmentDate: new Date(appointmentDate),
            appointmentTime: appointmentTime,
            status: { $nin: ['cancelled', 'no-show'] }
        });

        if (existingAppointment) {
            return res.status(400).json({
                status: 'fail',
                message: 'الوقت الجديد محجوز مسبقاً'
            });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            {
                appointmentDate: new Date(appointmentDate),
                appointmentTime: appointmentTime,
                status: 'rescheduled',
                rescheduledFrom: {
                    originalDate: currentAppointment.appointmentDate,
                    originalTime: currentAppointment.appointmentTime,
                    reason: reason
                },
                rescheduledTo: {
                    newDate: new Date(appointmentDate),
                    newTime: appointmentTime,
                    reason: reason
                }
            },
            { new: true }
        ).populate('patient', 'firstName lastName phone')
            .populate('doctor', 'firstName lastName specialization');

        if (!appointment) {
            return res.status(404).json({
                status: 'fail',
                message: 'الموعد غير موجود'
            });
        }

        res.json({
            status: 'success',
            message: 'تم إعادة جدولة الموعد بنجاح',
            data: { appointment }
        });
    } catch (error) {
        console.error('❌ Error rescheduling appointment:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// البحث في المواعيد
const searchAppointments = async (req, res) => {
    try {
        const { query, status, appointmentType, startDate, endDate } = req.query;

        let searchQuery = {};

        // البحث النصي
        if (query) {
            const patients = await Patient.find({
                $or: [
                    { firstName: new RegExp(query, 'i') },
                    { lastName: new RegExp(query, 'i') },
                    { phone: new RegExp(query, 'i') },
                    { nationalId: new RegExp(query, 'i') }
                ]
            });

            const doctors = await Doctor.find({
                $or: [
                    { firstName: new RegExp(query, 'i') },
                    { lastName: new RegExp(query, 'i') },
                    { specialization: new RegExp(query, 'i') }
                ]
            });

            const patientIds = patients.map(p => p._id);
            const doctorIds = doctors.map(d => d._id);

            searchQuery.$or = [
                { patient: { $in: patientIds } },
                { doctor: { $in: doctorIds } },
                { reasonForVisit: new RegExp(query, 'i') },
                { chiefComplaint: new RegExp(query, 'i') }
            ];
        }

        // فلاتر إضافية
        if (status) searchQuery.status = status;
        if (appointmentType) searchQuery.appointmentType = appointmentType;
        if (startDate || endDate) {
            searchQuery.appointmentDate = {};
            if (startDate) searchQuery.appointmentDate.$gte = new Date(startDate);
            if (endDate) searchQuery.appointmentDate.$lte = new Date(endDate);
        }

        const appointments = await Appointment.find(searchQuery)
            .populate('patient', 'firstName lastName phone nationalId')
            .populate('doctor', 'firstName lastName specialization')
            .sort({ appointmentDate: -1 })
            .limit(50);

        res.json({
            status: 'success',
            data: { appointments },
            count: appointments.length
        });
    } catch (error) {
        console.error('❌ Error searching appointments:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// الحصول على المواعيد حسب التاريخ
const getAppointmentsByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const startDate = new Date(date);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);

        const appointments = await Appointment.find({
            appointmentDate: {
                $gte: startDate,
                $lt: endDate
            }
        })
            .populate('patient', 'firstName lastName phone')
            .populate('doctor', 'firstName lastName specialization')
            .sort({ appointmentTime: 1 });

        res.json({
            status: 'success',
            data: { appointments },
            date: date,
            count: appointments.length
        });
    } catch (error) {
        console.error('❌ Error getting appointments by date:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// الحصول على المواعيد حسب الطبيب
const getAppointmentsByDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        let query = { doctor: doctorId };

        // فلترة حسب التاريخ
        if (req.query.startDate || req.query.endDate) {
            query.appointmentDate = {};
            if (req.query.startDate) query.appointmentDate.$gte = new Date(req.query.startDate);
            if (req.query.endDate) query.appointmentDate.$lte = new Date(req.query.endDate);
        }

        // فلترة حسب الحالة
        if (req.query.status) query.status = req.query.status;

        const appointments = await Appointment.find(query)
            .populate('patient', 'firstName lastName phone nationalId')
            .skip(skip)
            .limit(limit)
            .sort({ appointmentDate: -1, appointmentTime: 1 });

        const total = await Appointment.countDocuments(query);

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
        console.error('❌ Error getting appointments by doctor:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// الحصول على المواعيد حسب المريض
const getAppointmentsByPatient = async (req, res) => {
    try {
        const { patientId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        let query = { patient: patientId };

        // فلترة حسب الحالة
        if (req.query.status) query.status = req.query.status;

        const appointments = await Appointment.find(query)
            .populate('doctor', 'firstName lastName specialization')
            .skip(skip)
            .limit(limit)
            .sort({ appointmentDate: -1 });

        const total = await Appointment.countDocuments(query);

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
        console.error('❌ Error getting appointments by patient:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// إحصائيات المواعيد
const getAppointmentsStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const [
            totalAppointments,
            todaysAppointments,
            weeklyAppointments,
            monthlyAppointments,
            statusStats,
            typeStats
        ] = await Promise.all([
            Appointment.countDocuments(),
            Appointment.countDocuments({
                appointmentDate: { $gte: startOfToday, $lte: endOfToday }
            }),
            Appointment.countDocuments({
                appointmentDate: { $gte: startOfWeek }
            }),
            Appointment.countDocuments({
                appointmentDate: { $gte: startOfMonth }
            }),
            Appointment.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]),
            Appointment.aggregate([
                {
                    $group: {
                        _id: '$appointmentType',
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        // إحصائيات المواعيد القادمة
        const upcomingAppointments = await Appointment.countDocuments({
            appointmentDate: { $gte: today },
            status: { $in: ['scheduled', 'confirmed'] }
        });

        // إحصائيات المواعيد المتأخرة
        const overdueAppointments = await Appointment.countDocuments({
            appointmentDate: { $lt: startOfToday },
            status: { $in: ['scheduled', 'confirmed'] }
        });

        res.json({
            status: 'success',
            data: {
                total: totalAppointments,
                today: todaysAppointments,
                thisWeek: weeklyAppointments,
                thisMonth: monthlyAppointments,
                upcoming: upcomingAppointments,
                overdue: overdueAppointments,
                byStatus: statusStats.reduce((acc, stat) => {
                    acc[stat._id] = stat.count;
                    return acc;
                }, {}),
                byType: typeStats.reduce((acc, stat) => {
                    acc[stat._id] = stat.count;
                    return acc;
                }, {})
            }
        });
    } catch (error) {
        console.error('❌ Error getting appointments stats:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// تسجيل وصول المريض
const checkInPatient = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            {
                status: 'checked-in',
                checkInTime: new Date(),
                checkInBy: req.user?.username || 'staff'
            },
            { new: true }
        ).populate('patient', 'firstName lastName')
            .populate('doctor', 'firstName lastName');

        if (!appointment) {
            return res.status(404).json({
                status: 'fail',
                message: 'الموعد غير موجود'
            });
        }

        res.json({
            status: 'success',
            message: 'تم تسجيل وصول المريض بنجاح',
            data: { appointment }
        });
    } catch (error) {
        console.error('❌ Error checking in patient:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// إنهاء الموعد
const completeAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            {
                status: 'completed',
                consultationEndTime: new Date(),
                ...req.body // يمكن إضافة معلومات إضافية مثل diagnosis, treatment plan
            },
            { new: true }
        ).populate('patient', 'firstName lastName')
            .populate('doctor', 'firstName lastName');

        if (!appointment) {
            return res.status(404).json({
                status: 'fail',
                message: 'الموعد غير موجود'
            });
        }

        // حساب المدة الفعلية
        if (appointment.consultationStartTime && appointment.consultationEndTime) {
            const duration = Math.round((appointment.consultationEndTime - appointment.consultationStartTime) / 60000);
            appointment.actualDuration = duration;
            await appointment.save();
        }

        res.json({
            status: 'success',
            message: 'تم إنهاء الموعد بنجاح',
            data: { appointment }
        });
    } catch (error) {
        console.error('❌ Error completing appointment:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// تسجيل خروج المريض
const checkOutPatient = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                status: 'fail',
                message: 'الموعد غير موجود'
            });
        }

        // تحديث حالة الموعد وبيانات الخروج
        appointment.status = 'completed';
        if (!appointment.consultationEndTime) {
            appointment.consultationEndTime = new Date();
        }

        await appointment.save();

        res.json({
            status: 'success',
            message: 'تم تسجيل خروج المريض بنجاح',
            data: { appointment }
        });
    } catch (error) {
        console.error('❌ Error checking out patient:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// الحصول على الأوقات المتاحة
const getAvailableTimeSlots = async (req, res) => {
    try {
        const { doctorId, date } = req.query;

        if (!doctorId || !date) {
            return res.status(400).json({
                status: 'fail',
                message: 'معرف الطبيب والتاريخ مطلوبان'
            });
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({
                status: 'fail',
                message: 'الطبيب غير موجود'
            });
        }

        const selectedDate = new Date(date);
        const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'lowercase' });

        // البحث عن جدول الطبيب لهذا اليوم
        const daySchedule = doctor.schedule?.find(s => s.dayOfWeek === dayOfWeek);

        if (!daySchedule || !daySchedule.isAvailable) {
            return res.json({
                status: 'success',
                data: {
                    availableSlots: [],
                    message: 'الطبيب غير متاح في هذا اليوم'
                }
            });
        }

        // الحصول على المواعيد المحجوزة في هذا اليوم
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const bookedAppointments = await Appointment.find({
            doctor: doctorId,
            appointmentDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $nin: ['cancelled', 'no-show'] }
        }).select('appointmentTime');

        const bookedTimes = bookedAppointments.map(apt => apt.appointmentTime);

        // إنشاء قائمة الأوقات المتاحة
        const availableSlots = [];
        const startTime = daySchedule.startTime;
        const endTime = daySchedule.endTime;
        const slotDuration = 30; // 30 دقيقة لكل موعد

        let currentTime = startTime;
        while (currentTime < endTime) {
            if (!bookedTimes.includes(currentTime)) {
                availableSlots.push(currentTime);
            }

            // إضافة 30 دقيقة
            const [hours, minutes] = currentTime.split(':');
            const nextTime = new Date();
            nextTime.setHours(parseInt(hours), parseInt(minutes) + slotDuration);
            currentTime = nextTime.toTimeString().slice(0, 5);
        }

        res.json({
            status: 'success',
            data: {
                availableSlots,
                daySchedule,
                totalSlots: availableSlots.length
            }
        });
    } catch (error) {
        console.error('❌ Error getting available time slots:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// تأكيد الموعد
const confirmAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: 'confirmed' },
            { new: true }
        ).populate('patient', 'firstName lastName phone')
            .populate('doctor', 'firstName lastName specialization');

        if (!appointment) {
            return res.status(404).json({
                status: 'fail',
                message: 'الموعد غير موجود'
            });
        }

        res.json({
            status: 'success',
            message: 'تم تأكيد الموعد بنجاح',
            data: { appointment }
        });
    } catch (error) {
        console.error('❌ Error confirming appointment:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// الحصول على المواعيد القادمة
const getUpcomingAppointments = async (req, res) => {
    try {
        const today = new Date();
        const limit = parseInt(req.query.limit) || 10;

        const appointments = await Appointment.find({
            appointmentDate: { $gte: today },
            status: { $in: ['scheduled', 'confirmed'] }
        })
            .populate('patient', 'firstName lastName phone')
            .populate('doctor', 'firstName lastName specialization')
            .sort({ appointmentDate: 1, appointmentTime: 1 })
            .limit(limit);

        res.json({
            status: 'success',
            data: { appointments },
            count: appointments.length
        });
    } catch (error) {
        console.error('❌ Error getting upcoming appointments:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// الحصول على المواعيد المتأخرة
const getOverdueAppointments = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const appointments = await Appointment.find({
            appointmentDate: { $lt: today },
            status: { $in: ['scheduled', 'confirmed'] }
        })
            .populate('patient', 'firstName lastName phone')
            .populate('doctor', 'firstName lastName specialization')
            .sort({ appointmentDate: -1 });

        res.json({
            status: 'success',
            data: { appointments },
            count: appointments.length
        });
    } catch (error) {
        console.error('❌ Error getting overdue appointments:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// الحصول على مواعيد اليوم
const getTodaysAppointments = async (req, res) => {
    try {
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));

        const appointments = await Appointment.find({
            appointmentDate: { $gte: startOfToday, $lte: endOfToday }
        })
            .populate('patient', 'firstName lastName phone')
            .populate('doctor', 'firstName lastName specialization')
            .sort({ appointmentTime: 1 });

        res.json({
            status: 'success',
            data: { appointments },
            date: today.toISOString().split('T')[0],
            count: appointments.length
        });
    } catch (error) {
        console.error('❌ Error getting today\'s appointments:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// الحصول على تاريخ المواعيد
const getAppointmentHistory = async (req, res) => {
    try {
        const { patientId, doctorId } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        let query = { status: 'completed' };

        if (patientId) query.patient = patientId;
        if (doctorId) query.doctor = doctorId;

        const appointments = await Appointment.find(query)
            .populate('patient', 'firstName lastName')
            .populate('doctor', 'firstName lastName specialization')
            .skip(skip)
            .limit(limit)
            .sort({ appointmentDate: -1 });

        const total = await Appointment.countDocuments(query);

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
        console.error('❌ Error getting appointment history:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// إضافة ملاحظة للموعد
const addAppointmentNote = async (req, res) => {
    try {
        const { note } = req.body;

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    privateNotes: {
                        note: note,
                        addedBy: req.user?.username || 'staff',
                        addedAt: new Date()
                    }
                }
            },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({
                status: 'fail',
                message: 'الموعد غير موجود'
            });
        }

        res.json({
            status: 'success',
            message: 'تم إضافة الملاحظة بنجاح',
            data: { appointment }
        });
    } catch (error) {
        console.error('❌ Error adding appointment note:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// تحديث حالة الموعد
const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true }
        ).populate('patient', 'firstName lastName')
            .populate('doctor', 'firstName lastName');

        if (!appointment) {
            return res.status(404).json({
                status: 'fail',
                message: 'الموعد غير موجود'
            });
        }

        res.json({
            status: 'success',
            message: 'تم تحديث حالة الموعد بنجاح',
            data: { appointment }
        });
    } catch (error) {
        console.error('❌ Error updating appointment status:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// الحصول على المواعيد حسب الحالة
const getAppointmentsByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const appointments = await Appointment.find({ status: status })
            .populate('patient', 'firstName lastName phone')
            .populate('doctor', 'firstName lastName specialization')
            .skip(skip)
            .limit(limit)
            .sort({ appointmentDate: -1 });

        const total = await Appointment.countDocuments({ status: status });

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
        console.error('❌ Error getting appointments by status:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// إرسال تذكير بالموعد
const sendAppointmentReminder = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patient', 'firstName lastName phone email');

        if (!appointment) {
            return res.status(404).json({
                status: 'fail',
                message: 'الموعد غير موجود'
            });
        }

        // هنا يمكن إضافة منطق إرسال التذكير عبر SMS أو Email
        // حالياً سنقوم بتسجيل التذكير فقط
        appointment.remindersSent.push({
            type: req.body.type || 'sms',
            sentAt: new Date(),
            status: 'sent'
        });

        await appointment.save();

        res.json({
            status: 'success',
            message: 'تم إرسال التذكير بنجاح',
            data: { appointment }
        });
    } catch (error) {
        console.error('❌ Error sending appointment reminder:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// تحديث مجموعة من المواعيد
const bulkUpdateAppointments = async (req, res) => {
    try {
        const { appointmentIds, updateData } = req.body;

        if (!appointmentIds || !Array.isArray(appointmentIds) || appointmentIds.length === 0) {
            return res.status(400).json({
                status: 'fail',
                message: 'قائمة معرفات المواعيد مطلوبة'
            });
        }

        const result = await Appointment.updateMany(
            { _id: { $in: appointmentIds } },
            updateData
        );

        res.json({
            status: 'success',
            message: `تم تحديث ${result.modifiedCount} موعد بنجاح`,
            data: {
                matched: result.matchedCount,
                modified: result.modifiedCount
            }
        });
    } catch (error) {
        console.error('❌ Error bulk updating appointments:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
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
    bulkUpdateAppointments,
    completeAppointment
}; 