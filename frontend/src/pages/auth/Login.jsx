import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = "اسم المستخدم مطلوب";
    } else if (formData.username.length < 3) {
      errors.username = "اسم المستخدم يجب أن يكون 3 أحرف على الأقل";
    }

    if (!formData.password) {
      errors.password = "كلمة المرور مطلوبة";
    } else if (formData.password.length < 6) {
      errors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const result = await login({
        username: formData.username,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      if (result.success) {
        toast.success("مرحباً بك في نظام إدارة المستشفى");
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      } else {
        toast.error(result.error || "فشل في تسجيل الدخول");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من هويتك...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout
      title="تسجيل الدخول"
      subtitle="أدخل بياناتك للوصول إلى نظام إدارة المستشفى"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Global Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}

        {/* Username Field */}
        <div>
          <label htmlFor="username" className="input-label">
            اسم المستخدم
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              className={`input-field pr-10 ${
                formErrors.username
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
              placeholder="أدخل اسم المستخدم"
              dir="ltr"
            />
          </div>
          {formErrors.username && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-sm text-red-600 flex items-center gap-1"
            >
              <AlertCircle className="w-4 h-4" />
              {formErrors.username}
            </motion.p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="input-label">
            كلمة المرور
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              className={`input-field pr-10 pl-10 ${
                formErrors.password
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
              placeholder="أدخل كلمة المرور"
              dir="ltr"
            />
            <button
              type="button"
              className="absolute inset-y-0 left-0 pl-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              )}
            </button>
          </div>
          {formErrors.password && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-sm text-red-600 flex items-center gap-1"
            >
              <AlertCircle className="w-4 h-4" />
              {formErrors.password}
            </motion.p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label
              htmlFor="remember-me"
              className="mr-2 block text-sm text-gray-700"
            >
              تذكرني
            </label>
          </div>

          <div className="text-sm">
            <Link
              to="/auth/forgot-password"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full btn-primary relative ${
            isSubmitting ? "opacity-75 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              جاري تسجيل الدخول...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              تسجيل الدخول
            </div>
          )}
        </motion.button>

        {/* Help Text */}
        <div className="text-center mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">
            <strong>للدخول إلى النظام استخدم:</strong>
          </p>
          <p className="text-sm text-blue-700">
            اسم المستخدم:{" "}
            <code className="bg-blue-100 px-2 py-1 rounded">admin</code>
          </p>
          <p className="text-sm text-blue-700">
            كلمة المرور:{" "}
            <code className="bg-blue-100 px-2 py-1 rounded">admin123</code>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
