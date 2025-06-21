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
    Badge
} from '@mui/material';
import {
    PersonAdd as PersonAddIcon,
    Search as SearchIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Schedule as ScheduleIcon,
    LocalHospital as MedicalIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    School as EducationIcon,
    WorkHistory as ExperienceIcon,
    Star as StarIcon,
    EventAvailable as AvailableIcon,
    EventBusy as BusyIcon,
    AccessTime as TimeIcon,
    Assignment as AssignmentIcon
} from '@mui/icons-material';
import axios from 'axios';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSpecialization, setFilterSpecialization] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [tabValue, setTabValue] = useState(0);

    const [newDoctor, setNewDoctor] = useState({
        firstName: '',
        lastName: '',
        specialization: '',
        phone: '',
        email: '',
        yearsOfExperience: '',
        licenseNumber: '',
        department: '',
        consultationFee: '',
        biography: ''
    });

    const specializations = [
        'General Medicine', 'Internal Medicine', 'General Surgery', 'Pediatrics',
        'Obstetrics and Gynecology', 'Cardiology', 'Orthopedics', 'Dermatology',
        'Ophthalmology', 'ENT (Ear, Nose, Throat)', 'Neurology', 'Psychiatry',
        'Dentistry', 'Anesthesiology', 'Radiology', 'Emergency Medicine'
    ];

    useEffect(() => {
        fetchDoctors();
    }, []);

    useEffect(() => {
        filterDoctors();
    }, [doctors, searchTerm, filterSpecialization, filterStatus]);

    const fetchDoctors = async () => {
        try {
            const response = await axios.get('/api/doctors');
            const doctorsData = response.data.data.doctors || [];

            // Mock data if API returns empty
            const mockDoctors = doctorsData.length ? doctorsData : [
                {
                    _id: '1',
                    firstName: 'د. خالد',
                    lastName: 'السعيد',
                    specialization: 'Cardiology',
                    phone: '+966501234567',
                    email: 'khalid.alsaeed@hospital.com',
                    yearsOfExperience: 15,
                    licenseNumber: 'MD123456',
                    department: 'قسم القلب',
                    consultationFee: 300,
                    status: 'active',
                    doctorId: 'DR001',
                    joiningDate: '2020-01-15',
                    schedule: [
                        { dayOfWeek: 'sunday', startTime: '08:00', endTime: '16:00', isAvailable: true },
                        { dayOfWeek: 'monday', startTime: '08:00', endTime: '16:00', isAvailable: true },
                        { dayOfWeek: 'tuesday', startTime: '08:00', endTime: '16:00', isAvailable: true }
                    ],
                    ratings: { averageRating: 4.8, totalReviews: 156 },
                    todayAppointments: 8,
                    biography: 'استشاري أمراض القلب مع خبرة واسعة في جراحة القلب المفتوح'
                },
                {
                    _id: '2',
                    firstName: 'د. نورا',
                    lastName: 'المالكي',
                    specialization: 'Pediatrics',
                    phone: '+966502345678',
                    email: 'nora.almalki@hospital.com',
                    yearsOfExperience: 10,
                    licenseNumber: 'MD789012',
                    department: 'قسم الأطفال',
                    consultationFee: 250,
                    status: 'active',
                    doctorId: 'DR002',
                    joiningDate: '2021-03-10',
                    schedule: [
                        { dayOfWeek: 'sunday', startTime: '09:00', endTime: '17:00', isAvailable: true },
                        { dayOfWeek: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: true }
                    ],
                    ratings: { averageRating: 4.9, totalReviews: 203 },
                    todayAppointments: 12,
                    biography: 'استشارية طب الأطفال متخصصة في الرعاية المتقدمة للأطفال'
                },
                {
                    _id: '3',
                    firstName: 'د. أميرة',
                    lastName: 'حسن',
                    specialization: 'General Surgery',
                    phone: '+966503456789',
                    email: 'amira.hassan@hospital.com',
                    yearsOfExperience: 12,
                    licenseNumber: 'MD345678',
                    department: 'قسم الجراحة',
                    consultationFee: 400,
                    status: 'on-leave',
                    doctorId: 'DR003',
                    joiningDate: '2019-07-20',
                    schedule: [],
                    ratings: { averageRating: 4.7, totalReviews: 89 },
                    todayAppointments: 0,
                    biography: 'جراحة عامة مع تخصص في الجراحات طفيفة التوغل'
                }
            ];

            setDoctors(mockDoctors);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching doctors:', error);
            setLoading(false);
            setSnackbar({
                open: true,
                message: 'خطأ في تحميل بيانات الأطباء',
                severity: 'error'
            });
        }
    };

    const filterDoctors = () => {
        let filtered = doctors;

        if (searchTerm) {
            filtered = filtered.filter(doctor =>
                doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doctor.doctorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterSpecialization !== 'all') {
            filtered = filtered.filter(doctor => doctor.specialization === filterSpecialization);
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter(doctor => doctor.status === filterStatus);
        }

        setFilteredDoctors(filtered);
    };

    const handleAddDoctor = async () => {
        try {
            const response = await axios.post('/api/doctors', newDoctor);
            setDoctors([response.data.data.doctor, ...doctors]);
            setAddDialogOpen(false);
            setNewDoctor({
                firstName: '',
                lastName: '',
                specialization: '',
                phone: '',
                email: '',
                yearsOfExperience: '',
                licenseNumber: '',
                department: '',
                consultationFee: '',
                biography: ''
            });
            setSnackbar({
                open: true,
                message: 'تم إضافة الطبيب بنجاح',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error adding doctor:', error);
            setSnackbar({
                open: true,
                message: 'خطأ في إضافة الطبيب',
                severity: 'error'
            });
        }
    };

    const handleMenuClick = (event, doctor) => {
        setMenuAnchor(event.currentTarget);
        setSelectedDoctor(doctor);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setSelectedDoctor(null);
    };

    const handleViewDoctor = () => {
        setDialogOpen(true);
        handleMenuClose();
    };

    const handleViewSchedule = () => {
        setScheduleDialogOpen(true);
        handleMenuClose();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'on-leave': return 'warning';
            case 'inactive': return 'default';
            default: return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active': return 'نشط';
            case 'on-leave': return 'في إجازة';
            case 'inactive': return 'غير نشط';
            default: return status;
        }
    };

    const getSpecializationArabic = (specialization) => {
        const translations = {
            'Cardiology': 'أمراض القلب',
            'Pediatrics': 'طب الأطفال',
            'General Surgery': 'الجراحة العامة',
            'General Medicine': 'الطب العام',
            'Internal Medicine': 'الطب الباطني',
            'Orthopedics': 'العظام',
            'Dermatology': 'الجلدية',
            'Neurology': 'الأعصاب'
        };
        return translations[specialization] || specialization;
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        إدارة الأطباء 👨‍⚕️
                    </Typography>
                    <Typography variant="h6" color="textSecondary">
                        إدارة شاملة لجميع الأطباء والتخصصات في المستشفى
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setAddDialogOpen(true)}
                    sx={{ borderRadius: 3, px: 3 }}
                >
                    طبيب جديد
                </Button>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ textAlign: 'center', py: 2 }}>
                        <CardContent>
                            <Typography variant="h3" color="primary" fontWeight="bold">
                                {doctors.length}
                            </Typography>
                            <Typography variant="h6" color="textSecondary">
                                إجمالي الأطباء
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ textAlign: 'center', py: 2 }}>
                        <CardContent>
                            <Typography variant="h3" color="success.main" fontWeight="bold">
                                {doctors.filter(d => d.status === 'active').length}
                            </Typography>
                            <Typography variant="h6" color="textSecondary">
                                الأطباء النشطون
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ textAlign: 'center', py: 2 }}>
                        <CardContent>
                            <Typography variant="h3" color="info.main" fontWeight="bold">
                                {[...new Set(doctors.map(d => d.specialization))].length}
                            </Typography>
                            <Typography variant="h6" color="textSecondary">
                                التخصصات المتاحة
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ textAlign: 'center', py: 2 }}>
                        <CardContent>
                            <Typography variant="h3" color="secondary.main" fontWeight="bold">
                                {doctors.reduce((sum, d) => sum + (d.todayAppointments || 0), 0)}
                            </Typography>
                            <Typography variant="h6" color="textSecondary">
                                مواعيد اليوم
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Search and Filter */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={5}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="البحث بالاسم، التخصص، أو رقم الطبيب..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>التخصص</InputLabel>
                                <Select
                                    value={filterSpecialization}
                                    label="التخصص"
                                    onChange={(e) => setFilterSpecialization(e.target.value)}
                                >
                                    <MenuItem value="all">جميع التخصصات</MenuItem>
                                    {specializations.map((spec) => (
                                        <MenuItem key={spec} value={spec}>
                                            {getSpecializationArabic(spec)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
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
                                    <MenuItem value="active">نشط</MenuItem>
                                    <MenuItem value="on-leave">في إجازة</MenuItem>
                                    <MenuItem value="inactive">غير نشط</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<ScheduleIcon />}
                                sx={{ height: 56 }}
                            >
                                عرض الجداول
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Doctors Table */}
            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell>الطبيب</TableCell>
                                <TableCell>التخصص والقسم</TableCell>
                                <TableCell>معلومات الاتصال</TableCell>
                                <TableCell>الخبرة والتقييم</TableCell>
                                <TableCell>مواعيد اليوم</TableCell>
                                <TableCell>الحالة</TableCell>
                                <TableCell align="center">الإجراءات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredDoctors
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((doctor) => (
                                    <TableRow key={doctor._id} hover>
                                        <TableCell>
                                            <Box display="flex" alignItems="center">
                                                <Avatar
                                                    sx={{
                                                        bgcolor: 'primary.main',
                                                        mr: 2,
                                                        width: 50,
                                                        height: 50
                                                    }}
                                                >
                                                    <MedicalIcon />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {doctor.firstName} {doctor.lastName}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {doctor.doctorId}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        رخصة: {doctor.licenseNumber}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        <TableCell>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                                                    {getSpecializationArabic(doctor.specialization)}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    {doctor.department}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {doctor.consultationFee} ريال / استشارة
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell>
                                            <Box>
                                                <Box display="flex" alignItems="center" mb={0.5}>
                                                    <PhoneIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                                    <Typography variant="body2">{doctor.phone}</Typography>
                                                </Box>
                                                <Box display="flex" alignItems="center">
                                                    <EmailIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                                        {doctor.email}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        <TableCell>
                                            <Box>
                                                <Box display="flex" alignItems="center" mb={0.5}>
                                                    <ExperienceIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                                    <Typography variant="body2">
                                                        {doctor.yearsOfExperience} سنة خبرة
                                                    </Typography>
                                                </Box>
                                                <Box display="flex" alignItems="center">
                                                    <StarIcon sx={{ fontSize: 16, mr: 1, color: '#ffa726' }} />
                                                    <Typography variant="body2">
                                                        {doctor.ratings?.averageRating} ({doctor.ratings?.totalReviews} تقييم)
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        <TableCell>
                                            <Box textAlign="center">
                                                <Badge badgeContent={doctor.todayAppointments} color="primary">
                                                    <AssignmentIcon color="action" />
                                                </Badge>
                                                <Typography variant="caption" display="block" mt={0.5}>
                                                    {doctor.todayAppointments} موعد
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={getStatusText(doctor.status)}
                                                color={getStatusColor(doctor.status)}
                                                size="small"
                                                icon={doctor.status === 'active' ? <AvailableIcon /> : <BusyIcon />}
                                            />
                                        </TableCell>

                                        <TableCell align="center">
                                            <IconButton
                                                onClick={(e) => handleMenuClick(e, doctor)}
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
                    count={filteredDoctors.length}
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
                <MenuItem onClick={handleViewDoctor}>
                    <ViewIcon sx={{ mr: 1 }} />
                    عرض التفاصيل
                </MenuItem>
                <MenuItem onClick={handleViewSchedule}>
                    <ScheduleIcon sx={{ mr: 1 }} />
                    عرض الجدول
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                    <EditIcon sx={{ mr: 1 }} />
                    تعديل البيانات
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
                    <DeleteIcon sx={{ mr: 1 }} />
                    حذف
                </MenuItem>
            </Menu>

            {/* Doctor Details Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    تفاصيل الطبيب
                </DialogTitle>
                <DialogContent>
                    {selectedDoctor && (
                        <Box>
                            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                                <Tab label="المعلومات الأساسية" />
                                <Tab label="السيرة الذاتية" />
                                <Tab label="التقييمات" />
                            </Tabs>

                            {tabValue === 0 && (
                                <Grid container spacing={3} mt={1}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h6" gutterBottom>المعلومات الشخصية</Typography>
                                        <Typography><strong>الاسم:</strong> {selectedDoctor.firstName} {selectedDoctor.lastName}</Typography>
                                        <Typography><strong>رقم الطبيب:</strong> {selectedDoctor.doctorId}</Typography>
                                        <Typography><strong>التخصص:</strong> {getSpecializationArabic(selectedDoctor.specialization)}</Typography>
                                        <Typography><strong>القسم:</strong> {selectedDoctor.department}</Typography>
                                        <Typography><strong>سنوات الخبرة:</strong> {selectedDoctor.yearsOfExperience} سنة</Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h6" gutterBottom>معلومات الاتصال</Typography>
                                        <Typography><strong>الهاتف:</strong> {selectedDoctor.phone}</Typography>
                                        <Typography><strong>البريد الإلكتروني:</strong> {selectedDoctor.email}</Typography>
                                        <Typography><strong>رسوم الاستشارة:</strong> {selectedDoctor.consultationFee} ريال</Typography>
                                        <Typography><strong>رقم الرخصة:</strong> {selectedDoctor.licenseNumber}</Typography>
                                    </Grid>
                                </Grid>
                            )}

                            {tabValue === 1 && (
                                <Box mt={2}>
                                    <Typography variant="h6" gutterBottom>السيرة الذاتية</Typography>
                                    <Typography>{selectedDoctor.biography || 'لم يتم إدخال سيرة ذاتية بعد'}</Typography>
                                </Box>
                            )}

                            {tabValue === 2 && (
                                <Box mt={2}>
                                    <Typography variant="h6" gutterBottom>التقييمات والمراجعات</Typography>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <StarIcon sx={{ color: '#ffa726', mr: 1 }} />
                                        <Typography variant="h6">
                                            {selectedDoctor.ratings?.averageRating || 0} من 5
                                        </Typography>
                                        <Typography variant="body2" sx={{ ml: 2 }}>
                                            ({selectedDoctor.ratings?.totalReviews || 0} تقييم)
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>إغلاق</Button>
                    <Button variant="contained">تعديل</Button>
                </DialogActions>
            </Dialog>

            {/* Schedule Dialog */}
            <Dialog
                open={scheduleDialogOpen}
                onClose={() => setScheduleDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    جدول عمل {selectedDoctor?.firstName} {selectedDoctor?.lastName}
                </DialogTitle>
                <DialogContent>
                    {selectedDoctor?.schedule && selectedDoctor.schedule.length > 0 ? (
                        <List>
                            {selectedDoctor.schedule.map((day, index) => (
                                <ListItem key={index}>
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: day.isAvailable ? 'success.main' : 'grey.500' }}>
                                            <TimeIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={`${day.dayOfWeek === 'sunday' ? 'الأحد' :
                                            day.dayOfWeek === 'monday' ? 'الإثنين' :
                                                day.dayOfWeek === 'tuesday' ? 'الثلاثاء' :
                                                    day.dayOfWeek === 'wednesday' ? 'الأربعاء' :
                                                        day.dayOfWeek === 'thursday' ? 'الخميس' :
                                                            day.dayOfWeek === 'friday' ? 'الجمعة' : 'السبت'}`}
                                        secondary={`${day.startTime} - ${day.endTime} ${day.isAvailable ? '(متاح)' : '(غير متاح)'}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography>لم يتم تحديد جدول عمل بعد</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setScheduleDialogOpen(false)}>إغلاق</Button>
                    <Button variant="contained">تعديل الجدول</Button>
                </DialogActions>
            </Dialog>

            {/* Add Doctor Dialog */}
            <Dialog
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>إضافة طبيب جديد</DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} mt={1}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="الاسم الأول"
                                value={newDoctor.firstName}
                                onChange={(e) => setNewDoctor({ ...newDoctor, firstName: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="اسم العائلة"
                                value={newDoctor.lastName}
                                onChange={(e) => setNewDoctor({ ...newDoctor, lastName: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>التخصص</InputLabel>
                                <Select
                                    value={newDoctor.specialization}
                                    label="التخصص"
                                    onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                                >
                                    {specializations.map((spec) => (
                                        <MenuItem key={spec} value={spec}>
                                            {getSpecializationArabic(spec)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="رقم الهاتف"
                                value={newDoctor.phone}
                                onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="البريد الإلكتروني"
                                type="email"
                                value={newDoctor.email}
                                onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="سنوات الخبرة"
                                type="number"
                                value={newDoctor.yearsOfExperience}
                                onChange={(e) => setNewDoctor({ ...newDoctor, yearsOfExperience: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="رقم الرخصة"
                                value={newDoctor.licenseNumber}
                                onChange={(e) => setNewDoctor({ ...newDoctor, licenseNumber: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="القسم"
                                value={newDoctor.department}
                                onChange={(e) => setNewDoctor({ ...newDoctor, department: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="السيرة الذاتية"
                                multiline
                                rows={3}
                                value={newDoctor.biography}
                                onChange={(e) => setNewDoctor({ ...newDoctor, biography: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddDialogOpen(false)}>إلغاء</Button>
                    <Button variant="contained" onClick={handleAddDoctor}>إضافة</Button>
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

export default Doctors; 