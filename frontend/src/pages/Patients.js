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
    Fab,
    Tooltip,
    Alert,
    Snackbar
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Download as DownloadIcon,
    PersonAdd as PersonAddIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    LocationOn as LocationIcon,
    Cake as CakeIcon,
    LocalHospital as MedicalIcon
} from '@mui/icons-material';
import axios from 'axios';

const Patients = () => {
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [newPatient, setNewPatient] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        dateOfBirth: '',
        gender: '',
        address: {
            street: '',
            city: '',
            country: 'Saudi Arabia'
        },
        emergencyContact: {
            name: '',
            phone: '',
            relationship: ''
        }
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        filterPatients();
    }, [patients, searchTerm, filterStatus]);

    const fetchPatients = async () => {
        try {
            const response = await axios.get('/api/patients');
            const patientsData = response.data.data.patients || [];

            // Mock data if API returns empty
            const mockPatients = patientsData.length ? patientsData : [
                {
                    _id: '1',
                    firstName: 'أحمد',
                    lastName: 'محمد العتيبي',
                    phone: '+966501234567',
                    email: 'ahmed@email.com',
                    dateOfBirth: '1985-05-15',
                    gender: 'male',
                    status: 'active',
                    patientId: 'P20240001',
                    registrationDate: '2024-01-15',
                    address: { city: 'الرياض' },
                    emergencyContact: { name: 'سارة العتيبي', phone: '+966509876543' }
                },
                {
                    _id: '2',
                    firstName: 'فاطمة',
                    lastName: 'علي الزهراني',
                    phone: '+966502345678',
                    email: 'fatima@email.com',
                    dateOfBirth: '1990-08-22',
                    gender: 'female',
                    status: 'active',
                    patientId: 'P20240002',
                    registrationDate: '2024-02-10',
                    address: { city: 'جدة' },
                    emergencyContact: { name: 'علي الزهراني', phone: '+966508765432' }
                },
                {
                    _id: '3',
                    firstName: 'محمد',
                    lastName: 'سعد القحطاني',
                    phone: '+966503456789',
                    email: 'mohammed@email.com',
                    dateOfBirth: '1978-12-03',
                    gender: 'male',
                    status: 'inactive',
                    patientId: 'P20240003',
                    registrationDate: '2024-03-05',
                    address: { city: 'الدمام' },
                    emergencyContact: { name: 'نورا القحطاني', phone: '+966507654321' }
                }
            ];

            setPatients(mockPatients);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching patients:', error);
            setLoading(false);
            setSnackbar({
                open: true,
                message: 'خطأ في تحميل بيانات المرضى',
                severity: 'error'
            });
        }
    };

    const filterPatients = () => {
        let filtered = patients;

        if (searchTerm) {
            filtered = filtered.filter(patient =>
                patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.phone.includes(searchTerm)
            );
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter(patient => patient.status === filterStatus);
        }

        setFilteredPatients(filtered);
    };

    const handleAddPatient = async () => {
        try {
            const response = await axios.post('/api/patients', newPatient);
            setPatients([response.data.data.patient, ...patients]);
            setAddDialogOpen(false);
            setNewPatient({
                firstName: '',
                lastName: '',
                phone: '',
                email: '',
                dateOfBirth: '',
                gender: '',
                address: { street: '', city: '', country: 'Saudi Arabia' },
                emergencyContact: { name: '', phone: '', relationship: '' }
            });
            setSnackbar({
                open: true,
                message: 'تم إضافة المريض بنجاح',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error adding patient:', error);
            setSnackbar({
                open: true,
                message: 'خطأ في إضافة المريض',
                severity: 'error'
            });
        }
    };

    const handleMenuClick = (event, patient) => {
        setMenuAnchor(event.currentTarget);
        setSelectedPatient(patient);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setSelectedPatient(null);
    };

    const handleViewPatient = () => {
        setDialogOpen(true);
        handleMenuClose();
    };

    const calculateAge = (dateOfBirth) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'inactive': return 'default';
            case 'deceased': return 'error';
            default: return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active': return 'نشط';
            case 'inactive': return 'غير نشط';
            case 'deceased': return 'متوفي';
            default: return status;
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        إدارة المرضى 👥
                    </Typography>
                    <Typography variant="h6" color="textSecondary">
                        إدارة شاملة لجميع المرضى في المستشفى
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setAddDialogOpen(true)}
                    sx={{ borderRadius: 3, px: 3 }}
                >
                    مريض جديد
                </Button>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ textAlign: 'center', py: 2 }}>
                        <CardContent>
                            <Typography variant="h3" color="primary" fontWeight="bold">
                                {patients.length}
                            </Typography>
                            <Typography variant="h6" color="textSecondary">
                                إجمالي المرضى
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ textAlign: 'center', py: 2 }}>
                        <CardContent>
                            <Typography variant="h3" color="success.main" fontWeight="bold">
                                {patients.filter(p => p.status === 'active').length}
                            </Typography>
                            <Typography variant="h6" color="textSecondary">
                                المرضى النشطون
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ textAlign: 'center', py: 2 }}>
                        <CardContent>
                            <Typography variant="h3" color="warning.main" fontWeight="bold">
                                {new Date().toLocaleDateString('ar-SA')}
                            </Typography>
                            <Typography variant="h6" color="textSecondary">
                                تاريخ اليوم
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Card sx={{ textAlign: 'center', py: 2 }}>
                        <CardContent>
                            <Typography variant="h3" color="secondary.main" fontWeight="bold">
                                15
                            </Typography>
                            <Typography variant="h6" color="textSecondary">
                                مرضى جدد هذا الشهر
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Search and Filter */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="البحث بالاسم، رقم المريض، أو رقم الهاتف..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>حالة المريض</InputLabel>
                                <Select
                                    value={filterStatus}
                                    label="حالة المريض"
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <MenuItem value="all">جميع الحالات</MenuItem>
                                    <MenuItem value="active">نشط</MenuItem>
                                    <MenuItem value="inactive">غير نشط</MenuItem>
                                    <MenuItem value="deceased">متوفي</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                sx={{ height: 56 }}
                            >
                                تصدير البيانات
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Patients Table */}
            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell>المريض</TableCell>
                                <TableCell>معلومات الاتصال</TableCell>
                                <TableCell>العمر</TableCell>
                                <TableCell>المدينة</TableCell>
                                <TableCell>تاريخ التسجيل</TableCell>
                                <TableCell>الحالة</TableCell>
                                <TableCell align="center">الإجراءات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredPatients
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((patient) => (
                                    <TableRow key={patient._id} hover>
                                        <TableCell>
                                            <Box display="flex" alignItems="center">
                                                <Avatar
                                                    sx={{
                                                        bgcolor: patient.gender === 'male' ? '#1976d2' : '#e91e63',
                                                        mr: 2,
                                                        width: 40,
                                                        height: 40
                                                    }}
                                                >
                                                    {patient.firstName.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {patient.firstName} {patient.lastName}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {patient.patientId}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Box display="flex" alignItems="center" mb={0.5}>
                                                    <PhoneIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                                    <Typography variant="body2">{patient.phone}</Typography>
                                                </Box>
                                                {patient.email && (
                                                    <Box display="flex" alignItems="center">
                                                        <EmailIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                                        <Typography variant="body2">{patient.email}</Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center">
                                                <CakeIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                                <Typography variant="body2">
                                                    {calculateAge(patient.dateOfBirth)} سنة
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center">
                                                <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                                <Typography variant="body2">{patient.address?.city}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {new Date(patient.registrationDate).toLocaleDateString('ar-SA')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getStatusText(patient.status)}
                                                color={getStatusColor(patient.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                onClick={(e) => handleMenuClick(e, patient)}
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
                    count={filteredPatients.length}
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
                <MenuItem onClick={handleViewPatient}>
                    <ViewIcon sx={{ mr: 1 }} />
                    عرض التفاصيل
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                    <EditIcon sx={{ mr: 1 }} />
                    تعديل
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                    <MedicalIcon sx={{ mr: 1 }} />
                    السجل الطبي
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
                    <DeleteIcon sx={{ mr: 1 }} />
                    حذف
                </MenuItem>
            </Menu>

            {/* Patient Details Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    تفاصيل المريض
                </DialogTitle>
                <DialogContent>
                    {selectedPatient && (
                        <Grid container spacing={3} mt={1}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>المعلومات الشخصية</Typography>
                                <Typography><strong>الاسم:</strong> {selectedPatient.firstName} {selectedPatient.lastName}</Typography>
                                <Typography><strong>رقم المريض:</strong> {selectedPatient.patientId}</Typography>
                                <Typography><strong>الجنس:</strong> {selectedPatient.gender === 'male' ? 'ذكر' : 'أنثى'}</Typography>
                                <Typography><strong>العمر:</strong> {calculateAge(selectedPatient.dateOfBirth)} سنة</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>معلومات الاتصال</Typography>
                                <Typography><strong>الهاتف:</strong> {selectedPatient.phone}</Typography>
                                <Typography><strong>البريد الإلكتروني:</strong> {selectedPatient.email || 'غير محدد'}</Typography>
                                <Typography><strong>المدينة:</strong> {selectedPatient.address?.city}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>جهة الاتصال في الطوارئ</Typography>
                                <Typography><strong>الاسم:</strong> {selectedPatient.emergencyContact?.name}</Typography>
                                <Typography><strong>الهاتف:</strong> {selectedPatient.emergencyContact?.phone}</Typography>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>إغلاق</Button>
                    <Button variant="contained">تعديل</Button>
                </DialogActions>
            </Dialog>

            {/* Add Patient Dialog */}
            <Dialog
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>إضافة مريض جديد</DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} mt={1}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="الاسم الأول"
                                value={newPatient.firstName}
                                onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="اسم العائلة"
                                value={newPatient.lastName}
                                onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="رقم الهاتف"
                                value={newPatient.phone}
                                onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="البريد الإلكتروني"
                                type="email"
                                value={newPatient.email}
                                onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="تاريخ الميلاد"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={newPatient.dateOfBirth}
                                onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>الجنس</InputLabel>
                                <Select
                                    value={newPatient.gender}
                                    label="الجنس"
                                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                                >
                                    <MenuItem value="male">ذكر</MenuItem>
                                    <MenuItem value="female">أنثى</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddDialogOpen(false)}>إلغاء</Button>
                    <Button variant="contained" onClick={handleAddPatient}>إضافة</Button>
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

export default Patients; 