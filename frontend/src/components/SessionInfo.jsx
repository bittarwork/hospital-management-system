import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { tokenManager } from "../services/auth";
import { Clock, User, Shield, LogOut } from "lucide-react";

const SessionInfo = () => {
  const { user, logout } = useAuth();
  const [sessionInfo, setSessionInfo] = useState({
    timeUntilExpiration: 0,
    tokenExpiration: null,
    loginType: "session",
    isRememberMe: false,
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const updateSessionInfo = () => {
      setSessionInfo({
        timeUntilExpiration: tokenManager.getTimeUntilExpiration(),
        tokenExpiration: tokenManager.getTokenExpiration(),
        loginType: tokenManager.getLoginType(),
        isRememberMe: tokenManager.isRememberMe(),
      });
    };

    // Update immediately
    updateSessionInfo();

    // Update every minute
    const interval = setInterval(updateSessionInfo, 60000);

    return () => clearInterval(interval);
  }, []);

  const formatTimeRemaining = (milliseconds) => {
    if (milliseconds <= 0) return "منتهية الصلاحية";

    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} أيام`;
    } else if (hours > 0) {
      return `${hours} ساعة و ${minutes} دقيقة`;
    } else {
      return `${minutes} دقيقة`;
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "غير محدد";
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-xs text-gray-500">
              {user.role === "admin" ? "مدير النظام" : user.role}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showDetails ? "إخفاء التفاصيل" : "عرض التفاصيل"}
          </button>

          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          {/* Session Type */}
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">نوع الجلسة:</span>
            <span
              className={`font-medium ${
                sessionInfo.isRememberMe ? "text-green-600" : "text-blue-600"
              }`}
            >
              {sessionInfo.isRememberMe
                ? "دائمة (تذكرني)"
                : "مؤقتة (جلسة واحدة)"}
            </span>
          </div>

          {/* Session Expiration */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">انتهاء الجلسة:</span>
            <span
              className={`font-medium ${
                sessionInfo.timeUntilExpiration < 30 * 60 * 1000
                  ? "text-red-600"
                  : "text-gray-900"
              }`}
            >
              {formatTimeRemaining(sessionInfo.timeUntilExpiration)}
            </span>
          </div>

          {/* Token Expiration Date */}
          {sessionInfo.tokenExpiration && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">تنتهي في:</span>
              <span className="font-medium text-gray-900">
                {formatDateTime(sessionInfo.tokenExpiration)}
              </span>
            </div>
          )}

          {/* Security Warning */}
          {sessionInfo.timeUntilExpiration < 30 * 60 * 1000 &&
            sessionInfo.timeUntilExpiration > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  ⚠️ ستنتهي جلستك قريباً. احفظ عملك لتجنب فقدان البيانات.
                </p>
              </div>
            )}

          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <h4 className="text-sm font-medium text-gray-900">
              معلومات الحساب
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">اسم المستخدم:</span>
                <span className="block font-mono text-gray-900">
                  {user.username}
                </span>
              </div>
              <div>
                <span className="text-gray-500">البريد الإلكتروني:</span>
                <span className="block text-gray-900">{user.email}</span>
              </div>
              <div>
                <span className="text-gray-500">القسم:</span>
                <span className="block text-gray-900">
                  {user.department || "غير محدد"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">المنصب:</span>
                <span className="block text-gray-900">
                  {user.position || "غير محدد"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionInfo;
