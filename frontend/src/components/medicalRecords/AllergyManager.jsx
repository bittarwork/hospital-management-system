import React, { useState } from "react";
import { medicalRecordsAPI } from "../../services/api";
import toast from "react-hot-toast";

const AllergyManager = ({ recordId, allergies = [], onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState(null);
  const [formData, setFormData] = useState({
    allergen: "",
    allergenType: "drug",
    reaction: "",
    severity: "mild",
    onsetDate: "",
    verificationStatus: "suspected",
    notes: "",
  });

  const allergenTypes = [
    { value: "drug", label: "دواء" },
    { value: "food", label: "طعام" },
    { value: "environmental", label: "بيئي" },
    { value: "latex", label: "لاتكس" },
    { value: "other", label: "أخرى" },
  ];

  const severityLevels = [
    { value: "mild", label: "خفيف", color: "text-green-600 bg-green-50" },
    {
      value: "moderate",
      label: "متوسط",
      color: "text-yellow-600 bg-yellow-50",
    },
    { value: "severe", label: "شديد", color: "text-orange-600 bg-orange-50" },
    {
      value: "life_threatening",
      label: "مهدد للحياة",
      color: "text-red-600 bg-red-50",
    },
  ];

  const verificationStatuses = [
    { value: "confirmed", label: "مؤكد", color: "text-red-600 bg-red-50" },
    {
      value: "suspected",
      label: "مشتبه",
      color: "text-yellow-600 bg-yellow-50",
    },
    {
      value: "unlikely",
      label: "غير محتمل",
      color: "text-gray-600 bg-gray-50",
    },
    { value: "refuted", label: "مدحوض", color: "text-green-600 bg-green-50" },
  ];

  const resetForm = () => {
    setFormData({
      allergen: "",
      allergenType: "drug",
      reaction: "",
      severity: "mild",
      onsetDate: "",
      verificationStatus: "suspected",
      notes: "",
    });
    setEditingAllergy(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingAllergy) {
        await medicalRecordsAPI.updateAllergy(
          recordId,
          editingAllergy._id,
          formData
        );
        toast.success("تم تحديث الحساسية بنجاح");
      } else {
        await medicalRecordsAPI.addAllergy(recordId, formData);
        toast.success("تم إضافة الحساسية بنجاح");
      }

      resetForm();
      onUpdate?.();
    } catch (error) {
      console.error("❌ Error managing allergy:", error);
      toast.error("حدث خطأ في إدارة الحساسية");
    }
  };

  const handleEdit = (allergy) => {
    setFormData({
      allergen: allergy.allergen || "",
      allergenType: allergy.allergenType || "drug",
      reaction: allergy.reaction || "",
      severity: allergy.severity || "mild",
      onsetDate: allergy.onsetDate
        ? new Date(allergy.onsetDate).toISOString().split("T")[0]
        : "",
      verificationStatus: allergy.verificationStatus || "suspected",
      notes: allergy.notes || "",
    });
    setEditingAllergy(allergy);
    setShowForm(true);
  };

  const handleDelete = async (allergyId) => {
    if (!confirm("هل أنت متأكد من حذف هذه الحساسية؟")) return;

    try {
      await medicalRecordsAPI.removeAllergy(recordId, allergyId);
      toast.success("تم حذف الحساسية بنجاح");
      onUpdate?.();
    } catch (error) {
      console.error("❌ Error removing allergy:", error);
      toast.error("حدث خطأ في حذف الحساسية");
    }
  };

  const getTypeLabel = (type) => {
    return allergenTypes.find((t) => t.value === type)?.label || type;
  };

  const getSeverityInfo = (severity) => {
    return (
      severityLevels.find((s) => s.value === severity) || severityLevels[0]
    );
  };

  const getVerificationInfo = (status) => {
    return (
      verificationStatuses.find((s) => s.value === status) ||
      verificationStatuses[1]
    );
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "mild":
        return "🟢";
      case "moderate":
        return "🟡";
      case "severe":
        return "🟠";
      case "life_threatening":
        return "🔴";
      default:
        return "⚪";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          الحساسيات ({allergies?.length || 0})
        </h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          إضافة حساسية جديدة
        </button>
      </div>

      {/* Critical Allergies Alert */}
      {allergies?.some(
        (allergy) => allergy.severity === "life_threatening"
      ) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-600 text-lg ml-2">⚠️</span>
            <div>
              <h4 className="text-red-800 font-semibold">
                تحذير: يوجد حساسيات مهددة للحياة
              </h4>
              <p className="text-red-700 text-sm">
                يرجى مراجعة قائمة الحساسيات بعناية قبل وصف أي أدوية
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Allergies List */}
      <div className="space-y-4">
        {allergies?.map((allergy, index) => {
          const severityInfo = getSeverityInfo(allergy.severity);
          const verificationInfo = getVerificationInfo(
            allergy.verificationStatus
          );

          return (
            <div
              key={allergy._id || index}
              className="bg-white border rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 space-x-reverse mb-2">
                    <span className="text-lg">
                      {getSeverityIcon(allergy.severity)}
                    </span>
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {allergy.allergen}
                    </h4>
                    <span className="text-sm text-gray-600">
                      ({getTypeLabel(allergy.allergenType)})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600">رد الفعل:</p>
                      <p className="font-medium">{allergy.reaction}</p>
                    </div>

                    {allergy.onsetDate && (
                      <div>
                        <p className="text-sm text-gray-600">تاريخ الحدوث:</p>
                        <p className="font-medium">
                          {new Date(allergy.onsetDate).toLocaleDateString(
                            "ar-SA"
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {allergy.notes && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">ملاحظات:</p>
                      <p className="text-sm">{allergy.notes}</p>
                    </div>
                  )}

                  <div className="flex space-x-2 space-x-reverse">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${severityInfo.color}`}
                    >
                      {severityInfo.label}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${verificationInfo.color}`}
                    >
                      {verificationInfo.label}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2 space-x-reverse">
                  <button
                    onClick={() => handleEdit(allergy)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(allergy._id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {(!allergies || allergies.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            لا توجد حساسيات مسجلة حالياً
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingAllergy ? "تعديل الحساسية" : "إضافة حساسية جديدة"}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  مسبب الحساسية *
                </label>
                <input
                  type="text"
                  required
                  value={formData.allergen}
                  onChange={(e) =>
                    setFormData({ ...formData, allergen: e.target.value })
                  }
                  placeholder="مثال: البنسلين، الفول السوداني"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نوع مسبب الحساسية *
                </label>
                <select
                  required
                  value={formData.allergenType}
                  onChange={(e) =>
                    setFormData({ ...formData, allergenType: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {allergenTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رد الفعل *
                </label>
                <input
                  type="text"
                  required
                  value={formData.reaction}
                  onChange={(e) =>
                    setFormData({ ...formData, reaction: e.target.value })
                  }
                  placeholder="مثال: طفح جلدي، صعوبة في التنفس"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الشدة *
                </label>
                <select
                  required
                  value={formData.severity}
                  onChange={(e) =>
                    setFormData({ ...formData, severity: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {severityLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  حالة التأكيد
                </label>
                <select
                  value={formData.verificationStatus}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      verificationStatus: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {verificationStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تاريخ الحدوث
                </label>
                <input
                  type="date"
                  value={formData.onsetDate}
                  onChange={(e) =>
                    setFormData({ ...formData, onsetDate: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ملاحظات إضافية
                </label>
                <textarea
                  rows="3"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="تفاصيل إضافية حول الحساسية..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 space-x-reverse pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {editingAllergy ? "تحديث" : "إضافة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllergyManager;
