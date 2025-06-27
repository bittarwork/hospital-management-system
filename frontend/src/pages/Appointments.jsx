import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Clock,
  User,
  Stethoscope,
  X,
  CheckCircle,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  Activity,
  FileText,
  Download,
  Grid,
  List,
} from "lucide-react";
import {
  appointmentsAPI,
  patientsAPI,
  doctorsAPI,
  showSuccessMessage,
  handleApiError,
} from "../services/api";
import AppointmentCalendar from "../components/AppointmentCalendar";
import AppointmentExport from "../components/AppointmentExport";
import AppointmentStatusManager from "../components/AppointmentStatusManager";
import BulkStatusManager from "../components/BulkStatusManager";
import toast from "react-hot-toast";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // add, edit, view, delete, status
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentsPerPage] = useState(10);
  const [stats, setStats] = useState({});
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'calendar'
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedAppointmentIds, setSelectedAppointmentIds] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    patient: "",
    doctor: "",
    appointmentDate: "",
    appointmentTime: "",
    appointmentType: "consultation",
    status: "scheduled",
    reasonForVisit: "",
    priority: "normal",
    estimatedDuration: 30,
  });

  const appointmentTypes = [
    { value: "consultation", label: "استشارة" },
    { value: "follow-up", label: "متابعة" },
    { value: "routine-checkup", label: "فحص دوري" },
    { value: "emergency", label: "طوارئ" },
    { value: "procedure", label: "إجراء" },
    { value: "diagnostic", label: "تشخيص" },
    { value: "screening", label: "فحص" },
  ];

  const appointmentStatuses = [
    { value: "scheduled", label: "مجدول", color: "blue" },
    { value: "confirmed", label: "مؤكد", color: "green" },
    { value: "checked-in", label: "تم الوصول", color: "yellow" },
    { value: "in-progress", label: "جاري", color: "orange" },
    { value: "completed", label: "مكتمل", color: "green" },
    { value: "cancelled", label: "ملغي", color: "red" },
    { value: "no-show", label: "لم يحضر", color: "gray" },
  ];

  const priorities = [
    { value: "normal", label: "عادي", color: "gray" },
    { value: "high", label: "عالي", color: "orange" },
    { value: "urgent", label: "عاجل", color: "red" },
  ];

  // Load data on component mount
  useEffect(() => {
    loadAppointments();
    loadPatients();
    loadDoctors();
    loadStats();
  }, []);

  // Filter appointments based on search term, status, and type
  useEffect(() => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = appointments.filter((appointment) => {
        const patientName = `${appointment.patient?.firstName || ""} ${
          appointment.patient?.lastName || ""
        }`;
        const doctorName = `${appointment.doctor?.firstName || ""} ${
          appointment.doctor?.lastName || ""
        }`;

        return (
          patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.patient?.phone?.includes(searchTerm) ||
          appointment.patient?.nationalId?.includes(searchTerm) ||
          appointment.doctor?.specialization
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          appointment.reasonForVisit
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
      });
    }

    if (statusFilter) {
      filtered = filtered.filter(
        (appointment) => appointment.status === statusFilter
      );
    }

    if (typeFilter) {
      filtered = filtered.filter(
        (appointment) => appointment.appointmentType === typeFilter
      );
    }

    setFilteredAppointments(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, appointments]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      console.log("📅 Loading appointments...");
      const response = await appointmentsAPI.getAll();
      console.log("📅 Appointments response:", response.data);

      const appointmentsData =
        response.data?.data?.appointments || response.data?.data || [];
      console.log("📅 Appointments data:", appointmentsData);

      setAppointments(appointmentsData);
    } catch (error) {
      console.error("❌ Error loading appointments:", error);
      handleApiError(error, "فشل في تحميل بيانات المواعيد");
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await patientsAPI.getAll();
      console.log("👥 Patients response:", response.data);
      const patientsData =
        response.data?.data?.patients || response.data?.data || [];
      setPatients(patientsData);
    } catch (error) {
      console.error("Error loading patients:", error);
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await doctorsAPI.getAll();
      console.log("👨‍⚕️ Doctors response:", response.data);
      const doctorsData =
        response.data?.data?.doctors || response.data?.data || [];
      setDoctors(doctorsData);
    } catch (error) {
      console.error("Error loading doctors:", error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await appointmentsAPI.getStats();
      console.log("📊 Stats response:", response.data);
      setStats(response.data?.data || {});
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      patient: "",
      doctor: "",
      appointmentDate: "",
      appointmentTime: "",
      appointmentType: "consultation",
      status: "scheduled",
      reasonForVisit: "",
      priority: "normal",
      estimatedDuration: 30,
    });
  };

  const openModal = (type, appointment = null) => {
    setModalType(type);
    setSelectedAppointment(appointment);
    if (appointment && (type === "edit" || type === "view")) {
      const appointmentDateTime = new Date(appointment.appointmentDate);
      setFormData({
        patient: appointment.patient?._id || "",
        doctor: appointment.doctor?._id || "",
        appointmentDate: appointmentDateTime.toISOString().split("T")[0],
        appointmentTime: appointment.appointmentTime || "",
        appointmentType: appointment.appointmentType || "consultation",
        status: appointment.status || "scheduled",
        reasonForVisit: appointment.reasonForVisit || "",
        priority: appointment.priority || "normal",
        estimatedDuration: appointment.estimatedDuration || 30,
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType("add");
    setSelectedAppointment(null);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const appointmentData = {
        ...formData,
        appointmentDate: new Date(
          `${formData.appointmentDate}T${formData.appointmentTime}`
        ).toISOString(),
      };

      if (modalType === "add") {
        await appointmentsAPI.create(appointmentData);
        showSuccessMessage("تم إضافة الموعد بنجاح");
      } else if (modalType === "edit") {
        await appointmentsAPI.update(selectedAppointment._id, appointmentData);
        showSuccessMessage("تم تحديث الموعد بنجاح");
      }

      closeModal();
      loadAppointments();
      loadStats();
    } catch (error) {
      handleApiError(
        error,
        `فشل في ${modalType === "add" ? "إضافة" : "تحديث"} الموعد`
      );
    }
  };

  const handleDelete = async () => {
    try {
      await appointmentsAPI.delete(selectedAppointment._id);
      showSuccessMessage("تم حذف الموعد بنجاح");
      closeModal();
      loadAppointments();
      loadStats();
    } catch (error) {
      handleApiError(error, "فشل في حذف الموعد");
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await appointmentsAPI.updateStatus(appointmentId, { status: newStatus });
      showSuccessMessage("تم تحديث حالة الموعد بنجاح");
      loadAppointments();
      loadStats();
    } catch (error) {
      handleApiError(error, "فشل في تحديث حالة الموعد");
    }
  };

  const openStatusManager = (appointment) => {
    setSelectedAppointment(appointment);
    setModalType("status");
    setShowModal(true);
  };

  const handleAppointmentUpdate = (updatedAppointment) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt._id === updatedAppointment._id ? updatedAppointment : apt
      )
    );
    loadStats();
    closeModal();
  };

  // Bulk selection functions
  const handleSelectAppointment = (appointmentId) => {
    setSelectedAppointmentIds((prev) => {
      if (prev.includes(appointmentId)) {
        return prev.filter((id) => id !== appointmentId);
      } else {
        return [...prev, appointmentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedAppointmentIds.length === currentAppointments.length) {
      setSelectedAppointmentIds([]);
    } else {
      setSelectedAppointmentIds(currentAppointments.map((apt) => apt._id));
    }
  };

  const clearSelection = () => {
    setSelectedAppointmentIds([]);
  };

  const getSelectedAppointments = () => {
    return appointments.filter((apt) =>
      selectedAppointmentIds.includes(apt._id)
    );
  };

  const openBulkStatusManager = () => {
    setShowBulkStatusModal(true);
  };

  const handleBulkUpdate = () => {
    loadAppointments();
    loadStats();
    setSelectedAppointmentIds([]);
    setShowBulkStatusModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getStatusColor = (status) => {
    const statusObj = appointmentStatuses.find((s) => s.value === status);
    return statusObj ? statusObj.color : "gray";
  };

  const getStatusLabel = (status) => {
    const statusObj = appointmentStatuses.find((s) => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find((p) => p.value === priority);
    return priorityObj ? priorityObj.color : "gray";
  };

  const getTypeLabel = (type) => {
    const typeObj = appointmentTypes.find((t) => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const formatDateTime = (dateString, timeString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("ar-SA"),
      time:
        timeString ||
        date.toLocaleTimeString("ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
        }),
    };
  };

  // Pagination
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(
    indexOfFirstAppointment,
    indexOfLastAppointment
  );
  const totalPages = Math.ceil(
    filteredAppointments.length / appointmentsPerPage
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة المواعيد</h1>
            <p className="text-gray-600">
              إجمالي المواعيد: {filteredAppointments.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "calendar"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            تصدير
          </button>

          {/* Add Appointment Button */}
          <button
            onClick={() => openModal("add")}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            حجز موعد جديد
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && Object.keys(stats).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي المواعيد</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.total || 0}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">مواعيد اليوم</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.today || 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">المواعيد القادمة</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.upcoming || 0}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">المواعيد المتأخرة</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.overdue || 0}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute right-3 top-3" />
              <input
                type="text"
                placeholder="البحث عن موعد (اسم المريض، الطبيب، الهاتف)..."
                className="input-field pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field w-48"
            >
              <option value="">كل الحالات</option>
              {appointmentStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input-field w-48"
            >
              <option value="">كل الأنواع</option>
              {appointmentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              النتائج: {filteredAppointments.length}
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedAppointmentIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">
                    تم تحديد {selectedAppointmentIds.length} موعد
                  </p>
                  <p className="text-sm text-blue-700">
                    اختر إجراء لتطبيقه على المواعيد المحددة
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={openBulkStatusManager}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  إدارة الحالة
                </button>
                <button
                  onClick={clearSelection}
                  className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  إلغاء التحديد
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Area - List or Calendar */}
      {viewMode === "calendar" ? (
        <div className="space-y-6">
          <AppointmentCalendar
            onSelectDate={(date) => {
              console.log("Selected date:", date);
            }}
            onViewAppointment={(appointment) => {
              openModal("view", appointment);
            }}
            onAddAppointment={(date) => {
              // Pre-fill the form with selected date
              setFormData((prev) => ({
                ...prev,
                appointmentDate: date.toISOString().split("T")[0],
              }));
              openModal("add");
            }}
          />
        </div>
      ) : (
        <>
          {/* Appointments Table */}
          <div className="card">
            <div className="card-body p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                  <span className="mr-3">جاري التحميل...</span>
                </div>
              ) : currentAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    {searchTerm || statusFilter || typeFilter
                      ? "لا توجد نتائج"
                      : "لا يوجد مواعيد"}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm || statusFilter || typeFilter
                      ? "جرب البحث بكلمات أخرى"
                      : "ابدأ بحجز موعد جديد"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <input
                              type="checkbox"
                              checked={
                                selectedAppointmentIds.length ===
                                  currentAppointments.length &&
                                currentAppointments.length > 0
                              }
                              onChange={handleSelectAll}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            المريض
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الطبيب
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            التاريخ والوقت
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            النوع
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الحالة
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الأولوية
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentAppointments.map((appointment) => {
                          const { date, time } = formatDateTime(
                            appointment.appointmentDate,
                            appointment.appointmentTime
                          );
                          const statusColor = getStatusColor(
                            appointment.status
                          );
                          const priorityColor = getPriorityColor(
                            appointment.priority
                          );

                          return (
                            <motion.tr
                              key={appointment._id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className={`hover:bg-gray-50 ${
                                selectedAppointmentIds.includes(appointment._id)
                                  ? "bg-blue-50 border-l-4 border-blue-500"
                                  : ""
                              }`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedAppointmentIds.includes(
                                    appointment._id
                                  )}
                                  onChange={() =>
                                    handleSelectAppointment(appointment._id)
                                  }
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-green-600" />
                                  </div>
                                  <div className="mr-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {appointment.patient
                                        ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                                        : "غير محدد"}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {appointment.patient?.phone || ""}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Stethoscope className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div className="mr-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {appointment.doctor
                                        ? `د. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                                        : "غير محدد"}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {appointment.doctor?.specialization || ""}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {date}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {time}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                  {getTypeLabel(appointment.appointmentType)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => openStatusManager(appointment)}
                                  className={`px-3 py-1 text-xs rounded-full font-medium transition-all hover:shadow-sm ${
                                    statusColor === "green"
                                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                                      : statusColor === "blue"
                                      ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                      : statusColor === "yellow"
                                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                      : statusColor === "orange"
                                      ? "bg-orange-100 text-orange-800 hover:bg-orange-200"
                                      : statusColor === "red"
                                      ? "bg-red-100 text-red-800 hover:bg-red-200"
                                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                  }`}
                                  title="إدارة حالة الموعد"
                                >
                                  {getStatusLabel(appointment.status)}
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    priorityColor === "red"
                                      ? "bg-red-100 text-red-800"
                                      : priorityColor === "orange"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {priorities.find(
                                    (p) => p.value === appointment.priority
                                  )?.label || appointment.priority}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      openModal("view", appointment)
                                    }
                                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                    title="عرض التفاصيل"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      openStatusManager(appointment)
                                    }
                                    className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                                    title="إدارة الحالة"
                                  >
                                    <Activity className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      openModal("edit", appointment)
                                    }
                                    className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                    title="تعديل الموعد"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>

                                  {/* Quick Status Actions */}
                                  {appointment.status === "scheduled" && (
                                    <button
                                      onClick={() =>
                                        handleStatusUpdate(
                                          appointment._id,
                                          "confirmed"
                                        )
                                      }
                                      className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                      title="تأكيد سريع"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                  )}
                                  {appointment.status === "confirmed" && (
                                    <button
                                      onClick={() =>
                                        handleStatusUpdate(
                                          appointment._id,
                                          "checked-in"
                                        )
                                      }
                                      className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50"
                                      title="تسجيل وصول سريع"
                                    >
                                      <UserCheck className="w-4 h-4" />
                                    </button>
                                  )}
                                  {appointment.status === "checked-in" && (
                                    <button
                                      onClick={() =>
                                        handleStatusUpdate(
                                          appointment._id,
                                          "in-progress"
                                        )
                                      }
                                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                      title="بدء الكشف"
                                    >
                                      <Activity className="w-4 h-4" />
                                    </button>
                                  )}

                                  <button
                                    onClick={() =>
                                      openModal("delete", appointment)
                                    }
                                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                    title="حذف الموعد"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="px-6 py-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          عرض {indexOfFirstAppointment + 1} إلى{" "}
                          {Math.min(
                            indexOfLastAppointment,
                            filteredAppointments.length
                          )}{" "}
                          من {filteredAppointments.length} موعد
                        </div>
                        <div className="flex items-center gap-2">
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                          ).map((number) => (
                            <button
                              key={number}
                              onClick={() => paginate(number)}
                              className={`px-3 py-1 text-sm rounded ${
                                currentPage === number
                                  ? "bg-primary text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {number}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {modalType === "add" && "حجز موعد جديد"}
                  {modalType === "edit" && "تعديل الموعد"}
                  {modalType === "view" && "تفاصيل الموعد"}
                  {modalType === "delete" && "حذف الموعد"}
                  {modalType === "status" && "إدارة حالة الموعد"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalType === "status" ? (
                <AppointmentStatusManager
                  appointment={selectedAppointment}
                  onUpdate={handleAppointmentUpdate}
                  onClose={closeModal}
                />
              ) : modalType === "delete" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <div>
                      <h3 className="font-medium text-red-800">
                        تأكيد حذف الموعد
                      </h3>
                      <p className="text-red-600">
                        هل أنت متأكد من حذف هذا الموعد؟ لا يمكن التراجع عن هذا
                        الإجراء.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button onClick={closeModal} className="btn-secondary">
                      إلغاء
                    </button>
                    <button onClick={handleDelete} className="btn-danger">
                      حذف
                    </button>
                  </div>
                </div>
              ) : modalType === "view" ? (
                <div className="space-y-6">
                  {selectedAppointment && (
                    <>
                      {/* Patient Info */}
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-medium text-green-800 mb-2">
                          معلومات المريض
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">الاسم: </span>
                            <span className="font-medium">
                              {selectedAppointment.patient
                                ? `${selectedAppointment.patient.firstName} ${selectedAppointment.patient.lastName}`
                                : "غير محدد"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">الهاتف: </span>
                            <span className="font-medium">
                              {selectedAppointment.patient?.phone || "غير محدد"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Doctor Info */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium text-blue-800 mb-2">
                          معلومات الطبيب
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">الاسم: </span>
                            <span className="font-medium">
                              {selectedAppointment.doctor
                                ? `د. ${selectedAppointment.doctor.firstName} ${selectedAppointment.doctor.lastName}`
                                : "غير محدد"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">التخصص: </span>
                            <span className="font-medium">
                              {selectedAppointment.doctor?.specialization ||
                                "غير محدد"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Appointment Details */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-800 mb-2">
                          تفاصيل الموعد
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">التاريخ: </span>
                            <span className="font-medium">
                              {
                                formatDateTime(
                                  selectedAppointment.appointmentDate,
                                  selectedAppointment.appointmentTime
                                ).date
                              }
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">الوقت: </span>
                            <span className="font-medium">
                              {
                                formatDateTime(
                                  selectedAppointment.appointmentDate,
                                  selectedAppointment.appointmentTime
                                ).time
                              }
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">النوع: </span>
                            <span className="font-medium">
                              {getTypeLabel(
                                selectedAppointment.appointmentType
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">الحالة: </span>
                            <span className="font-medium">
                              {getStatusLabel(selectedAppointment.status)}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-600">سبب الزيارة: </span>
                            <span className="font-medium">
                              {selectedAppointment.reasonForVisit || "غير محدد"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        المريض *
                      </label>
                      <select
                        name="patient"
                        value={formData.patient}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        disabled={modalType === "view"}
                      >
                        <option value="">اختر المريض</option>
                        {patients.map((patient) => (
                          <option key={patient._id} value={patient._id}>
                            {patient.firstName} {patient.lastName} -{" "}
                            {patient.phone}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الطبيب *
                      </label>
                      <select
                        name="doctor"
                        value={formData.doctor}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        disabled={modalType === "view"}
                      >
                        <option value="">اختر الطبيب</option>
                        {doctors.map((doctor) => (
                          <option key={doctor._id} value={doctor._id}>
                            د. {doctor.firstName} {doctor.lastName} -{" "}
                            {doctor.specialization}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        التاريخ *
                      </label>
                      <input
                        type="date"
                        name="appointmentDate"
                        value={formData.appointmentDate}
                        onChange={handleInputChange}
                        required
                        min={new Date().toISOString().split("T")[0]}
                        className="input-field"
                        disabled={modalType === "view"}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الوقت *
                      </label>
                      <input
                        type="time"
                        name="appointmentTime"
                        value={formData.appointmentTime}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        disabled={modalType === "view"}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نوع الموعد *
                      </label>
                      <select
                        name="appointmentType"
                        value={formData.appointmentType}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        disabled={modalType === "view"}
                      >
                        {appointmentTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الأولوية
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="input-field"
                        disabled={modalType === "view"}
                      >
                        {priorities.map((priority) => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        المدة المتوقعة (دقيقة)
                      </label>
                      <input
                        type="number"
                        name="estimatedDuration"
                        value={formData.estimatedDuration}
                        onChange={handleInputChange}
                        min="15"
                        max="240"
                        step="15"
                        className="input-field"
                        disabled={modalType === "view"}
                      />
                    </div>

                    {modalType === "edit" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الحالة
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="input-field"
                        >
                          {appointmentStatuses.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      سبب الزيارة *
                    </label>
                    <textarea
                      name="reasonForVisit"
                      value={formData.reasonForVisit}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="input-field"
                      disabled={modalType === "view"}
                      placeholder="اذكر سبب الزيارة أو الأعراض..."
                    />
                  </div>

                  {modalType !== "view" && (
                    <div className="flex gap-3 justify-end">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="btn-secondary"
                      >
                        إلغاء
                      </button>
                      <button type="submit" className="btn-primary">
                        {modalType === "add" ? "حجز الموعد" : "حفظ التغييرات"}
                      </button>
                    </div>
                  )}
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <AppointmentExport
            appointments={filteredAppointments}
            filters={{
              searchTerm,
              statusFilter,
              typeFilter,
              startDate: null,
              endDate: null,
            }}
            onClose={() => setShowExportModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Bulk Status Management Modal */}
      <AnimatePresence>
        {showBulkStatusModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowBulkStatusModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  التحديث المجمع للمواعيد
                </h2>
                <button
                  onClick={() => setShowBulkStatusModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <BulkStatusManager
                selectedAppointments={getSelectedAppointments()}
                onUpdate={handleBulkUpdate}
                onClose={() => setShowBulkStatusModal(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Appointments;
