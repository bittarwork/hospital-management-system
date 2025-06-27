import React, { useState, useEffect } from "react";
import { medicalRecordsAPI } from "../../services/api";
import toast from "react-hot-toast";
import {
  FaXRay,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSave,
  FaTimes,
  FaFileMedical,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaImage,
} from "react-icons/fa";

const RadiologyManager = ({ recordId, radiologyTests = [], onUpdate }) => {
  const [tests, setTests] = useState(radiologyTests);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    testType: "",
    bodyPart: "",
    indication: "",
    testDate: "",
    performedBy: "",
    radiologist: "",
    technique: "",
    findings: "",
    impression: "",
    recommendation: "",
    priority: "routine",
    urgency: "normal",
    status: "scheduled",
    images: [],
    contrast: false,
    contrastAgent: "",
    radiation: {
      dose: "",
      unit: "mGy",
    },
  });

  useEffect(() => {
    setTests(radiologyTests);
  }, [radiologyTests]);

  const resetForm = () => {
    setFormData({
      testType: "",
      bodyPart: "",
      indication: "",
      testDate: "",
      performedBy: "",
      radiologist: "",
      technique: "",
      findings: "",
      impression: "",
      recommendation: "",
      priority: "routine",
      urgency: "normal",
      status: "scheduled",
      images: [],
      contrast: false,
      contrastAgent: "",
      radiation: {
        dose: "",
        unit: "mGy",
      },
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      if (!formData.testType || !formData.bodyPart || !formData.indication) {
        toast.error("يرجى ملء جميع الحقول المطلوبة");
        return;
      }

      if (editingId) {
        const response = await medicalRecordsAPI.updateRadiologyResult(
          recordId,
          editingId,
          formData
        );
        toast.success("تم تحديث نتيجة الأشعة بنجاح");
      } else {
        const response = await medicalRecordsAPI.addRadiologyResult(
          recordId,
          formData
        );
        toast.success("تم إضافة نتيجة الأشعة بنجاح");
      }

      if (onUpdate) {
        onUpdate();
      }
      resetForm();
    } catch (error) {
      console.error("Error managing radiology result:", error);
      toast.error("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (test) => {
    setFormData({
      testType: test.testType || "",
      bodyPart: test.bodyPart || "",
      indication: test.indication || "",
      testDate: test.testDate?.split("T")[0] || "",
      performedBy: test.performedBy || "",
      radiologist: test.radiologist || "",
      technique: test.technique || "",
      findings: test.findings || "",
      impression: test.impression || "",
      recommendation: test.recommendation || "",
      priority: test.priority || "routine",
      urgency: test.urgency || "normal",
      status: test.status || "scheduled",
      images: test.images || [],
      contrast: test.contrast || false,
      contrastAgent: test.contrastAgent || "",
      radiation: {
        dose: test.radiation?.dose || "",
        unit: test.radiation?.unit || "mGy",
      },
    });
    setEditingId(test._id);
    setShowAddForm(true);
  };

  const handleDelete = async (testId) => {
    if (window.confirm("هل أنت متأكد من حذف هذه النتيجة؟")) {
      try {
        setIsLoading(true);
        await medicalRecordsAPI.removeRadiologyResult(recordId, testId);
        toast.success("تم حذف نتيجة الأشعة بنجاح");
        if (onUpdate) {
          onUpdate();
        }
      } catch (error) {
        console.error("Error deleting radiology result:", error);
        toast.error("حدث خطأ أثناء حذف البيانات");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "in_progress":
        return "text-blue-600 bg-blue-100";
      case "scheduled":
        return "text-yellow-600 bg-yellow-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 bg-red-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "routine":
        return "text-blue-600 bg-blue-100";
      case "low":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FaXRay className="text-blue-600" />
          نتائج الأشعة والصور الطبية
        </h3>
        <button
          onClick={() => setShowAddForm(true)}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="text-sm" />
          إضافة نتيجة أشعة
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg border p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium text-gray-800">
              {editingId ? "تحديث نتيجة الأشعة" : "إضافة نتيجة أشعة جديدة"}
            </h4>
            <button
              onClick={resetForm}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Basic Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نوع الفحص *
              </label>
              <select
                value={formData.testType}
                onChange={(e) =>
                  setFormData({ ...formData, testType: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">اختر نوع الفحص</option>
                <option value="x-ray">أشعة سينية (X-Ray)</option>
                <option value="ct">أشعة مقطعية (CT)</option>
                <option value="mri">رنين مغناطيسي (MRI)</option>
                <option value="ultrasound">أشعة صوتية (Ultrasound)</option>
                <option value="mammography">تصوير الثدي</option>
                <option value="pet">PET Scan</option>
                <option value="nuclear">طب نووي</option>
                <option value="fluoroscopy">تنظير بالأشعة</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الجزء المصور *
              </label>
              <input
                type="text"
                value={formData.bodyPart}
                onChange={(e) =>
                  setFormData({ ...formData, bodyPart: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثل: الصدر، البطن، الرأس"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تاريخ الفحص
              </label>
              <input
                type="date"
                value={formData.testDate}
                onChange={(e) =>
                  setFormData({ ...formData, testDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الطبيب المختص بالأشعة
              </label>
              <input
                type="text"
                value={formData.radiologist}
                onChange={(e) =>
                  setFormData({ ...formData, radiologist: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="اسم طبيب الأشعة"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الأولوية
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">منخفضة</option>
                <option value="routine">عادية</option>
                <option value="high">عالية</option>
                <option value="urgent">عاجلة</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الحالة
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="scheduled">مجدول</option>
                <option value="in_progress">قيد التنفيذ</option>
                <option value="completed">مكتمل</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>
          </div>

          {/* Contrast Information */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="contrast"
                checked={formData.contrast}
                onChange={(e) =>
                  setFormData({ ...formData, contrast: e.target.checked })
                }
                className="rounded"
              />
              <label
                htmlFor="contrast"
                className="text-sm font-medium text-gray-700"
              >
                تم استخدام صبغة
              </label>
            </div>
            {formData.contrast && (
              <input
                type="text"
                value={formData.contrastAgent}
                onChange={(e) =>
                  setFormData({ ...formData, contrastAgent: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="نوع الصبغة المستخدمة"
              />
            )}
          </div>

          {/* Text Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                دواعي الفحص *
              </label>
              <textarea
                value={formData.indication}
                onChange={(e) =>
                  setFormData({ ...formData, indication: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="السبب في طلب الفحص..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                التقنية المستخدمة
              </label>
              <textarea
                value={formData.technique}
                onChange={(e) =>
                  setFormData({ ...formData, technique: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="تفاصيل التقنية المستخدمة..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                النتائج والملاحظات
              </label>
              <textarea
                value={formData.findings}
                onChange={(e) =>
                  setFormData({ ...formData, findings: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="وصف النتائج التي ظهرت في الفحص..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الانطباع والتشخيص
              </label>
              <textarea
                value={formData.impression}
                onChange={(e) =>
                  setFormData({ ...formData, impression: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="التشخيص المبدئي بناءً على النتائج..."
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              التوصيات
            </label>
            <textarea
              value={formData.recommendation}
              onChange={(e) =>
                setFormData({ ...formData, recommendation: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="التوصيات الطبية والمتابعة المطلوبة..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={resetForm}
              disabled={isLoading}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaSave className="text-sm" />
              {isLoading ? "جاري الحفظ..." : "حفظ"}
            </button>
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-4">
        {tests && tests.length > 0 ? (
          tests.map((test, index) => (
            <div
              key={test._id || index}
              className="bg-white border rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FaXRay className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {test.testType} - {test.bodyPart}
                    </h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                          test.status
                        )}`}
                      >
                        {test.status === "completed"
                          ? "مكتمل"
                          : test.status === "in_progress"
                          ? "قيد التنفيذ"
                          : test.status === "scheduled"
                          ? "مجدول"
                          : test.status === "cancelled"
                          ? "ملغي"
                          : test.status}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(
                          test.priority
                        )}`}
                      >
                        {test.priority === "urgent"
                          ? "عاجل"
                          : test.priority === "high"
                          ? "عالي"
                          : test.priority === "routine"
                          ? "عادي"
                          : test.priority === "low"
                          ? "منخفض"
                          : test.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(test)}
                    disabled={isLoading}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(test._id)}
                    disabled={isLoading}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {test.testDate && (
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-400" />
                    <span className="text-gray-600">
                      تاريخ الفحص:{" "}
                      {new Date(test.testDate).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                )}

                {test.radiologist && (
                  <div className="flex items-center gap-2">
                    <FaFileMedical className="text-gray-400" />
                    <span className="text-gray-600">
                      طبيب الأشعة: {test.radiologist}
                    </span>
                  </div>
                )}

                {test.contrast && (
                  <div className="flex items-center gap-2">
                    <FaExclamationTriangle className="text-orange-400" />
                    <span className="text-gray-600">
                      تم استخدام صبغة
                      {test.contrastAgent && `: ${test.contrastAgent}`}
                    </span>
                  </div>
                )}
              </div>

              {test.indication && (
                <div className="mt-3">
                  <h5 className="font-medium text-gray-700 mb-1">
                    دواعي الفحص:
                  </h5>
                  <p className="text-gray-600 text-sm">{test.indication}</p>
                </div>
              )}

              {test.findings && (
                <div className="mt-3">
                  <h5 className="font-medium text-gray-700 mb-1">النتائج:</h5>
                  <p className="text-gray-600 text-sm">{test.findings}</p>
                </div>
              )}

              {test.impression && (
                <div className="mt-3">
                  <h5 className="font-medium text-gray-700 mb-1">الانطباع:</h5>
                  <p className="text-gray-600 text-sm">{test.impression}</p>
                </div>
              )}

              {test.recommendation && (
                <div className="mt-3">
                  <h5 className="font-medium text-gray-700 mb-1">التوصيات:</h5>
                  <p className="text-gray-600 text-sm">{test.recommendation}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FaXRay className="mx-auto text-4xl mb-4 text-gray-300" />
            <p>لا توجد نتائج أشعة مسجلة</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RadiologyManager;
