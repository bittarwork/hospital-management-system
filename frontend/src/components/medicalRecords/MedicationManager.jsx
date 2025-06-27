import React, { useState, useEffect } from "react";
import { medicalRecordsAPI } from "../../services/api";
import toast from "react-hot-toast";

const MedicationManager = ({ recordId, medications = [], onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [formData, setFormData] = useState({
    medicationName: "",
    genericName: "",
    dosage: "",
    frequency: "",
    route: "oral",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    indication: "",
    instructions: "",
    quantity: "",
    refills: 0,
    adherence: "unknown",
  });

  const routes = [
    { value: "oral", label: "فموي" },
    { value: "iv", label: "وريدي" },
    { value: "im", label: "عضلي" },
    { value: "sc", label: "تحت الجلد" },
    { value: "topical", label: "موضعي" },
    { value: "inhalation", label: "استنشاق" },
    { value: "rectal", label: "شرجي" },
    { value: "nasal", label: "أنفي" },
    { value: "sublingual", label: "تحت اللسان" },
    { value: "other", label: "أخرى" },
  ];

  const adherenceOptions = [
    { value: "excellent", label: "ممتاز" },
    { value: "good", label: "جيد" },
    { value: "fair", label: "عادي" },
    { value: "poor", label: "ضعيف" },
    { value: "unknown", label: "غير محدد" },
  ];

  const resetForm = () => {
    setFormData({
      medicationName: "",
      genericName: "",
      dosage: "",
      frequency: "",
      route: "oral",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      indication: "",
      instructions: "",
      quantity: "",
      refills: 0,
      adherence: "unknown",
    });
    setEditingMedication(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingMedication) {
        await medicalRecordsAPI.updateMedication(
          recordId,
          editingMedication._id,
          formData
        );
        toast.success("تم تحديث الدواء بنجاح");
      } else {
        await medicalRecordsAPI.addMedication(recordId, formData);
        toast.success("تم إضافة الدواء بنجاح");
      }

      resetForm();
      onUpdate?.();
    } catch (error) {
      console.error("❌ Error managing medication:", error);
      toast.error("حدث خطأ في إدارة الدواء");
    }
  };

  const handleEdit = (medication) => {
    setFormData({
      medicationName: medication.medicationName || "",
      genericName: medication.genericName || "",
      dosage: medication.dosage || "",
      frequency: medication.frequency || "",
      route: medication.route || "oral",
      startDate: medication.startDate
        ? new Date(medication.startDate).toISOString().split("T")[0]
        : "",
      endDate: medication.endDate
        ? new Date(medication.endDate).toISOString().split("T")[0]
        : "",
      indication: medication.indication || "",
      instructions: medication.instructions || "",
      quantity: medication.quantity || "",
      refills: medication.refills || 0,
      adherence: medication.adherence || "unknown",
    });
    setEditingMedication(medication);
    setShowForm(true);
  };

  const handleDelete = async (medicationId) => {
    if (!confirm("هل أنت متأكد من حذف هذا الدواء؟")) return;

    try {
      await medicalRecordsAPI.removeMedication(recordId, medicationId);
      toast.success("تم حذف الدواء بنجاح");
      onUpdate?.();
    } catch (error) {
      console.error("❌ Error removing medication:", error);
      toast.error("حدث خطأ في حذف الدواء");
    }
  };

  const getRouteLabel = (route) => {
    return routes.find((r) => r.value === route)?.label || route;
  };

  const getAdherenceLabel = (adherence) => {
    return (
      adherenceOptions.find((a) => a.value === adherence)?.label || adherence
    );
  };

  const getAdherenceColor = (adherence) => {
    switch (adherence) {
      case "excellent":
        return "text-green-600 bg-green-50";
      case "good":
        return "text-blue-600 bg-blue-50";
      case "fair":
        return "text-yellow-600 bg-yellow-50";
      case "poor":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          الأدوية الحالية ({medications?.length || 0})
        </h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          إضافة دواء جديد
        </button>
      </div>

      {/* Medications List */}
      <div className="space-y-4">
        {medications?.map((medication, index) => (
          <div
            key={medication._id || index}
            className="bg-white border rounded-lg p-4 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900">
                  {medication.medicationName}
                </h4>
                {medication.genericName && (
                  <p className="text-sm text-gray-600">
                    ({medication.genericName})
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-600">الجرعة والتكرار</p>
                <p className="font-medium">
                  {medication.dosage} - {medication.frequency}
                </p>
                <p className="text-sm text-gray-600">
                  الطريق: {getRouteLabel(medication.route)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">فترة العلاج</p>
                <p className="text-sm">
                  من:{" "}
                  {medication.startDate
                    ? new Date(medication.startDate).toLocaleDateString("ar-SA")
                    : "غير محدد"}
                </p>
                {medication.endDate && (
                  <p className="text-sm">
                    إلى:{" "}
                    {new Date(medication.endDate).toLocaleDateString("ar-SA")}
                  </p>
                )}
              </div>
            </div>

            {medication.indication && (
              <div className="mt-3">
                <p className="text-sm text-gray-600">دواعي الاستعمال:</p>
                <p className="text-sm">{medication.indication}</p>
              </div>
            )}

            {medication.instructions && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">تعليمات:</p>
                <p className="text-sm">{medication.instructions}</p>
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-2 space-x-reverse">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${getAdherenceColor(
                    medication.adherence
                  )}`}
                >
                  الالتزام: {getAdherenceLabel(medication.adherence)}
                </span>
                {medication.quantity && (
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    الكمية: {medication.quantity}
                  </span>
                )}
                {medication.refills > 0 && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    إعادة صرف: {medication.refills}
                  </span>
                )}
              </div>

              <div className="flex space-x-2 space-x-reverse">
                <button
                  onClick={() => handleEdit(medication)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(medication._id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}

        {(!medications || medications.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            لا توجد أدوية مسجلة حالياً
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingMedication ? "تعديل الدواء" : "إضافة دواء جديد"}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم الدواء *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.medicationName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        medicationName: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم العلمي
                  </label>
                  <input
                    type="text"
                    value={formData.genericName}
                    onChange={(e) =>
                      setFormData({ ...formData, genericName: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الجرعة *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.dosage}
                    onChange={(e) =>
                      setFormData({ ...formData, dosage: e.target.value })
                    }
                    placeholder="مثال: 500mg"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    التكرار *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.frequency}
                    onChange={(e) =>
                      setFormData({ ...formData, frequency: e.target.value })
                    }
                    placeholder="مثال: 3 مرات يومياً"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    طريقة الإعطاء
                  </label>
                  <select
                    value={formData.route}
                    onChange={(e) =>
                      setFormData({ ...formData, route: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {routes.map((route) => (
                      <option key={route.value} value={route.value}>
                        {route.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الالتزام
                  </label>
                  <select
                    value={formData.adherence}
                    onChange={(e) =>
                      setFormData({ ...formData, adherence: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {adherenceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ البداية *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ النهاية
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الكمية
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    عدد مرات إعادة الصرف
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.refills}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        refills: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  دواعي الاستعمال
                </label>
                <input
                  type="text"
                  value={formData.indication}
                  onChange={(e) =>
                    setFormData({ ...formData, indication: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تعليمات خاصة
                </label>
                <textarea
                  rows="3"
                  value={formData.instructions}
                  onChange={(e) =>
                    setFormData({ ...formData, instructions: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingMedication ? "تحديث" : "إضافة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationManager;
