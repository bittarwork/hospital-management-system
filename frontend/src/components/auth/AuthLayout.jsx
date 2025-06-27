import { motion } from "framer-motion";
import { Heart, Shield, Activity } from "lucide-react";

const AuthLayout = ({ children, title, subtitle }) => {
  const features = [
    {
      icon: Heart,
      title: "رعاية صحية متطورة",
      description: "نظام إدارة شامل لأفضل رعاية طبية",
    },
    {
      icon: Shield,
      title: "أمان وخصوصية",
      description: "حماية قصوى لبيانات المرضى والمعلومات الطبية",
    },
    {
      icon: Activity,
      title: "متابعة مستمرة",
      description: "تتبع حالة المرضى والمواعيد في الوقت الفعلي",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex">
      {/* Left Side - Branding & Info */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-secondary-600 text-white p-12 flex-col justify-center relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-white rounded-full"></div>
          <div className="absolute bottom-1/3 right-1/3 w-16 h-16 bg-white rounded-full"></div>
        </div>

        <div className="relative z-10">
          {/* Logo & Brand */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  مستشفى المشروع الأول الطبي
                </h1>
                <p className="text-white/80">نظام الإدارة الطبية المتطور</p>
              </div>
            </div>
          </motion.div>

          {/* Features */}
          <div className="space-y-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex items-start gap-4"
              >
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/80 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="mt-16 grid grid-cols-3 gap-8"
          >
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">1000+</div>
              <div className="text-white/80 text-sm">مريض</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">50+</div>
              <div className="text-white/80 text-sm">طبيب</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">24/7</div>
              <div className="text-white/80 text-sm">خدمة</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-bold text-gray-900">
                  مستشفى المشروع الأول الطبي
                </h1>
                <p className="text-gray-600 text-sm">نظام الإدارة الطبية</p>
              </div>
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-8">
            {children}
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              جميع الحقوق محفوظة © 2024 مستشفى المشروع الأول الطبي
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
