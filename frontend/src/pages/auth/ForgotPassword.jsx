import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import { authAPI } from "../../services/auth";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = "البريد الإلكتروني مطلوب";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "البريد الإلكتروني غير صحيح";
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
      await authAPI.forgotPassword({ email });
      setIsEmailSent(true);
      toast.success(
        "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني"
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء إرسال الطلب");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setEmail(e.target.value);
    if (formErrors.email) {
      setFormErrors({ email: "" });
    }
  };

  if (isEmailSent) {
    return (
      <AuthLayout title="تم إرسال الرابط" subtitle="تحقق من بريدك الإلكتروني">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-success-600" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-4">
            تم إرسال الرابط بنجاح!
          </h3>

          <p className="text-gray-600 mb-6 leading-relaxed">
            تم إرسال رابط إعادة تعيين كلمة المرور إلى العنوان:
            <br />
            <span className="font-medium text-gray-900">{email}</span>
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>ملاحظة:</strong> إذا لم تجد الرسالة في صندوق الوارد، تحقق
              من مجلد الرسائل المزعجة (Spam)
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setIsEmailSent(false);
                setEmail("");
              }}
              className="btn-outline"
            >
              إرسال مرة أخرى
            </button>

            <Link to="/auth/login" className="btn-primary">
              <div className="flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                العودة لتسجيل الدخول
              </div>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="نسيت كلمة المرور؟"
      subtitle="أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            سنرسل لك رابط آمن لإعادة تعيين كلمة المرور عبر البريد الإلكتروني
          </p>
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="input-label">
            البريد الإلكتروني
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={handleChange}
              className={`input-field pr-10 ${
                formErrors.email
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
              placeholder="أدخل البريد الإلكتروني"
              dir="ltr"
            />
          </div>
          {formErrors.email && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-sm text-red-600 flex items-center gap-1"
            >
              <AlertCircle className="w-4 h-4" />
              {formErrors.email}
            </motion.p>
          )}
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
              جاري الإرسال...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              إرسال رابط إعادة التعيين
            </div>
          )}
        </motion.button>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            to="/auth/login"
            className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة إلى تسجيل الدخول
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
