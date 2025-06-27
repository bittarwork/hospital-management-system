import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Plus,
  Eye,
} from "lucide-react";
import { appointmentsAPI } from "../services/api";
import toast from "react-hot-toast";

const AppointmentCalendar = ({
  onSelectDate,
  onViewAppointment,
  onAddAppointment,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMonthAppointments();
  }, [currentDate]);

  const loadMonthAppointments = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      // Get first and last day of the month
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const response = await appointmentsAPI.getAll({
        startDate: firstDay.toISOString().split("T")[0],
        endDate: lastDay.toISOString().split("T")[0],
      });

      // Group appointments by date
      const appointmentsByDate = {};
      const appointmentsList = response.data?.data?.appointments || [];

      appointmentsList.forEach((appointment) => {
        const date = new Date(appointment.appointmentDate).toDateString();
        if (!appointmentsByDate[date]) {
          appointmentsByDate[date] = [];
        }
        appointmentsByDate[date].push(appointment);
      });

      setAppointments(appointmentsByDate);
    } catch (error) {
      console.error("Error loading month appointments:", error);
      toast.error("فشل في تحميل مواعيد الشهر");
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDate; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getAppointmentsForDate = (date) => {
    if (!date) return [];
    return appointments[date.toDateString()] || [];
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleDateClick = (date) => {
    if (!date) return;
    setSelectedDate(date);
    onSelectDate?.(date);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: "bg-blue-500",
      confirmed: "bg-green-500",
      "checked-in": "bg-yellow-500",
      "in-progress": "bg-orange-500",
      completed: "bg-green-600",
      cancelled: "bg-red-500",
      "no-show": "bg-gray-500",
    };
    return colors[status] || "bg-gray-400";
  };

  const monthNames = [
    "يناير",
    "فبراير",
    "مارس",
    "إبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  const dayNames = [
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];

  const days = getDaysInMonth(currentDate);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Calendar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              اليوم
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
          </div>
        )}

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-gray-600"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            const dayAppointments = getAppointmentsForDate(date);
            const isCurrentDay = isToday(date);
            const isSelectedDay = isSelected(date);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                className={`
                  relative min-h-[80px] p-2 border border-gray-100 rounded-lg cursor-pointer
                  transition-all duration-200 hover:bg-gray-50
                  ${!date ? "invisible" : ""}
                  ${isCurrentDay ? "bg-purple-50 border-purple-200" : ""}
                  ${isSelectedDay ? "bg-purple-100 border-purple-300" : ""}
                `}
                onClick={() => handleDateClick(date)}
              >
                {date && (
                  <>
                    {/* Day number */}
                    <div
                      className={`
                        text-sm font-medium mb-1
                        ${isCurrentDay ? "text-purple-600" : "text-gray-900"}
                        ${isSelectedDay ? "text-purple-700" : ""}
                      `}
                    >
                      {date.getDate()}
                    </div>

                    {/* Appointments indicators */}
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 3).map((appointment, idx) => (
                        <motion.div
                          key={appointment._id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`
                            text-xs px-1 py-0.5 rounded text-white truncate
                            ${getStatusColor(appointment.status)}
                          `}
                          title={`${appointment.patient?.firstName || ""} ${
                            appointment.patient?.lastName || ""
                          } - ${appointment.appointmentTime}`}
                        >
                          {appointment.appointmentTime}{" "}
                          {appointment.patient?.firstName}
                        </motion.div>
                      ))}

                      {dayAppointments.length > 3 && (
                        <div className="text-xs text-gray-500 font-medium">
                          +{dayAppointments.length - 3} أخرى
                        </div>
                      )}
                    </div>

                    {/* Add appointment button - shows on hover */}
                    {date >= new Date().setHours(0, 0, 0, 0) && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddAppointment?.(date);
                        }}
                        className="absolute top-1 left-1 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <Plus className="w-3 h-3" />
                      </motion.button>
                    )}
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      <AnimatePresence>
        {selectedDate && getAppointmentsForDate(selectedDate).length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 p-4 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">
                مواعيد{" "}
                {selectedDate.toLocaleDateString("ar-SA", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h4>
              <span className="text-sm text-gray-600">
                {getAppointmentsForDate(selectedDate).length} موعد
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {getAppointmentsForDate(selectedDate).map((appointment) => (
                <motion.div
                  key={appointment._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${getStatusColor(
                        appointment.status
                      )}`}
                    ></div>
                    <div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="font-medium">
                          {appointment.appointmentTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <User className="w-3 h-3" />
                          {appointment.patient
                            ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                            : "مريض غير محدد"}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Stethoscope className="w-3 h-3" />
                          د.{" "}
                          {appointment.doctor
                            ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                            : "طبيب غير محدد"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onViewAppointment?.(appointment)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppointmentCalendar;
