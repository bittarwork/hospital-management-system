const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital-management', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

console.log('✅ MongoDB Connected');

const appointmentTypes = [
    'consultation',
    'follow-up',
    'routine-checkup',
    'emergency',
    'procedure',
    'diagnostic',
    'screening'
];

const appointmentStatuses = [
    'scheduled',
    'confirmed',
    'checked-in',
    'in-progress',
    'completed',
    'cancelled'
];

const priorities = [
    'normal',
    'high',
    'urgent'
];

const reasons = [
    'فحص دوري',
    'ألم في الصدر',
    'صداع مستمر',
    'ضغط الدم المرتفع',
    'فحص السكر',
    'آلام المفاصل',
    'مشاكل في النوم',
    'حساسية الجلد',
    'مشاكل في الهضم',
    'فحص القلب',
    'آلام الظهر',
    'مراجعة النتائج',
    'استشارة طبية',
    'تجديد الوصفة الطبية',
    'فحص العيون'
];

const symptoms = [
    'ألم',
    'حمى',
    'صداع',
    'غثيان',
    'دوخة',
    'ضيق في التنفس',
    'خفقان القلب',
    'ألم في المفاصل',
    'طفح جلدي',
    'تعب عام'
];

// Generate random time slots
const generateTimeSlots = () => {
    const times = [];
    for (let hour = 8; hour <= 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            times.push(timeString);
        }
    }
    return times;
};

const timeSlots = generateTimeSlots();

// Generate random date within range
const generateRandomDate = (daysBack = 30, daysForward = 60) => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - daysBack);

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + daysForward);

    const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
    return new Date(randomTime);
};

