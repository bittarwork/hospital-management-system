import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  Calendar,
  MapPin,
  X,
  User,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Award,
  Clock,
  Download,
  Printer,
  BarChart3,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  DollarSign,
  GraduationCap,
  Users,
} from "lucide-react";
import {
  doctorsAPI,
  showSuccessMessage,
  handleApiError,
} from "../services/api";
import toast from "react-hot-toast";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // add, edit, view, delete
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [doctorsPerPage] = useState(10);

  // Advanced filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    specialization: "",
    gender: "",
    consultationFeeRange: { min: "", max: "" },
    experience: "",
    status: "",
    position: "",
  });

  // Statistics modal
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    specialization: "",
    phone: "",
    email: "",
    licenseNumber: "",
    dateOfBirth: "",
    gender: "",
    consultationFee: "",
    experience: "",
    department: "",
    position: "Specialist",
    status: "active",
    qualifications: "",
    workingHours: {
      start: "",
      end: "",
      workingDays: [],
    },
    education: [],
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
    },
  });

  const specializations = [
    "طب عام",
    "طب باطني",
    "جراحة عامة",
    "طب أطفال",
    "نساء وولادة",
    "طب عيون",
    "طب أسنان",
    "طب نفسي",
    "طب جلدية",
    "طب عظام",
    "طب قلب",
    "طب أعصاب",
    "طب أنف وأذن",
    "طب مسالك بولية",
    "طب تخدير",
  ];

  const positions = [
    "Chief of Department",
    "Senior Consultant",
    "Consultant",
    "Specialist",
    "Resident",
    "Intern",
  ];

  const workingDaysOptions = [
    { value: "saturday", label: "السبت" },
    { value: "sunday", label: "الأحد" },
    { value: "monday", label: "الاثنين" },
    { value: "tuesday", label: "الثلاثاء" },
    { value: "wednesday", label: "الأربعاء" },
    { value: "thursday", label: "الخميس" },
    { value: "friday", label: "الجمعة" },
  ];

  // Load doctors on component mount
  useEffect(() => {
    loadDoctors();
  }, []);

  // Filter doctors based on search term and advanced filters
  useEffect(() => {
    let filtered = doctors;

    // Apply text search
    if (searchTerm) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.phone?.includes(searchTerm) ||
          doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialization
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          doctor.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply advanced filters
    if (filters.specialization) {
      filtered = filtered.filter(
        (doctor) => doctor.specialization === filters.specialization
      );
    }

    if (filters.gender) {
      filtered = filtered.filter((doctor) => doctor.gender === filters.gender);
    }

    if (filters.status) {
      filtered = filtered.filter((doctor) => doctor.status === filters.status);
    }

    if (filters.position) {
      filtered = filtered.filter(
        (doctor) => doctor.position === filters.position
      );
    }

    if (filters.consultationFeeRange.min || filters.consultationFeeRange.max) {
      filtered = filtered.filter((doctor) => {
        if (!doctor.consultationFee) return false;
        const fee = parseFloat(doctor.consultationFee);
        const minFee = filters.consultationFeeRange.min
          ? parseFloat(filters.consultationFeeRange.min)
          : 0;
        const maxFee = filters.consultationFeeRange.max
          ? parseFloat(filters.consultationFeeRange.max)
          : 9999;
        return fee >= minFee && fee <= maxFee;
      });
    }

    if (filters.experience) {
      const expFilter = parseInt(filters.experience);
      filtered = filtered.filter((doctor) => {
        const docExp = parseInt(doctor.experience) || 0;
        if (expFilter === 5) return docExp < 5;
        if (expFilter === 10) return docExp >= 5 && docExp < 10;
        if (expFilter === 15) return docExp >= 10 && docExp < 15;
        if (expFilter === 20) return docExp >= 15;
        return true;
      });
    }

    setFilteredDoctors(filtered);
    setCurrentPage(1);
  }, [searchTerm, doctors, filters]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorsAPI.getAll();

      // Extract doctors from response - handle different response structures
      let doctorsData = [];
      if (response.data.data && Array.isArray(response.data.data.doctors)) {
        doctorsData = response.data.data.doctors;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        doctorsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        doctorsData = response.data;
      }

      setDoctors(doctorsData);
    } catch (error) {
      handleApiError(error, "فشل في تحميل بيانات الأطباء");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      specialization: "",
      gender: "",
      consultationFeeRange: { min: "", max: "" },
      experience: "",
      status: "",
      position: "",
    });
    setSearchTerm("");
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "الاسم الأول",
      "الاسم الأخير",
      "التخصص",
      "رقم الترخيص",
      "الهاتف",
      "البريد الإلكتروني",
      "الجنس",
      "سعر الكشف",
      "سنوات الخبرة",
      "المنصب",
      "الحالة",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredDoctors.map((doctor) =>
        [
          doctor.firstName || "",
          doctor.lastName || "",
          doctor.specialization || "",
          doctor.licenseNumber || "",
          doctor.phone || "",
          doctor.email || "",
          doctor.gender === "male"
            ? "ذكر"
            : doctor.gender === "female"
            ? "أنثى"
            : "",
          doctor.consultationFee || "",
          doctor.experience || "",
          doctor.position || "",
          doctor.status === "active" ? "نشط" : "غير نشط",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `doctors_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("تم تصدير البيانات بنجاح");
  };

  // Print doctors list
  const printDoctors = () => {
    const printContent = `
      <html>
        <head>
          <title>قائمة الأطباء</title>
          <style>
            body { font-family: Arial, sans-serif; direction: rtl; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 20px; }
            .date { text-align: left; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>مستشفى المشروع الأول الطبي</h1>
            <h2>قائمة الأطباء</h2>
          </div>
          <div class="date">
            تاريخ الطباعة: ${new Date().toLocaleDateString("ar-SA")}
          </div>
          <table>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>التخصص</th>
                <th>الهاتف</th>
                <th>سعر الكشف</th>
                <th>سنوات الخبرة</th>
                <th>المنصب</th>
              </tr>
            </thead>
            <tbody>
              ${filteredDoctors
                .map(
                  (doctor) => `
                <tr>
                  <td>د. ${doctor.firstName} ${doctor.lastName}</td>
                  <td>${doctor.specialization || ""}</td>
                  <td>${doctor.phone || ""}</td>
                  <td>${
                    doctor.consultationFee
                      ? doctor.consultationFee + " ر.س"
                      : ""
                  }</td>
                  <td>${doctor.experience || ""} سنة</td>
                  <td>${doctor.position || ""}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <div style="margin-top: 20px; text-align: center;">
            <p>إجمالي الأطباء: ${filteredDoctors.length}</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();

    toast.success("تم إعداد الطباعة");
  };

  // Get doctors statistics
  const getStatistics = () => {
    const stats = {
      total: filteredDoctors.length,
      active: filteredDoctors.filter((d) => d.status === "active").length,
      inactive: filteredDoctors.filter((d) => d.status !== "active").length,
      male: filteredDoctors.filter((d) => d.gender === "male").length,
      female: filteredDoctors.filter((d) => d.gender === "female").length,
      specializations: {},
      positions: {},
      experienceGroups: {
        "0-5": 0,
        "6-10": 0,
        "11-15": 0,
        "16+": 0,
      },
      feeRanges: {
        "0-200": 0,
        "201-300": 0,
        "301-400": 0,
        "401+": 0,
      },
    };

    // Count specializations
    filteredDoctors.forEach((doctor) => {
      if (doctor.specialization) {
        stats.specializations[doctor.specialization] =
          (stats.specializations[doctor.specialization] || 0) + 1;
      }

      // Count positions
      if (doctor.position) {
        stats.positions[doctor.position] =
          (stats.positions[doctor.position] || 0) + 1;
      }

      // Count experience groups
      const exp = parseInt(doctor.experience) || 0;
      if (exp <= 5) stats.experienceGroups["0-5"]++;
      else if (exp <= 10) stats.experienceGroups["6-10"]++;
      else if (exp <= 15) stats.experienceGroups["11-15"]++;
      else stats.experienceGroups["16+"]++;

      // Count fee ranges
      const fee = parseInt(doctor.consultationFee) || 0;
      if (fee <= 200) stats.feeRanges["0-200"]++;
      else if (fee <= 300) stats.feeRanges["201-300"]++;
      else if (fee <= 400) stats.feeRanges["301-400"]++;
      else stats.feeRanges["401+"]++;
    });

    return stats;
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      specialization: "",
      phone: "",
      email: "",
      licenseNumber: "",
      dateOfBirth: "",
      gender: "",
      consultationFee: "",
      experience: "",
      department: "",
      position: "Specialist",
      status: "active",
      qualifications: "",
      workingHours: {
        start: "",
        end: "",
        workingDays: [],
      },
      education: [],
      emergencyContact: {
        name: "",
        relationship: "",
        phone: "",
      },
    });
  };

  const openModal = (type, doctor = null) => {
    setModalType(type);
    setSelectedDoctor(doctor);
    if (doctor && (type === "edit" || type === "view")) {
      setFormData({
        firstName: doctor.firstName || "",
        lastName: doctor.lastName || "",
        specialization: doctor.specialization || "",
        phone: doctor.phone || "",
        email: doctor.email || "",
        licenseNumber: doctor.licenseNumber || "",
        dateOfBirth: doctor.dateOfBirth ? doctor.dateOfBirth.split("T")[0] : "",
        gender: doctor.gender || "",
        consultationFee: doctor.consultationFee || "",
        experience: doctor.experience || "",
        department: doctor.department || "",
        position: doctor.position || "Specialist",
        status: doctor.status || "active",
        qualifications: doctor.qualifications || "",
        workingHours: doctor.workingHours || {
          start: "",
          end: "",
          workingDays: [],
        },
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType("add");
    setSelectedDoctor(null);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalType === "add") {
        await doctorsAPI.create(formData);
        showSuccessMessage("تم إضافة الطبيب بنجاح");
      } else if (modalType === "edit") {
        await doctorsAPI.update(selectedDoctor._id, formData);
        showSuccessMessage("تم تحديث بيانات الطبيب بنجاح");
      }

      closeModal();
      loadDoctors();
    } catch (error) {
      handleApiError(
        error,
        `فشل في ${modalType === "add" ? "إضافة" : "تحديث"} الطبيب`
      );
    }
  };

  const handleDelete = async () => {
    try {
      await doctorsAPI.delete(selectedDoctor._id);
      showSuccessMessage("تم حذف الطبيب بنجاح");
      closeModal();
      loadDoctors();
    } catch (error) {
      handleApiError(error, "فشل في حذف الطبيب");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleWorkingDaysChange = (day) => {
    setFormData((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        workingDays: prev.workingHours.workingDays.includes(day)
          ? prev.workingHours.workingDays.filter((d) => d !== day)
          : [...prev.workingHours.workingDays, day],
      },
    }));
  };

  // Add education
  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: "", institution: "", fieldOfStudy: "", graduationYear: "" },
      ],
    }));
  };

  // Remove education
  const removeEducation = (index) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  // Update education
  const updateEducation = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // Handle fee range filter
  const handleFeeRangeChange = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      consultationFeeRange: {
        ...prev.consultationFeeRange,
        [type]: value,
      },
    }));
  };

  // Pagination
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(
    indexOfFirstDoctor,
    indexOfLastDoctor
  );
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Get statistics data for cards
  const stats = getStatistics();

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
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الأطباء</h1>
            <p className="text-gray-600">
              عرض {currentDoctors.length} من {filteredDoctors.length} أطباء
            </p>
          </div>
        </div>
        <button
          onClick={() => openModal("add")}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة طبيب جديد
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">إجمالي الأطباء</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">نشط</p>
              <p className="text-3xl font-bold">{stats.active}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">التخصصات</p>
              <p className="text-3xl font-bold">
                {Object.keys(stats.specializations).length}
              </p>
            </div>
            <Award className="w-8 h-8 text-purple-200" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">متوسط سعر الكشف</p>
              <p className="text-3xl font-bold">
                {filteredDoctors.length > 0
                  ? Math.round(
                      filteredDoctors.reduce(
                        (sum, d) => sum + (parseInt(d.consultationFee) || 0),
                        0
                      ) / filteredDoctors.length
                    )
                  : 0}{" "}
                ر.س
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-orange-200" />
          </div>
        </motion.div>
      </div>

      {/* Toolbar */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute right-3 top-3" />
              <input
                type="text"
                placeholder="البحث عن طبيب (الاسم، التخصص، الهاتف، رقم الترخيص)..."
                className="input-field pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Toolbar buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-outline flex items-center gap-2 ${
                  showFilters ? "bg-blue-50 border-blue-300" : ""
                }`}
              >
                <Filter className="w-4 h-4" />
                فلترة
                {showFilters ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={exportToCSV}
                className="btn-outline flex items-center gap-2"
                title="تصدير CSV"
              >
                <Download className="w-4 h-4" />
                تصدير
              </button>

              <button
                onClick={printDoctors}
                className="btn-outline flex items-center gap-2"
                title="طباعة"
              >
                <Printer className="w-4 h-4" />
                طباعة
              </button>

              <button
                onClick={() => setShowStatsModal(true)}
                className="btn-outline flex items-center gap-2"
                title="إحصائيات"
              >
                <BarChart3 className="w-4 h-4" />
                إحصائيات
              </button>

              <button
                onClick={loadDoctors}
                className="btn-outline flex items-center gap-2"
                title="تحديث"
              >
                <RefreshCw className="w-4 h-4" />
                تحديث
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t pt-4 mt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      التخصص
                    </label>
                    <select
                      value={filters.specialization}
                      onChange={(e) =>
                        handleFilterChange("specialization", e.target.value)
                      }
                      className="input-field"
                    >
                      <option value="">جميع التخصصات</option>
                      {specializations.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الجنس
                    </label>
                    <select
                      value={filters.gender}
                      onChange={(e) =>
                        handleFilterChange("gender", e.target.value)
                      }
                      className="input-field"
                    >
                      <option value="">الجميع</option>
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      المنصب
                    </label>
                    <select
                      value={filters.position}
                      onChange={(e) =>
                        handleFilterChange("position", e.target.value)
                      }
                      className="input-field"
                    >
                      <option value="">جميع المناصب</option>
                      {positions.map((pos) => (
                        <option key={pos} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      سنوات الخبرة
                    </label>
                    <select
                      value={filters.experience}
                      onChange={(e) =>
                        handleFilterChange("experience", e.target.value)
                      }
                      className="input-field"
                    >
                      <option value="">جميع المستويات</option>
                      <option value="5">أقل من 5 سنوات</option>
                      <option value="10">5-10 سنوات</option>
                      <option value="15">10-15 سنة</option>
                      <option value="20">أكثر من 15 سنة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      سعر الكشف الأدنى
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filters.consultationFeeRange.min}
                      onChange={(e) =>
                        handleFeeRangeChange("min", e.target.value)
                      }
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      سعر الكشف الأعلى
                    </label>
                    <input
                      type="number"
                      placeholder="1000"
                      value={filters.consultationFeeRange.max}
                      onChange={(e) =>
                        handleFeeRangeChange("max", e.target.value)
                      }
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الحالة
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      className="input-field"
                    >
                      <option value="">جميع الحالات</option>
                      <option value="active">نشط</option>
                      <option value="inactive">غير نشط</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="btn-outline w-full"
                    >
                      مسح الفلاتر
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    النتائج: {filteredDoctors.length} طبيب
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Doctors Table */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
              <span className="mr-3">جاري التحميل...</span>
            </div>
          ) : currentDoctors.length === 0 ? (
            <div className="text-center py-12">
              <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {searchTerm ? "لا توجد نتائج" : "لا يوجد أطباء"}
              </h3>
              <p className="text-gray-500">
                {searchTerm ? "جرب البحث بكلمات أخرى" : "ابدأ بإضافة طبيب جديد"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الطبيب
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        التخصص
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المنصب
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الهاتف
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        سعر الكشف
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الخبرة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentDoctors.map((doctor) => (
                      <motion.tr
                        key={doctor._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Stethoscope className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="mr-4">
                              <div className="text-sm font-medium text-gray-900">
                                د. {doctor.firstName} {doctor.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {doctor.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {doctor.specialization}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doctor.position || "Specialist"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doctor.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doctor.consultationFee
                            ? `${doctor.consultationFee} ر.س`
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doctor.experience ? `${doctor.experience} سنة` : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              doctor.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {doctor.status === "active" ? "نشط" : "غير نشط"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openModal("view", doctor)}
                              className="text-blue-600 hover:text-blue-900"
                              title="عرض"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openModal("edit", doctor)}
                              className="text-green-600 hover:text-green-900"
                              title="تعديل"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openModal("delete", doctor)}
                              className="text-red-600 hover:text-red-900"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-3 bg-gray-50 border-t flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    عرض {indexOfFirstDoctor + 1} إلى{" "}
                    {Math.min(indexOfLastDoctor, filteredDoctors.length)} من{" "}
                    {filteredDoctors.length} طبيب
                  </div>
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => paginate(page)}
                          className={`px-3 py-1 rounded ${
                            currentPage === page
                              ? "bg-primary text-white"
                              : "bg-white text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold">
                  {modalType === "add" && "إضافة طبيب جديد"}
                  {modalType === "edit" && "تعديل بيانات الطبيب"}
                  {modalType === "view" && "عرض بيانات الطبيب"}
                  {modalType === "delete" && "حذف الطبيب"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {modalType === "delete" ? (
                  <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      هل أنت متأكد من حذف هذا الطبيب؟
                    </h4>
                    <p className="text-gray-600 mb-6">
                      سيتم حذف د. {selectedDoctor?.firstName}{" "}
                      {selectedDoctor?.lastName} نهائياً من النظام
                    </p>
                    <div className="flex justify-center gap-4">
                      <button onClick={handleDelete} className="btn-danger">
                        حذف نهائياً
                      </button>
                      <button onClick={closeModal} className="btn-outline">
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">
                        المعلومات الأساسية
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            رقم الموظف *
                          </label>
                          <input
                            type="text"
                            name="employeeId"
                            value={formData.employeeId}
                            onChange={handleInputChange}
                            className="input-field"
                            required
                            disabled={modalType === "view"}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            الاسم الأول *
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="input-field"
                            required
                            disabled={modalType === "view"}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            الاسم الأخير *
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="input-field"
                            required
                            disabled={modalType === "view"}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            التخصص *
                          </label>
                          <select
                            name="specialization"
                            value={formData.specialization}
                            onChange={handleInputChange}
                            className="input-field"
                            required
                            disabled={modalType === "view"}
                          >
                            <option value="">اختر التخصص</option>
                            {specializations.map((spec) => (
                              <option key={spec} value={spec}>
                                {spec}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            تاريخ الميلاد *
                          </label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            className="input-field"
                            required
                            disabled={modalType === "view"}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            الجنس *
                          </label>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className="input-field"
                            required
                            disabled={modalType === "view"}
                          >
                            <option value="">اختر الجنس</option>
                            <option value="male">ذكر</option>
                            <option value="female">أنثى</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="border-t pt-4">
                      <h4 className="text-md font-medium text-gray-900 mb-3">
                        معلومات الاتصال
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            رقم الهاتف *
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="input-field"
                            required
                            disabled={modalType === "view"}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            البريد الإلكتروني *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="input-field"
                            required
                            disabled={modalType === "view"}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            العنوان
                          </label>
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="input-field"
                            rows="2"
                            disabled={modalType === "view"}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div className="border-t pt-4">
                      <h4 className="text-md font-medium text-gray-900 mb-3">
                        المعلومات المهنية
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            رقم الترخيص *
                          </label>
                          <input
                            type="text"
                            name="licenseNumber"
                            value={formData.licenseNumber}
                            onChange={handleInputChange}
                            className="input-field"
                            required
                            disabled={modalType === "view"}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            سعر الكشف (ر.س)
                          </label>
                          <input
                            type="number"
                            name="consultationFee"
                            value={formData.consultationFee}
                            onChange={handleInputChange}
                            className="input-field"
                            disabled={modalType === "view"}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            سنوات الخبرة
                          </label>
                          <input
                            type="number"
                            name="experience"
                            value={formData.experience}
                            onChange={handleInputChange}
                            className="input-field"
                            disabled={modalType === "view"}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            الحالة
                          </label>
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="input-field"
                            disabled={modalType === "view"}
                          >
                            <option value="active">نشط</option>
                            <option value="inactive">غير نشط</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            المؤهلات
                          </label>
                          <textarea
                            name="qualifications"
                            value={formData.qualifications}
                            onChange={handleInputChange}
                            className="input-field"
                            rows="3"
                            placeholder="اذكر المؤهلات والشهادات..."
                            disabled={modalType === "view"}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Working Hours */}
                    <div className="border-t pt-4">
                      <h4 className="text-md font-medium text-gray-900 mb-3">
                        أوقات العمل
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            وقت البداية
                          </label>
                          <input
                            type="time"
                            name="workingHours.start"
                            value={formData.workingHours.start}
                            onChange={handleInputChange}
                            className="input-field"
                            disabled={modalType === "view"}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            وقت النهاية
                          </label>
                          <input
                            type="time"
                            name="workingHours.end"
                            value={formData.workingHours.end}
                            onChange={handleInputChange}
                            className="input-field"
                            disabled={modalType === "view"}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          أيام العمل
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {workingDaysOptions.map((day) => (
                            <label
                              key={day.value}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="checkbox"
                                checked={formData.workingHours.workingDays.includes(
                                  day.value
                                )}
                                onChange={() =>
                                  handleWorkingDaysChange(day.value)
                                }
                                className="rounded"
                                disabled={modalType === "view"}
                              />
                              <span className="text-sm">{day.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {modalType !== "view" && (
                      <div className="flex justify-end gap-4 pt-4 border-t">
                        <button
                          type="button"
                          onClick={closeModal}
                          className="btn-outline"
                        >
                          إلغاء
                        </button>
                        <button type="submit" className="btn-primary">
                          {modalType === "add"
                            ? "إضافة الطبيب"
                            : "حفظ التغييرات"}
                        </button>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistics Modal */}
      <AnimatePresence>
        {showStatsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold">إحصائيات الأطباء</h3>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* General Statistics */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    الإحصائيات العامة
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {stats.total}
                      </p>
                      <p className="text-sm text-gray-600">إجمالي الأطباء</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {stats.active}
                      </p>
                      <p className="text-sm text-gray-600">نشط</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {stats.inactive}
                      </p>
                      <p className="text-sm text-gray-600">غير نشط</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {Object.keys(stats.specializations).length}
                      </p>
                      <p className="text-sm text-gray-600">التخصصات</p>
                    </div>
                  </div>
                </div>

                {/* Gender Distribution */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    التوزيع الجنسي
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">ذكر</span>
                        <span className="text-sm text-gray-600">
                          {stats.male}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${
                              stats.total > 0
                                ? (stats.male / stats.total) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {stats.total > 0
                          ? Math.round((stats.male / stats.total) * 100)
                          : 0}
                        %
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">أنثى</span>
                        <span className="text-sm text-gray-600">
                          {stats.female}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-pink-600 h-2 rounded-full"
                          style={{
                            width: `${
                              stats.total > 0
                                ? (stats.female / stats.total) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {stats.total > 0
                          ? Math.round((stats.female / stats.total) * 100)
                          : 0}
                        %
                      </p>
                    </div>
                  </div>
                </div>

                {/* Specializations */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    توزيع التخصصات
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(stats.specializations).map(
                      ([spec, count]) => (
                        <div key={spec} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{spec}</span>
                            <span className="text-sm text-gray-600">
                              {count}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${
                                  stats.total > 0
                                    ? (count / stats.total) * 100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Experience Groups */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    توزيع سنوات الخبرة
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(stats.experienceGroups).map(
                      ([range, count]) => (
                        <div
                          key={range}
                          className="bg-gray-50 p-4 rounded-lg text-center"
                        >
                          <p className="text-xl font-bold text-orange-600">
                            {count}
                          </p>
                          <p className="text-sm text-gray-600">{range} سنة</p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Fee Ranges */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    توزيع أسعار الكشف
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(stats.feeRanges).map(([range, count]) => (
                      <div
                        key={range}
                        className="bg-gray-50 p-4 rounded-lg text-center"
                      >
                        <p className="text-xl font-bold text-green-600">
                          {count}
                        </p>
                        <p className="text-sm text-gray-600">{range} ر.س</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Positions */}
                {Object.keys(stats.positions).length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      توزيع المناصب
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(stats.positions).map(
                        ([position, count]) => (
                          <div
                            key={position}
                            className="bg-gray-50 p-3 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">
                                {position}
                              </span>
                              <span className="text-sm text-gray-600">
                                {count}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{
                                  width: `${
                                    stats.total > 0
                                      ? (count / stats.total) * 100
                                      : 0
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 p-6 border-t">
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="btn-outline"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Doctors;
