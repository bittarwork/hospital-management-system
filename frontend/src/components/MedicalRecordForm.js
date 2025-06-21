import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Autocomplete,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Divider,
    Alert,
    Snackbar,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Avatar,
    Badge
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    LocalHospital as MedicalIcon,
    Person as PersonIcon,
    Medication as MedicationIcon,
    Warning as AllergyIcon,
    Assignment as DiagnosisIcon,
    Science as LabIcon,
    Radiology as RadiologyIcon,
    Insights as VitalsIcon,
    Notes as NotesIcon,
    History as HistoryIcon,
    Print as PrintIcon,
    Preview as PreviewIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { medicalRecordsAPI } from '../services/api';

const MedicalRecordForm = ({
    open,
    onClose,
    selectedAppointment = null,
    patient = null,
    doctor = null,
    onSuccess
}) => {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [medicalRecord, setMedicalRecord] = useState({
        patientId: patient?._id || selectedAppointment?.patient?._id || '',
        doctorId: doctor?._id || selectedAppointment?.doctor?._id || '',
        appointmentId: selectedAppointment?._id || '',
        visitDate: dayjs(),
        chiefComplaint: selectedAppointment?.reasonForVisit || '',
        historyOfPresentIllness: '',
        pastMedicalHistory: '',
        familyHistory: '',
        socialHistory: '',
        allergies: [],
        currentMedications: [],
        physicalExamination: {
            general: '',
            vitals: {
                bloodPressure: '',
                heartRate: '',
                temperature: '',
                respiratoryRate: '',
                oxygenSaturation: '',
                weight: '',
                height: '',
                bmi: ''
            },
            systems: {
                cardiovascular: '',
                respiratory: '',
                gastrointestinal: '',
                neurological: '',
                musculoskeletal: '',
                dermatological: ''
            }
        },
        diagnoses: [],
        treatmentPlan: '',
        prescriptions: [],
        labOrders: [],
        radiologyOrders: [],
        followUpInstructions: '',
        nextVisitDate: null,
        notes: '',
        status: 'draft'
    });

    const [newDiagnosis, setNewDiagnosis] = useState({
        icdCode: '',
        description: '',
        type: 'primary',
        severity: 'mild',
        notes: ''
    });

    const [newPrescription, setNewPrescription] = useState({
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        refills: 0
    });

    const [newAllergy, setNewAllergy] = useState({
        allergen: '',
        reaction: '',
        severity: 'mild',
        dateDiscovered: dayjs()
    });

    const [diagnosisDialogOpen, setDiagnosisDialogOpen] = useState(false);
    const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false);
    const [allergyDialogOpen, setAllergyDialogOpen] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    const icdCodes = [
        { code: 'I10', description: 'Essential (primary) hypertension - ارتفاع ضغط الدم الأساسي' },
        { code: 'E11', description: 'Type 2 diabetes mellitus - السكري من النوع الثاني' },
        { code: 'J44', description: 'Other chronic obstructive pulmonary disease - مرض الانسداد الرئوي المزمن' },
        { code: 'M79.3', description: 'Panniculitis, unspecified - التهاب النسيج الضام' },
        { code: 'R50', description: 'Fever, unspecified - الحمى غير المحددة' },
        { code: 'K59.00', description: 'Constipation, unspecified - الإمساك' },
        { code: 'M25.50', description: 'Pain in unspecified joint - ألم في المفاصل' },
        { code: 'R06.00', description: 'Dyspnea, unspecified - ضيق التنفس' }
    ];

    const commonMedications = [
        'Paracetamol - باراسيتامول',
        'Ibuprofen - إيبوبروفين',
        'Amoxicillin - أموكسيسيللين',
        'Metformin - ميتفورمين',
        'Amlodipine - أملوديبين',
        'Atorvastatin - أتورفاستاتين',
        'Lisinopril - ليسينوبريل',
        'Omeprazole - أوميبرازول'
    ];

    const frequencies = [
        'Once daily - مرة يومياً',
        'Twice daily - مرتين يومياً',
        'Three times daily - ثلاث مرات يومياً',
        'Four times daily - أربع مرات يومياً',
        'Every 6 hours - كل 6 ساعات',
        'Every 8 hours - كل 8 ساعات',
        'Every 12 hours - كل 12 ساعة',
        'As needed - عند الحاجة'
    ];

    useEffect(() => {
        if (selectedAppointment || patient) {
            setMedicalRecord(prev => ({
                ...prev,
                patientId: patient?._id || selectedAppointment?.patient?._id || '',
                doctorId: doctor?._id || selectedAppointment?.doctor?._id || '',
                appointmentId: selectedAppointment?._id || '',
                chiefComplaint: selectedAppointment?.reasonForVisit || ''
            }));
        }
    }, [selectedAppointment, patient, doctor]);

    const handleSave = async (status = 'draft') => {
        try {
            setLoading(true);
            const recordData = {
                ...medicalRecord,
                status,
                visitDate: medicalRecord.visitDate.format('YYYY-MM-DD'),
                nextVisitDate: medicalRecord.nextVisitDate ?
                    medicalRecord.nextVisitDate.format('YYYY-MM-DD') : null
            };

            const response = await medicalRecordsAPI.create(recordData);

            setSnackbar({
                open: true,
                message: status === 'draft' ? 'تم حفظ المسودة' : 'تم حفظ السجل الطبي بنجاح',
                severity: 'success'
            });

            if (onSuccess) {
                onSuccess(response.data);
            }

            if (status === 'completed') {
                onClose();
            }
        } catch (error) {
            console.error('Error saving medical record:', error);
            setSnackbar({
                open: true,
                message: 'خطأ في حفظ السجل الطبي',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddDiagnosis = () => {
        if (newDiagnosis.description) {
            setMedicalRecord(prev => ({
                ...prev,
                diagnoses: [...prev.diagnoses, { ...newDiagnosis, id: Date.now() }]
            }));
            setNewDiagnosis({
                icdCode: '',
                description: '',
                type: 'primary',
                severity: 'mild',
                notes: ''
            });
            setDiagnosisDialogOpen(false);
        }
    };

    const handleRemoveDiagnosis = (id) => {
        setMedicalRecord(prev => ({
            ...prev,
            diagnoses: prev.diagnoses.filter(d => d.id !== id)
        }));
    };

    const handleAddPrescription = () => {
        if (newPrescription.medication && newPrescription.dosage) {
            setMedicalRecord(prev => ({
                ...prev,
                prescriptions: [...prev.prescriptions, { ...newPrescription, id: Date.now() }]
            }));
            setNewPrescription({
                medication: '',
                dosage: '',
                frequency: '',
                duration: '',
                instructions: '',
                refills: 0
            });
            setPrescriptionDialogOpen(false);
        }
    };

    const handleRemovePrescription = (id) => {
        setMedicalRecord(prev => ({
            ...prev,
            prescriptions: prev.prescriptions.filter(p => p.id !== id)
        }));
    };

    const handleAddAllergy = () => {
        if (newAllergy.allergen) {
            setMedicalRecord(prev => ({
                ...prev,
                allergies: [...prev.allergies, {
                    ...newAllergy,
                    id: Date.now(),
                    dateDiscovered: newAllergy.dateDiscovered.format('YYYY-MM-DD')
                }]
            }));
            setNewAllergy({
                allergen: '',
                reaction: '',
                severity: 'mild',
                dateDiscovered: dayjs()
            });
            setAllergyDialogOpen(false);
        }
    };

    const handleRemoveAllergy = (id) => {
        setMedicalRecord(prev => ({
            ...prev,
            allergies: prev.allergies.filter(a => a.id !== id)
        }));
    };

    const calculateBMI = () => {
        const weight = parseFloat(medicalRecord.physicalExamination.vitals.weight);
        const height = parseFloat(medicalRecord.physicalExamination.vitals.height) / 100; // Convert cm to m

        if (weight && height) {
            const bmi = (weight / (height * height)).toFixed(1);
            setMedicalRecord(prev => ({
                ...prev,
                physicalExamination: {
                    ...prev.physicalExamination,
                    vitals: {
                        ...prev.physicalExamination.vitals,
                        bmi: bmi
                    }
                }
            }));
        }
    };

    const renderBasicInfo = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>معلومات المريض</Typography>
                <Typography><strong>الاسم:</strong> {patient?.firstName || selectedAppointment?.patient?.firstName} {patient?.lastName || selectedAppointment?.patient?.lastName}</Typography>
                <Typography><strong>الهاتف:</strong> {patient?.phone || selectedAppointment?.patient?.phone}</Typography>
                <Typography><strong>رقم المريض:</strong> {patient?.patientId || selectedAppointment?.patient?.patientId}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>معلومات الطبيب</Typography>
                <Typography><strong>الاسم:</strong> {doctor?.firstName || selectedAppointment?.doctor?.firstName} {doctor?.lastName || selectedAppointment?.doctor?.lastName}</Typography>
                <Typography><strong>التخصص:</strong> {doctor?.specialization || selectedAppointment?.doctor?.specialization}</Typography>
                <Typography><strong>رقم الطبيب:</strong> {doctor?.doctorId || selectedAppointment?.doctor?.doctorId}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
                <DatePicker
                    label="تاريخ الزيارة"
                    value={medicalRecord.visitDate}
                    onChange={(newValue) => setMedicalRecord(prev => ({ ...prev, visitDate: newValue }))}
                    slotProps={{ textField: { fullWidth: true } }}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="الشكوى الرئيسية"
                    multiline
                    rows={3}
                    value={medicalRecord.chiefComplaint}
                    onChange={(e) => setMedicalRecord(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="تاريخ المرض الحالي"
                    multiline
                    rows={4}
                    value={medicalRecord.historyOfPresentIllness}
                    onChange={(e) => setMedicalRecord(prev => ({ ...prev, historyOfPresentIllness: e.target.value }))}
                />
            </Grid>
        </Grid>
    );

    const renderVitalsAndExam = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>العلامات الحيوية</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
                <TextField
                    fullWidth
                    label="ضغط الدم"
                    placeholder="120/80"
                    value={medicalRecord.physicalExamination.vitals.bloodPressure}
                    onChange={(e) => setMedicalRecord(prev => ({
                        ...prev,
                        physicalExamination: {
                            ...prev.physicalExamination,
                            vitals: { ...prev.physicalExamination.vitals, bloodPressure: e.target.value }
                        }
                    }))}
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <TextField
                    fullWidth
                    label="نبضات القلب"
                    placeholder="72"
                    type="number"
                    value={medicalRecord.physicalExamination.vitals.heartRate}
                    onChange={(e) => setMedicalRecord(prev => ({
                        ...prev,
                        physicalExamination: {
                            ...prev.physicalExamination,
                            vitals: { ...prev.physicalExamination.vitals, heartRate: e.target.value }
                        }
                    }))}
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <TextField
                    fullWidth
                    label="درجة الحرارة (°C)"
                    placeholder="37.0"
                    type="number"
                    step="0.1"
                    value={medicalRecord.physicalExamination.vitals.temperature}
                    onChange={(e) => setMedicalRecord(prev => ({
                        ...prev,
                        physicalExamination: {
                            ...prev.physicalExamination,
                            vitals: { ...prev.physicalExamination.vitals, temperature: e.target.value }
                        }
                    }))}
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <TextField
                    fullWidth
                    label="معدل التنفس"
                    placeholder="16"
                    type="number"
                    value={medicalRecord.physicalExamination.vitals.respiratoryRate}
                    onChange={(e) => setMedicalRecord(prev => ({
                        ...prev,
                        physicalExamination: {
                            ...prev.physicalExamination,
                            vitals: { ...prev.physicalExamination.vitals, respiratoryRate: e.target.value }
                        }
                    }))}
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <TextField
                    fullWidth
                    label="تشبع الأكسجين (%)"
                    placeholder="98"
                    type="number"
                    value={medicalRecord.physicalExamination.vitals.oxygenSaturation}
                    onChange={(e) => setMedicalRecord(prev => ({
                        ...prev,
                        physicalExamination: {
                            ...prev.physicalExamination,
                            vitals: { ...prev.physicalExamination.vitals, oxygenSaturation: e.target.value }
                        }
                    }))}
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <TextField
                    fullWidth
                    label="الوزن (كغ)"
                    placeholder="70"
                    type="number"
                    value={medicalRecord.physicalExamination.vitals.weight}
                    onChange={(e) => {
                        setMedicalRecord(prev => ({
                            ...prev,
                            physicalExamination: {
                                ...prev.physicalExamination,
                                vitals: { ...prev.physicalExamination.vitals, weight: e.target.value }
                            }
                        }));
                        setTimeout(calculateBMI, 100);
                    }}
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <TextField
                    fullWidth
                    label="الطول (سم)"
                    placeholder="170"
                    type="number"
                    value={medicalRecord.physicalExamination.vitals.height}
                    onChange={(e) => {
                        setMedicalRecord(prev => ({
                            ...prev,
                            physicalExamination: {
                                ...prev.physicalExamination,
                                vitals: { ...prev.physicalExamination.vitals, height: e.target.value }
                            }
                        }));
                        setTimeout(calculateBMI, 100);
                    }}
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <TextField
                    fullWidth
                    label="مؤشر كتلة الجسم"
                    value={medicalRecord.physicalExamination.vitals.bmi}
                    InputProps={{ readOnly: true }}
                />
            </Grid>
        </Grid>
    );

    const renderDiagnoses = () => (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">التشخيص</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setDiagnosisDialogOpen(true)}
                >
                    إضافة تشخيص
                </Button>
            </Box>

            {medicalRecord.diagnoses.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>رمز ICD</TableCell>
                                <TableCell>الوصف</TableCell>
                                <TableCell>النوع</TableCell>
                                <TableCell>الشدة</TableCell>
                                <TableCell>الإجراءات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {medicalRecord.diagnoses.map((diagnosis) => (
                                <TableRow key={diagnosis.id}>
                                    <TableCell>{diagnosis.icdCode}</TableCell>
                                    <TableCell>{diagnosis.description}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={diagnosis.type === 'primary' ? 'أساسي' : 'ثانوي'}
                                            color={diagnosis.type === 'primary' ? 'primary' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={diagnosis.severity === 'mild' ? 'خفيف' :
                                                diagnosis.severity === 'moderate' ? 'متوسط' : 'شديد'}
                                            color={diagnosis.severity === 'mild' ? 'success' :
                                                diagnosis.severity === 'moderate' ? 'warning' : 'error'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleRemoveDiagnosis(diagnosis.id)}
                                            size="small"
                                        >
                                            <RemoveIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Alert severity="info">لم يتم إضافة أي تشخيص بعد</Alert>
            )}
        </Box>
    );

    const renderPrescriptions = () => (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">الوصفات الطبية</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setPrescriptionDialogOpen(true)}
                >
                    إضافة دواء
                </Button>
            </Box>

            {medicalRecord.prescriptions.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>الدواء</TableCell>
                                <TableCell>الجرعة</TableCell>
                                <TableCell>التكرار</TableCell>
                                <TableCell>المدة</TableCell>
                                <TableCell>الإجراءات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {medicalRecord.prescriptions.map((prescription) => (
                                <TableRow key={prescription.id}>
                                    <TableCell>{prescription.medication}</TableCell>
                                    <TableCell>{prescription.dosage}</TableCell>
                                    <TableCell>{prescription.frequency}</TableCell>
                                    <TableCell>{prescription.duration}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleRemovePrescription(prescription.id)}
                                            size="small"
                                        >
                                            <RemoveIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Alert severity="info">لم يتم إضافة أي وصفة طبية بعد</Alert>
            )}
        </Box>
    );

    const renderTreatmentPlan = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="خطة العلاج"
                    multiline
                    rows={6}
                    value={medicalRecord.treatmentPlan}
                    onChange={(e) => setMedicalRecord(prev => ({ ...prev, treatmentPlan: e.target.value }))}
                    placeholder="اكتب خطة العلاج التفصيلية..."
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="تعليمات المتابعة"
                    multiline
                    rows={4}
                    value={medicalRecord.followUpInstructions}
                    onChange={(e) => setMedicalRecord(prev => ({ ...prev, followUpInstructions: e.target.value }))}
                    placeholder="تعليمات للمريض للمتابعة..."
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <DatePicker
                    label="موعد الزيارة القادمة"
                    value={medicalRecord.nextVisitDate}
                    onChange={(newValue) => setMedicalRecord(prev => ({ ...prev, nextVisitDate: newValue }))}
                    slotProps={{ textField: { fullWidth: true } }}
                    minDate={dayjs().add(1, 'day')}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="ملاحظات إضافية"
                    multiline
                    rows={3}
                    value={medicalRecord.notes}
                    onChange={(e) => setMedicalRecord(prev => ({ ...prev, notes: e.target.value }))}
                />
            </Grid>
        </Grid>
    );

    const renderTabContent = () => {
        switch (tabValue) {
            case 0: return renderBasicInfo();
            case 1: return renderVitalsAndExam();
            case 2: return renderDiagnoses();
            case 3: return renderPrescriptions();
            case 4: return renderTreatmentPlan();
            default: return null;
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6">السجل الطبي</Typography>
                        <Box>
                            <Button
                                startIcon={<PreviewIcon />}
                                onClick={() => setPreviewMode(!previewMode)}
                                sx={{ mr: 1 }}
                            >
                                {previewMode ? 'تحرير' : 'معاينة'}
                            </Button>
                            <Button
                                startIcon={<PrintIcon />}
                                disabled={medicalRecord.status === 'draft'}
                            >
                                طباعة
                            </Button>
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Tabs
                            value={tabValue}
                            onChange={(e, newValue) => setTabValue(newValue)}
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            <Tab label="المعلومات الأساسية" />
                            <Tab label="الفحص والعلامات الحيوية" />
                            <Tab label="التشخيص" />
                            <Tab label="الوصفات الطبية" />
                            <Tab label="خطة العلاج" />
                        </Tabs>

                        <Box sx={{ mt: 3 }}>
                            {renderTabContent()}
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>
                        إغلاق
                    </Button>
                    <Button
                        onClick={() => handleSave('draft')}
                        disabled={loading}
                        variant="outlined"
                    >
                        حفظ كمسودة
                    </Button>
                    <Button
                        onClick={() => handleSave('completed')}
                        disabled={loading}
                        variant="contained"
                        startIcon={<SaveIcon />}
                    >
                        حفظ وإنهاء
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diagnosis Dialog */}
            <Dialog open={diagnosisDialogOpen} onClose={() => setDiagnosisDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>إضافة تشخيص</DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                options={icdCodes}
                                getOptionLabel={(option) => `${option.code} - ${option.description}`}
                                onChange={(event, newValue) => {
                                    if (newValue) {
                                        setNewDiagnosis(prev => ({
                                            ...prev,
                                            icdCode: newValue.code,
                                            description: newValue.description
                                        }));
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="رمز التشخيص ICD-10" fullWidth />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>نوع التشخيص</InputLabel>
                                <Select
                                    value={newDiagnosis.type}
                                    label="نوع التشخيص"
                                    onChange={(e) => setNewDiagnosis(prev => ({ ...prev, type: e.target.value }))}
                                >
                                    <MenuItem value="primary">أساسي</MenuItem>
                                    <MenuItem value="secondary">ثانوي</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>شدة الحالة</InputLabel>
                                <Select
                                    value={newDiagnosis.severity}
                                    label="شدة الحالة"
                                    onChange={(e) => setNewDiagnosis(prev => ({ ...prev, severity: e.target.value }))}
                                >
                                    <MenuItem value="mild">خفيف</MenuItem>
                                    <MenuItem value="moderate">متوسط</MenuItem>
                                    <MenuItem value="severe">شديد</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="ملاحظات التشخيص"
                                multiline
                                rows={3}
                                value={newDiagnosis.notes}
                                onChange={(e) => setNewDiagnosis(prev => ({ ...prev, notes: e.target.value }))}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDiagnosisDialogOpen(false)}>إلغاء</Button>
                    <Button onClick={handleAddDiagnosis} variant="contained">إضافة</Button>
                </DialogActions>
            </Dialog>

            {/* Prescription Dialog */}
            <Dialog open={prescriptionDialogOpen} onClose={() => setPrescriptionDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>إضافة وصفة طبية</DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                options={commonMedications}
                                freeSolo
                                value={newPrescription.medication}
                                onChange={(event, newValue) => setNewPrescription(prev => ({ ...prev, medication: newValue || '' }))}
                                renderInput={(params) => (
                                    <TextField {...params} label="اسم الدواء" fullWidth />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="الجرعة"
                                value={newPrescription.dosage}
                                onChange={(e) => setNewPrescription(prev => ({ ...prev, dosage: e.target.value }))}
                                placeholder="مثال: 500mg"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                options={frequencies}
                                value={newPrescription.frequency}
                                onChange={(event, newValue) => setNewPrescription(prev => ({ ...prev, frequency: newValue || '' }))}
                                renderInput={(params) => (
                                    <TextField {...params} label="التكرار" fullWidth />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="المدة"
                                value={newPrescription.duration}
                                onChange={(e) => setNewPrescription(prev => ({ ...prev, duration: e.target.value }))}
                                placeholder="مثال: 7 أيام"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="تعليمات الاستخدام"
                                multiline
                                rows={3}
                                value={newPrescription.instructions}
                                onChange={(e) => setNewPrescription(prev => ({ ...prev, instructions: e.target.value }))}
                                placeholder="تعليمات خاصة للمريض..."
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPrescriptionDialogOpen(false)}>إلغاء</Button>
                    <Button onClick={handleAddPrescription} variant="contained">إضافة</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default MedicalRecordForm; 