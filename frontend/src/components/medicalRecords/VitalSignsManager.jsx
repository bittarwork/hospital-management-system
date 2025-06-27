import React, { useState, useEffect } from "react";
import { medicalRecordsAPI } from "../../services/api";
import toast from "react-hot-toast";

const VitalSignsManager = ({ recordId, vitalSigns = {}, onUpdate }) => {
  const [formData, setFormData] = useState({
    bloodPressure: {
      systolic: "",
      diastolic: "",
    },
    heartRate: "",
    respiratoryRate: "",
    temperature: {
      value: "",
      unit: "celsius",
    },
    oxygenSaturation: "",
    height: {
      value: "",
      unit: "cm",
    },
    weight: {
      value: "",
      unit: "kg",
    },
    bmi: "",
    painScore: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (vitalSigns) {
      setFormData({
        bloodPressure: {
          systolic: vitalSigns.bloodPressure?.systolic || "",
          diastolic: vitalSigns.bloodPressure?.diastolic || "",
        },
        heartRate: vitalSigns.heartRate || "",
        respiratoryRate: vitalSigns.respiratoryRate || "",
        temperature: {
          value: vitalSigns.temperature?.value || "",
          unit: vitalSigns.temperature?.unit || "celsius",
        },
        oxygenSaturation: vitalSigns.oxygenSaturation || "",
        height: {
          value: vitalSigns.height?.value || "",
          unit: vitalSigns.height?.unit || "cm",
        },
        weight: {
          value: vitalSigns.weight?.value || "",
          unit: vitalSigns.weight?.unit || "kg",
        },
        bmi: vitalSigns.bmi || "",
        painScore: vitalSigns.painScore || "",
      });
    }
  }, [vitalSigns]);

  // Calculate BMI automatically
  useEffect(() => {
    const height = formData.height.value;
    const weight = formData.weight.value;

    if (height && weight) {
      const heightInMeters = height / 100; // Convert cm to meters
      const bmi = weight / (heightInMeters * heightInMeters);
      setFormData((prev) => ({
        ...prev,
        bmi: Math.round(bmi * 10) / 10,
      }));
    }
  }, [formData.height.value, formData.weight.value]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const updateData = {
        physicalExamination: {
          vitalSigns: formData,
        },
      };

      await medicalRecordsAPI.update(recordId, updateData);
      toast.success("تم تحديث العلامات الحيوية بنجاح");
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error("❌ Error updating vital signs:", error);
      toast.error("حدث خطأ في تحديث العلامات الحيوية");
    }
  };

  const getVitalStatus = (value, ranges) => {
    if (!value || !ranges) return { status: "normal", color: "text-gray-600" };

    const numValue = parseFloat(value);
    if (numValue < ranges.low) return { status: "low", color: "text-blue-600" };
    if (numValue > ranges.high)
      return { status: "high", color: "text-red-600" };
    return { status: "normal", color: "text-green-600" };
  };

  const getBPStatus = (systolic, diastolic) => {
    if (!systolic || !diastolic)
      return { status: "normal", color: "text-gray-600", label: "غير محدد" };

    const sys = parseFloat(systolic);
    const dia = parseFloat(diastolic);

    if (sys < 90 || dia < 60)
      return { status: "low", color: "text-blue-600", label: "منخفض" };
    if (sys >= 140 || dia >= 90)
      return { status: "high", color: "text-red-600", label: "مرتفع" };
    if (sys >= 120 || dia >= 80)
      return {
        status: "elevated",
        color: "text-yellow-600",
        label: "مرتفع قليلاً",
      };
    return { status: "normal", color: "text-green-600", label: "طبيعي" };
  };

  const getBMIStatus = (bmi) => {
    if (!bmi)
      return { status: "normal", color: "text-gray-600", label: "غير محدد" };

    const value = parseFloat(bmi);
    if (value < 18.5)
      return {
        status: "underweight",
        color: "text-blue-600",
        label: "نقص وزن",
      };
    if (value >= 30)
      return { status: "obese", color: "text-red-600", label: "سمنة" };
    if (value >= 25)
      return {
        status: "overweight",
        color: "text-yellow-600",
        label: "زيادة وزن",
      };
    return { status: "normal", color: "text-green-600", label: "طبيعي" };
  };

  const getPainLevel = (score) => {
    if (!score) return { label: "غير محدد", color: "text-gray-600" };

    const value = parseFloat(score);
    if (value <= 3) return { label: "خفيف", color: "text-green-600" };
    if (value <= 6) return { label: "متوسط", color: "text-yellow-600" };
    return { label: "شديد", color: "text-red-600" };
  };

  const getTemperatureStatus = (temp) => {
    if (!temp)
      return { status: "normal", color: "text-gray-600", label: "غير محدد" };

    const value = parseFloat(temp);
    if (value < 36)
      return { status: "low", color: "text-blue-600", label: "منخفضة" };
    if (value >= 38)
      return { status: "high", color: "text-red-600", label: "حمى" };
    if (value >= 37.5)
      return {
        status: "elevated",
        color: "text-yellow-600",
        label: "مرتفعة قليلاً",
      };
    return { status: "normal", color: "text-green-600", label: "طبيعية" };
  };

  const bpStatus = getBPStatus(
    formData.bloodPressure.systolic,
    formData.bloodPressure.diastolic
  );
  const bmiStatus = getBMIStatus(formData.bmi);
  const painLevel = getPainLevel(formData.painScore);
  const tempStatus = getTemperatureStatus(formData.temperature.value);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          العلامات الحيوية
        </h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isEditing
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isEditing ? "إلغاء" : "تعديل"}
        </button>
      </div>

      {isEditing ? (
        /* Edit Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Blood Pressure */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                ضغط الدم (mmHg)
              </label>
              <div className="flex space-x-2 space-x-reverse">
                <input
                  type="number"
                  placeholder="الانقباضي"
                  value={formData.bloodPressure.systolic}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bloodPressure: {
                        ...formData.bloodPressure,
                        systolic: e.target.value,
                      },
                    })
                  }
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="self-center text-gray-500">/</span>
                <input
                  type="number"
                  placeholder="الانبساطي"
                  value={formData.bloodPressure.diastolic}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bloodPressure: {
                        ...formData.bloodPressure,
                        diastolic: e.target.value,
                      },
                    })
                  }
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Heart Rate */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                معدل النبض (bpm)
              </label>
              <input
                type="number"
                value={formData.heartRate}
                onChange={(e) =>
                  setFormData({ ...formData, heartRate: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Respiratory Rate */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                معدل التنفس (rpm)
              </label>
              <input
                type="number"
                value={formData.respiratoryRate}
                onChange={(e) =>
                  setFormData({ ...formData, respiratoryRate: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Temperature */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                درجة الحرارة
              </label>
              <div className="flex space-x-2 space-x-reverse">
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature.value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      temperature: {
                        ...formData.temperature,
                        value: e.target.value,
                      },
                    })
                  }
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={formData.temperature.unit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      temperature: {
                        ...formData.temperature,
                        unit: e.target.value,
                      },
                    })
                  }
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="celsius">°C</option>
                  <option value="fahrenheit">°F</option>
                </select>
              </div>
            </div>

            {/* Oxygen Saturation */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                تشبع الأكسجين (%)
              </label>
              <input
                type="number"
                min="70"
                max="100"
                value={formData.oxygenSaturation}
                onChange={(e) =>
                  setFormData({ ...formData, oxygenSaturation: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Height */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                الطول
              </label>
              <div className="flex space-x-2 space-x-reverse">
                <input
                  type="number"
                  value={formData.height.value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      height: {
                        ...formData.height,
                        value: e.target.value,
                      },
                    })
                  }
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={formData.height.unit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      height: {
                        ...formData.height,
                        unit: e.target.value,
                      },
                    })
                  }
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cm">سم</option>
                  <option value="inches">بوصة</option>
                </select>
              </div>
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                الوزن
              </label>
              <div className="flex space-x-2 space-x-reverse">
                <input
                  type="number"
                  value={formData.weight.value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weight: {
                        ...formData.weight,
                        value: e.target.value,
                      },
                    })
                  }
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={formData.weight.unit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weight: {
                        ...formData.weight,
                        unit: e.target.value,
                      },
                    })
                  }
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="kg">كغ</option>
                  <option value="lbs">رطل</option>
                </select>
              </div>
            </div>

            {/* BMI */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                مؤشر كتلة الجسم
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.bmi}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                placeholder="يتم حسابه تلقائياً"
              />
            </div>

            {/* Pain Score */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                درجة الألم (0-10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.painScore}
                onChange={(e) =>
                  setFormData({ ...formData, painScore: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 space-x-reverse">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              حفظ
            </button>
          </div>
        </form>
      ) : (
        /* Display Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Blood Pressure */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-700">ضغط الدم</h4>
              <span className="text-xl">🩸</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formData.bloodPressure.systolic &&
              formData.bloodPressure.diastolic
                ? `${formData.bloodPressure.systolic}/${formData.bloodPressure.diastolic}`
                : "غير محدد"}
            </div>
            <div className={`text-sm ${bpStatus.color}`}>{bpStatus.label}</div>
          </div>

          {/* Heart Rate */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-700">معدل النبض</h4>
              <span className="text-xl">💓</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formData.heartRate || "غير محدد"}
            </div>
            <div className="text-sm text-gray-600">
              {formData.heartRate && "نبضة/دقيقة"}
            </div>
          </div>

          {/* Temperature */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-700">درجة الحرارة</h4>
              <span className="text-xl">🌡️</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formData.temperature.value
                ? `${formData.temperature.value}°${
                    formData.temperature.unit === "celsius" ? "C" : "F"
                  }`
                : "غير محدد"}
            </div>
            <div className={`text-sm ${tempStatus.color}`}>
              {tempStatus.label}
            </div>
          </div>

          {/* Oxygen Saturation */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-700">تشبع الأكسجين</h4>
              <span className="text-xl">🫁</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formData.oxygenSaturation || "غير محدد"}
            </div>
            <div className="text-sm text-gray-600">
              {formData.oxygenSaturation && "%"}
            </div>
          </div>

          {/* Height & Weight */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-700">الطول والوزن</h4>
              <span className="text-xl">📏</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {formData.height.value
                ? `${formData.height.value} ${formData.height.unit}`
                : "غير محدد"}
            </div>
            <div className="text-lg font-bold text-gray-900">
              {formData.weight.value
                ? `${formData.weight.value} ${formData.weight.unit}`
                : "غير محدد"}
            </div>
          </div>

          {/* BMI */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-700">مؤشر كتلة الجسم</h4>
              <span className="text-xl">⚖️</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formData.bmi || "غير محدد"}
            </div>
            <div className={`text-sm ${bmiStatus.color}`}>
              {bmiStatus.label}
            </div>
          </div>

          {/* Pain Score */}
          {formData.painScore && (
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-700">درجة الألم</h4>
                <span className="text-xl">😖</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formData.painScore}/10
              </div>
              <div className={`text-sm ${painLevel.color}`}>
                {painLevel.label}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VitalSignsManager;
