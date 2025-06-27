import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  X,
  FileText,
  File,
  FileSpreadsheet,
  Settings,
  CheckCircle,
  AlertCircle,
  Calendar,
  Filter,
} from "lucide-react";
import {
  invoicesAPI,
  handleApiError,
  showSuccessMessage,
} from "../../services/api";

const InvoiceExport = ({ isOpen, onClose, currentFilters = {} }) => {
  const [loading, setLoading] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    format: "csv",
    dateRange: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    },
    includeFields: {
      invoiceNumber: true,
      patient: true,
      doctor: true,
      date: true,
      dueDate: true,
      amount: true,
      paidAmount: true,
      status: true,
      paymentStatus: true,
      description: true,
      items: false,
      payments: false,
    },
    filterBy: "all", // all, filtered, dateRange
    status: [],
    paymentStatus: [],
  });

  const [exportHistory, setExportHistory] = useState([]);

  const formatOptions = [
    {
      value: "csv",
      label: "CSV",
      icon: FileSpreadsheet,
      description: "ملف CSV للاستيراد في Excel",
    },
    {
      value: "excel",
      label: "Excel",
      icon: FileSpreadsheet,
      description: "ملف Excel مع تنسيق متقدم",
    },
    {
      value: "pdf",
      label: "PDF",
      icon: FileText,
      description: "تقرير PDF مطبوع",
    },
    {
      value: "json",
      label: "JSON",
      icon: File,
      description: "بيانات JSON للمطورين",
    },
  ];

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

  const handleConfigChange = (key, value) => {
    setExportConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDateRangeChange = (key, value) => {
    setExportConfig((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [key]: value,
      },
    }));
  };

  const handleFieldChange = (field, checked) => {
    setExportConfig((prev) => ({
      ...prev,
      includeFields: {
        ...prev.includeFields,
        [field]: checked,
      },
    }));
  };

  const handleStatusChange = (statusType, value) => {
    setExportConfig((prev) => ({
      ...prev,
      [statusType]: prev[statusType].includes(value)
        ? prev[statusType].filter((s) => s !== value)
        : [...prev[statusType], value],
    }));
  };

  const validateConfig = () => {
    const errors = [];

    if (exportConfig.filterBy === "dateRange") {
      if (
        !exportConfig.dateRange.startDate ||
        !exportConfig.dateRange.endDate
      ) {
        errors.push("يرجى تحديد فترة تاريخ صحيحة");
      }
      if (
        new Date(exportConfig.dateRange.startDate) >
        new Date(exportConfig.dateRange.endDate)
      ) {
        errors.push("تاريخ البداية يجب أن يكون قبل تاريخ النهاية");
      }
    }

    const selectedFields = Object.values(exportConfig.includeFields).some(
      (v) => v
    );
    if (!selectedFields) {
      errors.push("يرجى اختيار حقل واحد على الأقل للتصدير");
    }

    return errors;
  };

  const exportInvoices = async () => {
    const errors = validateConfig();
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    try {
      setLoading(true);

      let filters = {};

      if (exportConfig.filterBy === "filtered") {
        filters = currentFilters;
      } else if (exportConfig.filterBy === "dateRange") {
        filters = {
          dateRange: exportConfig.dateRange,
        };
      }

      if (exportConfig.status.length > 0) {
        filters.status = exportConfig.status;
      }
      if (exportConfig.paymentStatus.length > 0) {
        filters.paymentStatus = exportConfig.paymentStatus;
      }

      // إعداد parameters للتصدير
      const exportParams = {
        format: exportConfig.format,
        ...filters,
      };

      // إضافة حالات الفاتورة والدفع إذا كانت محددة
      if (exportConfig.status.length > 0) {
        exportParams.status = exportConfig.status.join(",");
      }
      if (exportConfig.paymentStatus.length > 0) {
        exportParams.paymentStatus = exportConfig.paymentStatus.join(",");
      }

      const response = await invoicesAPI.exportInvoices(exportParams);

      // Handle file download based on format
      let fileContent = "";
      let mimeType = "text/plain";
      let fileExtension = exportConfig.format;

      if (exportConfig.format === "csv") {
        fileContent = response.data.data; // البيانات CSV من الخادم
        mimeType = "text/csv;charset=utf-8;";
      } else if (exportConfig.format === "json") {
        fileContent = JSON.stringify(response.data, null, 2);
        mimeType = "application/json";
      } else if (exportConfig.format === "excel") {
        // Convert CSV to Excel format (يمكن تحسينه لاحقاً)
        fileContent = response.data.data;
        mimeType = "application/vnd.ms-excel";
        fileExtension = "xls";
      } else {
        fileContent = JSON.stringify(response.data, null, 2);
      }

      // إنشاء الملف وتحميله
      const blob = new Blob([fileContent], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoices_${
        new Date().toISOString().split("T")[0]
      }.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Add to export history
      const newExport = {
        id: Date.now(),
        date: new Date().toISOString(),
        format: exportConfig.format,
        count: response.data?.count || response.data?.data?.count || 0,
        status: "completed",
      };
      setExportHistory((prev) => [newExport, ...prev.slice(0, 4)]); // Keep last 5 exports

      showSuccessMessage(
        `تم تصدير ${
          newExport.count
        } فاتورة بنجاح بصيغة ${exportConfig.format.toUpperCase()}!`
      );
    } catch (error) {
      handleApiError(error, "فشل في تصدير الفواتير");
    } finally {
      setLoading(false);
    }
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
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download className="w-6 h-6" />
              <h2 className="text-xl font-bold">تصدير الفواتير</h2>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Export Configuration */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  إعدادات التصدير
                </h3>

                {/* Format Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    صيغة الملف
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {formatOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <div
                          key={option.value}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            exportConfig.format === option.value
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() =>
                            handleConfigChange("format", option.value)
                          }
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <IconComponent className="w-5 h-5 text-green-600" />
                            <span className="font-medium">{option.label}</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {option.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Filter Options */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    نطاق البيانات
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="filterBy"
                        value="all"
                        checked={exportConfig.filterBy === "all"}
                        onChange={(e) =>
                          handleConfigChange("filterBy", e.target.value)
                        }
                        className="mr-2"
                      />
                      جميع الفواتير
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="filterBy"
                        value="filtered"
                        checked={exportConfig.filterBy === "filtered"}
                        onChange={(e) =>
                          handleConfigChange("filterBy", e.target.value)
                        }
                        className="mr-2"
                      />
                      الفواتير المفلترة حالياً
                      {Object.keys(currentFilters).length === 0 && (
                        <span className="text-xs text-gray-400 mr-2">
                          (لا توجد مرشحات)
                        </span>
                      )}
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="filterBy"
                        value="dateRange"
                        checked={exportConfig.filterBy === "dateRange"}
                        onChange={(e) =>
                          handleConfigChange("filterBy", e.target.value)
                        }
                        className="mr-2"
                      />
                      فترة تاريخ محددة
                    </label>
                  </div>

                  {exportConfig.filterBy === "dateRange" && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          من تاريخ
                        </label>
                        <input
                          type="date"
                          value={exportConfig.dateRange.startDate}
                          onChange={(e) =>
                            handleDateRangeChange("startDate", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          إلى تاريخ
                        </label>
                        <input
                          type="date"
                          value={exportConfig.dateRange.endDate}
                          onChange={(e) =>
                            handleDateRangeChange("endDate", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      حالة الفاتورة
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {statusOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={exportConfig.status.includes(option.value)}
                            onChange={() =>
                              handleStatusChange("status", option.value)
                            }
                            className="mr-2"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      حالة الدفع
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {paymentStatusOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={exportConfig.paymentStatus.includes(
                              option.value
                            )}
                            onChange={() =>
                              handleStatusChange("paymentStatus", option.value)
                            }
                            className="mr-2"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fields Selection & Export History */}
            <div className="space-y-6">
              {/* Fields to Include */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  الحقول المطلوب تصديرها
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries({
                      invoiceNumber: "رقم الفاتورة",
                      patient: "المريض",
                      doctor: "الطبيب",
                      date: "التاريخ",
                      dueDate: "تاريخ الاستحقاق",
                      amount: "المبلغ الإجمالي",
                      paidAmount: "المبلغ المدفوع",
                      status: "حالة الفاتورة",
                      paymentStatus: "حالة الدفع",
                      description: "الوصف",
                      items: "عناصر الفاتورة",
                      payments: "سجل المدفوعات",
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exportConfig.includeFields[key]}
                          onChange={(e) =>
                            handleFieldChange(key, e.target.checked)
                          }
                          className="mr-2"
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Export History */}
              {exportHistory.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    سجل التصديرات الأخيرة
                  </h3>
                  <div className="space-y-2">
                    {exportHistory.map((exp) => (
                      <div
                        key={exp.id}
                        className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">
                            {exp.format.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(exp.date).toLocaleDateString("ar-SA")}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {exp.count} فاتورة
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <AlertCircle className="w-4 h-4" />
              سيتم تحميل الملف تلقائياً بعد التصدير
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={exportInvoices}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    جاري التصدير...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    تصدير الفواتير
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InvoiceExport;
