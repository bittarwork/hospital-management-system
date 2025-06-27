import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, AlertTriangle, RefreshCw, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { tokenManager } from "../services/auth";

const SessionExpiredModal = () => {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const checkSessionExpiration = () => {
      const timeUntilExpiration = tokenManager.getTimeUntilExpiration();
      setTimeRemaining(timeUntilExpiration);

      // Show modal when 3 minutes or less remain
      if (timeUntilExpiration > 0 && timeUntilExpiration <= 3 * 60 * 1000) {
        setIsOpen(true);
      } else if (timeUntilExpiration <= 0) {
        // Session has expired
        setIsOpen(false);
        logout();
      } else {
        setIsOpen(false);
      }
    };

    // Check immediately
    checkSessionExpiration();

    // Check every 2 minutes (reduced frequency)
    const interval = setInterval(checkSessionExpiration, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [logout]);

  const formatTimeRemaining = (milliseconds) => {
    if (milliseconds <= 0) return "0:00";

    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleExtendSession = async () => {
    setIsRefreshing(true);
    try {
      // In a real app, you would call an API to refresh the token
      // For now, we'll just check if the token is still valid
      const currentTimeUntilExpiration = tokenManager.getTimeUntilExpiration();

      if (currentTimeUntilExpiration > 5 * 60 * 1000) {
        setIsOpen(false);
      } else {
        // Token is still about to expire, user needs to re-authenticate
        throw new Error("Token cannot be refreshed, please login again");
      }
    } catch (error) {
      console.error("Failed to extend session:", error);
      handleLogout();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  const isExpiringSoon = timeRemaining <= 2 * 60 * 1000; // 2 minutes

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => {}} // Prevent closing on backdrop click
          />

          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
            >
              <div className="text-center">
                {/* Icon */}
                <div
                  className={`mx-auto flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                    isExpiringSoon ? "bg-red-100" : "bg-amber-100"
                  }`}
                >
                  {isExpiringSoon ? (
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  ) : (
                    <Clock className="w-8 h-8 text-amber-600" />
                  )}
                </div>

                {/* Title */}
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    isExpiringSoon ? "text-red-900" : "text-amber-900"
                  }`}
                >
                  {isExpiringSoon
                    ? "ستنتهي جلستك قريباً!"
                    : "تحذير انتهاء الجلسة"}
                </h3>

                {/* Time Remaining */}
                <div className="mb-4">
                  <div
                    className={`text-3xl font-bold mb-2 ${
                      isExpiringSoon ? "text-red-600" : "text-amber-600"
                    }`}
                  >
                    {formatTimeRemaining(timeRemaining)}
                  </div>
                  <p className="text-sm text-gray-600">
                    الوقت المتبقي قبل انتهاء الجلسة
                  </p>
                </div>

                {/* Message */}
                <p className="text-gray-700 mb-6 text-sm leading-relaxed">
                  {isExpiringSoon
                    ? "ستنتهي جلستك خلال دقيقتين. سيتم تسجيل خروجك تلقائياً لحماية بياناتك. احفظ عملك الآن."
                    : "ستنتهي جلستك قريباً. يمكنك تمديد الجلسة أو حفظ عملك وتسجيل الخروج."}
                </p>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  {!isExpiringSoon && (
                    <motion.button
                      onClick={handleExtendSession}
                      disabled={isRefreshing}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isRefreshing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          جاري التحديث...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          تمديد الجلسة
                        </>
                      )}
                    </motion.button>
                  )}

                  <motion.button
                    onClick={handleLogout}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      isExpiringSoon
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج الآن
                  </motion.button>
                </div>

                {/* Security Note */}
                <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                  💡 تنتهي الجلسات تلقائياً لحماية بياناتك وضمان أمان النظام
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SessionExpiredModal;
