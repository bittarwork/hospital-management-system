import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  Stethoscope,
  X,
  Activity,
  BarChart3,
  Clock,
  AlertTriangle,
  Download,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
} from "lucide-react";
import { medicalRecordsAPI, patientsAPI, doctorsAPI } from "../services/api";
import {
  MedicationManager,
  AllergyManager,
  VitalSignsManager,
  LabResultsManager,
  RadiologyManager,
  DiagnosisManager,
  CreateMedicalRecordForm,
} from "../components/medicalRecords";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    recordType: "",
    department: "",
    recordStatus: "",
    startDate: "",
    endDate: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("view"); // view, edit, create
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const recordTypes = [
    "consultation",
    "emergency_visit",
    "follow_up",
    "surgery",
    "procedure",
    "diagnostic_test",
    "laboratory_result",
    "radiology_result",
    "prescription",
    "discharge_summary",
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadRecords();
  }, [currentPage, filters, searchTerm]);

  const loadInitialData = async () => {
    try {
      // Load data sequentially to avoid rate limiting
      try {
        const patientsRes = await patientsAPI.getAll();
        setPatients(
          Array.isArray(patientsRes.data?.data) ? patientsRes.data.data : []
        );
      } catch (error) {
        console.error("Error loading patients:", error);
        setPatients([]);
      }

      try {
        const doctorsRes = await doctorsAPI.getAll();
        setDoctors(
          Array.isArray(doctorsRes.data?.data) ? doctorsRes.data.data : []
        );
      } catch (error) {
        console.error("Error loading doctors:", error);
        setDoctors([]);
      }

      try {
        const statsRes = await medicalRecordsAPI.getStats();
        setStats(statsRes.data?.data || {});
      } catch (error) {
        console.error("Error loading stats:", error);
        setStats({});
      }
    } catch (error) {
      console.error("❌ Error loading initial data:", error);
      // Don't show toast for initial load failures
    }
  };

  const loadRecords = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        ...filters,
      };

      if (searchTerm) {
        const response = await medicalRecordsAPI.search({
          query: searchTerm,
          ...params,
        });
        const records =
          response.data?.data?.medicalRecords ||
          response.data?.medicalRecords ||
          [];
        setRecords(Array.isArray(records) ? records : []);
        setTotalRecords(response.data?.count || response.data?.total || 0);
        setTotalPages(
          Math.ceil((response.data?.count || response.data?.total || 0) / 20)
        );
      } else {
        const response = await medicalRecordsAPI.getAll(params);
        const records =
          response.data?.data?.medicalRecords ||
          response.data?.medicalRecords ||
          response.data?.data ||
          [];
        setRecords(Array.isArray(records) ? records : []);
        setTotalPages(
          response.data?.data?.pagination?.totalPages ||
            response.data?.pagination?.totalPages ||
            1
        );
        setTotalRecords(
          response.data?.data?.pagination?.totalRecords ||
            response.data?.pagination?.totalRecords ||
            response.data?.count ||
            0
        );
      }
    } catch (error) {
      console.error("❌ Error loading records:", error);
      setRecords([]); // Ensure records is always an array
      setTotalRecords(0);
      setTotalPages(1);

      if (error.response && error.response.status === 429) {
        toast.error("عدد كبير من الطلبات. يرجى المحاولة بعد قليل.");
      } else {
        toast.error("خطأ في تحميل السجلات");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      recordType: "",
      department: "",
      recordStatus: "",
      startDate: "",
      endDate: "",
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  const openModal = (type, record = null) => {
    setModalType(type);
    setSelectedRecord(record);
    setActiveTab("overview");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRecord(null);
    setActiveTab("overview");
  };

  const handleRecordUpdate = () => {
    loadRecords();
    if (modalType !== "view") {
      closeModal();
    }
  };

  const getPatientName = (record) => {
    if (record.patient) {
      return `${record.patient.firstName} ${record.patient.lastName}`;
    }
    return "غير محدد";
  };

  const getDoctorName = (record) => {
    if (record.doctor) {
      return `د. ${record.doctor.firstName} ${record.doctor.lastName}`;
    }
    return "غير محدد";
  };

  const getRecordTypeLabel = (type) => {
    const types = {
      consultation: "استشارة",
      emergency_visit: "زيارة طوارئ",
      follow_up: "متابعة",
      surgery: "جراحة",
      procedure: "إجراء",
      diagnostic_test: "فحص تشخيصي",
      laboratory_result: "نتيجة مختبر",
      radiology_result: "نتيجة أشعة",
      prescription: "وصفة طبية",
      discharge_summary: "ملخص خروج",
    };
    return types[type] || type;
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-yellow-100 text-yellow-800",
      final: "bg-green-100 text-green-800",
      amended: "bg-blue-100 text-blue-800",
      corrected: "bg-purple-100 text-purple-800",
      archived: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                السجلات الطبية
              </h1>
              <p className="text-gray-600">إدارة شاملة للسجلات الطبية</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي السجلات</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.total || 0}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">اليوم</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.today || 0}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute right-3 top-3" />
            <input
              type="text"
              placeholder="البحث في السجلات (المريض، التشخيص، الملاحظات)..."
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              value={filters.recordType}
              onChange={(e) => handleFilterChange("recordType", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الأنواع</option>
              {recordTypes.map((type) => (
                <option key={type} value={type}>
                  {getRecordTypeLabel(type)}
                </option>
              ))}
            </select>

            <select
              value={filters.recordStatus}
              onChange={(e) =>
                handleFilterChange("recordStatus", e.target.value)
              }
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الحالات</option>
              <option value="draft">مسودة</option>
              <option value="final">نهائي</option>
              <option value="amended">معدل</option>
              <option value="archived">مؤرشف</option>
            </select>

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="من تاريخ"
            />

            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="إلى تاريخ"
            />

            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={clearFilters}
                className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                مسح الفلاتر
              </button>
              <button
                onClick={loadRecords}
                className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">عرض {totalRecords} نتيجة</p>
        <button
          onClick={() => openModal("create")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          سجل طبي جديد
        </button>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {loading ? (
          <LoadingSpinner
            size="lg"
            text="جاري تحميل السجلات الطبية..."
            className="py-12"
          />
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              لا توجد سجلات
            </h3>
            <p className="text-gray-500">لم يتم العثور على سجلات تطابق البحث</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    رقم السجل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    المريض
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الطبيب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    النوع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.map((record) => (
                  <motion.tr
                    key={record._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.recordId || "غير محدد"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900">
                            {getPatientName(record)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.patient?.nationalId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getDoctorName(record)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {record.doctor?.specialization}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        {getRecordTypeLabel(record.recordType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(record.visitDate).toLocaleDateString("ar-SA")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          record.recordStatus
                        )}`}
                      >
                        {record.recordStatus === "draft"
                          ? "مسودة"
                          : record.recordStatus === "final"
                          ? "نهائي"
                          : record.recordStatus === "amended"
                          ? "معدل"
                          : record.recordStatus === "archived"
                          ? "مؤرشف"
                          : record.recordStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <button
                          onClick={() => openModal("view", record)}
                          className="text-blue-600 hover:text-blue-900"
                          title="عرض"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal("edit", record)}
                          className="text-green-600 hover:text-green-900"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 bg-gray-50 border-t flex items-center justify-between">
            <div className="text-sm text-gray-700">
              صفحة {currentPage} من {totalPages}
            </div>
            <div className="flex space-x-1 space-x-reverse">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + Math.max(1, currentPage - 2);
                return page <= totalPages ? (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === page
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ) : null;
              })}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Medical Record Modal */}
      <AnimatePresence>
        {showModal && modalType === "create" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <CreateMedicalRecordForm
              onClose={closeModal}
              onSuccess={handleRecordUpdate}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced View/Edit Modal */}
      <AnimatePresence>
        {showModal && selectedRecord && modalType !== "create" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b bg-gray-50">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      السجل الطبي - {getPatientName(selectedRecord)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedRecord.recordId} •{" "}
                      {new Date(selectedRecord.visitDate).toLocaleDateString(
                        "ar-SA"
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content with Tabs */}
              <div className="flex h-[calc(95vh-140px)]">
                {/* Sidebar Navigation */}
                <div className="w-64 bg-gray-50 border-r p-4">
                  <nav className="space-y-2">
                    {[
                      { id: "overview", label: "نظرة عامة", icon: FileText },
                      { id: "diagnosis", label: "التشخيص", icon: Stethoscope },
                      {
                        id: "vitals",
                        label: "العلامات الحيوية",
                        icon: Activity,
                      },
                      { id: "medications", label: "الأدوية", icon: Plus },
                      {
                        id: "allergies",
                        label: "الحساسيات",
                        icon: AlertTriangle,
                      },
                      {
                        id: "lab-results",
                        label: "نتائج المختبر",
                        icon: BarChart3,
                      },
                      {
                        id: "radiology",
                        label: "نتائج الأشعة",
                        icon: Eye,
                      },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 space-x-reverse px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeTab === tab.id
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900">
                            المعلومات الأساسية
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">نوع السجل:</span>
                              <span className="font-medium">
                                {getRecordTypeLabel(selectedRecord.recordType)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">القسم:</span>
                              <span className="font-medium">
                                {selectedRecord.department || "غير محدد"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">الحالة:</span>
                              <span
                                className={`px-2 py-1 text-xs rounded ${getStatusColor(
                                  selectedRecord.recordStatus
                                )}`}
                              >
                                {selectedRecord.recordStatus}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900">
                            الشكوى الرئيسية
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-700">
                              {selectedRecord.chiefComplaint || "غير محدد"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {selectedRecord.assessment?.primaryDiagnosis && (
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900">
                            التشخيص الأساسي
                          </h4>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-blue-900">
                                  {
                                    selectedRecord.assessment.primaryDiagnosis
                                      .condition
                                  }
                                </p>
                                {selectedRecord.assessment.primaryDiagnosis
                                  .icdCode && (
                                  <p className="text-sm text-blue-700">
                                    كود ICD:{" "}
                                    {
                                      selectedRecord.assessment.primaryDiagnosis
                                        .icdCode
                                    }
                                  </p>
                                )}
                              </div>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  selectedRecord.assessment.primaryDiagnosis
                                    .confidence === "confirmed"
                                    ? "bg-green-100 text-green-800"
                                    : selectedRecord.assessment.primaryDiagnosis
                                        .confidence === "probable"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {
                                  selectedRecord.assessment.primaryDiagnosis
                                    .confidence
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedRecord.clinicalNotes && (
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900">
                            الملاحظات السريرية
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-700 whitespace-pre-wrap">
                              {selectedRecord.clinicalNotes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "vitals" && (
                    <VitalSignsManager
                      recordId={selectedRecord._id}
                      vitalSigns={
                        selectedRecord.physicalExamination?.vitalSigns
                      }
                      onUpdate={handleRecordUpdate}
                    />
                  )}

                  {activeTab === "medications" && (
                    <MedicationManager
                      recordId={selectedRecord._id}
                      medications={selectedRecord.currentMedications}
                      onUpdate={handleRecordUpdate}
                    />
                  )}

                  {activeTab === "allergies" && (
                    <AllergyManager
                      recordId={selectedRecord._id}
                      allergies={selectedRecord.allergies}
                      onUpdate={handleRecordUpdate}
                    />
                  )}

                  {activeTab === "diagnosis" && (
                    <DiagnosisManager
                      recordId={selectedRecord._id}
                      diagnosis={selectedRecord.assessment}
                      onUpdate={handleRecordUpdate}
                    />
                  )}

                  {activeTab === "lab-results" && (
                    <LabResultsManager
                      recordId={selectedRecord._id}
                      labResults={
                        selectedRecord.diagnosticTests?.laboratoryTests
                      }
                      onUpdate={handleRecordUpdate}
                    />
                  )}

                  {activeTab === "radiology" && (
                    <RadiologyManager
                      recordId={selectedRecord._id}
                      radiologyTests={
                        selectedRecord.diagnosticTests?.radiologyTests
                      }
                      onUpdate={handleRecordUpdate}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MedicalRecords;
