import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  Calendar,
  Filter,
  X,
  CheckCircle,
} from "lucide-react";
import { appointmentsAPI } from "../services/api";
import toast from "react-hot-toast";

const AppointmentExport = ({ appointments, filters, onClose }) => {
  const [exportType, setExportType] = useState("print");
  const [printOptions, setPrintOptions] = useState({
    includePatientDetails: true,
    includeDoctorDetails: true,
    includeNotes: false,
    includeStatus: true,
    groupByDate: true,
    showFilters: true,
  });
  const [loading, setLoading] = useState(false);

  const exportOptions = [
    {
      id: "excel",
      name: "Excel (.xlsx)",
      icon: FileSpreadsheet,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: "pdf",
      name: "PDF",
      icon: FileText,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      id: "print",
      name: "طباعة مباشرة",
      icon: Printer,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  const handleExport = async () => {
    try {
      setLoading(true);

      if (exportType === "print") {
        handlePrint();
        return;
      }

      const exportData = {
        appointments: appointments,
        filters: filters,
        options: printOptions,
        exportType: exportType,
      };

      let response;
      if (exportType === "excel") {
        response = await appointmentsAPI.exportToExcel(exportData);
      } else if (exportType === "pdf") {
        response = await appointmentsAPI.exportToPDF(exportData);
      }

      // Download the file
      const blob = new Blob([response.data], {
        type:
          exportType === "excel"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `appointments_${new Date().toISOString().split("T")[0]}.${
        exportType === "excel" ? "xlsx" : "pdf"
      }`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast.success(`تم تصدير البيانات بنجاح`);
      onClose?.();
    } catch (error) {
      console.error("Export error:", error);
      toast.error("فشل في تصدير البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = generatePrintContent();
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>تقرير المواعيد</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            direction: rtl;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #1f2937;
            margin: 0;
            font-size: 24px;
          }
          .header p {
            color: #6b7280;
            margin: 5px 0 0 0;
          }
          .filters {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .filters h3 {
            margin: 0 0 10px 0;
            color: #374151;
            font-size: 16px;
          }
          .filter-item {
            display: inline-block;
            margin: 5px 10px 5px 0;
            padding: 5px 10px;
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            background: white;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 10px;
            text-align: right;
          }
          th {
            background: #f3f4f6;
            font-weight: 600;
            color: #374151;
          }
          .status-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
          }
          .status-scheduled { background: #dbeafe; color: #1e40af; }
          .status-confirmed { background: #dcfce7; color: #166534; }
          .status-checked-in { background: #fef3c7; color: #92400e; }
          .status-in-progress { background: #fed7aa; color: #c2410c; }
          .status-completed { background: #dcfce7; color: #166534; }
          .status-cancelled { background: #fee2e2; color: #dc2626; }
          .status-no-show { background: #f3f4f6; color: #6b7280; }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);

    toast.success("تم إرسال التقرير للطباعة");
    onClose?.();
  };

  const generatePrintContent = () => {
    const statusLabels = {
      scheduled: "مجدول",
      confirmed: "مؤكد",
      "checked-in": "تم الوصول",
      "in-progress": "جاري",
      completed: "مكتمل",
      cancelled: "ملغي",
      "no-show": "لم يحضر",
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const formatTime = (timeString) => {
      return timeString || "--";
    };

    let content = `
      <div class="header">
                    <h1>تقرير المواعيد - مستشفى المشروع الأول الطبي</h1>
        <p>تاريخ التقرير: ${new Date().toLocaleDateString("ar-SA")}</p>
        <p>إجمالي المواعيد: ${appointments.length}</p>
      </div>
    `;

    // Add filters if enabled
    if (printOptions.showFilters && filters) {
      content += `
        <div class="filters">
          <h3>معايير البحث المطبقة:</h3>
      `;

      if (filters.startDate) {
        content += `<span class="filter-item">من تاريخ: ${formatDate(
          filters.startDate
        )}</span>`;
      }
      if (filters.endDate) {
        content += `<span class="filter-item">إلى تاريخ: ${formatDate(
          filters.endDate
        )}</span>`;
      }
      if (filters.status) {
        content += `<span class="filter-item">الحالة: ${
          statusLabels[filters.status] || filters.status
        }</span>`;
      }
      if (filters.doctorName) {
        content += `<span class="filter-item">الطبيب: ${filters.doctorName}</span>`;
      }
      if (filters.patientName) {
        content += `<span class="filter-item">المريض: ${filters.patientName}</span>`;
      }

      content += `</div>`;
    }

    // Group by date if enabled
    if (printOptions.groupByDate) {
      const groupedAppointments = appointments.reduce((groups, appointment) => {
        const date = appointment.appointmentDate.split("T")[0];
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(appointment);
        return groups;
      }, {});

      Object.keys(groupedAppointments)
        .sort()
        .forEach((date) => {
          content += `
          <h2 style="margin-top: 30px; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">
            ${formatDate(date)} - ${groupedAppointments[date].length} موعد
          </h2>
          <table>
            <thead>
              <tr>
                <th>الوقت</th>
                ${printOptions.includePatientDetails ? "<th>المريض</th>" : ""}
                ${printOptions.includeDoctorDetails ? "<th>الطبيب</th>" : ""}
                <th>نوع الموعد</th>
                ${printOptions.includeStatus ? "<th>الحالة</th>" : ""}
                ${printOptions.includeNotes ? "<th>ملاحظات</th>" : ""}
              </tr>
            </thead>
            <tbody>
        `;

          groupedAppointments[date].forEach((appointment) => {
            content += `
            <tr>
              <td>${formatTime(appointment.appointmentTime)}</td>
              ${
                printOptions.includePatientDetails
                  ? `
                <td>
                  ${
                    appointment.patient
                      ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                      : "غير محدد"
                  }
                  ${
                    appointment.patient?.phone
                      ? `<br><small>هاتف: ${appointment.patient.phone}</small>`
                      : ""
                  }
                </td>
              `
                  : ""
              }
              ${
                printOptions.includeDoctorDetails
                  ? `
                <td>
                  د. ${
                    appointment.doctor
                      ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                      : "غير محدد"
                  }
                  ${
                    appointment.doctor?.specialization
                      ? `<br><small>${appointment.doctor.specialization}</small>`
                      : ""
                  }
                </td>
              `
                  : ""
              }
              <td>${appointment.appointmentType || "استشارة"}</td>
              ${
                printOptions.includeStatus
                  ? `
                <td>
                  <span class="status-badge status-${appointment.status}">
                    ${statusLabels[appointment.status] || appointment.status}
                  </span>
                </td>
              `
                  : ""
              }
              ${
                printOptions.includeNotes
                  ? `
                <td>${appointment.notes || "--"}</td>
              `
                  : ""
              }
            </tr>
          `;
          });

          content += `
            </tbody>
          </table>
        `;
        });
    } else {
      // Single table for all appointments
      content += `
        <table>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>الوقت</th>
              ${printOptions.includePatientDetails ? "<th>المريض</th>" : ""}
              ${printOptions.includeDoctorDetails ? "<th>الطبيب</th>" : ""}
              <th>نوع الموعد</th>
              ${printOptions.includeStatus ? "<th>الحالة</th>" : ""}
              ${printOptions.includeNotes ? "<th>ملاحظات</th>" : ""}
            </tr>
          </thead>
          <tbody>
      `;

      appointments.forEach((appointment) => {
        content += `
          <tr>
            <td>${formatDate(appointment.appointmentDate)}</td>
            <td>${formatTime(appointment.appointmentTime)}</td>
            ${
              printOptions.includePatientDetails
                ? `
              <td>
                ${
                  appointment.patient
                    ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                    : "غير محدد"
                }
                ${
                  appointment.patient?.phone
                    ? `<br><small>هاتف: ${appointment.patient.phone}</small>`
                    : ""
                }
              </td>
            `
                : ""
            }
            ${
              printOptions.includeDoctorDetails
                ? `
              <td>
                د. ${
                  appointment.doctor
                    ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                    : "غير محدد"
                }
                ${
                  appointment.doctor?.specialization
                    ? `<br><small>${appointment.doctor.specialization}</small>`
                    : ""
                }
              </td>
            `
                : ""
            }
            <td>${appointment.appointmentType || "استشارة"}</td>
            ${
              printOptions.includeStatus
                ? `
              <td>
                <span class="status-badge status-${appointment.status}">
                  ${statusLabels[appointment.status] || appointment.status}
                </span>
              </td>
            `
                : ""
            }
            ${
              printOptions.includeNotes
                ? `
              <td>${appointment.notes || "--"}</td>
            `
                : ""
            }
          </tr>
        `;
      });

      content += `
          </tbody>
        </table>
      `;
    }

    content += `
      <div class="footer">
                  <p>تم إنشاء هذا التقرير بواسطة نظام إدارة مستشفى المشروع الأول الطبي</p>
        <p>تاريخ الطباعة: ${new Date().toLocaleString("ar-SA")}</p>
      </div>
    `;

    return content;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  تصدير وطباعة المواعيد
                </h3>
                <p className="text-sm text-gray-600">
                  {appointments.length} موعد محدد للتصدير
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Export Type Selection */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              اختر نوع التصدير
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {exportOptions.map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setExportType(option.id)}
                  className={`
                    p-4 rounded-lg border-2 transition-all text-right
                    ${
                      exportType === option.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 ${option.bgColor} rounded-lg flex items-center justify-center`}
                    >
                      <option.icon className={`w-4 h-4 ${option.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {option.name}
                      </p>
                    </div>
                    {exportType === option.id && (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Print Options */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              خيارات التصدير
            </h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={printOptions.includePatientDetails}
                  onChange={(e) =>
                    setPrintOptions((prev) => ({
                      ...prev,
                      includePatientDetails: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  تضمين تفاصيل المرضى
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={printOptions.includeDoctorDetails}
                  onChange={(e) =>
                    setPrintOptions((prev) => ({
                      ...prev,
                      includeDoctorDetails: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  تضمين تفاصيل الأطباء
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={printOptions.includeStatus}
                  onChange={(e) =>
                    setPrintOptions((prev) => ({
                      ...prev,
                      includeStatus: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">تضمين حالة الموعد</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={printOptions.includeNotes}
                  onChange={(e) =>
                    setPrintOptions((prev) => ({
                      ...prev,
                      includeNotes: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">تضمين الملاحظات</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={printOptions.groupByDate}
                  onChange={(e) =>
                    setPrintOptions((prev) => ({
                      ...prev,
                      groupByDate: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">تجميع حسب التاريخ</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={printOptions.showFilters}
                  onChange={(e) =>
                    setPrintOptions((prev) => ({
                      ...prev,
                      showFilters: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  إظهار معايير البحث المطبقة
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              إلغاء
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExport}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  جاري المعالجة...
                </>
              ) : (
                <>
                  {exportType === "print" ? (
                    <Printer className="w-4 h-4" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {exportType === "print" ? "طباعة" : "تصدير"}
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AppointmentExport;
