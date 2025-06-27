import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Save,
  X,
  DollarSign,
  Stethoscope,
  TestTube,
  Activity,
  Heart,
  Eye,
  FileText,
  AlertTriangle,
  CheckCircle,
  Copy,
  RefreshCw,
} from "lucide-react";
import { showSuccessMessage, handleApiError } from "../../services/api";
import LoadingSpinner from "../LoadingSpinner";
import toast from "react-hot-toast";

const MedicalServicesSettings = ({ isOpen, onClose, onServiceUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // add, edit, delete
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    itemType: "consultation",
    unitPrice: 0,
    category: "",
    isActive: true,
    allowCustomQuantity: true,
    minimumQuantity: 1,
    maximumQuantity: 100,
    discountEligible: true,
    notes: "",
  });

  // Categories for medical services
  const serviceCategories = [
    {
      value: "consultation",
      label: "استشارات",
      icon: Stethoscope,
      color: "blue",
    },
    {
      value: "diagnostic_test",
      label: "فحوصات تشخيصية",
      icon: Activity,
      color: "green",
    },
    {
      value: "laboratory_test",
      label: "تحاليل مختبرية",
      icon: TestTube,
      color: "purple",
    },
    { value: "radiology", label: "أشعة", icon: Eye, color: "orange" },
    {
      value: "medical_procedure",
      label: "إجراءات طبية",
      icon: Heart,
      color: "red",
    },
    {
      value: "surgery",
      label: "عمليات جراحية",
      icon: AlertTriangle,
      color: "pink",
    },
    { value: "medication", label: "أدوية", icon: Plus, color: "teal" },
    {
      value: "facility_fee",
      label: "رسوم المرافق",
      icon: FileText,
      color: "gray",
    },
    { value: "emergency", label: "طوارئ", icon: AlertTriangle, color: "red" },
    { value: "other", label: "أخرى", icon: Settings, color: "indigo" },
  ];

  useEffect(() => {
    if (isOpen) {
      loadServices();
    }
  }, [isOpen]);

  const loadServices = async () => {
    try {
      setLoading(true);

      // Mock data - في التطبيق الحقيقي ستكون من API
      const mockServices = [
        {
          id: "1",
          itemName: "استشارة طبية عامة",
          description: "استشارة طبية شاملة مع الفحص السريري",
          itemType: "consultation",
          unitPrice: 200,
          category: "consultation",
          isActive: true,
          allowCustomQuantity: false,
          minimumQuantity: 1,
          maximumQuantity: 1,
          discountEligible: true,
          notes: "تشمل الفحص الأولي والتشخيص",
        },
        {
          id: "2",
          itemName: "فحص دم شامل",
          description: "تحليل دم شامل يشمل جميع المؤشرات الأساسية",
          itemType: "laboratory_test",
          unitPrice: 120,
          category: "laboratory_test",
          isActive: true,
          allowCustomQuantity: true,
          minimumQuantity: 1,
          maximumQuantity: 5,
          discountEligible: true,
          notes: "يتطلب صيام 12 ساعة",
        },
        {
          id: "3",
          itemName: "أشعة سينية للصدر",
          description: "تصوير بالأشعة السينية لمنطقة الصدر",
          itemType: "radiology",
          unitPrice: 150,
          category: "radiology",
          isActive: true,
          allowCustomQuantity: false,
          minimumQuantity: 1,
          maximumQuantity: 1,
          discountEligible: false,
          notes: "لا يحتاج تحضير مسبق",
        },
        {
          id: "4",
          itemName: "خياطة جراحية بسيطة",
          description: "خياطة الجروح البسيطة والسطحية",
          itemType: "medical_procedure",
          unitPrice: 300,
          category: "medical_procedure",
          isActive: true,
          allowCustomQuantity: false,
          minimumQuantity: 1,
          maximumQuantity: 1,
          discountEligible: true,
          notes: "يشمل التخدير الموضعي",
        },
        {
          id: "5",
          itemName: "رسوم طوارئ",
          description: "رسم خدمة قسم الطوارئ",
          itemType: "facility_fee",
          unitPrice: 100,
          category: "emergency",
          isActive: true,
          allowCustomQuantity: false,
          minimumQuantity: 1,
          maximumQuantity: 1,
          discountEligible: false,
          notes: "رسم ثابت لجميع حالات الطوارئ",
        },
      ];

      setServices(mockServices);
    } catch (error) {
      console.error("Error loading services:", error);
      handleApiError(error, "فشل في تحميل الخدمات");
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      itemName: "",
      description: "",
      itemType: "consultation",
      unitPrice: 0,
      category: "",
      isActive: true,
      allowCustomQuantity: true,
      minimumQuantity: 1,
      maximumQuantity: 100,
      discountEligible: true,
      notes: "",
    });
  };

  const openModal = (type, service = null) => {
    setModalType(type);
    setSelectedService(service);

    if (service && (type === "edit" || type === "delete")) {
      setFormData({
        itemName: service.itemName,
        description: service.description,
        itemType: service.itemType,
        unitPrice: service.unitPrice,
        category: service.category,
        isActive: service.isActive,
        allowCustomQuantity: service.allowCustomQuantity,
        minimumQuantity: service.minimumQuantity,
        maximumQuantity: service.maximumQuantity,
        discountEligible: service.discountEligible,
        notes: service.notes || "",
      });
    } else {
      resetForm();
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedService(null);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.itemName.trim()) {
      toast.error("يجب إدخال اسم الخدمة");
      return;
    }

    if (formData.unitPrice <= 0) {
      toast.error("يجب إدخال سعر صحيح");
      return;
    }

    try {
      setLoading(true);

      // Mock API call - في التطبيق الحقيقي ستكون من API
      if (modalType === "add") {
        const newService = {
          id: Date.now().toString(),
          ...formData,
        };
        setServices((prev) => [...prev, newService]);
        showSuccessMessage("تم إضافة الخدمة بنجاح");
      } else if (modalType === "edit") {
        setServices((prev) =>
          prev.map((service) =>
            service.id === selectedService.id
              ? { ...service, ...formData }
              : service
          )
        );
        showSuccessMessage("تم تحديث الخدمة بنجاح");
      }

      closeModal();
      onServiceUpdate && onServiceUpdate();
    } catch (error) {
      handleApiError(
        error,
        `فشل في ${modalType === "add" ? "إضافة" : "تحديث"} الخدمة`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);

      // Mock API call
      setServices((prev) =>
        prev.filter((service) => service.id !== selectedService.id)
      );
      showSuccessMessage("تم حذف الخدمة بنجاح");

      closeModal();
      onServiceUpdate && onServiceUpdate();
    } catch (error) {
      handleApiError(error, "فشل في حذف الخدمة");
    } finally {
      setLoading(false);
    }
  };

  const duplicateService = async (service) => {
    try {
      const duplicatedService = {
        ...service,
        id: Date.now().toString(),
        itemName: `${service.itemName} (نسخة)`,
        isActive: false,
      };

      setServices((prev) => [...prev, duplicatedService]);
      showSuccessMessage("تم نسخ الخدمة بنجاح");
    } catch (error) {
      handleApiError(error, "فشل في نسخ الخدمة");
    }
  };

  const toggleServiceStatus = async (service) => {
    try {
      setServices((prev) =>
        prev.map((s) =>
          s.id === service.id ? { ...s, isActive: !s.isActive } : s
        )
      );

      showSuccessMessage(
        `تم ${service.isActive ? "إلغاء تفعيل" : "تفعيل"} الخدمة`
      );
    } catch (error) {
      handleApiError(error, "فشل في تغيير حالة الخدمة");
    }
  };

  const getCategoryIcon = (category) => {
    const cat = serviceCategories.find((c) => c.value === category);
    return cat ? cat.icon : Settings;
  };

  const getCategoryLabel = (category) => {
    const cat = serviceCategories.find((c) => c.value === category);
    return cat ? cat.label : "غير محدد";
  };

  const getCategoryColor = (category) => {
    const cat = serviceCategories.find((c) => c.value === category);
    return cat ? cat.color : "gray";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6" />
              <h2 className="text-xl font-bold">
                إعدادات الخدمات الطبية والأسعار
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => openModal("add")}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة خدمة
              </button>
              <button
                onClick={onClose}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Search and Filters */}
          <div className="p-6 bg-gray-50 border-b">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    placeholder="البحث في الخدمات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="w-full md:w-64">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">جميع الفئات</option>
                  {serviceCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Services List */}
          <div className="p-6">
            {loading ? (
              <LoadingSpinner
                size="lg"
                text="جاري تحميل الخدمات..."
                className="py-12"
              />
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  لا توجد خدمات
                </h3>
                <p className="text-gray-500">
                  لم يتم العثور على خدمات تطابق البحث
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredServices.map((service) => {
                  const IconComponent = getCategoryIcon(service.category);
                  const categoryColor = getCategoryColor(service.category);

                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-white border rounded-lg p-6 ${
                        service.isActive
                          ? "border-gray-200"
                          : "border-red-200 bg-red-50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-12 h-12 bg-${categoryColor}-100 rounded-lg flex items-center justify-center`}
                          >
                            <IconComponent
                              className={`w-6 h-6 text-${categoryColor}-600`}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {service.itemName}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {service.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span
                                className={`px-2 py-1 bg-${categoryColor}-100 text-${categoryColor}-800 rounded-full`}
                              >
                                {getCategoryLabel(service.category)}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full ${
                                  service.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {service.isActive ? "مفعل" : "غير مفعل"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => duplicateService(service)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            title="نسخ الخدمة"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openModal("edit", service)}
                            className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openModal("delete", service)}
                            className="p-2 text-red-400 hover:text-red-600 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">السعر:</span>
                          <span className="font-bold text-lg text-green-600">
                            {formatCurrency(service.unitPrice)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            كمية قابلة للتخصيص:
                          </span>
                          <span
                            className={`text-sm ${
                              service.allowCustomQuantity
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            {service.allowCustomQuantity ? "نعم" : "لا"}
                          </span>
                        </div>

                        {service.allowCustomQuantity && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              النطاق:
                            </span>
                            <span className="text-sm text-gray-900">
                              {service.minimumQuantity} -{" "}
                              {service.maximumQuantity}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            مؤهل للخصم:
                          </span>
                          <span
                            className={`text-sm ${
                              service.discountEligible
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            {service.discountEligible ? "نعم" : "لا"}
                          </span>
                        </div>

                        {service.notes && (
                          <div className="pt-3 border-t">
                            <p className="text-sm text-gray-600">
                              <strong>ملاحظات:</strong> {service.notes}
                            </p>
                          </div>
                        )}

                        <div className="pt-3 border-t">
                          <button
                            onClick={() => toggleServiceStatus(service)}
                            className={`w-full py-2 px-4 rounded-lg transition-colors ${
                              service.isActive
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {service.isActive
                              ? "إلغاء التفعيل"
                              : "تفعيل الخدمة"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              {modalType === "delete" ? (
                // Delete Confirmation Modal
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      تأكيد الحذف
                    </h3>
                  </div>

                  <p className="text-gray-600 mb-6">
                    هل أنت متأكد من رغبتك في حذف الخدمة "
                    {selectedService?.itemName}"؟ لا يمكن التراجع عن هذا
                    الإجراء.
                  </p>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      disabled={loading}
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      disabled={loading}
                    >
                      {loading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      )}
                      حذف الخدمة
                    </button>
                  </div>
                </div>
              ) : (
                // Add/Edit Modal
                <form onSubmit={handleSubmit}>
                  <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6">
                    <h3 className="text-lg font-semibold">
                      {modalType === "add"
                        ? "إضافة خدمة جديدة"
                        : "تعديل الخدمة"}
                    </h3>
                  </div>

                  <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          اسم الخدمة *
                        </label>
                        <input
                          type="text"
                          value={formData.itemName}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              itemName: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          الفئة *
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              category: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                          required
                        >
                          <option value="">اختر الفئة</option>
                          {serviceCategories.map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الوصف
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          السعر (ريال) *
                        </label>
                        <input
                          type="number"
                          value={formData.unitPrice}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              unitPrice: parseFloat(e.target.value) || 0,
                            }))
                          }
                          min="0"
                          step="0.01"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          نوع العنصر
                        </label>
                        <select
                          value={formData.itemType}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              itemType: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="consultation">استشارة</option>
                          <option value="diagnostic_test">فحص تشخيصي</option>
                          <option value="laboratory_test">تحليل مختبري</option>
                          <option value="radiology">أشعة</option>
                          <option value="medical_procedure">إجراء طبي</option>
                          <option value="surgery">جراحة</option>
                          <option value="medication">دواء</option>
                          <option value="facility_fee">رسوم مرافق</option>
                          <option value="other">أخرى</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.allowCustomQuantity}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              allowCustomQuantity: e.target.checked,
                            }))
                          }
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">
                          السماح بتخصيص الكمية
                        </span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.discountEligible}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              discountEligible: e.target.checked,
                            }))
                          }
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">
                          مؤهل للخصم
                        </span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              isActive: e.target.checked,
                            }))
                          }
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">مفعل</span>
                      </label>
                    </div>

                    {formData.allowCustomQuantity && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            الحد الأدنى للكمية
                          </label>
                          <input
                            type="number"
                            value={formData.minimumQuantity}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                minimumQuantity: parseInt(e.target.value) || 1,
                              }))
                            }
                            min="1"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            الحد الأقصى للكمية
                          </label>
                          <input
                            type="number"
                            value={formData.maximumQuantity}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                maximumQuantity:
                                  parseInt(e.target.value) || 100,
                              }))
                            }
                            min="1"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ملاحظات
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        rows={2}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                        placeholder="ملاحظات إضافية..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 p-6 border-t">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      disabled={loading}
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                      disabled={loading}
                    >
                      {loading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      )}
                      <Save className="w-4 h-4" />
                      {modalType === "add" ? "إضافة الخدمة" : "حفظ التغييرات"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MedicalServicesSettings;
