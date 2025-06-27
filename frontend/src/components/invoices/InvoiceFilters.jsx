import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Filter,
  X,
  Calendar,
  DollarSign,
  User,
  FileText,
  ChevronDown,
  RotateCcw,
  Search,
} from "lucide-react";
import { patientsAPI, doctorsAPI } from "../../services/api";

const InvoiceFilters = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters = {},
}) => {
  const [filters, setFilters] = useState({
    invoiceNumber: "",
    patientId: "",
    doctorId: "",
    status: "",
    paymentStatus: "",
    dateRange: {
      startDate: "",
      endDate: "",
    },
    amountRange: {
      min: "",
      max: "",
    },
    ...currentFilters,
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: "draft", label: "مسودة" },
    { value: "issued", label: "صادرة" },
    { value: "sent", label: "مرسلة" },
    { value: "cancelled", label: "ملغية" },
    { value: "void", label: "باطلة" },
  ];

  const paymentStatusOptions = [
    { value: "unpaid", label: "غير مدفوعة" },
    { value: "partially_paid", label: "مدفوعة جزئياً" },
    { value: "paid", label: "مدفوعة" },
    { value: "overdue", label: "متأخرة" },
    { value: "refunded", label: "مسترجعة" },
  ];

  useEffect(() => {
    if (isOpen) {
      loadOptions();
    }
  }, [isOpen]);

  const loadOptions = async () => {
    try {
      setLoading(true);
      const [patientsResponse, doctorsResponse] = await Promise.all([
        patientsAPI.getAll({ limit: 100 }),
        doctorsAPI.getAll({ limit: 100 }),
      ]);

      // Handle different response structures for patients
      let patientsData = patientsResponse.data?.data;
      if (
        patientsData &&
        typeof patientsData === "object" &&
        !Array.isArray(patientsData)
      ) {
        if (patientsData.patients && Array.isArray(patientsData.patients)) {
          patientsData = patientsData.patients;
        } else if (
          patientsData.results &&
          Array.isArray(patientsData.results)
        ) {
          patientsData = patientsData.results;
        } else {
          patientsData = [];
        }
      }
      setPatients(Array.isArray(patientsData) ? patientsData : []);

      // Handle different response structures for doctors
      let doctorsData = doctorsResponse.data?.data;
      if (
        doctorsData &&
        typeof doctorsData === "object" &&
        !Array.isArray(doctorsData)
      ) {
        if (doctorsData.doctors && Array.isArray(doctorsData.doctors)) {
          doctorsData = doctorsData.doctors;
        } else if (doctorsData.results && Array.isArray(doctorsData.results)) {
          doctorsData = doctorsData.results;
        } else {
          doctorsData = [];
        }
      }
      setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
    } catch (error) {
      console.error("Error loading filter options:", error);
      setPatients([]);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDateRangeChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [key]: value,
      },
    }));
  };

  const handleAmountRangeChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      amountRange: {
        ...prev.amountRange,
        [key]: value,
      },
    }));
  };

  const resetFilters = () => {
    setFilters({
      invoiceNumber: "",
      patientId: "",
      doctorId: "",
      status: "",
      paymentStatus: "",
      dateRange: {
        startDate: "",
        endDate: "",
      },
      amountRange: {
        min: "",
        max: "",
      },
    });
  };

  const applyFilters = () => {
    // Remove empty values
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (key === "dateRange" || key === "amountRange") {
        const cleanSubObject = Object.entries(value).reduce(
          (subAcc, [subKey, subValue]) => {
            if (subValue !== "") {
              subAcc[subKey] = subValue;
            }
            return subAcc;
          },
          {}
        );
        if (Object.keys(cleanSubObject).length > 0) {
          acc[key] = cleanSubObject;
        }
      } else if (value !== "") {
        acc[key] = value;
      }
      return acc;
    }, {});

    onApplyFilters(cleanFilters);
    onClose();
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some((value) => {
      if (typeof value === "object") {
        return Object.values(value).some((subValue) => subValue !== "");
      }
      return value !== "";
    });
  };

  if (!isOpen) return null;

  return (
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
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="w-6 h-6" />
              <h2 className="text-xl font-bold">مرشحات متقدمة</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 p-6">
          <div className="space-y-6">
            {/* Invoice Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الفاتورة
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.invoiceNumber}
                  onChange={(e) =>
                    handleFilterChange("invoiceNumber", e.target.value)
                  }
                  placeholder="البحث برقم الفاتورة"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Patient Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المريض
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <select
                  value={filters.patientId}
                  onChange={(e) =>
                    handleFilterChange("patientId", e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="">جميع المرضى</option>
                  {Array.isArray(patients)
                    ? patients.map((patient) => (
                        <option key={patient._id} value={patient._id}>
                          {patient.firstName} {patient.lastName}
                        </option>
                      ))
                    : null}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Doctor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الطبيب
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <select
                  value={filters.doctorId}
                  onChange={(e) =>
                    handleFilterChange("doctorId", e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="">جميع الأطباء</option>
                  {Array.isArray(doctors)
                    ? doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>
                          د. {doctor.firstName} {doctor.lastName} -{" "}
                          {doctor.specialization}
                        </option>
                      ))
                    : null}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Status Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  حالة الفاتورة
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">جميع الحالات</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  حالة الدفع
                </label>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) =>
                    handleFilterChange("paymentStatus", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">جميع حالات الدفع</option>
                  {paymentStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                فترة التاريخ
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={filters.dateRange.startDate}
                    onChange={(e) =>
                      handleDateRangeChange("startDate", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="من تاريخ"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={filters.dateRange.endDate}
                    onChange={(e) =>
                      handleDateRangeChange("endDate", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="إلى تاريخ"
                  />
                </div>
              </div>
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نطاق المبلغ (ريال)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={filters.amountRange.min}
                    onChange={(e) =>
                      handleAmountRangeChange("min", e.target.value)
                    }
                    placeholder="أقل مبلغ"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={filters.amountRange.max}
                    onChange={(e) =>
                      handleAmountRangeChange("max", e.target.value)
                    }
                    placeholder="أعلى مبلغ"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={!hasActiveFilters()}
            >
              <RotateCcw className="w-4 h-4" />
              إعادة تعيين
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={applyFilters}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Search className="w-4 h-4" />
                تطبيق المرشحات
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InvoiceFilters;
