import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Clock,
  UserCheck,
  Activity,
  XCircle,
  AlertCircle,
  Calendar,
  FileText,
  Users,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";
import {
  appointmentsAPI,
  showSuccessMessage,
  handleApiError,
} from "../services/api";

const BulkStatusManager = ({ selectedAppointments, onUpdate, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [reason, setReason] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [progress, setProgress] = useState({
    completed: 0,
    total: 0,
    errors: [],
  });

  const statusOptions = [
    {
      value: "confirmed",
      label: "تأكيد المواعيد",
      color: "green",
      icon: CheckCircle,
    },
    {
      value: "cancelled",
      label: "إلغاء المواعيد",
      color: "red",
      icon: XCircle,
      requiresReason: true,
    },
    {
      value: "no-show",
      label: "عدم الحضور",
      color: "gray",
      icon: AlertCircle,
      requiresReason: true,
    },
    {
      value: "rescheduled",
      label: "إعادة الجدولة",
      color: "purple",
      icon: Calendar,
      requiresReason: true,
    },
  ];

  const selectedOption = statusOptions.find(
    (opt) => opt.value === selectedStatus
  );

  const getAppointmentInfo = (appointment) => {
    const patientName = appointment.patient
      ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
      : "غير محدد";
    const doctorName = appointment.doctor
      ? `د. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
      : "غير محدد";
    const date = new Date(appointment.appointmentDate).toLocaleDateString(
      "ar-SA"
    );
    const time = appointment.appointmentTime;

    return { patientName, doctorName, date, time };
  };

  const validateSelection = () => {
    if (!selectedStatus) {
      return "يرجى اختيار الحالة الجديدة";
    }
    if (selectedOption?.requiresReason && !reason.trim()) {
      return "يرجى إدخال سبب هذا التغيير";
    }
    return null;
  };

  const handleBulkUpdate = async () => {
    const validationError = validateSelection();
    if (validationError) {
      handleApiError(new Error(validationError));
      return;
    }

    setShowConfirmation(true);
  };

  const executeBulkUpdate = async () => {
    try {
      setLoading(true);
      setProgress({
        completed: 0,
        total: selectedAppointments.length,
        errors: [],
      });

      const appointmentIds = selectedAppointments.map((apt) => apt._id);
      const updateData = { status: selectedStatus };

      if (selectedOption?.requiresReason) {
        if (selectedStatus === "cancelled") {
          updateData.cancellationReason = reason;
          updateData.cancelledBy = "staff";
          updateData.cancelledAt = new Date();
        } else if (selectedStatus === "no-show") {
          updateData.cancellationReason = reason;
        } else if (selectedStatus === "rescheduled") {
          updateData.rescheduledFrom = {
            reason: reason,
          };
        }
      }

      const response = await appointmentsAPI.bulkUpdate({
        appointmentIds,
        updateData,
      });

      showSuccessMessage(
        `تم تحديث ${response.data.data.modified} من ${selectedAppointments.length} موعد بنجاح`
      );

      onUpdate && onUpdate();
      onClose();
    } catch (error) {
      console.error("Error in bulk update:", error);
      handleApiError(error, "فشل في التحديث المجمع");
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Users className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            التحديث المجمع للمواعيد
          </h3>
          <p className="text-gray-600">
            تحديث {selectedAppointments.length} موعد مُحدد
          </p>
        </div>
      </div>

      {/* Selected Appointments Preview */}
      <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
        <h4 className="font-medium text-gray-900 mb-3">المواعيد المُحددة:</h4>
        <div className="space-y-2">
          {selectedAppointments.slice(0, 5).map((appointment) => {
            const { patientName, doctorName, date, time } =
              getAppointmentInfo(appointment);
            return (
              <div
                key={appointment._id}
                className="flex items-center justify-between bg-white p-3 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{patientName}</p>
                  <p className="text-sm text-gray-600">
                    {doctorName} • {date} • {time}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    appointment.status === "scheduled"
                      ? "bg-blue-100 text-blue-800"
                      : appointment.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : appointment.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {appointment.status === "scheduled"
                    ? "مجدول"
                    : appointment.status === "confirmed"
                    ? "مؤكد"
                    : appointment.status === "cancelled"
                    ? "ملغي"
                    : appointment.status}
                </span>
              </div>
            );
          })}
          {selectedAppointments.length > 5 && (
            <div className="text-center text-gray-600 text-sm py-2">
              و {selectedAppointments.length - 5} موعد إضافي...
            </div>
          )}
        </div>
      </div>

      {/* Status Selection */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            اختر الحالة الجديدة <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {statusOptions.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedStatus(option.value)}
                className={`p-4 rounded-lg border-2 transition-all text-right ${
                  selectedStatus === option.value
                    ? `border-${option.color}-500 bg-${option.color}-50`
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <option.icon
                    className={`w-5 h-5 ${
                      selectedStatus === option.value
                        ? `text-${option.color}-600`
                        : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      selectedStatus === option.value
                        ? `text-${option.color}-800`
                        : "text-gray-700"
                    }`}
                  >
                    {option.label}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Reason Input */}
        {selectedOption?.requiresReason && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-2"
          >
            <label className="block text-sm font-medium text-gray-700">
              سبب التغيير <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="أدخل سبب هذا التغيير..."
            />
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          disabled={loading}
        >
          إلغاء
        </button>
        <button
          onClick={handleBulkUpdate}
          disabled={
            loading ||
            !selectedStatus ||
            (selectedOption?.requiresReason && !reason.trim())
          }
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "جاري التحديث..." : "تحديث المواعيد"}
        </button>
      </div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => !loading && setShowConfirmation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    تأكيد التحديث
                  </h3>
                  <p className="text-gray-600">
                    هل أنت متأكد من تحديث هذه المواعيد؟
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">عدد المواعيد:</span>
                  <span className="font-medium">
                    {selectedAppointments.length}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">الحالة الجديدة:</span>
                  <span className="font-medium">{selectedOption?.label}</span>
                </div>
                {selectedOption?.requiresReason && (
                  <div className="mt-3">
                    <span className="text-sm text-gray-600">السبب:</span>
                    <p className="text-sm bg-white p-2 rounded mt-1">
                      {reason}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={loading}
                >
                  إلغاء
                </button>
                <button
                  onClick={executeBulkUpdate}
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "جاري التحديث..." : "تأكيد التحديث"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BulkStatusManager;
