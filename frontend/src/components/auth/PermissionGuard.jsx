import { useAuth } from "../../contexts/AuthContext";
import { AlertTriangle, Shield } from "lucide-react";

const PermissionGuard = ({
  resource,
  action,
  role,
  children,
  fallback,
  showError = true,
}) => {
  const { hasPermission, hasRole, user } = useAuth();

  // Check role-based access
  if (role && !hasRole(role)) {
    if (!showError) return null;

    return (
      fallback || (
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              غير مصرح لك بالوصول
            </h3>
            <p className="text-gray-600 mb-4">
              تحتاج إلى دور{" "}
              <span className="font-medium text-gray-900">{role}</span> للوصول
              إلى هذا المحتوى
            </p>
            <div className="text-sm text-gray-500">
              دورك الحالي:{" "}
              <span className="font-medium">{user?.role || "غير محدد"}</span>
            </div>
          </div>
        </div>
      )
    );
  }

  // Check permission-based access
  if (resource && action && !hasPermission(resource, action)) {
    if (!showError) return null;

    return (
      fallback || (
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-warning-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              صلاحية غير كافية
            </h3>
            <p className="text-gray-600 mb-4">
              تحتاج إلى صلاحية{" "}
              <span className="font-medium text-gray-900">{action}</span> على{" "}
              <span className="font-medium text-gray-900">{resource}</span>
            </p>
            <div className="text-sm text-gray-500">
              تواصل مع مدير النظام للحصول على الصلاحيات المطلوبة
            </div>
          </div>
        </div>
      )
    );
  }

  // Render content if all checks pass
  return children;
};

// Hook for checking permissions in components
export const usePermissionCheck = () => {
  const { hasPermission, hasRole } = useAuth();

  const canAccess = (resource, action) => {
    return hasPermission(resource, action);
  };

  const hasRequiredRole = (role) => {
    return hasRole(role);
  };

  return { canAccess, hasRequiredRole };
};

export default PermissionGuard;
