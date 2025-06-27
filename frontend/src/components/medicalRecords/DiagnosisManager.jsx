import React, { useState, useEffect } from "react";
import { medicalRecordsAPI } from "../../services/api";
import toast from "react-hot-toast";
import {
  FaStethoscope,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSave,
  FaTimes,
  FaSearch,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaBookMedical,
} from "react-icons/fa";

const DiagnosisManager = ({ recordId, diagnosis = {}, onUpdate }) => {
  const [diagnosisData, setDiagnosisData] = useState(diagnosis);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("primary");
  const [searchTerm, setSearchTerm] = useState("");
  const [icdSuggestions, setIcdSuggestions] = useState([]);
  const [formData, setFormData] = useState({
    primaryDiagnosis: {
      condition: "",
      icdCode: "",
      description: "",
      severity: "moderate",
      status: "active",
      certainty: "confirmed",
      onsetDate: "",
      notes: "",
    },
    secondaryDiagnoses: [],
    differentialDiagnoses: [],
    provisionalDiagnoses: [],
  });

  // ICD-10 codes examples (in real app, this would come from a database)
  const commonICD10 = [
    { code: "J00", name: "نزلة برد حادة" },
    { code: "J06.9", name: "التهاب حاد في الجهاز التنفسي العلوي" },
    { code: "K30", name: "عسر هضم وظيفي" },
    { code: "M79.1", name: "ألم عضلي" },
    { code: "R50.9", name: "حمى غير محددة" },
    { code: "R06.2", name: "أزيز" },
    { code: "R51", name: "صداع" },
    { code: "I10", name: "ارتفاع ضغط الدم الأساسي" },
    { code: "E11.9", name: "داء السكري من النوع 2" },
    { code: "M25.50", name: "ألم في المفصل" },
  ];

  useEffect(() => {
    setDiagnosisData(diagnosis);
    if (
      diagnosis.primaryDiagnosis ||
      diagnosis.secondaryDiagnoses?.length > 0
    ) {
      setFormData({
        primaryDiagnosis: diagnosis.primaryDiagnosis || {
          condition: "",
          icdCode: "",
          description: "",
          severity: "moderate",
          status: "active",
          certainty: "confirmed",
          onsetDate: "",
          notes: "",
        },
        secondaryDiagnoses: diagnosis.secondaryDiagnoses || [],
        differentialDiagnoses: diagnosis.differentialDiagnoses || [],
        provisionalDiagnoses: diagnosis.provisionalDiagnoses || [],
      });
    }
  }, [diagnosis]);

  const handleSearchICD = (searchTerm) => {
    if (searchTerm.length > 2) {
      const filtered = commonICD10.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setIcdSuggestions(filtered);
    } else {
      setIcdSuggestions([]);
    }
  };

  const handleSelectICD = (icdItem, diagnosisType = "primary") => {
    if (diagnosisType === "primary") {
      setFormData({
        ...formData,
        primaryDiagnosis: {
          ...formData.primaryDiagnosis,
          condition: icdItem.name,
          icdCode: icdItem.code,
        },
      });
    }
    setIcdSuggestions([]);
    setSearchTerm("");
  };

  const addSecondaryDiagnosis = () => {
    const newDiagnosis = {
      id: Date.now(),
      condition: "",
      icdCode: "",
      severity: "moderate",
      status: "active",
      notes: "",
    };
    setFormData({
      ...formData,
      secondaryDiagnoses: [...formData.secondaryDiagnoses, newDiagnosis],
    });
  };

  const removeSecondaryDiagnosis = (diagnosisId) => {
    setFormData({
      ...formData,
      secondaryDiagnoses: formData.secondaryDiagnoses.filter(
        (d) => d.id !== diagnosisId
      ),
    });
  };

  const updateSecondaryDiagnosis = (diagnosisId, field, value) => {
    setFormData({
      ...formData,
      secondaryDiagnoses: formData.secondaryDiagnoses.map((d) =>
        d.id === diagnosisId ? { ...d, [field]: value } : d
      ),
    });
  };

  const addDifferentialDiagnosis = () => {
    const newDiagnosis = {
      id: Date.now(),
      condition: "",
      icdCode: "",
      probability: "possible",
      notes: "",
      ruledOut: false,
    };
    setFormData({
      ...formData,
      differentialDiagnoses: [...formData.differentialDiagnoses, newDiagnosis],
    });
  };

  const removeDifferentialDiagnosis = (diagnosisId) => {
    setFormData({
      ...formData,
      differentialDiagnoses: formData.differentialDiagnoses.filter(
        (d) => d.id !== diagnosisId
      ),
    });
  };

  const updateDifferentialDiagnosis = (diagnosisId, field, value) => {
    setFormData({
      ...formData,
      differentialDiagnoses: formData.differentialDiagnoses.map((d) =>
        d.id === diagnosisId ? { ...d, [field]: value } : d
      ),
    });
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      if (!formData.primaryDiagnosis.condition) {
        toast.error("يرجى إدخال التشخيص الأساسي");
        return;
      }

      const response = await medicalRecordsAPI.update(recordId, {
        "assessment.primaryDiagnosis": formData.primaryDiagnosis,
        "assessment.secondaryDiagnoses": formData.secondaryDiagnoses,
        "assessment.differentialDiagnoses": formData.differentialDiagnoses,
        "assessment.provisionalDiagnoses": formData.provisionalDiagnoses,
      });

      toast.success("تم حفظ التشخيص بنجاح");
      if (onUpdate) {
        onUpdate();
      }
      setShowForm(false);
    } catch (error) {
      console.error("Error saving diagnosis:", error);
      toast.error("حدث خطأ أثناء حفظ التشخيص");
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "text-red-700 bg-red-100";
      case "severe":
        return "text-red-600 bg-red-100";
      case "moderate":
        return "text-yellow-600 bg-yellow-100";
      case "mild":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "resolved":
        return "text-blue-600 bg-blue-100";
      case "chronic":
        return "text-orange-600 bg-orange-100";
      case "inactive":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getCertaintyColor = (certainty) => {
    switch (certainty) {
      case "confirmed":
        return "text-green-600 bg-green-100";
      case "probable":
        return "text-yellow-600 bg-yellow-100";
      case "possible":
        return "text-orange-600 bg-orange-100";
      case "suspected":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FaStethoscope className="text-green-600" />
          التشخيص الطبي
        </h3>
        <button
          onClick={() => setShowForm(true)}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FaEdit className="text-sm" />
          تحرير التشخيص
        </button>
      </div>

      {/* Current Diagnosis Display */}
      {!showForm && (
        <div className="space-y-4">
          {/* Primary Diagnosis */}
          {diagnosisData.primaryDiagnosis && (
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FaBookMedical className="text-green-600" />
                التشخيص الأساسي
              </h4>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <span className="font-medium text-gray-700">الحالة:</span>
                  <span className="text-gray-900">
                    {diagnosisData.primaryDiagnosis.condition}
                  </span>
                </div>
                {diagnosisData.primaryDiagnosis.icdCode && (
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-700">كود ICD:</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                      {diagnosisData.primaryDiagnosis.icdCode}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(
                      diagnosisData.primaryDiagnosis.severity
                    )}`}
                  >
                    {diagnosisData.primaryDiagnosis.severity === "critical"
                      ? "حرج"
                      : diagnosisData.primaryDiagnosis.severity === "severe"
                      ? "شديد"
                      : diagnosisData.primaryDiagnosis.severity === "moderate"
                      ? "متوسط"
                      : diagnosisData.primaryDiagnosis.severity === "mild"
                      ? "خفيف"
                      : diagnosisData.primaryDiagnosis.severity}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                      diagnosisData.primaryDiagnosis.status
                    )}`}
                  >
                    {diagnosisData.primaryDiagnosis.status === "active"
                      ? "نشط"
                      : diagnosisData.primaryDiagnosis.status === "resolved"
                      ? "تم علاجه"
                      : diagnosisData.primaryDiagnosis.status === "chronic"
                      ? "مزمن"
                      : diagnosisData.primaryDiagnosis.status === "inactive"
                      ? "غير نشط"
                      : diagnosisData.primaryDiagnosis.status}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getCertaintyColor(
                      diagnosisData.primaryDiagnosis.certainty
                    )}`}
                  >
                    {diagnosisData.primaryDiagnosis.certainty === "confirmed"
                      ? "مؤكد"
                      : diagnosisData.primaryDiagnosis.certainty === "probable"
                      ? "محتمل"
                      : diagnosisData.primaryDiagnosis.certainty === "possible"
                      ? "ممكن"
                      : diagnosisData.primaryDiagnosis.certainty === "suspected"
                      ? "مشكوك فيه"
                      : diagnosisData.primaryDiagnosis.certainty}
                  </span>
                </div>
                {diagnosisData.primaryDiagnosis.description && (
                  <div className="mt-3">
                    <span className="font-medium text-gray-700">الوصف:</span>
                    <p className="text-gray-600 mt-1">
                      {diagnosisData.primaryDiagnosis.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Secondary Diagnoses */}
          {diagnosisData.secondaryDiagnoses &&
            diagnosisData.secondaryDiagnoses.length > 0 && (
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  التشخيصات الثانوية
                </h4>
                <div className="space-y-3">
                  {diagnosisData.secondaryDiagnoses.map((diagnosis, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-yellow-400 pl-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-medium text-gray-900">
                            {diagnosis.condition}
                          </span>
                          {diagnosis.icdCode && (
                            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {diagnosis.icdCode}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(
                              diagnosis.severity
                            )}`}
                          >
                            {diagnosis.severity === "severe"
                              ? "شديد"
                              : diagnosis.severity === "moderate"
                              ? "متوسط"
                              : diagnosis.severity === "mild"
                              ? "خفيف"
                              : diagnosis.severity}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                              diagnosis.status
                            )}`}
                          >
                            {diagnosis.status === "active"
                              ? "نشط"
                              : diagnosis.status === "resolved"
                              ? "تم علاجه"
                              : diagnosis.status === "chronic"
                              ? "مزمن"
                              : diagnosis.status}
                          </span>
                        </div>
                      </div>
                      {diagnosis.notes && (
                        <p className="text-gray-600 text-sm mt-2">
                          {diagnosis.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Differential Diagnoses */}
          {diagnosisData.differentialDiagnoses &&
            diagnosisData.differentialDiagnoses.length > 0 && (
              <div className="bg-white border rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  التشخيص التفريقي
                </h4>
                <div className="space-y-3">
                  {diagnosisData.differentialDiagnoses.map(
                    (diagnosis, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-blue-400 pl-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-medium text-gray-900">
                              {diagnosis.condition}
                            </span>
                            {diagnosis.icdCode && (
                              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {diagnosis.icdCode}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${getCertaintyColor(
                                diagnosis.probability
                              )}`}
                            >
                              {diagnosis.probability === "high"
                                ? "عالي الاحتمال"
                                : diagnosis.probability === "moderate"
                                ? "متوسط الاحتمال"
                                : diagnosis.probability === "low"
                                ? "منخفض الاحتمال"
                                : diagnosis.probability}
                            </span>
                            {diagnosis.ruledOut && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                مستبعد
                              </span>
                            )}
                          </div>
                        </div>
                        {diagnosis.notes && (
                          <p className="text-gray-600 text-sm mt-2">
                            {diagnosis.notes}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* No Diagnosis Message */}
          {!diagnosisData.primaryDiagnosis &&
            (!diagnosisData.secondaryDiagnoses ||
              diagnosisData.secondaryDiagnoses.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <FaStethoscope className="mx-auto text-4xl mb-4 text-gray-300" />
                <p>لم يتم تسجيل تشخيص طبي بعد</p>
              </div>
            )}
        </div>
      )}

      {/* Diagnosis Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg border p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-medium text-gray-800">
              تحرير التشخيص الطبي
            </h4>
            <button
              onClick={() => setShowForm(false)}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("primary")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "primary"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                التشخيص الأساسي
              </button>
              <button
                onClick={() => setActiveTab("secondary")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "secondary"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                التشخيصات الثانوية
              </button>
              <button
                onClick={() => setActiveTab("differential")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "differential"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                التشخيص التفريقي
              </button>
            </nav>
          </div>

          {/* Primary Diagnosis Tab */}
          {activeTab === "primary" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الحالة / التشخيص *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.primaryDiagnosis.condition}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          primaryDiagnosis: {
                            ...formData.primaryDiagnosis,
                            condition: e.target.value,
                          },
                        });
                        handleSearchICD(e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="أدخل التشخيص أو ابحث بالكود"
                    />
                    {icdSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto">
                        {icdSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            onClick={() => handleSelectICD(suggestion)}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            <span className="font-medium">
                              {suggestion.code}
                            </span>{" "}
                            - {suggestion.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    كود ICD-10
                  </label>
                  <input
                    type="text"
                    value={formData.primaryDiagnosis.icdCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        primaryDiagnosis: {
                          ...formData.primaryDiagnosis,
                          icdCode: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="مثل: J00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الشدة
                  </label>
                  <select
                    value={formData.primaryDiagnosis.severity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        primaryDiagnosis: {
                          ...formData.primaryDiagnosis,
                          severity: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="mild">خفيف</option>
                    <option value="moderate">متوسط</option>
                    <option value="severe">شديد</option>
                    <option value="critical">حرج</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الحالة
                  </label>
                  <select
                    value={formData.primaryDiagnosis.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        primaryDiagnosis: {
                          ...formData.primaryDiagnosis,
                          status: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="active">نشط</option>
                    <option value="resolved">تم علاجه</option>
                    <option value="chronic">مزمن</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    درجة اليقين
                  </label>
                  <select
                    value={formData.primaryDiagnosis.certainty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        primaryDiagnosis: {
                          ...formData.primaryDiagnosis,
                          certainty: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="confirmed">مؤكد</option>
                    <option value="probable">محتمل</option>
                    <option value="possible">ممكن</option>
                    <option value="suspected">مشكوك فيه</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ البداية
                  </label>
                  <input
                    type="date"
                    value={formData.primaryDiagnosis.onsetDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        primaryDiagnosis: {
                          ...formData.primaryDiagnosis,
                          onsetDate: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  وصف التشخيص
                </label>
                <textarea
                  value={formData.primaryDiagnosis.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      primaryDiagnosis: {
                        ...formData.primaryDiagnosis,
                        description: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  placeholder="تفاصيل إضافية حول التشخيص..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ملاحظات
                </label>
                <textarea
                  value={formData.primaryDiagnosis.notes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      primaryDiagnosis: {
                        ...formData.primaryDiagnosis,
                        notes: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="2"
                  placeholder="ملاحظات إضافية..."
                />
              </div>
            </div>
          )}

          {/* Secondary Diagnoses Tab */}
          {activeTab === "secondary" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h5 className="font-medium text-gray-800">
                  التشخيصات الثانوية
                </h5>
                <button
                  onClick={addSecondaryDiagnosis}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FaPlus className="text-sm" />
                  إضافة تشخيص ثانوي
                </button>
              </div>

              {formData.secondaryDiagnoses.map((diagnosis, index) => (
                <div
                  key={diagnosis.id}
                  className="border rounded-lg p-4 bg-white"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h6 className="font-medium text-gray-800">
                      تشخيص ثانوي #{index + 1}
                    </h6>
                    <button
                      onClick={() => removeSecondaryDiagnosis(diagnosis.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الحالة
                      </label>
                      <input
                        type="text"
                        value={diagnosis.condition}
                        onChange={(e) =>
                          updateSecondaryDiagnosis(
                            diagnosis.id,
                            "condition",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="اسم التشخيص"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        كود ICD-10
                      </label>
                      <input
                        type="text"
                        value={diagnosis.icdCode}
                        onChange={(e) =>
                          updateSecondaryDiagnosis(
                            diagnosis.id,
                            "icdCode",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="مثل: J00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الشدة
                      </label>
                      <select
                        value={diagnosis.severity}
                        onChange={(e) =>
                          updateSecondaryDiagnosis(
                            diagnosis.id,
                            "severity",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="mild">خفيف</option>
                        <option value="moderate">متوسط</option>
                        <option value="severe">شديد</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الحالة
                      </label>
                      <select
                        value={diagnosis.status}
                        onChange={(e) =>
                          updateSecondaryDiagnosis(
                            diagnosis.id,
                            "status",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">نشط</option>
                        <option value="resolved">تم علاجه</option>
                        <option value="chronic">مزمن</option>
                        <option value="inactive">غير نشط</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ملاحظات
                    </label>
                    <textarea
                      value={diagnosis.notes}
                      onChange={(e) =>
                        updateSecondaryDiagnosis(
                          diagnosis.id,
                          "notes",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="2"
                      placeholder="ملاحظات إضافية..."
                    />
                  </div>
                </div>
              ))}

              {formData.secondaryDiagnoses.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>لا توجد تشخيصات ثانوية</p>
                </div>
              )}
            </div>
          )}

          {/* Differential Diagnoses Tab */}
          {activeTab === "differential" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h5 className="font-medium text-gray-800">التشخيص التفريقي</h5>
                <button
                  onClick={addDifferentialDiagnosis}
                  className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  <FaPlus className="text-sm" />
                  إضافة تشخيص تفريقي
                </button>
              </div>

              {formData.differentialDiagnoses.map((diagnosis, index) => (
                <div
                  key={diagnosis.id}
                  className="border rounded-lg p-4 bg-white"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h6 className="font-medium text-gray-800">
                      تشخيص تفريقي #{index + 1}
                    </h6>
                    <button
                      onClick={() => removeDifferentialDiagnosis(diagnosis.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الحالة
                      </label>
                      <input
                        type="text"
                        value={diagnosis.condition}
                        onChange={(e) =>
                          updateDifferentialDiagnosis(
                            diagnosis.id,
                            "condition",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="اسم التشخيص المحتمل"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        كود ICD-10
                      </label>
                      <input
                        type="text"
                        value={diagnosis.icdCode}
                        onChange={(e) =>
                          updateDifferentialDiagnosis(
                            diagnosis.id,
                            "icdCode",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="مثل: J00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        احتمالية التشخيص
                      </label>
                      <select
                        value={diagnosis.probability}
                        onChange={(e) =>
                          updateDifferentialDiagnosis(
                            diagnosis.id,
                            "probability",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="high">عالية</option>
                        <option value="moderate">متوسطة</option>
                        <option value="low">منخفضة</option>
                        <option value="possible">ممكنة</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`ruled-out-${diagnosis.id}`}
                        checked={diagnosis.ruledOut}
                        onChange={(e) =>
                          updateDifferentialDiagnosis(
                            diagnosis.id,
                            "ruledOut",
                            e.target.checked
                          )
                        }
                        className="rounded"
                      />
                      <label
                        htmlFor={`ruled-out-${diagnosis.id}`}
                        className="mr-2 text-sm text-gray-700"
                      >
                        تم استبعاد هذا التشخيص
                      </label>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ملاحظات والأسباب
                    </label>
                    <textarea
                      value={diagnosis.notes}
                      onChange={(e) =>
                        updateDifferentialDiagnosis(
                          diagnosis.id,
                          "notes",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows="2"
                      placeholder="أسباب إدراج أو استبعاد هذا التشخيص..."
                    />
                  </div>
                </div>
              ))}

              {formData.differentialDiagnoses.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>لا توجد تشخيصات تفريقية</p>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowForm(false)}
              disabled={isLoading}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaSave className="text-sm" />
              {isLoading ? "جاري الحفظ..." : "حفظ التشخيص"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosisManager;
