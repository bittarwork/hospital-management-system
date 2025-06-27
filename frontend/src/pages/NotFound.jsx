import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Home, ArrowRight } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <AlertTriangle className="w-12 h-12 text-primary-600" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-6xl font-bold text-gray-900 mb-4"
        >
          404
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-semibold text-gray-700 mb-4"
        >
          الصفحة غير موجودة
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-500 mb-8 max-w-md mx-auto"
        >
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى موقع آخر
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => navigate("/")}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            العودة للرئيسية
          </button>

          <button
            onClick={() => navigate(-1)}
            className="btn-outline flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للصفحة السابقة
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
