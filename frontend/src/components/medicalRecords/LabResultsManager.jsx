import React, { useState } from "react";
import { medicalRecordsAPI } from "../../services/api";
import toast from "react-hot-toast";

const LabResultsManager = ({ recordId, labResults = [], onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [formData, setFormData] = useState({
    testName: "",
    testCode: "",
    orderDate: new Date().toISOString().split("T")[0],
    completionDate: "",
    results: [
      {
        parameter: "",
        value: "",
        unit: "",
        referenceRange: "",
        abnormalFlag: "normal",
      },
    ],
    interpretation: "",
    clinicalSignificance: "",
  });

  const abnormalFlags = [
    { value: "normal", label: "طبيعي", color: "text-green-600 bg-green-50" },
    { value: "high", label: "مرتفع", color: "text-red-600 bg-red-50" },
    { value: "low", label: "منخفض", color: "text-blue-600 bg-blue-50" },
    {
      value: "critical_high",
      label: "مرتفع خطر",
      color: "text-red-800 bg-red-100",
    },
    {
      value: "critical_low",
      label: "منخفض خطر",
      color: "text-red-800 bg-red-100",
    },
    {
      value: "abnormal",
      label: "غير طبيعي",
      color: "text-yellow-600 bg-yellow-50",
    },
  ];

  const resetForm = () => {
    setFormData({
      testName: "",
      testCode: "",
      orderDate: new Date().toISOString().split("T")[0],
      completionDate: "",
      results: [
        {
          parameter: "",
          value: "",
          unit: "",
          referenceRange: "",
          abnormalFlag: "normal",
        },
      ],
      interpretation: "",
      clinicalSignificance: "",
    });
    setEditingTest(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingTest) {
        // Update existing test
        await medicalRecordsAPI.updateLabResult(
          recordId,
          editingTest._id,
          formData
        );
        toast.success("تم تحديث نتيجة المختبر بنجاح");
      } else {
        // Add new test
        await medicalRecordsAPI.addLabResult(recordId, formData);
        toast.success("تم إضافة نتيجة المختبر بنجاح");
      }

      resetForm();
      onUpdate?.();
    } catch (error) {
      console.error("❌ Error managing lab result:", error);
      toast.error("حدث خطأ في إدارة نتيجة المختبر");
    }
  };

  const handleEdit = (test) => {
    setFormData({
      testName: test.testName || "",
      testCode: test.testCode || "",
      orderDate: test.orderDate
        ? new Date(test.orderDate).toISOString().split("T")[0]
        : "",
      completionDate: test.completionDate
        ? new Date(test.completionDate).toISOString().split("T")[0]
        : "",
      results:
        test.results?.length > 0
          ? test.results
          : [
              {
                parameter: "",
                value: "",
                unit: "",
                referenceRange: "",
                abnormalFlag: "normal",
              },
            ],
      interpretation: test.interpretation || "",
      clinicalSignificance: test.clinicalSignificance || "",
    });
    setEditingTest(test);
    setShowForm(true);
  };

  const handleDelete = async (testId) => {
    if (!confirm("هل أنت متأكد من حذف نتيجة المختبر هذه؟")) return;

    try {
      await medicalRecordsAPI.removeLabResult(recordId, testId);
      toast.success("تم حذف نتيجة المختبر بنجاح");
      onUpdate?.();
    } catch (error) {
      console.error("❌ Error removing lab result:", error);
      toast.error("حدث خطأ في حذف نتيجة المختبر");
    }
  };

  const addResultParameter = () => {
    setFormData({
      ...formData,
      results: [
        ...formData.results,
        {
          parameter: "",
          value: "",
          unit: "",
          referenceRange: "",
          abnormalFlag: "normal",
        },
      ],
    });
  };

  const removeResultParameter = (index) => {
    const newResults = formData.results.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      results:
        newResults.length > 0
          ? newResults
          : [
              {
                parameter: "",
                value: "",
                unit: "",
                referenceRange: "",
                abnormalFlag: "normal",
              },
            ],
    });
  };

  const updateResultParameter = (index, field, value) => {
    const newResults = [...formData.results];
    newResults[index] = { ...newResults[index], [field]: value };
    setFormData({ ...formData, results: newResults });
  };

  const getFlagInfo = (flag) => {
    return abnormalFlags.find((f) => f.value === flag) || abnormalFlags[0];
  };

  const getFlagIcon = (flag) => {
    switch (flag) {
      case "normal":
        return "✅";
      case "high":
      case "critical_high":
        return "⬆️";
      case "low":
      case "critical_low":
        return "⬇️";
      case "abnormal":
        return "⚠️";
      default:
        return "❓";
    }
  };

  const getTestStatus = (test) => {
    const hasAbnormal = test.results?.some((r) => r.abnormalFlag !== "normal");
    const hasCritical = test.results?.some((r) =>
      r.abnormalFlag?.includes("critical")
    );

    if (hasCritical)
      return { status: "critical", color: "text-red-800", bg: "bg-red-50" };
    if (hasAbnormal)
      return {
        status: "abnormal",
        color: "text-yellow-700",
        bg: "bg-yellow-50",
      };
    return { status: "normal", color: "text-green-700", bg: "bg-green-50" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          نتائج المختبر ({labResults?.length || 0})
        </h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          إضافة نتيجة مختبر
        </button>
      </div>

      {/* Critical Results Alert */}
      {labResults?.some((test) =>
        test.results?.some((r) => r.abnormalFlag?.includes("critical"))
      ) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-600 text-lg ml-2">🚨</span>
            <div>
              <h4 className="text-red-800 font-semibold">
                تنبيه: يوجد نتائج حرجة
              </h4>
              <p className="text-red-700 text-sm">
                يرجى مراجعة النتائج الحرجة وإعطاء الاهتمام اللازم
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lab Results List */}
      <div className="space-y-4">
        {labResults?.map((test, index) => {
          const testStatus = getTestStatus(test);

          return (
            <div
              key={test._id || index}
              className={`border rounded-lg p-4 ${testStatus.bg}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">
                    {test.testName}
                  </h4>
                  {test.testCode && (
                    <p className="text-sm text-gray-600">
                      كود الفحص: {test.testCode}
                    </p>
                  )}
                  <div className="flex space-x-4 space-x-reverse text-sm text-gray-600 mt-1">
                    <span>
                      تاريخ الطلب:{" "}
                      {new Date(test.orderDate).toLocaleDateString("ar-SA")}
                    </span>
                    {test.completionDate && (
                      <span>
                        تاريخ الإنجاز:{" "}
                        {new Date(test.completionDate).toLocaleDateString(
                          "ar-SA"
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 space-x-reverse">
                  <button
                    onClick={() => handleEdit(test)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(test._id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    حذف
                  </button>
                </div>
              </div>

              {/* Test Results */}
              {test.results?.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-medium text-gray-800 mb-2">النتائج:</h5>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                            المعامل
                          </th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                            القيمة
                          </th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                            الوحدة
                          </th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                            المعدل الطبيعي
                          </th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                            الحالة
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {test.results.map((result, resultIndex) => {
                          const flagInfo = getFlagInfo(result.abnormalFlag);

                          return (
                            <tr key={resultIndex} className="border-t">
                              <td className="px-4 py-2 text-sm">
                                {result.parameter}
                              </td>
                              <td className="px-4 py-2 text-sm font-medium">
                                {result.value}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {result.unit}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {result.referenceRange}
                              </td>
                              <td className="px-4 py-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${flagInfo.color} flex items-center`}
                                >
                                  <span className="ml-1">
                                    {getFlagIcon(result.abnormalFlag)}
                                  </span>
                                  {flagInfo.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Interpretation */}
              {test.interpretation && (
                <div className="mb-3">
                  <h5 className="font-medium text-gray-800 mb-1">التفسير:</h5>
                  <p className="text-sm text-gray-700">{test.interpretation}</p>
                </div>
              )}

              {/* Clinical Significance */}
              {test.clinicalSignificance && (
                <div>
                  <h5 className="font-medium text-gray-800 mb-1">
                    الأهمية السريرية:
                  </h5>
                  <p className="text-sm text-gray-700">
                    {test.clinicalSignificance}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {(!labResults || labResults.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            لا توجد نتائج مختبر مسجلة حالياً
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingTest
                  ? "تعديل نتيجة المختبر"
                  : "إضافة نتيجة مختبر جديدة"}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Test Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم الفحص *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.testName}
                    onChange={(e) =>
                      setFormData({ ...formData, testName: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    كود الفحص
                  </label>
                  <input
                    type="text"
                    value={formData.testCode}
                    onChange={(e) =>
                      setFormData({ ...formData, testCode: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ الطلب *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.orderDate}
                    onChange={(e) =>
                      setFormData({ ...formData, orderDate: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ الإنجاز
                  </label>
                  <input
                    type="date"
                    value={formData.completionDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        completionDate: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Test Results */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    نتائج الفحص
                  </label>
                  <button
                    type="button"
                    onClick={addResultParameter}
                    className="text-purple-600 hover:text-purple-800 text-sm"
                  >
                    إضافة معامل
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.results.map((result, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <input
                          type="text"
                          placeholder="المعامل"
                          value={result.parameter}
                          onChange={(e) =>
                            updateResultParameter(
                              index,
                              "parameter",
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="القيمة"
                          value={result.value}
                          onChange={(e) =>
                            updateResultParameter(
                              index,
                              "value",
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="الوحدة"
                          value={result.unit}
                          onChange={(e) =>
                            updateResultParameter(index, "unit", e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="المعدل الطبيعي"
                          value={result.referenceRange}
                          onChange={(e) =>
                            updateResultParameter(
                              index,
                              "referenceRange",
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                      </div>

                      <div className="flex space-x-2 space-x-reverse">
                        <select
                          value={result.abnormalFlag}
                          onChange={(e) =>
                            updateResultParameter(
                              index,
                              "abnormalFlag",
                              e.target.value
                            )
                          }
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        >
                          {abnormalFlags.map((flag) => (
                            <option key={flag.value} value={flag.value}>
                              {flag.label}
                            </option>
                          ))}
                        </select>

                        {formData.results.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeResultParameter(index)}
                            className="text-red-600 hover:text-red-800 px-2"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    التفسير
                  </label>
                  <textarea
                    rows="4"
                    value={formData.interpretation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        interpretation: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الأهمية السريرية
                  </label>
                  <textarea
                    rows="4"
                    value={formData.clinicalSignificance}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        clinicalSignificance: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
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
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editingTest ? "تحديث" : "إضافة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabResultsManager;
