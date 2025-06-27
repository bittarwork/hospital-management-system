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

// Get all doctors with pagination, search, and filters
const getAllDoctors = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Build query object
        let query = {};

        // Search functionality
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            query.$or = [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { phone: searchRegex },
                { email: searchRegex },
                { specialization: searchRegex },
                { licenseNumber: searchRegex }
            ];
        }

        // Filters
        if (req.query.specialization) {
            query.specialization = req.query.specialization;
        }

        if (req.query.gender) {
            query.gender = req.query.gender;
        }

        if (req.query.status) {
            query.status = req.query.status;
        } else {
            // Default to active doctors only if no status filter is specified
            query.status = 'active';
        }

        if (req.query.position) {
            query.position = req.query.position;
        }

        if (req.query.department) {
            query.department = req.query.department;
        }

        // Fee range filter
        if (req.query.minFee || req.query.maxFee) {
            query.consultationFee = {};
            if (req.query.minFee) {
                query.consultationFee.$gte = parseFloat(req.query.minFee);
            }
            if (req.query.maxFee) {
                query.consultationFee.$lte = parseFloat(req.query.maxFee);
            }
        }

        // Experience filter
        if (req.query.minExperience || req.query.maxExperience) {
            query.experience = {};
            if (req.query.minExperience) {
                query.experience.$gte = parseInt(req.query.minExperience);
            }
            if (req.query.maxExperience) {
                query.experience.$lte = parseInt(req.query.maxExperience);
            }
        }

        const doctors = await Doctor.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Doctor.countDocuments(query);

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
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({
                status: 'fail',
                message: 'Search query is required'
            });
        }

        const searchRegex = new RegExp(query, 'i');
        const doctors = await Doctor.find({
            status: 'active',
            $or: [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { specialization: searchRegex },
                { phone: searchRegex },
                { email: searchRegex },
                { licenseNumber: searchRegex }
            ]
        }).limit(20);

        res.json({
            status: 'success',
            data: { doctors }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get doctors statistics
const getDoctorsStats = async (req, res) => {
    try {
        // Get all doctors for detailed statistics
        const allDoctors = await Doctor.find({});

        // Basic counts
        const total = allDoctors.length;
        const active = allDoctors.filter(d => d.status === 'active').length;
        const inactive = total - active;
        const male = allDoctors.filter(d => d.gender === 'male').length;
        const female = allDoctors.filter(d => d.gender === 'female').length;

        // Specialization distribution
        const specializationCounts = {};
        allDoctors.forEach(doctor => {
            if (doctor.specialization) {
                specializationCounts[doctor.specialization] = (specializationCounts[doctor.specialization] || 0) + 1;
            }
        });

        // Position distribution
        const positionCounts = {};
        allDoctors.forEach(doctor => {
            if (doctor.position) {
                positionCounts[doctor.position] = (positionCounts[doctor.position] || 0) + 1;
            }
        });

        // Experience groups
        const experienceGroups = {
            "0-5": 0,
            "6-10": 0,
            "11-15": 0,
            "16+": 0
        };

        allDoctors.forEach(doctor => {
            const exp = parseInt(doctor.experience) || 0;
            if (exp <= 5) experienceGroups["0-5"]++;
            else if (exp <= 10) experienceGroups["6-10"]++;
            else if (exp <= 15) experienceGroups["11-15"]++;
            else experienceGroups["16+"]++;
        });

        // Fee ranges
        const feeRanges = {
            "0-200": 0,
            "201-300": 0,
            "301-400": 0,
            "401+": 0
        };

        allDoctors.forEach(doctor => {
            const fee = parseInt(doctor.consultationFee) || 0;
            if (fee <= 200) feeRanges["0-200"]++;
            else if (fee <= 300) feeRanges["201-300"]++;
            else if (fee <= 400) feeRanges["301-400"]++;
            else feeRanges["401+"]++;
        });

        // Average consultation fee
        const feesSum = allDoctors.reduce((sum, doctor) => {
            return sum + (parseInt(doctor.consultationFee) || 0);
        }, 0);
        const averageFee = total > 0 ? Math.round(feesSum / total) : 0;

        res.json({
            status: 'success',
            data: {
                total,
                active,
                inactive,
                male,
                female,
                averageFee,
                specializations: specializationCounts,
                positions: positionCounts,
                experienceGroups,
                feeRanges,
                uniqueSpecializations: Object.keys(specializationCounts).length,
                uniquePositions: Object.keys(positionCounts).length
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get doctors by specialization
const getDoctorsBySpecialization = async (req, res) => {
    try {
        const { specialization } = req.params;
        const doctors = await Doctor.find({
            specialization: specialization,
            status: 'active'
        }).sort({ firstName: 1 });

        res.json({
            status: 'success',
            data: { doctors }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get available doctors (active doctors with schedule)
const getAvailableDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({
            status: 'active',
            'schedule.0': { $exists: true } // Has at least one schedule entry
        }).sort({ firstName: 1 });

        res.json({
            status: 'success',
            data: { doctors }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get doctor schedule
const getDoctorSchedule = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).select('schedule workingHours');
        if (!doctor) {
            return res.status(404).json({
                status: 'fail',
                message: 'Doctor not found'
            });
        }

        res.json({
            status: 'success',
            data: {
                schedule: doctor.schedule,
                workingHours: doctor.workingHours
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Update doctor schedule
const updateDoctorSchedule = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            {
                schedule: req.body.schedule,
                workingHours: req.body.workingHours
            },
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
            message: 'Doctor schedule updated successfully',
            data: { doctor }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Get doctor appointments
const getDoctorAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            doctor: req.params.id
        }).populate('patient', 'firstName lastName phone');

        res.json({
            status: 'success',
            data: { appointments }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get doctor patients
const getDoctorPatients = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            doctor: req.params.id
        }).populate('patient').distinct('patient');

        res.json({
            status: 'success',
            data: { patients: appointments }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get doctor availability
const getDoctorAvailability = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({
                status: 'fail',
                message: 'Doctor not found'
            });
        }

        // Get appointments for the requested date
        const date = req.query.date || new Date().toISOString().split('T')[0];
        const appointments = await Appointment.countDocuments({
            doctor: req.params.id,
            appointmentDate: {
                $gte: new Date(date),
                $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
            },
            status: { $in: ['scheduled', 'confirmed'] }
        });

        // Get doctor's schedule for the day
        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
        const daySchedule = doctor.schedule.find(s => s.dayOfWeek === dayOfWeek);

        const isAvailable = daySchedule && daySchedule.isAvailable;
        const maxPatients = daySchedule ? daySchedule.maxPatients : 0;
        const availableSlots = Math.max(0, maxPatients - appointments);

        res.json({
            status: 'success',
            data: {
                date,
                isAvailable,
                maxPatients,
                bookedAppointments: appointments,
                availableSlots,
                schedule: daySchedule
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Add doctor schedule
const addDoctorSchedule = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({
                status: 'fail',
                message: 'Doctor not found'
            });
        }

        doctor.schedule.push(req.body);
        await doctor.save();

        res.json({
            status: 'success',
            message: 'Schedule added successfully',
            data: { doctor }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Remove doctor schedule
const removeDoctorSchedule = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({
                status: 'fail',
                message: 'Doctor not found'
            });
        }

        doctor.schedule.id(req.params.scheduleId).remove();
        await doctor.save();

        res.json({
            status: 'success',
            message: 'Schedule removed successfully',
            data: { doctor }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Get doctor workload
const getDoctorWorkload = async (req, res) => {
    try {
        const startDate = new Date(req.query.startDate || new Date());
        const endDate = new Date(req.query.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

        const workload = await Appointment.aggregate([
            {
                $match: {
                    doctor: req.params.id,
                    appointmentDate: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } },
                    appointmentCount: { $sum: 1 },
                    totalRevenue: { $sum: "$consultationFee" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            status: 'success',
            data: { workload }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Update doctor status
const updateDoctorStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            { status },
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
            message: 'Doctor status updated successfully',
            data: { doctor }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Get doctor ratings
const getDoctorRatings = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).select('ratings');
        if (!doctor) {
            return res.status(404).json({
                status: 'fail',
                message: 'Doctor not found'
            });
        }

        res.json({
            status: 'success',
            data: { ratings: doctor.ratings }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Add doctor rating
const addDoctorRating = async (req, res) => {
    try {
        const { rating, review } = req.body;
        const doctor = await Doctor.findById(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                status: 'fail',
                message: 'Doctor not found'
            });
        }

        // Update average rating
        const currentTotal = (doctor.ratings.averageRating || 0) * (doctor.ratings.totalReviews || 0);
        const newTotal = currentTotal + rating;
        const newCount = (doctor.ratings.totalReviews || 0) + 1;

        doctor.ratings = {
            averageRating: newTotal / newCount,
            totalReviews: newCount
        };

        await doctor.save();

        res.json({
            status: 'success',
            message: 'Rating added successfully',
            data: { doctor }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Get doctor certifications
const getDoctorCertifications = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).select('certifications education');
        if (!doctor) {
            return res.status(404).json({
                status: 'fail',
                message: 'Doctor not found'
            });
        }

        res.json({
            status: 'success',
            data: {
                certifications: doctor.certifications,
                education: doctor.education
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Add doctor certification
const addDoctorCertification = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({
                status: 'fail',
                message: 'Doctor not found'
            });
        }

        doctor.certifications.push(req.body);
        await doctor.save();

        res.json({
            status: 'success',
            message: 'Certification added successfully',
            data: { doctor }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Update doctor certification
const updateDoctorCertification = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({
                status: 'fail',
                message: 'Doctor not found'
            });
        }

        const certification = doctor.certifications.id(req.params.certificationId);
        if (!certification) {
            return res.status(404).json({
                status: 'fail',
                message: 'Certification not found'
            });
        }

        Object.assign(certification, req.body);
        await doctor.save();

        res.json({
            status: 'success',
            message: 'Certification updated successfully',
            data: { doctor }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Remove doctor certification
const removeDoctorCertification = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({
                status: 'fail',
                message: 'Doctor not found'
            });
        }

        doctor.certifications.id(req.params.certificationId).remove();
        await doctor.save();

        res.json({
            status: 'success',
            message: 'Certification removed successfully',
            data: { doctor }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
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
