import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle,
  UserCheck,
  Activity,
  XCircle,
  AlertCircle,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

const AppointmentStatusFlow = ({ currentStatus, onStatusClick }) => {
  const statusFlow = [
    {
      id: "scheduled",
      label: "مجدول",
      icon: Calendar,
      color: "blue",
      description: "الموعد مجدول وفي انتظار التأكيد",
      nextStates: ["confirmed", "cancelled", "rescheduled"],
    },
    {
      id: "confirmed",
      label: "مؤكد",
      icon: CheckCircle,
      color: "green",
      description: "تم تأكيد الموعد من المريض",
      nextStates: ["checked-in", "cancelled", "no-show", "rescheduled"],
    },
    {
      id: "checked-in",
      label: "تم الوصول",
      icon: UserCheck,
      color: "yellow",
      description: "وصل المريض وتم تسجيل وصوله",
      nextStates: ["in-progress", "cancelled"],
    },
    {
      id: "in-progress",
      label: "جاري الكشف",
      icon: Activity,
      color: "orange",
      description: "الطبيب يكشف على المريض حالياً",
      nextStates: ["completed"],
    },
    {
      id: "completed",
      label: "مكتمل",
      icon: CheckCircle,
      color: "green",
      description: "انتهى الموعد بنجاح",
      nextStates: [],
    },
  ];

  const specialStates = [
    {
      id: "cancelled",
      label: "ملغي",
      icon: XCircle,
      color: "red",
      description: "تم إلغاء الموعد",
      nextStates: ["rescheduled"],
    },
    {
      id: "no-show",
      label: "لم يحضر",
      icon: AlertCircle,
      color: "gray",
      description: "لم يحضر المريض للموعد",
      nextStates: ["rescheduled"],
    },
    {
      id: "rescheduled",
      label: "معاد الجدولة",
      icon: RotateCcw,
      color: "purple",
      description: "تم إعادة جدولة الموعد",
      nextStates: ["confirmed"],
    },
  ];

  const getStatusInfo = (statusId) => {
    return [...statusFlow, ...specialStates].find((s) => s.id === statusId);
  };

  const isCurrentStatus = (statusId) => statusId === currentStatus;
  const isNextPossibleStatus = (statusId) => {
    const current = getStatusInfo(currentStatus);
    return current?.nextStates.includes(statusId);
  };

  const getStatusColor = (status, variant = "bg") => {
    const colors = {
      blue:
        variant === "bg"
          ? "bg-blue-100"
          : variant === "text"
          ? "text-blue-800"
          : "border-blue-300",
      green:
        variant === "bg"
          ? "bg-green-100"
          : variant === "text"
          ? "text-green-800"
          : "border-green-300",
      yellow:
        variant === "bg"
          ? "bg-yellow-100"
          : variant === "text"
          ? "text-yellow-800"
          : "border-yellow-300",
      orange:
        variant === "bg"
          ? "bg-orange-100"
          : variant === "text"
          ? "text-orange-800"
          : "border-orange-300",
      red:
        variant === "bg"
          ? "bg-red-100"
          : variant === "text"
          ? "text-red-800"
          : "border-red-300",
      gray:
        variant === "bg"
          ? "bg-gray-100"
          : variant === "text"
          ? "text-gray-800"
          : "border-gray-300",
      purple:
        variant === "bg"
          ? "bg-purple-100"
          : variant === "text"
          ? "text-purple-800"
          : "border-purple-300",
    };
    return colors[status.color] || colors.gray;
  };

  const StatusCard = ({ status, index }) => {
    const isCurrent = isCurrentStatus(status.id);
    const isNextPossible = isNextPossibleStatus(status.id);
    const isClickable = onStatusClick && (isCurrent || isNextPossible);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
          isCurrent
            ? `${getStatusColor(status, "border")} ${getStatusColor(
                status
              )} ring-2 ring-${status.color}-200`
            : isNextPossible
            ? `border-gray-200 hover:${getStatusColor(
                status,
                "border"
              )} hover:${getStatusColor(status)}`
            : "border-gray-100 bg-gray-50 opacity-60"
        }`}
        onClick={() => isClickable && onStatusClick(status.id)}
        whileHover={isClickable ? { scale: 1.02 } : undefined}
        whileTap={isClickable ? { scale: 0.98 } : undefined}
      >
        {isCurrent && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}

        <div className="flex items-center gap-3 mb-2">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isCurrent ? `bg-${status.color}-600` : getStatusColor(status)
            }`}
          >
            <status.icon
              className={`w-5 h-5 ${
                isCurrent ? "text-white" : `text-${status.color}-600`
              }`}
            />
          </div>
          <div>
            <h3
              className={`font-semibold ${
                isCurrent ? `text-${status.color}-900` : "text-gray-700"
              }`}
            >
              {status.label}
            </h3>
            {isCurrent && (
              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                الحالة الحالية
              </span>
            )}
            {isNextPossible && !isCurrent && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                متاح
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          {status.description}
        </p>

        {/* Next States Indicator */}
        {status.nextStates.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">
              الحالات التالية المتاحة:
            </p>
            <div className="flex flex-wrap gap-1">
              {status.nextStates.map((nextStateId) => {
                const nextState = getStatusInfo(nextStateId);
                return nextState ? (
                  <span
                    key={nextStateId}
                    className={`text-xs px-2 py-1 rounded ${getStatusColor(
                      nextState
                    )} ${getStatusColor(nextState, "text")}`}
                  >
                    {nextState.label}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          سير عمل حالات المواعيد
        </h3>
        <p className="text-gray-600">
          المسار الطبيعي لحالة الموعد من البداية حتى النهاية
        </p>
      </div>

      {/* Main Flow */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-800">المسار الأساسي:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {statusFlow.map((status, index) => (
            <div key={status.id} className="relative">
              <StatusCard status={status} index={index} />
              {index < statusFlow.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-6 transform -translate-y-1/2 text-gray-400">
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Special States */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-800">الحالات الخاصة:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {specialStates.map((status, index) => (
            <StatusCard
              key={status.id}
              status={status}
              index={index + statusFlow.length}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-3">دليل الرموز:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span>الحالة الحالية للموعد</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                متاح
              </span>
              <span>الحالات المتاحة للانتقال إليها</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <span>اتجاه التدفق الطبيعي</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 rounded border-gray-100"></div>
              <span>حالة غير متاحة حالياً</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentStatusFlow;
