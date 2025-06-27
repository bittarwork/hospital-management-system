import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Users,
  UserCheck,
  Calendar,
  FileText,
  Receipt,
  Menu,
  X,
  Settings,
  User,
  LogOut,
  Activity,
  Heart,
  Shield,
  Clock,
  Wifi,
  WifiOff,
  Server,
  Globe,
} from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    isOnline: true,
    lastSync: new Date(),
    serverStatus: "connected",
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigation = [
    {
      name: "لوحة التحكم",
      href: "/dashboard",
      icon: Home,
      gradient: "from-blue-500 to-cyan-500",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "نظرة شاملة على النظام",
    },
    {
      name: "المرضى",
      href: "/patients",
      icon: Users,
      gradient: "from-green-500 to-emerald-500",
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "إدارة بيانات المرضى",
    },
    {
      name: "الأطباء",
      href: "/doctors",
      icon: UserCheck,
      gradient: "from-purple-500 to-violet-500",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "إدارة الكادر الطبي",
    },
    {
      name: "المواعيد",
      href: "/appointments",
      icon: Calendar,
      gradient: "from-orange-500 to-amber-500",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "جدولة وإدارة المواعيد",
    },
    {
      name: "السجلات الطبية",
      href: "/medical-records",
      icon: FileText,
      gradient: "from-indigo-500 to-blue-500",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      description: "السجلات والتقارير الطبية",
    },
    {
      name: "الفواتير",
      href: "/invoices",
      icon: Receipt,
      gradient: "from-red-500 to-pink-500",
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "إدارة الفواتير والمدفوعات",
    },
  ];

  const isActive = (path) => {
    return (
      location.pathname === path ||
      (path === "/dashboard" && location.pathname === "/")
    );
  };

  // تحديث حالة النظام
  useEffect(() => {
    const updateSystemStatus = () => {
      setSystemStatus({
        isOnline: navigator.onLine,
        lastSync: new Date(),
        serverStatus: navigator.onLine ? "connected" : "disconnected",
      });
    };

    updateSystemStatus();
    const interval = setInterval(updateSystemStatus, 30000); // كل 30 ثانية

    window.addEventListener("online", updateSystemStatus);
    window.addEventListener("offline", updateSystemStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", updateSystemStatus);
      window.removeEventListener("offline", updateSystemStatus);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth/login");
    } catch (error) {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
  };

  const sidebarVariants = {
    open: {
      width: "320px",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
    closed: {
      width: "80px",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
  };

  const menuItemVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
    closed: {
      opacity: 0,
      x: -20,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
  };

  const containerVariants = {
    open: {
      transition: {
        staggerChildren: 0.1,
      },
    },
    closed: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Enhanced Sidebar */}
      <motion.div
        variants={sidebarVariants}
        animate={isSidebarOpen ? "open" : "closed"}
        className="bg-white border-l border-gray-200 shadow-2xl flex flex-col relative overflow-hidden"
      >
        {/* Gradient Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 pointer-events-none" />

        {/* Header Section */}
        <div className="relative z-10 p-6 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-3"
                >
                  <div className="relative">
                    <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-lg">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 leading-tight">
                      مستشفى المشروع الأول الطبي
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <p className="text-sm text-gray-500">نظام متطور ومتصل</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-purple-50 border border-gray-200 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <motion.div
                animate={{ rotate: isSidebarOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isSidebarOpen ? (
                  <X className="w-5 h-5 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600" />
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Navigation Menu */}
        <motion.nav
          variants={containerVariants}
          animate={isSidebarOpen ? "open" : "closed"}
          className="relative z-10 flex-1 px-4 py-2 space-y-2 overflow-y-auto"
        >
          {navigation.map((item, index) => {
            const isItemActive = isActive(item.href);
            return (
              <motion.div
                key={item.name}
                variants={menuItemVariants}
                whileHover={{ x: 2 }}
                className="relative"
              >
                <Link
                  to={item.href}
                  className={clsx(
                    "group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden",
                    isItemActive
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-sm"
                      : "text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-gray-900 border border-transparent hover:border-gray-200"
                  )}
                >
                  {/* Icon with Gradient Background */}
                  <div
                    className={clsx(
                      "relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                      isItemActive
                        ? `bg-gradient-to-br ${item.gradient} shadow-lg shadow-blue-500/25`
                        : "bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-gray-200 group-hover:to-blue-100"
                    )}
                  >
                    <item.icon
                      className={clsx(
                        "w-5 h-5 transition-all duration-300",
                        isItemActive
                          ? "text-white"
                          : "text-gray-600 group-hover:text-blue-600"
                      )}
                    />

                    {/* Active Pulse Effect */}
                    {isItemActive && (
                      <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse" />
                    )}
                  </div>

                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.div
                        variants={menuItemVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        className="flex-1 min-w-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p
                              className={clsx(
                                "font-semibold text-sm transition-colors",
                                isItemActive
                                  ? "text-blue-700"
                                  : "text-gray-700 group-hover:text-gray-900"
                              )}
                            >
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-tight">
                              {item.description}
                            </p>
                          </div>

                          {/* Notification Badge */}
                          {item.name === "المواعيد" && (
                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">
                                3
                              </span>
                            </div>
                          )}

                          {item.name === "الفواتير" && (
                            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">
                                12
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Active Indicator */}
                  {isItemActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </motion.div>
            );
          })}
        </motion.nav>

        {/* Bottom Status Bar */}
        <div className="relative z-10 p-4 border-t border-gray-100 bg-white/80 backdrop-blur-sm">
          <AnimatePresence>
            {isSidebarOpen ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-gray-700">
                    نظام نشط
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-gray-600">متصل</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center"
              >
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900">
                  {navigation.find((item) => isActive(item.href))?.name ||
                    "لوحة التحكم"}
                </h2>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-blue-700 font-medium">
                    {new Date().toLocaleTimeString("ar-SA", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* System Status */}
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full"
                >
                  {systemStatus.isOnline ? (
                    <>
                      <Wifi className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-700 font-medium">
                        متصل
                      </span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-700 font-medium">
                        غير متصل
                      </span>
                    </>
                  )}
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-full"
                >
                  <Server className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-blue-700 font-medium">
                    الخادم نشط
                  </span>
                </motion.div>
              </div>

              {/* Date Display */}
              <div className="text-sm text-gray-600 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 px-4 py-2 rounded-xl font-medium">
                {new Date().toLocaleDateString("ar-SA", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>

              {/* User Actions */}
              <div className="flex items-center gap-2">
                {/* Notifications - Under Development */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    toast.info("نظام الإشعارات قيد التطوير", {
                      position: "top-right",
                    })
                  }
                  className="relative p-2 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl hover:from-yellow-50 hover:to-yellow-100 hover:border-yellow-200 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-yellow-600">
                        !
                      </span>
                    </div>
                    <span className="text-xs text-gray-600 group-hover:text-yellow-700 font-medium">
                      الإشعارات
                    </span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border border-white animate-pulse" />
                </motion.button>

                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </motion.button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-2xl py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">
                            {user?.name || "مدير النظام"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user?.role || "مدير عام"}
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            toast.info("الإعدادات قيد التطوير", {
                              position: "top-right",
                            })
                          }
                          className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Settings className="w-4 h-4" />
                            الإعدادات
                          </div>
                          <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">
                            قيد التطوير
                          </span>
                        </button>
                        <button
                          onClick={() =>
                            toast.info("إدارة الصلاحيات قيد التطوير", {
                              position: "top-right",
                            })
                          }
                          className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Shield className="w-4 h-4" />
                            الصلاحيات
                          </div>
                          <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">
                            قيد التطوير
                          </span>
                        </button>
                        <hr className="my-2" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          تسجيل الخروج
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
