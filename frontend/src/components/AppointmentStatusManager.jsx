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
  User,
  FileText,
  ArrowRight,
  Bell,
  MessageSquare,
} from "lucide-react";
import {
  appointmentsAPI,
  showSuccessMessage,
  handleApiError,
} from "../services/api";
import AppointmentStatusFlow from "./AppointmentStatusFlow";
import toast from "react-hot-toast";

const AppointmentStatusManager = ({ appointment, onUpdate, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  // Status definitions with enhanced metadata
  const statusDefinitions = {
    scheduled: {
      label: "مجدول",
      color: "blue",
      icon: Calendar,
      description: "الموعد مجدول وفي انتظار التأكيد",
      nextActions: ["confirm", "cancel", "reschedule"],
    },
    confirmed: {
      label: "مؤكد",
      color: "green",
      icon: CheckCircle,
      description: "الموعد مؤكد من قبل المريض",
      nextActions: ["check-in", "cancel", "reschedule", "no-show"],
    },
    "checked-in": {
      label: "تم الوصول",
      color: "yellow",
      icon: UserCheck,
      description: "وصل المريض وتم تسجيل وصوله",
      nextActions: ["start-consultation", "cancel"],
    },
    "in-progress": {
      label: "جاري الكشف",
      color: "orange",
      icon: Activity,
      description: "الطبيب يكشف على المريض حالياً",
      nextActions: ["complete", "cancel"],
    },
    completed: {
      label: "مكتمل",
      color: "green",
      icon: CheckCircle,
      description: "انتهاء الموعد بنجاح",
      nextActions: ["add-notes"],
    },
    cancelled: {
      label: "ملغي",
      color: "red",
      icon: XCircle,
      description: "تم إلغاء الموعد",
      nextActions: ["reschedule"],
    },
    "no-show": {
      label: "لم يحضر",
      color: "gray",
      icon: AlertCircle,
      description: "لم يحضر المريض للموعد",
      nextActions: ["reschedule", "cancel"],
    },
    rescheduled: {
      label: "معاد الجدولة",
      color: "purple",
      icon: Calendar,
      description: "تم إعادة جدولة الموعد",
      nextActions: ["confirm", "cancel"],
    },
  };

  // Action definitions
  const actionDefinitions = {
    confirm: {
      label: "تأكيد الموعد",
      color: "green",
      icon: CheckCircle,
      newStatus: "confirmed",
      requiresReason: false,
      description: "تأكيد الموعد مع المريض",
    },
    "check-in": {
      label: "تسجيل الوصول",
      color: "yellow",
      icon: UserCheck,
      newStatus: "checked-in",
      requiresReason: false,
      description: "تسجيل وصول المريض",
    },
    "start-consultation": {
      label: "بدء الكشف",
      color: "orange",
      icon: Activity,
      newStatus: "in-progress",
      requiresReason: false,
      description: "بدء الكشف الطبي",
    },
    complete: {
      label: "إنهاء الموعد",
      color: "green",
      icon: CheckCircle,
      newStatus: "completed",
      requiresReason: false,
      description: "إنهاء الموعد بنجاح",
    },
    cancel: {
      label: "إلغاء الموعد",
      color: "red",
      icon: XCircle,
      newStatus: "cancelled",
      requiresReason: true,
      description: "إلغاء الموعد",
    },
    "no-show": {
      label: "عدم الحضور",
      color: "gray",
      icon: AlertCircle,
      newStatus: "no-show",
      requiresReason: true,
      description: "المريض لم يحضر",
    },
    reschedule: {
      label: "إعادة الجدولة",
      color: "purple",
      icon: Calendar,
      newStatus: "rescheduled",
      requiresReason: true,
      description: "إعادة جدولة الموعد",
    },
    "add-notes": {
      label: "إضافة ملاحظات",
      color: "blue",
      icon: FileText,
      requiresReason: false,
      description: "إضافة ملاحظات للموعد",
    },
  };

  const currentStatus = statusDefinitions[appointment.status];
  const availableActions = currentStatus?.nextActions || [];

  const handleAction = (actionKey) => {
    const action = actionDefinitions[actionKey];
    setSelectedAction({ key: actionKey, ...action });

    if (action.requiresReason || actionKey === "add-notes") {
      setShowConfirmDialog(true);
    } else {
      executeAction(actionKey, action);
    }
  };

  const executeAction = async (actionKey, action) => {
    try {
      setLoading(true);

      let response;
      switch (actionKey) {
        case "confirm":
          response = await appointmentsAPI.confirm(appointment._id);
          break;
        case "check-in":
          response = await appointmentsAPI.checkIn(appointment._id);
          break;
        case "start-consultation":
          response = await appointmentsAPI.updateStatus(appointment._id, {
            status: "in-progress",
          });
          break;
        case "complete":
          response = await appointmentsAPI.checkOut(appointment._id);
          break;
        case "cancel":
          response = await appointmentsAPI.cancel(appointment._id, {
            reason: reason,
            cancelledBy: "staff",
          });
          break;
        case "no-show":
          response = await appointmentsAPI.updateStatus(appointment._id, {
            status: "no-show",
            cancellationReason: reason,
          });
          break;
        case "reschedule":
          // This would open a reschedule dialog - for now just update status
          response = await appointmentsAPI.updateStatus(appointment._id, {
            status: "rescheduled",
            rescheduledFrom: {
              originalDate: appointment.appointmentDate,
              originalTime: appointment.appointmentTime,
              reason: reason,
            },
          });
          break;
        case "add-notes":
          response = await appointmentsAPI.addNote(appointment._id, {
            note: notes,
          });
          break;
        default:
          throw new Error("Invalid action");
      }

      showSuccessMessage(`تم ${action.label} بنجاح`);
      onUpdate && onUpdate(response.data.data.appointment);
      setShowConfirmDialog(false);
      setReason("");
      setNotes("");
    } catch (error) {
      console.error("Error executing action:", error);
      handleApiError(error, `فشل في ${action.label}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusInfo = statusDefinitions[status];
    return statusInfo?.color || "gray";
  };

  const getStatusIcon = (status) => {
    const statusInfo = statusDefinitions[status];
    return statusInfo?.icon || AlertCircle;
  };

  const [showWorkflow, setShowWorkflow] = useState(false);

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setShowWorkflow(false)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            !showWorkflow
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          إدارة الحالة
        </button>
        <button
          onClick={() => setShowWorkflow(true)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            showWorkflow
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          سير العمل
        </button>
      </div>

      {showWorkflow ? (
        <AppointmentStatusFlow
          currentStatus={appointment.status}
          onStatusClick={(statusId) => {
            // Find the action that leads to this status
            const actionKey = Object.keys(actionDefinitions).find(
              (key) => actionDefinitions[key].newStatus === statusId
            );
            if (actionKey && availableActions.includes(actionKey)) {
              handleAction(actionKey);
            }
          }}
        />
      ) : (
        <div className="space-y-6">
          {/* Current Status Display */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                حالة الموعد الحالية
              </h3>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    currentStatus?.color === "green"
                      ? "bg-green-500"
                      : currentStatus?.color === "blue"
                      ? "bg-blue-500"
                      : currentStatus?.color === "yellow"
                      ? "bg-yellow-500"
                      : currentStatus?.color === "orange"
                      ? "bg-orange-500"
                      : currentStatus?.color === "red"
                      ? "bg-red-500"
                      : currentStatus?.color === "purple"
                      ? "bg-purple-500"
                      : "bg-gray-500"
                  }`}
                ></div>
                <span className="text-sm text-gray-600">مُحدث الآن</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  currentStatus?.color === "green"
                    ? "bg-green-100"
                    : currentStatus?.color === "blue"
                    ? "bg-blue-100"
                    : currentStatus?.color === "yellow"
                    ? "bg-yellow-100"
                    : currentStatus?.color === "orange"
                    ? "bg-orange-100"
                    : currentStatus?.color === "red"
                    ? "bg-red-100"
                    : currentStatus?.color === "purple"
                    ? "bg-purple-100"
                    : "bg-gray-100"
                }`}
              >
                {currentStatus?.icon && (
                  <currentStatus.icon
                    className={`w-8 h-8 ${
                      currentStatus?.color === "green"
                        ? "text-green-600"
                        : currentStatus?.color === "blue"
                        ? "text-blue-600"
                        : currentStatus?.color === "yellow"
                        ? "text-yellow-600"
                        : currentStatus?.color === "orange"
                        ? "text-orange-600"
                        : currentStatus?.color === "red"
                        ? "text-red-600"
                        : currentStatus?.color === "purple"
                        ? "text-purple-600"
                        : "text-gray-600"
                    }`}
                  />
                )}
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900">
                  {currentStatus?.label}
                </h4>
                <p className="text-gray-600 mt-1">
                  {currentStatus?.description}
                </p>
              </div>
            </div>
          </div>

          {/* Available Actions */}
          {availableActions.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                الإجراءات المتاحة
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableActions.map((actionKey) => {
                  const action = actionDefinitions[actionKey];
                  if (!action) return null;

                  return (
                    <motion.button
                      key={actionKey}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAction(actionKey)}
                      disabled={loading}
                      className={`p-4 rounded-lg border-2 border-gray-200 hover:border-${action.color}-300 
                             bg-${action.color}-50 hover:bg-${action.color}-100 
                             transition-all duration-200 text-right group`}
                    >
                      <div className="flex items-center gap-3">
                        <action.icon
                          className={`w-6 h-6 text-${action.color}-600`}
                        />
                        <div>
                          <p className={`font-medium text-${action.color}-800`}>
                            {action.label}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status History */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              تاريخ الحالة
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center bg-${currentStatus?.color}-100`}
                >
                  {currentStatus?.icon && (
                    <currentStatus.icon
                      className={`w-4 h-4 text-${currentStatus?.color}-600`}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {currentStatus?.label}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(appointment.updatedAt).toLocaleString("ar-SA")}
                  </p>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  حالي
                </span>
              </div>
            </div>
          </div>

          {/* Confirmation Dialog */}
          <AnimatePresence>
            {showConfirmDialog && selectedAction && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={() => setShowConfirmDialog(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <selectedAction.icon
                      className={`w-6 h-6 text-${selectedAction.color}-600`}
                    />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedAction.label}
                    </h3>
                  </div>

                  <p className="text-gray-600 mb-4">
                    {selectedAction.description}
                  </p>

                  {selectedAction.key === "add-notes" ? (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        الملاحظات
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                        placeholder="أدخل الملاحظات..."
                      />
                    </div>
                  ) : (
                    selectedAction.requiresReason && (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          السبب <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                          placeholder="أدخل سبب هذا الإجراء..."
                          required
                        />
                      </div>
                    )
                  )}

                  <div className="flex gap-3 justify-end mt-6">
                    <button
                      onClick={() => setShowConfirmDialog(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      disabled={loading}
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={() =>
                        executeAction(selectedAction.key, selectedAction)
                      }
                      disabled={
                        loading ||
                        (selectedAction.requiresReason && !reason.trim()) ||
                        (selectedAction.key === "add-notes" && !notes.trim())
                      }
                      className={`px-6 py-2 bg-${selectedAction.color}-600 text-white rounded-lg 
                             hover:bg-${selectedAction.color}-700 disabled:opacity-50 
                             disabled:cursor-not-allowed transition-colors`}
                    >
                      {loading ? "جاري التنفيذ..." : "تأكيد"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AppointmentStatusManager;