const createAppointments = async () => {
    try {
        console.log('🌱 Starting to seed appointments...');

        // Get all patients and doctors
        const patients = await Patient.find({});
        const doctors = await Doctor.find({});

        if (patients.length === 0) {
            console.log('❌ No patients found. Please seed patients first.');
            return;
        }

        if (doctors.length === 0) {
            console.log('❌ No doctors found. Please seed doctors first.');
            return;
        }

        console.log(`📋 Found ${patients.length} patients and ${doctors.length} doctors`);

        // Clear existing appointments
        await Appointment.deleteMany({});
        console.log('🗑️  Cleared existing appointments');

        const appointments = [];

        // Create 50 appointments
        for (let i = 0; i < 50; i++) {
            const patient = patients[Math.floor(Math.random() * patients.length)];
            const doctor = doctors[Math.floor(Math.random() * doctors.length)];

            const appointmentDate = generateRandomDate();
            const appointmentTime = timeSlots[Math.floor(Math.random() * timeSlots.length)];
            const appointmentType = appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)];

            // Determine status based on date
            let status;
            const today = new Date();
            if (appointmentDate < today) {
                // Past appointments - mostly completed
                const pastStatuses = ['completed', 'completed', 'completed', 'cancelled', 'no-show'];
                status = pastStatuses[Math.floor(Math.random() * pastStatuses.length)];
            } else {
                // Future appointments - scheduled or confirmed
                const futureStatuses = ['scheduled', 'confirmed', 'confirmed'];
                status = futureStatuses[Math.floor(Math.random() * futureStatuses.length)];
            }

            const reasonForVisit = reasons[Math.floor(Math.random() * reasons.length)];
            const priority = priorities[Math.floor(Math.random() * priorities.length)];

            // Create symptoms array
            const appointmentSymptoms = [];
            const numSymptoms = Math.floor(Math.random() * 3) + 1; // 1-3 symptoms
            for (let j = 0; j < numSymptoms; j++) {
                const symptom = symptoms[Math.floor(Math.random() * symptoms.length)];
                if (!appointmentSymptoms.find(s => s.symptom === symptom)) {
                    appointmentSymptoms.push({
                        symptom: symptom,
                        severity: ['mild', 'moderate', 'severe'][Math.floor(Math.random() * 3)],
                        duration: ['يوم واحد', 'عدة أيام', 'أسبوع', 'أسبوعين'][Math.floor(Math.random() * 4)]
                    });
                }
            }

            const appointment = {
                patient: patient._id,
                doctor: doctor._id,
                appointmentDate: appointmentDate,
                appointmentTime: appointmentTime,
                appointmentType: appointmentType,
                status: status,
                priority: priority,
                reasonForVisit: reasonForVisit,
                symptoms: appointmentSymptoms,
                estimatedDuration: [30, 45, 60][Math.floor(Math.random() * 3)],
                consultationFee: doctor.consultationFee || Math.floor(Math.random() * 200) + 100,
                createdBy: 'admin'
            };

            // Add additional data for completed appointments
            if (status === 'completed') {
                const consultationStart = new Date(appointmentDate);
                consultationStart.setHours(
                    parseInt(appointmentTime.split(':')[0]),
                    parseInt(appointmentTime.split(':')[1])
                );

                const consultationEnd = new Date(consultationStart);
                consultationEnd.setMinutes(consultationStart.getMinutes() + appointment.estimatedDuration);

                appointment.consultationStartTime = consultationStart;
                appointment.consultationEndTime = consultationEnd;
                appointment.actualDuration = appointment.estimatedDuration + Math.floor(Math.random() * 20) - 10; // ±10 minutes

                // Add some diagnoses
                const diagnoses = [
                    'ارتفاع ضغط الدم',
                    'التهاب المفاصل',
                    'الصداع النصفي',
                    'القلق',
                    'نزلة برد',
                    'حساسية',
                    'التهاب الحلق',
                    'آلام الظهر'
                ];

                if (Math.random() > 0.3) { // 70% chance of having diagnosis
                    appointment.diagnosis = [{
                        condition: diagnoses[Math.floor(Math.random() * diagnoses.length)],
                        severity: ['mild', 'moderate', 'severe'][Math.floor(Math.random() * 3)],
                        status: 'primary',
                        notes: 'تحتاج للمتابعة'
                    }];
                }

                // Add treatment plan
                if (Math.random() > 0.4) { // 60% chance
                    appointment.treatmentPlan = 'علاج دوائي مع المتابعة الدورية';
                }

                // Add prescriptions
                if (Math.random() > 0.5) { // 50% chance
                    const medications = [
                        'باراسيتامول',
                        'ايبوبروفين',
                        'أموكسيسيلين',
                        'أسبرين',
                        'فيتامين د'
                    ];

                    appointment.prescriptions = [{
                        medication: medications[Math.floor(Math.random() * medications.length)],
                        dosage: '500 مجم',
                        frequency: 'مرتين يومياً',
                        duration: 'أسبوع واحد',
                        instructions: 'يؤخذ بعد الأكل',
                        quantity: Math.floor(Math.random() * 20) + 10
                    }];
                }

                // Add follow-up if needed
                if (Math.random() > 0.6) { // 40% chance
                    appointment.followUpRequired = true;
                    const followUpDate = new Date(appointmentDate);
                    followUpDate.setDate(followUpDate.getDate() + Math.floor(Math.random() * 30) + 7); // 1-5 weeks later
                    appointment.followUpDate = followUpDate;
                    appointment.followUpInstructions = 'مراجعة خلال أسبوعين لمتابعة التحسن';
                }
            }

            // Add check-in data for in-progress appointments
            if (status === 'checked-in' || status === 'in-progress') {
                appointment.checkInTime = new Date();
                appointment.checkInBy = 'reception';
            }

            // Add cancellation reason for cancelled appointments
            if (status === 'cancelled') {
                const cancellationReasons = [
                    'طارئ شخصي',
                    'مرض مفاجئ',
                    'تعارض في المواعيد',
                    'سفر غير متوقع'
                ];
                appointment.cancellationReason = cancellationReasons[Math.floor(Math.random() * cancellationReasons.length)];
                appointment.cancelledBy = ['patient', 'doctor', 'staff'][Math.floor(Math.random() * 3)];
                appointment.cancelledAt = new Date(appointmentDate.getTime() - Math.random() * 24 * 60 * 60 * 1000); // Cancelled within 24 hours before appointment
            }

            appointments.push(appointment);
        }

        // Insert appointments with validation disabled for seeding
        const createdAppointments = await Appointment.insertMany(appointments, {
            ordered: false,
            lean: false,
            runValidators: false
        });
        console.log(`✅ Successfully created ${createdAppointments.length} appointments`);

        // Print summary by status
        const statusSummary = {};
        createdAppointments.forEach(apt => {
            statusSummary[apt.status] = (statusSummary[apt.status] || 0) + 1;
        });

        console.log('\n📊 Appointments Summary:');
        console.log('========================');
        Object.entries(statusSummary).forEach(([status, count]) => {
            const statusLabels = {
                'scheduled': 'مجدول',
                'confirmed': 'مؤكد',
                'checked-in': 'تم الوصول',
                'in-progress': 'جاري',
                'completed': 'مكتمل',
                'cancelled': 'ملغي',
                'no-show': 'لم يحضر'
            };
            console.log(`   • ${statusLabels[status] || status}: ${count} موعد`);
        });

        // Print appointments by type
        console.log('\n📋 Appointments by Type:');
        console.log('=========================');
        const typeSummary = {};
        createdAppointments.forEach(apt => {
            typeSummary[apt.appointmentType] = (typeSummary[apt.appointmentType] || 0) + 1;
        });

        Object.entries(typeSummary).forEach(([type, count]) => {
            const typeLabels = {
                'consultation': 'استشارة',
                'follow-up': 'متابعة',
                'routine-checkup': 'فحص دوري',
                'emergency': 'طوارئ',
                'procedure': 'إجراء',
                'diagnostic': 'تشخيص',
                'screening': 'فحص'
            };
            console.log(`   • ${typeLabels[type] || type}: ${count} موعد`);
        });

        console.log('\n🎉 Appointment seeding completed!');
        console.log('💡 You can now test the appointment management system');
        console.log('📅 Appointments span from 30 days ago to 60 days in the future');

    } catch (error) {
        console.error('❌ Error seeding appointments:', error);
    } finally {
        mongoose.connection.close();
    }
};

// Run the seeding
createAppointments(); 