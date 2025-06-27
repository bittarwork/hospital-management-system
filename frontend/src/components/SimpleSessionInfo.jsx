import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { tokenManager, userManager } from "../services/auth";
import { User, LogOut, Clock } from "lucide-react";

const SimpleSessionInfo = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!user) return;

    const updateTime = () => {
      const remaining = tokenManager.getTimeUntilExpiration();
      setTimeRemaining(remaining);
    };

    // Update immediately
    updateTime();

    // Update every 2 minutes to avoid excessive calls
    const interval = setInterval(updateTime, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const formatTime = (ms) => {
    if (ms <= 0) return "منتهية";
    const minutes = Math.floor(ms / (60 * 1000));
    if (minutes < 60) return `${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    return `${hours} ساعة`;
  };

  const clearAuthData = () => {
    // Clear all auth data manually for debugging
    localStorage.clear();
    sessionStorage.clear();
    console.log("🧹 All auth data cleared");
    window.location.reload();
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="text-blue-700 font-medium">
            مسجل دخول: {user.firstName} {user.lastName}
          </span>
          <span className="text-blue-600 mr-2">({user.role})</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={logout}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            تسجيل خروج
          </button>
          {process.env.NODE_ENV === "development" && (
            <button
              onClick={clearAuthData}
              className="text-red-600 hover:text-red-800 text-sm"
              title="Clear auth data (Debug)"
            >
              🧹 مسح
            </button>
          )}
        </div>
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-2 text-xs text-gray-600">
          Token: {tokenManager.getToken() ? "✅" : "❌"} | User:{" "}
          {userManager.getUser() ? "✅" : "❌"} | Valid:{" "}
          {tokenManager.isTokenValid() ? "✅" : "❌"}
        </div>
      )}
    </div>
  );
};

export default SimpleSessionInfo;
