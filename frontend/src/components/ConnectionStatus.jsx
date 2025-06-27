import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, Server, AlertCircle } from "lucide-react";
import { authAPI } from "../services/auth";

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [serverStatus, setServerStatus] = useState("checking");
  const [showStatus, setShowStatus] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  // Check server connectivity
  const checkServerStatus = async () => {
    // Only check if we have a token and are online
    if (!tokenManager.getToken() || !navigator.onLine) {
      setServerStatus("disconnected");
      return;
    }

    try {
      setServerStatus("checking");
      await authAPI.getCurrentUser();
      setServerStatus("connected");
      setLastChecked(new Date());
    } catch (error) {
      console.error("Server check failed:", error);
      setServerStatus("disconnected");
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    // Check online status
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
      // Check server when back online
      checkServerStatus();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
      setServerStatus("disconnected");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial server check
    if (navigator.onLine) {
      checkServerStatus();
    }

    // Periodic server check every 5 minutes (only if user is authenticated)
    const serverInterval = setInterval(() => {
      if (navigator.onLine && tokenManager.getToken()) {
        checkServerStatus();
      }
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(serverInterval);
    };
  }, []);

  // Show status temporarily when it changes
  useEffect(() => {
    if (!isOnline || serverStatus === "disconnected") {
      setShowStatus(true);
    }
  }, [isOnline, serverStatus]);

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        type: "offline",
        message: "لا يوجد اتصال بالإنترنت",
        icon: WifiOff,
        color: "bg-red-500",
        textColor: "text-red-600",
      };
    }

    if (serverStatus === "disconnected") {
      return {
        type: "server-down",
        message: "لا يمكن الاتصال بالخادم",
        icon: Server,
        color: "bg-orange-500",
        textColor: "text-orange-600",
      };
    }

    if (serverStatus === "checking") {
      return {
        type: "checking",
        message: "جاري فحص الاتصال...",
        icon: Wifi,
        color: "bg-blue-500",
        textColor: "text-blue-600",
      };
    }

    return {
      type: "connected",
      message: "متصل",
      icon: Wifi,
      color: "bg-green-500",
      textColor: "text-green-600",
    };
  };

  const statusInfo = getStatusInfo();
  const shouldShow = showStatus || !isOnline || serverStatus === "disconnected";

  const formatLastChecked = () => {
    if (!lastChecked) return "";

    const now = new Date();
    const diff = now - lastChecked;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "الآن";
    if (minutes < 60) return `منذ ${minutes} دقيقة`;

    const hours = Math.floor(minutes / 60);
    return `منذ ${hours} ساعة`;
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[280px]">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${statusInfo.color}`}>
                <statusInfo.icon className="w-4 h-4 text-white" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${statusInfo.textColor}`}
                  >
                    {statusInfo.message}
                  </span>

                  {statusInfo.type === "checking" && (
                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>

                {lastChecked && statusInfo.type !== "checking" && (
                  <p className="text-xs text-gray-500 mt-1">
                    آخر فحص: {formatLastChecked()}
                  </p>
                )}
              </div>

              {isOnline && serverStatus === "connected" && (
                <button
                  onClick={() => setShowStatus(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Connection issues help */}
            {(!isOnline || serverStatus === "disconnected") && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-gray-600">
                    {!isOnline ? (
                      <p>تحقق من اتصال الإنترنت وحاول مرة أخرى</p>
                    ) : (
                      <p>
                        قد تكون هناك مشكلة مؤقتة في الخادم. سيتم إعادة المحاولة
                        تلقائياً
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionStatus;
