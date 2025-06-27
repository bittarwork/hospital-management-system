import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
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
  Download,
  Printer,
  BarChart3,
  Settings,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  patientsAPI,
  showSuccessMessage,
  handleApiError,
} from "../services/api";
import toast from "react-hot-toast";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // add, edit, view, delete
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);

  // Advanced filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    gender: "",
    bloodType: "",
    ageRange: { min: "", max: "" },
    hasAllergies: "",
  });

  // Statistics modal
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nationalId: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
    },
    bloodType: "",
    allergies: [],
    medicalHistory: [],
  });

  // Load patients on component mount
  useEffect(() => {
    loadPatients();
  }, []);

  // Filter patients based on search term and advanced filters
  useEffect(() => {
    let filtered = patients;

    // Apply text search
    if (searchTerm) {
      filtered = filtered.filter(
        (patient) =>
          patient.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.nationalId?.includes(searchTerm) ||
          patient.phone?.includes(searchTerm) ||
          patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply advanced filters
    if (filters.gender) {
      filtered = filtered.filter(
        (patient) => patient.gender === filters.gender
      );
    }

    if (filters.bloodType) {
      filtered = filtered.filter(
        (patient) => patient.bloodType === filters.bloodType
      );
    }

    if (filters.ageRange.min || filters.ageRange.max) {
      filtered = filtered.filter((patient) => {
        if (!patient.dateOfBirth) return false;
        const age =
          new Date().getFullYear() -
          new Date(patient.dateOfBirth).getFullYear();
        const minAge = filters.ageRange.min
          ? parseInt(filters.ageRange.min)
          : 0;
        const maxAge = filters.ageRange.max
          ? parseInt(filters.ageRange.max)
          : 150;
        return age >= minAge && age <= maxAge;
      });
    }

    if (filters.hasAllergies === "yes") {
      filtered = filtered.filter(
        (patient) => patient.allergies && patient.allergies.length > 0
      );
    } else if (filters.hasAllergies === "no") {
      filtered = filtered.filter(
        (patient) => !patient.allergies || patient.allergies.length === 0
      );
    }

    setFilteredPatients(filtered);
    setCurrentPage(1);
  }, [searchTerm, patients, filters]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await patientsAPI.getAll();
      setPatients(response.data.data.patients || []);
    } catch (error) {
      handleApiError(error, "فشل في تحميل بيانات المرضى");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nationalId: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      phone: "",
      email: "",
      address: "",
      emergencyContact: {
        name: "",
        relationship: "",
        phone: "",
      },
      bloodType: "",
      allergies: [],
      medicalHistory: [],
    });
  };

  const openModal = (type, patient = null) => {
    setModalType(type);
    setSelectedPatient(patient);
    if (patient && (type === "edit" || type === "view")) {
      setFormData({
        nationalId: patient.nationalId || "",
        firstName: patient.firstName || "",
        lastName: patient.lastName || "",
        dateOfBirth: patient.dateOfBirth
          ? patient.dateOfBirth.split("T")[0]
          : "",
        gender: patient.gender || "",
        phone: patient.phone || "",
        email: patient.email || "",
        address: patient.address || "",
        emergencyContact: patient.emergencyContact || {
          name: "",
          relationship: "",
          phone: "",
        },
        bloodType: patient.bloodType || "",
        allergies: patient.allergies || [],
        medicalHistory: patient.medicalHistory || [],
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType("add");
    setSelectedPatient(null);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Clean form data before submission
      const cleanedFormData = {
        ...formData,
        allergies: Array.isArray(formData.allergies)
          ? formData.allergies.filter((allergy) => allergy.trim() !== "")
          : [],
        medicalHistory: Array.isArray(formData.medicalHistory)
          ? formData.medicalHistory.filter((history) => history.trim() !== "")
          : [],
      };

      if (modalType === "add") {
        await patientsAPI.create(cleanedFormData);
        showSuccessMessage("تم إضافة المريض بنجاح");
      } else if (modalType === "edit") {
        await patientsAPI.update(selectedPatient._id, cleanedFormData);
        showSuccessMessage("تم تحديث بيانات المريض بنجاح");
      }

      closeModal();
      loadPatients();
    } catch (error) {
      handleApiError(
        error,
        `فشل في ${modalType === "add" ? "إضافة" : "تحديث"} المريض`
      );
    }
  };

  const handleDelete = async () => {
    try {
      await patientsAPI.delete(selectedPatient._id);
      showSuccessMessage("تم حذف المريض بنجاح");
      closeModal();
      loadPatients();
    } catch (error) {
      handleApiError(error, "فشل في حذف المريض");
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

  // Add allergy
  const addAllergy = () => {
    const allergies = Array.isArray(formData.allergies)
      ? formData.allergies
      : [];
    setFormData((prev) => ({
      ...prev,
      allergies: [...allergies, ""],
    }));
  };

  // Remove allergy
  const removeAllergy = (index) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index),
    }));
  };

  // Update allergy
  const updateAllergy = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.map((allergy, i) =>
        i === index ? value : allergy
      ),
    }));
  };

  // Add medical history
  const addMedicalHistory = () => {
    const history = Array.isArray(formData.medicalHistory)
      ? formData.medicalHistory
      : [];
    setFormData((prev) => ({
      ...prev,
      medicalHistory: [...history, ""],
    }));
  };

  // Remove medical history
  const removeMedicalHistory = (index) => {
    setFormData((prev) => ({
      ...prev,
      medicalHistory: prev.medicalHistory.filter((_, i) => i !== index),
    }));
  };

  // Update medical history
  const updateMedicalHistory = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      medicalHistory: prev.medicalHistory.map((history, i) =>
        i === index ? value : history
      ),
    }));
  };

  // Pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(
    indexOfFirstPatient,
    indexOfLastPatient
  );
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      gender: "",
      bloodType: "",
      ageRange: { min: "", max: "" },
      hasAllergies: "",
    });
    setSearchTerm("");
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "رقم الهوية",
      "الاسم الأول",
      "الاسم الأخير",
      "الجنس",
      "تاريخ الميلاد",
      "الهاتف",
      "البريد الإلكتروني",
      "فصيلة الدم",
      "الحساسيات",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredPatients.map((patient) =>
        [
          patient.nationalId || "",
          patient.firstName || "",
          patient.lastName || "",
          patient.gender === "male"
            ? "ذكر"
            : patient.gender === "female"
            ? "أنثى"
            : "",
          patient.dateOfBirth
            ? new Date(patient.dateOfBirth).toLocaleDateString("ar-SA")
            : "",
          patient.phone || "",
          patient.email || "",
          patient.bloodType || "",
          patient.allergies ? patient.allergies.join("; ") : "",
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
      `patients_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("تم تصدير البيانات بنجاح");
  };

  // Print patients list
  const printPatients = () => {
    const printContent = `
      <html>
        <head>
          <title>قائمة المرضى</title>
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
            <h2>قائمة المرضى</h2>
          </div>
          <div class="date">
            تاريخ الطباعة: ${new Date().toLocaleDateString("ar-SA")}
          </div>
          <table>
            <thead>
              <tr>
                <th>رقم الهوية</th>
                <th>الاسم</th>
                <th>الجنس</th>
                <th>العمر</th>
                <th>الهاتف</th>
                <th>فصيلة الدم</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPatients
                .map(
                  (patient) => `
                <tr>
                  <td>${patient.nationalId || ""}</td>
                  <td>${patient.firstName} ${patient.lastName}</td>
                  <td>${
                    patient.gender === "male"
                      ? "ذكر"
                      : patient.gender === "female"
                      ? "أنثى"
                      : ""
                  }</td>
                  <td>${
                    patient.dateOfBirth
                      ? new Date().getFullYear() -
                        new Date(patient.dateOfBirth).getFullYear()
                      : ""
                  }</td>
                  <td>${patient.phone || ""}</td>
                  <td>${patient.bloodType || ""}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <div style="margin-top: 20px; text-align: center;">
            <p>إجمالي المرضى: ${filteredPatients.length}</p>
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

  // Get patients statistics
  const getStatistics = () => {
    const stats = {
      total: filteredPatients.length,
      male: filteredPatients.filter((p) => p.gender === "male").length,
      female: filteredPatients.filter((p) => p.gender === "female").length,
      withAllergies: filteredPatients.filter(
        (p) => p.allergies && p.allergies.length > 0
      ).length,
      bloodTypes: {},
      ageGroups: {
        "0-18": 0,
        "19-35": 0,
        "36-55": 0,
        "56+": 0,
      },
    };

    // Count blood types
    filteredPatients.forEach((patient) => {
      if (patient.bloodType) {
        stats.bloodTypes[patient.bloodType] =
          (stats.bloodTypes[patient.bloodType] || 0) + 1;
      }

      // Count age groups
      if (patient.dateOfBirth) {
        const age =
          new Date().getFullYear() -
          new Date(patient.dateOfBirth).getFullYear();
        if (age <= 18) stats.ageGroups["0-18"]++;
        else if (age <= 35) stats.ageGroups["19-35"]++;
        else if (age <= 55) stats.ageGroups["36-55"]++;
        else stats.ageGroups["56+"]++;
      }
    });

    return stats;
  };

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
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة المرضى</h1>
            <p className="text-gray-600">
              إجمالي المرضى: {patients.length} | المعروض:{" "}
              {filteredPatients.length}
            </p>
          </div>
        </div>
        <button
          onClick={() => openModal("add")}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة مريض جديد
        </button>
      </div>

      {/* Statistics Cards */}
      {patients.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(() => {
            const stats = getStatistics();
            return [
              {
                title: "إجمالي المرضى",
                value: stats.total,
                icon: Users,
                color: "bg-blue-500",
                bgColor: "bg-blue-50",
              },
              {
                title: "ذكور",
                value: stats.male,
                icon: User,
                color: "bg-green-500",
                bgColor: "bg-green-50",
              },
              {
                title: "إناث",
                value: stats.female,
                icon: User,
                color: "bg-pink-500",
                bgColor: "bg-pink-50",
              },
              {
                title: "مع حساسيات",
                value: stats.withAllergies,
                icon: AlertCircle,
                color: "bg-orange-500",
                bgColor: "bg-orange-50",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${stat.bgColor} rounded-lg p-4`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}
                  >
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </motion.div>
            ));
          })()}
        </div>
      )}

      {/* Search and Filter */}
      <div className="card">
        <div className="card-body">
          <div className="space-y-4">
            {/* Search Bar and Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute right-3 top-3" />
                <input
                  type="text"
                  placeholder="البحث عن مريض (الاسم، الهوية، الهاتف)..."
                  className="input-field pr-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    showFilters
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  فلترة متقدمة
                  {showFilters ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  تصدير
                </button>

                <button
                  onClick={printPatients}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  طباعة
                </button>

                <button
                  onClick={() => setShowStatsModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  إحصائيات
                </button>

                <button
                  onClick={loadPatients}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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
                  className="border-t pt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Gender Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الجنس
                      </label>
                      <select
                        className="input-field"
                        value={filters.gender}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            gender: e.target.value,
                          }))
                        }
                      >
                        <option value="">الكل</option>
                        <option value="male">ذكر</option>
                        <option value="female">أنثى</option>
                      </select>
                    </div>

                    {/* Blood Type Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        فصيلة الدم
                      </label>
                      <select
                        className="input-field"
                        value={filters.bloodType}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            bloodType: e.target.value,
                          }))
                        }
                      >
                        <option value="">الكل</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>

                    {/* Age Range */}
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        العمر
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="من"
                          className="input-field"
                          value={filters.ageRange.min}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              ageRange: {
                                ...prev.ageRange,
                                min: e.target.value,
                              },
                            }))
                          }
                        />
                        <input
                          type="number"
                          placeholder="إلى"
                          className="input-field"
                          value={filters.ageRange.max}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              ageRange: {
                                ...prev.ageRange,
                                max: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>

                    {/* Has Allergies Filter */}
                    <div className="md:col-start-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الحساسيات
                      </label>
                      <select
                        className="input-field"
                        value={filters.hasAllergies}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            hasAllergies: e.target.value,
                          }))
                        }
                      >
                        <option value="">الكل</option>
                        <option value="yes">يعاني من حساسيات</option>
                        <option value="no">لا يعاني من حساسيات</option>
                      </select>
                    </div>

                    {/* Clear Filters Button */}
                    <div className="flex items-end">
                      <button
                        onClick={clearFilters}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        مسح الفلاتر
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                النتائج: {filteredPatients.length} من {patients.length}
              </div>
              {filteredPatients.length !== patients.length && (
                <span className="text-orange-600">تطبيق فلاتر نشطة</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
              <span className="mr-3">جاري التحميل...</span>
            </div>
          ) : currentPatients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {searchTerm ? "لا توجد نتائج" : "لا يوجد مرضى"}
              </h3>
              <p className="text-gray-500">
                {searchTerm ? "جرب البحث بكلمات أخرى" : "ابدأ بإضافة مريض جديد"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المريض
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        رقم الهوية
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الهاتف
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        العمر
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        فصيلة الدم
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentPatients.map((patient) => (
                      <motion.tr
                        key={patient._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="mr-4">
                              <div className="text-sm font-medium text-gray-900">
                                {patient.firstName} {patient.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {patient.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.nationalId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.dateOfBirth
                            ? new Date().getFullYear() -
                              new Date(patient.dateOfBirth).getFullYear()
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.bloodType || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openModal("view", patient)}
                              className="text-blue-600 hover:text-blue-900"
                              title="عرض"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openModal("edit", patient)}
                              className="text-green-600 hover:text-green-900"
                              title="تعديل"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openModal("delete", patient)}
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
                    عرض {indexOfFirstPatient + 1} إلى{" "}
                    {Math.min(indexOfLastPatient, filteredPatients.length)} من{" "}
                    {filteredPatients.length} مريض
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
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold">
                  {modalType === "add" && "إضافة مريض جديد"}
                  {modalType === "edit" && "تعديل بيانات المريض"}
                  {modalType === "view" && "عرض بيانات المريض"}
                  {modalType === "delete" && "حذف المريض"}
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
                      هل أنت متأكد من حذف هذا المريض؟
                    </h4>
                    <p className="text-gray-600 mb-6">
                      سيتم حذف {selectedPatient?.firstName}{" "}
                      {selectedPatient?.lastName} نهائياً من النظام
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
                ) : modalType === "view" ? (
                  <div className="space-y-6">
                    {/* Patient Profile Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {selectedPatient?.firstName}{" "}
                            {selectedPatient?.lastName}
                          </h3>
                          <p className="text-gray-600">
                            {selectedPatient?.email}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>
                              رقم الهوية: {selectedPatient?.nationalId}
                            </span>
                            <span>•</span>
                            <span>
                              العمر:{" "}
                              {selectedPatient?.dateOfBirth
                                ? new Date().getFullYear() -
                                  new Date(
                                    selectedPatient.dateOfBirth
                                  ).getFullYear() +
                                  " سنة"
                                : "غير محدد"}
                            </span>
                            <span>•</span>
                            <span>
                              {selectedPatient?.gender === "male"
                                ? "ذكر"
                                : selectedPatient?.gender === "female"
                                ? "أنثى"
                                : "غير محدد"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Patient Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                          المعلومات الأساسية
                        </h4>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">
                                رقم الهاتف
                              </p>
                              <p className="text-gray-900">
                                {selectedPatient?.phone || "غير محدد"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">
                                البريد الإلكتروني
                              </p>
                              <p className="text-gray-900">
                                {selectedPatient?.email || "غير محدد"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">
                                تاريخ الميلاد
                              </p>
                              <p className="text-gray-900">
                                {selectedPatient?.dateOfBirth
                                  ? new Date(
                                      selectedPatient.dateOfBirth
                                    ).toLocaleDateString("ar-SA")
                                  : "غير محدد"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">العنوان</p>
                              <p className="text-gray-900">
                                {selectedPatient?.address || "غير محدد"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Medical Information */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                          المعلومات الطبية
                        </h4>

                        <div className="space-y-3">
                          <div className="bg-red-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <p className="text-sm font-medium text-red-700">
                                فصيلة الدم
                              </p>
                            </div>
                            <p className="text-red-900 font-semibold text-lg">
                              {selectedPatient?.bloodType || "غير محدد"}
                            </p>
                          </div>

                          <div className="bg-orange-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="w-4 h-4 text-orange-500" />
                              <p className="text-sm font-medium text-orange-700">
                                الحساسيات
                              </p>
                            </div>
                            {selectedPatient?.allergies &&
                            selectedPatient.allergies.length > 0 ? (
                              <div className="space-y-1">
                                {selectedPatient.allergies.map(
                                  (allergy, index) => (
                                    <span
                                      key={index}
                                      className="inline-block bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded mr-1"
                                    >
                                      {allergy}
                                    </span>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-orange-600">
                                لا توجد حساسيات مسجلة
                              </p>
                            )}
                          </div>

                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4 text-blue-500" />
                              <p className="text-sm font-medium text-blue-700">
                                التاريخ الطبي
                              </p>
                            </div>
                            {selectedPatient?.medicalHistory &&
                            selectedPatient.medicalHistory.length > 0 ? (
                              <div className="space-y-1">
                                {selectedPatient.medicalHistory.map(
                                  (history, index) => (
                                    <p
                                      key={index}
                                      className="text-blue-800 text-sm"
                                    >
                                      • {history}
                                    </p>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-blue-600">
                                لا يوجد تاريخ طبي مسجل
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    {selectedPatient?.emergencyContact &&
                      (selectedPatient.emergencyContact.name ||
                        selectedPatient.emergencyContact.phone) && (
                        <div className="border-t pt-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            جهة الاتصال في الطوارئ
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">الاسم</p>
                                <p className="text-gray-900 font-medium">
                                  {selectedPatient?.emergencyContact?.name ||
                                    "غير محدد"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">
                                  صلة القرابة
                                </p>
                                <p className="text-gray-900 font-medium">
                                  {selectedPatient?.emergencyContact
                                    ?.relationship || "غير محدد"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">
                                  رقم الهاتف
                                </p>
                                <p className="text-gray-900 font-medium">
                                  {selectedPatient?.emergencyContact?.phone ||
                                    "غير محدد"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* System Information */}
                    <div className="border-t pt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        معلومات النظام
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">تاريخ التسجيل</p>
                            <p className="text-gray-900">
                              {selectedPatient?.createdAt
                                ? new Date(
                                    selectedPatient.createdAt
                                  ).toLocaleDateString("ar-SA")
                                : "غير محدد"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">آخر تحديث</p>
                            <p className="text-gray-900">
                              {selectedPatient?.updatedAt
                                ? new Date(
                                    selectedPatient.updatedAt
                                  ).toLocaleDateString("ar-SA")
                                : "غير محدد"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-3 pt-6 border-t">
                      <button
                        onClick={() => {
                          closeModal();
                          openModal("edit", selectedPatient);
                        }}
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        تعديل المريض
                      </button>
                      <button
                        onClick={closeModal}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        إغلاق
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          رقم الهوية *
                        </label>
                        <input
                          type="text"
                          name="nationalId"
                          value={formData.nationalId}
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
                          البريد الإلكتروني
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="input-field"
                          disabled={modalType === "view"}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          فصيلة الدم
                        </label>
                        <select
                          name="bloodType"
                          value={formData.bloodType}
                          onChange={handleInputChange}
                          className="input-field"
                          disabled={modalType === "view"}
                        >
                          <option value="">اختر فصيلة الدم</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                    </div>

                    <div>
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

                    {/* Emergency Contact */}
                    <div className="border-t pt-4">
                      <h4 className="text-md font-medium text-gray-900 mb-3">
                        جهة الاتصال في الطوارئ
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            الاسم
                          </label>
                          <input
                            type="text"
                            name="emergencyContact.name"
                            value={formData.emergencyContact.name}
                            onChange={handleInputChange}
                            className="input-field"
                            disabled={modalType === "view"}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            صلة القرابة
                          </label>
                          <input
                            type="text"
                            name="emergencyContact.relationship"
                            value={formData.emergencyContact.relationship}
                            onChange={handleInputChange}
                            className="input-field"
                            disabled={modalType === "view"}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            رقم الهاتف
                          </label>
                          <input
                            type="tel"
                            name="emergencyContact.phone"
                            value={formData.emergencyContact.phone}
                            onChange={handleInputChange}
                            className="input-field"
                            disabled={modalType === "view"}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Allergies Section */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-md font-medium text-gray-900">
                          الحساسيات
                        </h4>
                        {modalType !== "view" && (
                          <button
                            type="button"
                            onClick={addAllergy}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Plus className="w-4 h-4" />
                            إضافة حساسية
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {Array.isArray(formData.allergies) &&
                        formData.allergies.length > 0 ? (
                          formData.allergies.map((allergy, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="text"
                                value={allergy}
                                onChange={(e) =>
                                  updateAllergy(index, e.target.value)
                                }
                                placeholder="اسم الحساسية"
                                className="input-field flex-1"
                                disabled={modalType === "view"}
                              />
                              {modalType !== "view" && (
                                <button
                                  type="button"
                                  onClick={() => removeAllergy(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm italic">
                            لا توجد حساسيات مسجلة
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Medical History Section */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-md font-medium text-gray-900">
                          التاريخ الطبي
                        </h4>
                        {modalType !== "view" && (
                          <button
                            type="button"
                            onClick={addMedicalHistory}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Plus className="w-4 h-4" />
                            إضافة سجل طبي
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {Array.isArray(formData.medicalHistory) &&
                        formData.medicalHistory.length > 0 ? (
                          formData.medicalHistory.map((history, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="text"
                                value={history}
                                onChange={(e) =>
                                  updateMedicalHistory(index, e.target.value)
                                }
                                placeholder="وصف السجل الطبي"
                                className="input-field flex-1"
                                disabled={modalType === "view"}
                              />
                              {modalType !== "view" && (
                                <button
                                  type="button"
                                  onClick={() => removeMedicalHistory(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm italic">
                            لا يوجد تاريخ طبي مسجل
                          </p>
                        )}
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
                            ? "إضافة المريض"
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
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                  إحصائيات المرضى التفصيلية
                </h3>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {(() => {
                  const stats = getStatistics();
                  return (
                    <>
                      {/* General Statistics */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-2xl font-bold text-blue-900">
                            {stats.total}
                          </p>
                          <p className="text-sm text-blue-700">إجمالي المرضى</p>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-2xl font-bold text-green-900">
                            {stats.male}
                          </p>
                          <p className="text-sm text-green-700">مرضى ذكور</p>
                        </div>

                        <div className="bg-pink-50 rounded-lg p-4 text-center">
                          <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-2xl font-bold text-pink-900">
                            {stats.female}
                          </p>
                          <p className="text-sm text-pink-700">مرضى إناث</p>
                        </div>

                        <div className="bg-orange-50 rounded-lg p-4 text-center">
                          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                            <AlertCircle className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-2xl font-bold text-orange-900">
                            {stats.withAllergies}
                          </p>
                          <p className="text-sm text-orange-700">مع حساسيات</p>
                        </div>
                      </div>

                      {/* Age Groups */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-gray-600" />
                          التوزيع العمري
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(stats.ageGroups).map(
                            ([range, count]) => (
                              <div key={range} className="text-center">
                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                  <p className="text-xl font-bold text-gray-900">
                                    {count}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {range} سنة
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Blood Types */}
                      <div className="bg-red-50 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <div className="w-5 h-5 bg-red-500 rounded-full"></div>
                          توزيع فصائل الدم
                        </h4>
                        {Object.keys(stats.bloodTypes).length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(stats.bloodTypes).map(
                              ([type, count]) => (
                                <div key={type} className="text-center">
                                  <div className="bg-white rounded-lg p-3 shadow-sm">
                                    <p className="text-xl font-bold text-red-900">
                                      {count}
                                    </p>
                                    <p className="text-sm text-red-700">
                                      {type}
                                    </p>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-600 text-center">
                            لا توجد بيانات فصائل دم
                          </p>
                        )}
                      </div>

                      {/* Gender Distribution */}
                      <div className="bg-gradient-to-r from-blue-50 to-pink-50 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          نسب التوزيع حسب الجنس
                        </h4>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between mb-2">
                              <span className="text-blue-700 font-medium">
                                ذكور
                              </span>
                              <span className="text-blue-900 font-bold">
                                {stats.total > 0
                                  ? Math.round((stats.male / stats.total) * 100)
                                  : 0}
                                %
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{
                                  width:
                                    stats.total > 0
                                      ? `${(stats.male / stats.total) * 100}%`
                                      : "0%",
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between mb-2">
                              <span className="text-pink-700 font-medium">
                                إناث
                              </span>
                              <span className="text-pink-900 font-bold">
                                {stats.total > 0
                                  ? Math.round(
                                      (stats.female / stats.total) * 100
                                    )
                                  : 0}
                                %
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-pink-500 h-2 rounded-full transition-all"
                                style={{
                                  width:
                                    stats.total > 0
                                      ? `${(stats.female / stats.total) * 100}%`
                                      : "0%",
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex justify-center gap-3 pt-4 border-t">
                        <button
                          onClick={exportToCSV}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          تصدير البيانات
                        </button>
                        <button
                          onClick={printPatients}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                          طباعة التقرير
                        </button>
                        <button
                          onClick={() => setShowStatsModal(false)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          إغلاق
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Patients;
