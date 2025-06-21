import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    Avatar,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    FormControl,
    InputLabel,
    Select,
    Divider,
    Alert,
    Snackbar,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Badge,
    Calendar,
    Stepper,
    Step,
    StepLabel,
    Autocomplete
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Schedule as ScheduleIcon,
    Person as PersonIcon,
    LocalHospital as DoctorIcon,
    AccessTime as TimeIcon,
    DateRange as DateIcon,
    Check as CheckIcon,
    Cancel as CancelIcon,
    Update as UpdateIcon,
    Notifications as NotificationIcon,
    Print as PrintIcon,
    CalendarToday as CalendarIcon,
    EventAvailable as AvailableIcon,
    EventBusy as BusyIcon,
    Phone as PhoneIcon,
    CheckCircle as CompletedIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import axios from 'axios';
import dayjs from 'dayjs';

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDate, setFilterDate] = useState('all');
    const [filterDoctor, setFilterDoctor] = useState('all');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [tabValue, setTabValue] = useState(0);
    const [activeStep, setActiveStep] = useState(0);

    const [newAppointment, setNewAppointment] = useState({
        patientId: '',
        doctorId: '',
        appointmentDate: dayjs(),
        appointmentTime: dayjs(),
        appointmentType: '',
        reasonForVisit: '',
        priority: 'normal',
        notes: ''
    });

    const appointmentTypes = [
        'consultation', 'follow-up', 'routine-checkup', 'emergency',
        'procedure', 'surgery', 'diagnostic', 'screening'
    ];

    const priorities = [
        { value: 'low', label: 'منخفضة', color: 'info' },
        { value: 'normal', label: 'عادية', color: 'primary' },
        { value: 'high', label: 'عالية', color: 'warning' },
        { value: 'urgent', label: 'عاجلة', color: 'error' }
    ];

    const steps = ['اختيار المريض', 'اختيار الطبيب', 'تحديد الموعد', 'تأكيد الحجز'];

    useEffect(() => {
        fetchAppointments();
        fetchPatientsAndDoctors();
    }, []);

    useEffect(() => {
        filterAppointments();
    }, [appointments, searchTerm, filterStatus, filterDate, filterDoctor]);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get('/api/appointments');
            const appointmentsData = response.data.data.appointments || [];

            // Mock data if API returns empty
            const mockAppointments = appointmentsData.length ? appointmentsData : [
                {
                    _id: '1',
                    appointmentId: 'APP001',
                    patient: {
                        _id: 'P1',
                        firstName: 'أحمد',
                        lastName: 'محمد العتيبي',
                        phone: '+966501234567'
                    },
                    doctor: {
                        _id: 'D1',
                        firstName: 'د. خالد',
                        lastName: 'السعيد',
                        specialization: 'Cardiology'
                    },
                    appointmentDate: '2024-06-21',
                    appointmentTime: '10:00',
                    appointmentType: 'consultation',
                    status: 'scheduled',
                    priority: 'normal',
                    reasonForVisit: 'فحص دوري للقلب',
                    estimatedDuration: 30,
                    createdAt: '2024-06-20',
                    checkInTime: null,
                    consultationStartTime: null,
                    consultationEndTime: null
                },
                {
                    _id: '2',
                    appointmentId: 'APP002',
                    patient: {
                        _id: 'P2',
                        firstName: 'فاطمة',
                        lastName: 'علي الزهراني',
                        phone: '+966502345678'
                    },
                    doctor: {
                        _id: 'D2',
                        firstName: 'د. نورا',
                        lastName: 'المالكي',
                        specialization: 'Pediatrics'
                    },
                    appointmentDate: '2024-06-21',
                    appointmentTime: '14:30',
                    appointmentType: 'follow-up',
                    status: 'confirmed',
                    priority: 'high',
                    reasonForVisit: 'متابعة حالة طفل',
                    estimatedDuration: 45,
                    createdAt: '2024-06-19',
                    checkInTime: null,
                    consultationStartTime: null,
                    consultationEndTime: null
                },
                {
                    _id: '3',
                    appointmentId: 'APP003',
                    patient: {
                        _id: 'P3',
                        firstName: 'محمد',
                        lastName: 'سعد القحطاني',
                        phone: '+966503456789'
                    },
                    doctor: {
                        _id: 'D3',
                        firstName: 'د. أميرة',
                        lastName: 'حسن',
                        specialization: 'General Surgery'
                    },
                    appointmentDate: '2024-06-20',
                    appointmentTime: '09:00',
                    appointmentType: 'procedure',
                    status: 'completed',
                    priority: 'urgent',
                    reasonForVisit: 'عملية جراحية بسيطة',
                    estimatedDuration: 60,
                    createdAt: '2024-06-18',
                    checkInTime: '2024-06-20T08:45:00',
                    consultationStartTime: '2024-06-20T09:05:00',
                    consultationEndTime: '2024-06-20T10:10:00'
                },
                {
                    _id: '4',
                    appointmentId: 'APP004',
                    patient: {
                        _id: 'P4',
                        firstName: 'ريم',
                        lastName: 'الزهراني',
                        phone: '+966504567890'
                    },
                    doctor: {
                        _id: 'D1',
                        firstName: 'د. خالد',
                        lastName: 'السعيد',
                        specialization: 'Cardiology'
                    },
                    appointmentDate: '2024-06-19',
                    appointmentTime: '11:00',
                    appointmentType: 'emergency',
                    status: 'cancelled',
                    priority: 'urgent',
                    reasonForVisit: 'آلام في الصدر',
                    estimatedDuration: 30,
                    createdAt: '2024-06-19',
                    cancellationReason: 'تحسن حالة المريض',
                    cancelledAt: '2024-06-19T10:30:00'
                }
            ];

            setAppointments(mockAppointments);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setLoading(false);
            setSnackbar({
                open: true,
                message: 'خطأ في تحميل بيانات المواعيد',
                severity: 'error'
            });
        }
    };

    const fetchPatientsAndDoctors = async () => {
        try {
            const [patientsRes, doctorsRes] = await Promise.all([
                axios.get('/api/patients'),
                axios.get('/api/doctors')
            ]);

            // Mock data
            const mockPatients = [
                { _id: 'P1', firstName: 'أحمد', lastName: 'محمد العتيبي', phone: '+966501234567' },
                { _id: 'P2', firstName: 'فاطمة', lastName: 'علي الزهراني', phone: '+966502345678' },
                { _id: 'P3', firstName: 'محمد', lastName: 'سعد القحطاني', phone: '+966503456789' },
                { _id: 'P4', firstName: 'ريم', lastName: 'الزهراني', phone: '+966504567890' }
            ];

            const mockDoctors = [
                { _id: 'D1', firstName: 'د. خالد', lastName: 'السعيد', specialization: 'Cardiology' },
                { _id: 'D2', firstName: 'د. نورا', lastName: 'المالكي', specialization: 'Pediatrics' },
                { _id: 'D3', firstName: 'د. أميرة', lastName: 'حسن', specialization: 'General Surgery' }
            ];

            setPatients(mockPatients);
            setDoctors(mockDoctors);
        } catch (error) {
            console.error('Error fetching patients and doctors:', error);
        }
    };

    const filterAppointments = () => {
        let filtered = appointments;

        if (searchTerm) {
            filtered = filtered.filter(appointment =>
                appointment.patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appointment.patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appointment.doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appointment.doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appointment.appointmentId.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter(appointment => appointment.status === filterStatus);
        }

        if (filterDate !== 'all') {
            const today = dayjs().format('YYYY-MM-DD');
            switch (filterDate) {
                case 'today':
                    filtered = filtered.filter(app => app.appointmentDate === today);
                    break;
                case 'tomorrow':
                    const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
                    filtered = filtered.filter(app => app.appointmentDate === tomorrow);
                    break;
                case 'thisWeek':
                    const weekStart = dayjs().startOf('week').format('YYYY-MM-DD');
                    const weekEnd = dayjs().endOf('week').format('YYYY-MM-DD');
                    filtered = filtered.filter(app =>
                        app.appointmentDate >= weekStart && app.appointmentDate <= weekEnd
                    );
                    break;
            }
        }

        if (filterDoctor !== 'all') {
            filtered = filtered.filter(appointment => appointment.doctor._id === filterDoctor);
        }

        setFilteredAppointments(filtered);
    };

    const handleAddAppointment = async () => {
        try {
            const appointmentData = {
                ...newAppointment,
                appointmentDate: newAppointment.appointmentDate.format('YYYY-MM-DD'),
                appointmentTime: newAppointment.appointmentTime.format('HH:mm'),
                createdBy: 'موظف الاستقبال'
            };

            const response = await axios.post('/api/appointments', appointmentData);
            setAppointments([response.data.data.appointment, ...appointments]);
            setAddDialogOpen(false);
            setActiveStep(0);
            setNewAppointment({
                patientId: '',
                doctorId: '',
                appointmentDate: dayjs(),
                appointmentTime: dayjs(),
                appointmentType: '',
                reasonForVisit: '',
                priority: 'normal',
                notes: ''
            });

            setSnackbar({
                open: true,
                message: 'تم حجز الموعد بنجاح',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error adding appointment:', error);
            setSnackbar({
                open: true,
                message: 'خطأ في حجز الموعد',
                severity: 'error'
            });
        }
    };

    const handleStatusChange = async (appointmentId, newStatus, additionalData = {}) => {
        try {
            const updateData = { status: newStatus, ...additionalData };

            if (newStatus === 'checked-in') {
                updateData.checkInTime = new Date().toISOString();
            } else if (newStatus === 'in-progress') {
                updateData.consultationStartTime = new Date().toISOString();
            } else if (newStatus === 'completed') {
                updateData.consultationEndTime = new Date().toISOString();
            }

            await axios.patch(`/api/appointments/${appointmentId}/status`, updateData);

            setAppointments(prev => prev.map(app =>
                app._id === appointmentId
                    ? { ...app, status: newStatus, ...updateData }
                    : app
            ));

            setSnackbar({
                open: true,
                message: getStatusChangeMessage(newStatus),
                severity: 'success'
            });
        } catch (error) {
            console.error('Error updating appointment status:', error);
            setSnackbar({
                open: true,
                message: 'خطأ في تحديث حالة الموعد',
                severity: 'error'
            });
        }
    };

    const getStatusChangeMessage = (status) => {
        const messages = {
            'confirmed': 'تم تأكيد الموعد',
            'checked-in': 'تم تسجيل وصول المريض',
            'in-progress': 'بدء الاستشارة',
            'completed': 'تم إنهاء الموعد',
            'cancelled': 'تم إلغاء الموعد'
        };
        return messages[status] || 'تم تحديث الموعد';
    };

    const handleMenuClick = (event, appointment) => {
        setMenuAnchor(event.currentTarget);
        setSelectedAppointment(appointment);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setSelectedAppointment(null);
    };

    const handleViewAppointment = () => {
        setDialogOpen(true);
        handleMenuClose();
    };

    const getStatusColor = (status) => {
        const colors = {
            'scheduled': 'info',
            'confirmed': 'primary',
            'checked-in': 'warning',
            'in-progress': 'secondary',
            'completed': 'success',
            'cancelled': 'error',
            'no-show': 'error',
            'rescheduled': 'warning'
        };
        return colors[status] || 'default';
    };

    const getStatusText = (status) => {
        const texts = {
            'scheduled': 'مجدول',
            'confirmed': 'مؤكد',
            'checked-in': 'وصل المريض',
            'in-progress': 'قيد التنفيذ',
            'completed': 'مكتمل',
            'cancelled': 'ملغي',
            'no-show': 'غياب',
            'rescheduled': 'معاد الجدولة'
        };
        return texts[status] || status;
    };

    const getAppointmentTypeText = (type) => {
        const types = {
            'consultation': 'استشارة',
            'follow-up': 'متابعة',
            'routine-checkup': 'فحص دوري',
            'emergency': 'طوارئ',
            'procedure': 'إجراء',
            'surgery': 'عملية',
            'diagnostic': 'تشخيص',
            'screening': 'فحص'
        };
        return types[type] || type;
    };

    const getPriorityColor = (priority) => {
        const priorityData = priorities.find(p => p.value === priority);
        return priorityData ? priorityData.color : 'default';
    };

    const getPriorityText = (priority) => {
        const priorityData = priorities.find(p => p.value === priority);
        return priorityData ? priorityData.label : priority;
    };

    const getTodaysAppointments = () => {
        const today = dayjs().format('YYYY-MM-DD');
        return appointments.filter(app => app.appointmentDate === today);
    };

    const getUpcomingAppointments = () => {
        const today = dayjs().format('YYYY-MM-DD');
        return appointments.filter(app =>
            app.appointmentDate >= today &&
            ['scheduled', 'confirmed'].includes(app.status)
        );
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Autocomplete
                                options={patients}
                                getOptionLabel={(patient) => `${patient.firstName} ${patient.lastName} - ${patient.phone}`}
                                value={patients.find(p => p._id === newAppointment.patientId) || null}
                                onChange={(event, newValue) => {
                                    setNewAppointment(prev => ({
                                        ...prev,
                                        patientId: newValue ? newValue._id : ''
                                    }));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="اختر المريض"
                                        placeholder="ابحث عن المريض بالاسم أو رقم الهاتف"
                                        fullWidth
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                );
            case 1:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Autocomplete
                                options={doctors}
                                getOptionLabel={(doctor) => `${doctor.firstName} ${doctor.lastName} - ${doctor.specialization}`}
                                value={doctors.find(d => d._id === newAppointment.doctorId) || null}
                                onChange={(event, newValue) => {
                                    setNewAppointment(prev => ({
                                        ...prev,
                                        doctorId: newValue ? newValue._id : ''
                                    }));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="اختر الطبيب"
                                        placeholder="ابحث عن الطبيب بالاسم أو التخصص"
                                        fullWidth
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                );
            case 2:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <DatePicker
                                label="تاريخ الموعد"
                                value={newAppointment.appointmentDate}
                                onChange={(newValue) => {
                                    setNewAppointment(prev => ({
                                        ...prev,
                                        appointmentDate: newValue
                                    }));
                                }}
                                slotProps={{ textField: { fullWidth: true } }}
                                minDate={dayjs()}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TimePicker
                                label="وقت الموعد"
                                value={newAppointment.appointmentTime}
                                onChange={(newValue) => {
                                    setNewAppointment(prev => ({
                                        ...prev,
                                        appointmentTime: newValue
                                    }));
                                }}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>نوع الموعد</InputLabel>
                                <Select
                                    value={newAppointment.appointmentType}
                                    label="نوع الموعد"
                                    onChange={(e) => setNewAppointment(prev => ({
                                        ...prev,
                                        appointmentType: e.target.value
                                    }))}
                                >
                                    {appointmentTypes.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {getAppointmentTypeText(type)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>الأولوية</InputLabel>
                                <Select
                                    value={newAppointment.priority}
                                    label="الأولوية"
                                    onChange={(e) => setNewAppointment(prev => ({
                                        ...prev,
                                        priority: e.target.value
                                    }))}
                                >
                                    {priorities.map((priority) => (
                                        <MenuItem key={priority.value} value={priority.value}>
                                            {priority.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="سبب الزيارة"
                                multiline
                                rows={3}
                                value={newAppointment.reasonForVisit}
                                onChange={(e) => setNewAppointment(prev => ({
                                    ...prev,
                                    reasonForVisit: e.target.value
                                }))}
                            />
                        </Grid>
                    </Grid>
                );
            case 3:
                const selectedPatient = patients.find(p => p._id === newAppointment.patientId);
                const selectedDoctor = doctors.find(d => d._id === newAppointment.doctorId);

                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>تأكيد بيانات الموعد</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography><strong>المريض:</strong> {selectedPatient?.firstName} {selectedPatient?.lastName}</Typography>
                            <Typography><strong>الطبيب:</strong> {selectedDoctor?.firstName} {selectedDoctor?.lastName}</Typography>
                            <Typography><strong>التخصص:</strong> {selectedDoctor?.specialization}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography><strong>التاريخ:</strong> {newAppointment.appointmentDate.format('YYYY-MM-DD')}</Typography>
                            <Typography><strong>الوقت:</strong> {newAppointment.appointmentTime.format('HH:mm')}</Typography>
                            <Typography><strong>نوع الموعد:</strong> {getAppointmentTypeText(newAppointment.appointmentType)}</Typography>
                            <Typography><strong>الأولوية:</strong> {getPriorityText(newAppointment.priority)}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography><strong>سبب الزيارة:</strong> {newAppointment.reasonForVisit}</Typography>
                        </Grid>
                    </Grid>
                );
            default:
                return null;
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        إدارة المواعيد 📅
                    </Typography>
                    <Typography variant="h6" color="textSecondary">
                        جدولة وإدارة شاملة للمواعيد الطبية
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setAddDialogOpen(true)}
                    sx={{ borderRadius: 3, px: 3 }}
                >
                    موعد جديد
                </Button>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ textAlign: 'center', py: 2 }}>
                        <CardContent>
                            <Typography variant="h3" color="primary" fontWeight="bold">
                                {getTodaysAppointments().length}
                            </Typography>
                            <Typography variant="h6" color="textSecondary">
                                مواعيد اليوم
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ textAlign: 'center', py: 2 }}>
                        <CardContent>
                            <Typography variant="h3" color="success.main" fontWeight="bold">
                                {getUpcomingAppointments().length}
                            </Typography>
                            <Typography variant="h6" color="textSecondary">
                                المواعيد القادمة
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ textAlign: 'center', py: 2 }}>
                        <CardContent>
                            <Typography variant="h3" color="warning.main" fontWeight="bold">
                                {appointments.filter(a => a.status === 'checked-in').length}
                            </Typography>
                            <Typography variant="h6" color="textSecondary">
                                في الانتظار
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ textAlign: 'center', py: 2 }}>
                        <CardContent>
                            <Typography variant="h3" color="info.main" fontWeight="bold">
                                {appointments.filter(a => a.status === 'completed').length}
                            </Typography>
                            <Typography variant="h6" color="textSecondary">
                                مكتملة اليوم
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Search and Filter */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="البحث بالمريض، الطبيب، أو رقم الموعد..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>الحالة</InputLabel>
                                <Select
                                    value={filterStatus}
                                    label="الحالة"
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <MenuItem value="all">جميع الحالات</MenuItem>
                                    <MenuItem value="scheduled">مجدول</MenuItem>
                                    <MenuItem value="confirmed">مؤكد</MenuItem>
                                    <MenuItem value="checked-in">وصل المريض</MenuItem>
                                    <MenuItem value="in-progress">قيد التنفيذ</MenuItem>
                                    <MenuItem value="completed">مكتمل</MenuItem>
                                    <MenuItem value="cancelled">ملغي</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>التاريخ</InputLabel>
                                <Select
                                    value={filterDate}
                                    label="التاريخ"
                                    onChange={(e) => setFilterDate(e.target.value)}
                                >
                                    <MenuItem value="all">جميع التواريخ</MenuItem>
                                    <MenuItem value="today">اليوم</MenuItem>
                                    <MenuItem value="tomorrow">غداً</MenuItem>
                                    <MenuItem value="thisWeek">هذا الأسبوع</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>الطبيب</InputLabel>
                                <Select
                                    value={filterDoctor}
                                    label="الطبيب"
                                    onChange={(e) => setFilterDoctor(e.target.value)}
                                >
                                    <MenuItem value="all">جميع الأطباء</MenuItem>
                                    {doctors.map((doctor) => (
                                        <MenuItem key={doctor._id} value={doctor._id}>
                                            {doctor.firstName} {doctor.lastName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<CalendarIcon />}
                                sx={{ height: 56 }}
                            >
                                عرض التقويم
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Appointments Table */}
            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell>المريض</TableCell>
                                <TableCell>الطبيب</TableCell>
                                <TableCell>التاريخ والوقت</TableCell>
                                <TableCell>نوع الموعد</TableCell>
                                <TableCell>الأولوية</TableCell>
                                <TableCell>الحالة</TableCell>
                                <TableCell align="center">الإجراءات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAppointments
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((appointment) => (
                                    <TableRow key={appointment._id} hover>
                                        <TableCell>
                                            <Box display="flex" alignItems="center">
                                                <Avatar
                                                    sx={{
                                                        bgcolor: 'primary.main',
                                                        mr: 2,
                                                        width: 40,
                                                        height: 40
                                                    }}
                                                >
                                                    <PersonIcon />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {appointment.patient.firstName} {appointment.patient.lastName}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {appointment.patient.phone}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        <TableCell>
                                            <Box display="flex" alignItems="center">
                                                <Avatar
                                                    sx={{
                                                        bgcolor: 'secondary.main',
                                                        mr: 2,
                                                        width: 40,
                                                        height: 40
                                                    }}
                                                >
                                                    <DoctorIcon />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {appointment.doctor.firstName} {appointment.doctor.lastName}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {appointment.doctor.specialization}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        <TableCell>
                                            <Box>
                                                <Box display="flex" alignItems="center" mb={0.5}>
                                                    <DateIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                                    <Typography variant="body2">
                                                        {dayjs(appointment.appointmentDate).format('YYYY-MM-DD')}
                                                    </Typography>
                                                </Box>
                                                <Box display="flex" alignItems="center">
                                                    <TimeIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                                    <Typography variant="body2">
                                                        {appointment.appointmentTime}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2" fontWeight="medium">
                                                {getAppointmentTypeText(appointment.appointmentType)}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {appointment.estimatedDuration} دقيقة
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={getPriorityText(appointment.priority)}
                                                color={getPriorityColor(appointment.priority)}
                                                size="small"
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={getStatusText(appointment.status)}
                                                color={getStatusColor(appointment.status)}
                                                size="small"
                                                icon={
                                                    appointment.status === 'completed' ? <CompletedIcon /> :
                                                        appointment.status === 'cancelled' ? <CancelIcon /> :
                                                            appointment.status === 'in-progress' ? <WarningIcon /> : null
                                                }
                                            />
                                        </TableCell>

                                        <TableCell align="center">
                                            <IconButton
                                                onClick={(e) => handleMenuClick(e, appointment)}
                                                size="small"
                                            >
                                                <MoreVertIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={filteredAppointments.length}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    labelRowsPerPage="عدد الصفوف في الصفحة:"
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} من ${count !== -1 ? count : 'أكثر من ' + to}`
                    }
                />
            </Card>

            {/* Actions Menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleViewAppointment}>
                    <ViewIcon sx={{ mr: 1 }} />
                    عرض التفاصيل
                </MenuItem>

                {selectedAppointment?.status === 'scheduled' && (
                    <MenuItem onClick={() => {
                        handleStatusChange(selectedAppointment._id, 'confirmed');
                        handleMenuClose();
                    }}>
                        <CheckIcon sx={{ mr: 1 }} />
                        تأكيد الموعد
                    </MenuItem>
                )}

                {selectedAppointment?.status === 'confirmed' && (
                    <MenuItem onClick={() => {
                        handleStatusChange(selectedAppointment._id, 'checked-in');
                        handleMenuClose();
                    }}>
                        <AvailableIcon sx={{ mr: 1 }} />
                        تسجيل الوصول
                    </MenuItem>
                )}

                {selectedAppointment?.status === 'checked-in' && (
                    <MenuItem onClick={() => {
                        handleStatusChange(selectedAppointment._id, 'in-progress');
                        handleMenuClose();
                    }}>
                        <ScheduleIcon sx={{ mr: 1 }} />
                        بدء الاستشارة
                    </MenuItem>
                )}

                {selectedAppointment?.status === 'in-progress' && (
                    <MenuItem onClick={() => {
                        handleStatusChange(selectedAppointment._id, 'completed');
                        handleMenuClose();
                    }}>
                        <CompletedIcon sx={{ mr: 1 }} />
                        إنهاء الموعد
                    </MenuItem>
                )}

                <MenuItem onClick={handleMenuClose}>
                    <EditIcon sx={{ mr: 1 }} />
                    تعديل الموعد
                </MenuItem>

                <MenuItem onClick={handleMenuClose}>
                    <UpdateIcon sx={{ mr: 1 }} />
                    إعادة جدولة
                </MenuItem>

                <Divider />

                <MenuItem onClick={() => {
                    handleStatusChange(selectedAppointment._id, 'cancelled', {
                        cancellationReason: 'تم الإلغاء من قبل المستخدم',
                        cancelledAt: new Date().toISOString()
                    });
                    handleMenuClose();
                }} sx={{ color: 'error.main' }}>
                    <CancelIcon sx={{ mr: 1 }} />
                    إلغاء الموعد
                </MenuItem>
            </Menu>

            {/* Add Appointment Dialog */}
            <Dialog
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>حجز موعد جديد</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Stepper activeStep={activeStep}>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        <Box sx={{ mt: 3 }}>
                            {renderStepContent(activeStep)}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddDialogOpen(false)}>إلغاء</Button>
                    <Button
                        disabled={activeStep === 0}
                        onClick={() => setActiveStep(prev => prev - 1)}
                    >
                        السابق
                    </Button>
                    {activeStep === steps.length - 1 ? (
                        <Button variant="contained" onClick={handleAddAppointment}>
                            تأكيد الحجز
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={() => setActiveStep(prev => prev + 1)}
                            disabled={
                                (activeStep === 0 && !newAppointment.patientId) ||
                                (activeStep === 1 && !newAppointment.doctorId) ||
                                (activeStep === 2 && (!newAppointment.appointmentType || !newAppointment.reasonForVisit))
                            }
                        >
                            التالي
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* View Appointment Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    تفاصيل الموعد - {selectedAppointment?.appointmentId}
                </DialogTitle>
                <DialogContent>
                    {selectedAppointment && (
                        <Grid container spacing={3} mt={1}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>معلومات المريض</Typography>
                                <Typography><strong>الاسم:</strong> {selectedAppointment.patient.firstName} {selectedAppointment.patient.lastName}</Typography>
                                <Typography><strong>الهاتف:</strong> {selectedAppointment.patient.phone}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>معلومات الطبيب</Typography>
                                <Typography><strong>الاسم:</strong> {selectedAppointment.doctor.firstName} {selectedAppointment.doctor.lastName}</Typography>
                                <Typography><strong>التخصص:</strong> {selectedAppointment.doctor.specialization}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>تفاصيل الموعد</Typography>
                                <Typography><strong>التاريخ:</strong> {dayjs(selectedAppointment.appointmentDate).format('YYYY-MM-DD')}</Typography>
                                <Typography><strong>الوقت:</strong> {selectedAppointment.appointmentTime}</Typography>
                                <Typography><strong>النوع:</strong> {getAppointmentTypeText(selectedAppointment.appointmentType)}</Typography>
                                <Typography><strong>الأولوية:</strong> {getPriorityText(selectedAppointment.priority)}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>الحالة والتوقيتات</Typography>
                                <Typography><strong>الحالة:</strong> {getStatusText(selectedAppointment.status)}</Typography>
                                {selectedAppointment.checkInTime && (
                                    <Typography><strong>وقت الوصول:</strong> {dayjs(selectedAppointment.checkInTime).format('HH:mm')}</Typography>
                                )}
                                {selectedAppointment.consultationStartTime && (
                                    <Typography><strong>بداية الاستشارة:</strong> {dayjs(selectedAppointment.consultationStartTime).format('HH:mm')}</Typography>
                                )}
                                {selectedAppointment.consultationEndTime && (
                                    <Typography><strong>نهاية الاستشارة:</strong> {dayjs(selectedAppointment.consultationEndTime).format('HH:mm')}</Typography>
                                )}
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>سبب الزيارة</Typography>
                                <Typography>{selectedAppointment.reasonForVisit}</Typography>
                            </Grid>
                            {selectedAppointment.cancellationReason && (
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom>سبب الإلغاء</Typography>
                                    <Typography color="error">{selectedAppointment.cancellationReason}</Typography>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>إغلاق</Button>
                    <Button variant="contained" startIcon={<PrintIcon />}>
                        طباعة
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Appointments; 