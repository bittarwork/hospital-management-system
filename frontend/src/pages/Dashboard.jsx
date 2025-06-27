import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  Heart,
  Stethoscope,
  Award,
  CalendarDays,
  UserPlus,
  Bell,
  Eye,
  ArrowRight,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Star,
  MessageCircle,
  Building,
  Thermometer,
  Bed,
  Pill,
  FileText,
  Receipt,
} from "lucide-react";
import {
  appointmentsAPI,
  patientsAPI,
  doctorsAPI,
  invoicesAPI,
} from "../services/api";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    patients: { total: 0, change: 0, newToday: 0 },
    doctors: { total: 0, change: 0, available: 0 },
    appointments: { total: 0, today: 0, upcoming: 0, overdue: 0, completed: 0 },
    revenue: { total: 0, change: 0, monthly: 0 },
    occupancy: { rate: 0, beds: { total: 100, occupied: 0 } },
    satisfaction: { rating: 4.8, reviews: 245 },
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    avgWaitTime: 15,
    patientSatisfaction: 4.8,
    treatmentSuccess: 95,
    efficiency: 88,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load all statistics in parallel
      const [
        appointmentStats,
        upcomingAppts,
        todaysAppts,
        patientsData,
        doctorsData,
        invoicesData,
      ] = await Promise.all([
        appointmentsAPI.getStats(),
        appointmentsAPI.getUpcoming({ limit: 5 }),
        appointmentsAPI.getTodays(),
        patientsAPI.getAll(),
        doctorsAPI.getAll(),
        invoicesAPI.getStats().catch(() => ({ data: { data: {} } })),
      ]);

      console.log("📊 Dashboard data loaded:", {
        appointmentStats: appointmentStats.data,
        upcomingAppts: upcomingAppts.data,
        todaysAppts: todaysAppts.data,
      });

      // Update stats with more detailed information
      setStats({
        patients: {
          total:
            patientsData.data?.data?.pagination?.totalPatients ||
            patientsData.data?.data?.length ||
            0,
          change: 12,
          newToday: 3,
        },
        doctors: {
          total:
            doctorsData.data?.data?.pagination?.totalDoctors ||
            doctorsData.data?.data?.length ||
            0,
          change: 3,
          available: Math.floor((doctorsData.data?.data?.length || 0) * 0.8),
        },
        appointments: {
          total: appointmentStats.data?.data?.total || 0,
          today: appointmentStats.data?.data?.today || 0,
          upcoming: appointmentStats.data?.data?.upcoming || 0,
          overdue: appointmentStats.data?.data?.overdue || 0,
          completed: appointmentStats.data?.data?.completed || 0,
        },
        revenue: {
          total: invoicesData.data?.data?.totalRevenue || 485000,
          change: 18,
          monthly: invoicesData.data?.data?.monthlyRevenue || 85000,
        },
        occupancy: {
          rate: 78,
          beds: { total: 100, occupied: 78 },
        },
        satisfaction: {
          rating: 4.8,
          reviews: 245,
        },
      });

      setUpcomingAppointments(upcomingAppts.data?.data?.appointments || []);
      setTodaysAppointments(todaysAppts.data?.data?.appointments || []);

      // Mock recent activities data
      setRecentActivities([
        {
          type: "patient",
          message: "تم تسجيل مريض جديد",
          time: "10 دقائق",
          icon: UserPlus,
        },
        {
          type: "appointment",
          message: "تم تأكيد موعد جديد",
          time: "25 دقيقة",
          icon: Calendar,
        },
        {
          type: "record",
          message: "تم تحديث سجل طبي",
          time: "1 ساعة",
          icon: FileText,
        },
        {
          type: "payment",
          message: "تم استلام دفعة",
          time: "2 ساعة",
          icon: DollarSign,
        },
      ]);
    } catch (error) {
      console.error("❌ Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    {
      title: "إجمالي المرضى",
      value: loading ? "..." : stats.patients.total.toLocaleString(),
      subtitle: `${stats.patients.newToday} جديد اليوم`,
      change: `+${stats.patients.change}%`,
      changeType: "increase",
      icon: Users,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
      onClick: () => navigate("/patients"),
    },
    {
      title: "الأطباء",
      value: loading ? "..." : stats.doctors.total.toString(),
      subtitle: `${stats.doctors.available} متاح`,
      change: `+${stats.doctors.change}`,
      changeType: "increase",
      icon: UserCheck,
      color: "bg-gradient-to-br from-green-500 to-green-600",
      lightColor: "bg-green-50",
      textColor: "text-green-600",
      onClick: () => navigate("/doctors"),
    },
    {
      title: "مواعيد اليوم",
      value: loading ? "..." : stats.appointments.today.toString(),
      subtitle: `${stats.appointments.upcoming} قادم`,
      change: `${stats.appointments.completed} مكتمل`,
      changeType: "success",
      icon: Calendar,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      lightColor: "bg-orange-50",
      textColor: "text-orange-600",
      onClick: () => navigate("/appointments"),
    },
    {
      title: "الإيرادات الشهرية",
      value: loading ? "..." : `${(stats.revenue.monthly / 1000).toFixed(0)}k`,
      subtitle: `${stats.revenue.total.toLocaleString()} إجمالي`,
      change: `+${stats.revenue.change}%`,
      changeType: "increase",
      icon: DollarSign,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      lightColor: "bg-purple-50",
      textColor: "text-purple-600",
      onClick: () => navigate("/invoices"),
    },
  ];

  const formatDateTime = (dateString, timeString) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("ar-SA", {
      month: "short",
      day: "numeric",
    });
    return {
      date: formattedDate,
      time:
        timeString ||
        date.toLocaleTimeString("ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
        }),
    };
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: "text-blue-600 bg-blue-50",
      confirmed: "text-green-600 bg-green-50",
      "checked-in": "text-yellow-600 bg-yellow-50",
      "in-progress": "text-orange-600 bg-orange-50",
      completed: "text-green-600 bg-green-50",
      cancelled: "text-red-600 bg-red-50",
      "no-show": "text-gray-600 bg-gray-50",
    };
    return colors[status] || "text-gray-600 bg-gray-50";
  };

  const getStatusLabel = (status) => {
    const labels = {
      scheduled: "مجدول",
      confirmed: "مؤكد",
      "checked-in": "تم الوصول",
      "in-progress": "جاري",
      completed: "مكتمل",
      cancelled: "ملغي",
      "no-show": "لم يحضر",
    };
    return labels[status] || status;
  };

  const quickActions = [
    {
      title: "إضافة مريض جديد",
      description: "تسجيل مريض جديد في النظام",
      icon: UserPlus,
      color: "bg-blue-500",
      onClick: () => navigate("/patients"),
    },
    {
      title: "حجز موعد",
      description: "جدولة موعد جديد مع طبيب",
      icon: Calendar,
      color: "bg-green-500",
      onClick: () => navigate("/appointments"),
    },
    {
      title: "السجلات الطبية",
      description: "عرض وإدارة السجلات الطبية",
      icon: Activity,
      color: "bg-purple-500",
      onClick: () => navigate("/medical-records"),
    },
    {
      title: "إدارة الفواتير",
      description: "إنشاء وإدارة الفواتير",
      icon: Receipt,
      color: "bg-orange-500",
      onClick: () => navigate("/invoices"),
    },
  ];

  const performanceCards = [
    {
      title: "نسبة الإشغال",
      value: `${stats.occupancy.rate}%`,
      subtitle: `${stats.occupancy.beds.occupied}/${stats.occupancy.beds.total} سرير`,
      icon: Bed,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "متوسط وقت الانتظار",
      value: `${performanceMetrics.avgWaitTime} دقيقة`,
      subtitle: "تحسن بنسبة 15%",
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "رضا المرضى",
      value: `${stats.satisfaction.rating}/5`,
      subtitle: `${stats.satisfaction.reviews} تقييم`,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "كفاءة العلاج",
      value: `${performanceMetrics.treatmentSuccess}%`,
      subtitle: "نسبة نجاح عالية",
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Enhanced Welcome Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  مرحباً بك في مستشفى المشروع الأول الطبي
                </h1>
                <p className="text-white/90 mt-2 text-lg">
                  نظام إدارة طبية متطور - لحظة بلحظة
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-white/90">النظام متصل</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-white/90" />
                    <span className="text-sm text-white/90">
                      {new Date().toLocaleDateString("ar-SA", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-end gap-3">
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-right">
                  <p className="text-sm text-white/90">حالة النظام</p>
                  <p className="text-lg font-bold">ممتاز</p>
                </div>
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-right text-sm text-white/80">
                آخر تحديث:{" "}
                {new Date().toLocaleTimeString("ar-SA", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {dashboardStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="stat-card cursor-pointer"
            onClick={stat.onClick}
          >
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">{stat.subtitle}</p>
                  <div className="flex items-center gap-1">
                    {stat.changeType === "increase" && (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    )}
                    {stat.changeType === "success" && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        stat.changeType === "increase" ||
                        stat.changeType === "success"
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl ${stat.lightColor} flex items-center justify-center`}
                >
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Enhanced Performance Metrics */}
      <motion.div variants={itemVariants}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">مؤشرات الأداء</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`p-5 rounded-xl border-2 ${card.bgColor} border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg ${card.bgColor
                      .replace("bg-", "bg-")
                      .replace(
                        "-50",
                        "-100"
                      )} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">
                      +12%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500">{card.subtitle}</p>
                </div>

                {/* Mini Progress Bar */}
                <div className="mt-3 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full ${card.color.replace(
                      "text-",
                      "bg-"
                    )} rounded-full transition-all duration-1000`}
                    style={{
                      width: card.title.includes("الإشغال")
                        ? "78%"
                        : card.title.includes("وقت")
                        ? "85%"
                        : card.title.includes("رضا")
                        ? "96%"
                        : "88%",
                    }}
                  ></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Advanced Analytics Section */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Trend */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">اتجاه الإيرادات</h3>
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                ↗ +18%
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">هذا الشهر</span>
                <span className="font-medium">
                  {(stats.revenue.monthly / 1000).toFixed(0)}k ريال
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">الشهر السابق</span>
                <span className="font-medium">
                  {((stats.revenue.monthly * 0.85) / 1000).toFixed(0)}k ريال
                </span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2 mt-3">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: "72%" }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                الهدف: {((stats.revenue.monthly * 1.2) / 1000).toFixed(0)}k ريال
              </p>
            </div>
          </div>

          {/* Patient Flow */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">تدفق المرضى</h3>
              </div>
              <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                {stats.appointments.today} اليوم
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">مرضى جدد</span>
                <div className="flex items-center gap-2">
                  <div className="w-12 bg-blue-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.patients.newToday}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">مراجعات</span>
                <div className="flex items-center gap-2">
                  <div className="w-12 bg-blue-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: "80%" }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.appointments.today - stats.patients.newToday}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">طوارئ</span>
                <div className="flex items-center gap-2">
                  <div className="w-12 bg-red-200 rounded-full h-1.5">
                    <div
                      className="bg-red-500 h-1.5 rounded-full"
                      style={{ width: "30%" }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Departments Status */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Building className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">حالة الأقسام</h3>
              </div>
              <span className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">
                8/10 نشط
              </span>
            </div>
            <div className="space-y-2">
              {[
                { name: "الطوارئ", status: "نشط", color: "green", load: "85%" },
                { name: "الجراحة", status: "نشط", color: "blue", load: "70%" },
                {
                  name: "الأطفال",
                  status: "نشط",
                  color: "yellow",
                  load: "60%",
                },
                { name: "النساء", status: "نشط", color: "green", load: "90%" },
              ].map((dept, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 bg-${dept.color}-500 rounded-full`}
                    ></div>
                    <span className="text-gray-700">{dept.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{dept.load}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Appointments */}
        <motion.div variants={itemVariants} className="lg:col-span-8">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    مواعيد اليوم ({stats.appointments.today})
                  </h3>
                </div>
                <button
                  onClick={() => navigate("/appointments")}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  عرض الكل
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                  <span className="mr-3">جاري التحميل...</span>
                </div>
              ) : todaysAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">لا توجد مواعيد لليوم</p>
                  <button
                    onClick={() => navigate("/appointments")}
                    className="mt-4 btn btn-primary"
                  >
                    حجز موعد جديد
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {todaysAppointments.slice(0, 5).map((appointment, index) => {
                    const { date, time } = formatDateTime(
                      appointment.appointmentDate,
                      appointment.appointmentTime
                    );
                    return (
                      <motion.div
                        key={appointment._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                      >
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {appointment.patient
                              ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                              : "مريض غير محدد"}
                          </p>
                          <p className="text-sm text-gray-600">
                            د.{" "}
                            {appointment.doctor
                              ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                              : "طبيب غير محدد"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {time}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                                appointment.status
                              )}`}
                            >
                              {getStatusLabel(appointment.status)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate("/appointments")}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Sidebar Content */}
        <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
          {/* Enhanced Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  إجراءات سريعة
                </h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={action.onClick}
                    className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all text-right group bg-gradient-to-r from-gray-50 to-white hover:from-indigo-50 hover:to-purple-50"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow group-hover:scale-110`}
                      >
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-base font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors mb-1">
                          {action.title}
                        </p>
                        <p className="text-sm text-gray-600 group-hover:text-indigo-600 transition-colors">
                          {action.description}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-5 h-5 text-indigo-500" />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-600">
                      {stats.appointments.today}
                    </p>
                    <p className="text-xs text-gray-600">مواعيد اليوم</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {stats.patients.newToday}
                    </p>
                    <p className="text-xs text-gray-600">مرضى جدد</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Recent Activities */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    النشاطات الأخيرة
                  </h3>
                </div>
                <div className="text-xs text-white/80 bg-white/20 px-2 py-1 rounded-full">
                  مباشر
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity, index) => {
                  const iconColors = {
                    patient: "bg-blue-500",
                    appointment: "bg-green-500",
                    record: "bg-purple-500",
                    payment: "bg-yellow-500",
                  };

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.15 }}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-emerald-50 transition-all duration-300 group border border-transparent hover:border-emerald-100"
                    >
                      <div
                        className={`w-10 h-10 ${
                          iconColors[activity.type]
                        } rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow group-hover:scale-110`}
                      >
                        <activity.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-emerald-700 transition-colors">
                          {activity.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            منذ {activity.time}
                          </p>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Activity Summary */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">إجمالي النشاطات اليوم</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-emerald-600">
                      24 نشاط
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Hospital Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Building className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    حالة المستشفى
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>عامل بكفاءة</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-5">
                {/* Active Patients */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-blue-900">
                      المرضى النشطون
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-blue-700">
                      {stats.patients.total}
                    </span>
                  </div>
                </div>

                {/* Available Doctors */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <Stethoscope className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-green-900">
                      الأطباء المتاحون
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 bg-green-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: "80%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-green-700">
                      {stats.doctors.available}/{stats.doctors.total}
                    </span>
                  </div>
                </div>

                {/* Occupancy Rate */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 border border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Bed className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-purple-900">
                      نسبة الإشغال
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 bg-purple-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: "78%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-purple-700">
                      {stats.occupancy.rate}%
                    </span>
                  </div>
                </div>

                {/* Emergency Status */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-emerald-900">
                      حالة الطوارئ
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-emerald-700">
                      مستقرة
                    </span>
                  </div>
                </div>

                {/* Overdue Appointments Alert */}
                {stats.appointments.overdue > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-red-900">
                        مواعيد متأخرة
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-bold text-red-700">
                        {stats.appointments.overdue}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Overall Status */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">الحالة العامة</span>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-green-600">
                      ممتازة
                    </span>
                  </div>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-2000"
                    style={{ width: "92%" }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  تقييم شامل للأداء: 92%
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
