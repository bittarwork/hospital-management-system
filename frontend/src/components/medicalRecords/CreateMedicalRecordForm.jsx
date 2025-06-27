import React, { useState, useEffect } from "react";
import { medicalRecordsAPI, patientsAPI, doctorsAPI } from "../../services/api";
import toast from "react-hot-toast";
import {
  FaFileMedical,
  FaSave,
  FaTimes,
  FaSearch,
  FaUser,
  FaUserMd,
  FaCalendarAlt,
  FaHospital,
  FaStethoscope,
  FaNotesMedical,
  FaClipboardList,
} from "react-icons/fa";

const CreateMedicalRecordForm = ({ onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);

  const [formData, setFormData] = useState({
    // Basic Information
    patient: "",
    doctor: "",
    appointment: "",
    visitDate: new Date().toISOString().split("T")[0],
    recordType: "consultation",
    department: "",

    // Clinical Information
    chiefComplaint: "",
    historyOfPresentIllness: "",
    pastMedicalHistory: "",
    familyHistory: "",
    socialHistory: "",
    allergies: [],
    currentMedications: [],

    // Physical Examination
    physicalExamination: {
      generalAppearance: "",
      vitalSigns: {
        temperature: "",
        bloodPressure: "",
        heartRate: "",
        respiratoryRate: "",
        oxygenSaturation: "",
        height: "",
        weight: "",
        bmi: "",
      },
      systemicExamination: {
        cardiovascular: "",
        respiratory: "",
        abdominal: "",
        neurological: "",
        musculoskeletal: "",
        dermatological: "",
        other: "",
      },
    },

    // Assessment and Plan
    assessment: {
      primaryDiagnosis: {
        condition: "",
        icdCode: "",
        description: "",
        severity: "moderate",
        status: "active",
        certainty: "probable",
      },
      secondaryDiagnoses: [],
      differentialDiagnoses: [],
    },

    treatmentPlan: {
      medications: [],
      procedures: [],
      followUpInstructions: "",
      lifestyle: "",
      investigations: [],
    },

    // Record Management
    recordStatus: "draft",
    clinicalNotes: "",
    urgency: "normal",
    confidentialityLevel: "standard",
  });

  const [filteredPatients, setFilteredPatients] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  const recordTypes = [
    { value: "consultation", label: "استشارة" },
    { value: "emergency_visit", label: "زيارة طوارئ" },
    { value: "follow_up", label: "متابعة" },
    { value: "surgery", label: "جراحة" },
    { value: "procedure", label: "إجراء" },
    { value: "diagnostic_test", label: "فحص تشخيصي" },
    { value: "laboratory_result", label: "نتيجة مختبر" },
    { value: "radiology_result", label: "نتيجة أشعة" },
    { value: "prescription", label: "وصفة طبية" },
    { value: "discharge_summary", label: "ملخص خروج" },
  ];

  const departments = [
    "الطب الباطني",
    "الجراحة العامة",
    "طب الأطفال",
    "النساء والولادة",
    "القلب والأوعية الدموية",
    "الجهاز التنفسي",
    "الجهاز الهضمي",
    "الكلى والمسالك البولية",
    "الأعصاب",
    "العظام والمفاصل",
    "الأنف والأذن والحنجرة",
    "العيون",
    "الجلدية",
    "الطب النفسي",
    "الطوارئ",
    "العناية المركزة",
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (patientSearch.length > 1) {
      const filtered = patients.filter(
        (patient) =>
          `${patient.firstName} ${patient.lastName}`
            .toLowerCase()
            .includes(patientSearch.toLowerCase()) ||
          patient.nationalId?.includes(patientSearch) ||
          patient.phoneNumber?.includes(patientSearch)
      );
      setFilteredPatients(filtered);
      setShowPatientDropdown(true);
    } else {
      setFilteredPatients([]);
      setShowPatientDropdown(false);
    }
  }, [patientSearch, patients]);

  useEffect(() => {
    if (doctorSearch.length > 1) {
      const filtered = doctors.filter(
        (doctor) =>
          `${doctor.firstName} ${doctor.lastName}`
            .toLowerCase()
            .includes(doctorSearch.toLowerCase()) ||
          doctor.specialization
            ?.toLowerCase()
            .includes(doctorSearch.toLowerCase()) ||
          doctor.licenseNumber?.includes(doctorSearch)
      );
      setFilteredDoctors(filtered);
      setShowDoctorDropdown(true);
    } else {
      setFilteredDoctors([]);
      setShowDoctorDropdown(false);
    }
  }, [doctorSearch, doctors]);

  const loadInitialData = async () => {
    try {
      const [patientsRes, doctorsRes] = await Promise.all([
        patientsAPI.getAll(),
        doctorsAPI.getAll(),
      ]);

      setPatients(patientsRes.data.data || []);
      setDoctors(doctorsRes.data.data || []);
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("خطأ في تحميل البيانات");
    }
  };

  const handlePatientSelect = (patient) => {
    setFormData({ ...formData, patient: patient._id });
    setPatientSearch(`${patient.firstName} ${patient.lastName}`);
    setShowPatientDropdown(false);
  };

  const handleDoctorSelect = (doctor) => {
    setFormData({ ...formData, doctor: doctor._id });
    setDoctorSearch(`د. ${doctor.firstName} ${doctor.lastName}`);
    setShowDoctorDropdown(false);
  };

  const handleVitalSignChange = (field, value) => {
    setFormData({
      ...formData,
      physicalExamination: {
        ...formData.physicalExamination,
        vitalSigns: {
          ...formData.physicalExamination.vitalSigns,
          [field]: value,
        },
      },
    });

    // Auto-calculate BMI
    if (field === "height" || field === "weight") {
      const height =
        field === "height"
          ? parseFloat(value)
          : parseFloat(formData.physicalExamination.vitalSigns.height);
      const weight =
        field === "weight"
          ? parseFloat(value)
          : parseFloat(formData.physicalExamination.vitalSigns.weight);

      if (height > 0 && weight > 0) {
        const heightInMeters = height / 100;
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        setFormData((prev) => ({
          ...prev,
          physicalExamination: {
            ...prev.physicalExamination,
            vitalSigns: {
              ...prev.physicalExamination.vitalSigns,
              bmi: bmi,
            },
          },
        }));
      }
    }
  };

  const handleSystemicExaminationChange = (system, value) => {
    setFormData({
      ...formData,
      physicalExamination: {
        ...formData.physicalExamination,
        systemicExamination: {
          ...formData.physicalExamination.systemicExamination,
          [system]: value,
        },
      },
    });
  };

  const handlePrimaryDiagnosisChange = (field, value) => {
    setFormData({
      ...formData,
      assessment: {
        ...formData.assessment,
        primaryDiagnosis: {
          ...formData.assessment.primaryDiagnosis,
          [field]: value,
        },
      },
    });
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.patient) errors.push("المريض مطلوب");
    if (!formData.doctor) errors.push("الطبيب مطلوب");
    if (!formData.visitDate) errors.push("تاريخ الزيارة مطلوب");
    if (!formData.chiefComplaint) errors.push("الشكوى الرئيسية مطلوبة");
    if (!formData.recordType) errors.push("نوع السجل مطلوب");

    if (errors.length > 0) {
      toast.error(`يرجى تصحيح الأخطاء التالية:\n${errors.join("\n")}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const response = await medicalRecordsAPI.create(formData);

      toast.success("تم إنشاء السجل الطبي بنجاح");

      if (onSuccess) {
        onSuccess(response.data.data);
      }

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error creating medical record:", error);
      toast.error("حدث خطأ أثناء إنشاء السجل الطبي");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-7xl mx-auto max-h-[95vh] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <FaFileMedical className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              إنشاء سجل طبي جديد
            </h2>
            <p className="text-sm text-gray-600">
              املأ المعلومات الطبية المطلوبة
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes className="w-6 h-6" />
        </button>
      </div>

      {/* Form Content */}
      <div className="overflow-y-auto max-h-[calc(95vh-100px)]">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FaClipboardList className="text-blue-600" />
              المعلومات الأساسية
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Patient Selection */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المريض *
                </label>
                <div className="relative">
                  <FaUser className="absolute right-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="البحث عن مريض..."
                    required
                  />
                </div>
                {showPatientDropdown && filteredPatients.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                    {filteredPatients.map((patient) => (
                      <div
                        key={patient._id}
                        onClick={() => handlePatientSelect(patient)}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {patient.nationalId} • {patient.phoneNumber}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Doctor Selection */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الطبيب المعالج *
                </label>
                <div className="relative">
                  <FaUserMd className="absolute right-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="البحث عن طبيب..."
                    required
                  />
                </div>
                {showDoctorDropdown && filteredDoctors.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                    {filteredDoctors.map((doctor) => (
                      <div
                        key={doctor._id}
                        onClick={() => handleDoctorSelect(doctor)}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">
                          د. {doctor.firstName} {doctor.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {doctor.specialization} • {doctor.licenseNumber}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Visit Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ الزيارة *
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute right-3 top-3 text-gray-400" />
                  <input
                    type="date"
                    value={formData.visitDate}
                    onChange={(e) =>
                      setFormData({ ...formData, visitDate: e.target.value })
                    }
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Record Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع السجل *
                </label>
                <select
                  value={formData.recordType}
                  onChange={(e) =>
                    setFormData({ ...formData, recordType: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {recordTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  القسم
                </label>
                <div className="relative">
                  <FaHospital className="absolute right-3 top-3 text-gray-400" />
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">اختر القسم</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  درجة الأولوية
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) =>
                    setFormData({ ...formData, urgency: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">منخفضة</option>
                  <option value="normal">عادية</option>
                  <option value="high">عالية</option>
                  <option value="urgent">عاجلة</option>
                </select>
              </div>
            </div>
          </div>

          {/* Clinical Information Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FaNotesMedical className="text-green-600" />
              المعلومات السريرية
            </h3>

            <div className="space-y-6">
              {/* Chief Complaint */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الشكوى الرئيسية *
                </label>
                <textarea
                  value={formData.chiefComplaint}
                  onChange={(e) =>
                    setFormData({ ...formData, chiefComplaint: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="وصف الشكوى الرئيسية للمريض..."
                  required
                />
              </div>

              {/* History of Present Illness */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ المرض الحالي
                </label>
                <textarea
                  value={formData.historyOfPresentIllness}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      historyOfPresentIllness: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  placeholder="تفاصيل تطور المرض الحالي..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Past Medical History */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التاريخ المرضي السابق
                  </label>
                  <textarea
                    value={formData.pastMedicalHistory}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pastMedicalHistory: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="الأمراض والعمليات السابقة..."
                  />
                </div>

                {/* Family History */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التاريخ العائلي
                  </label>
                  <textarea
                    value={formData.familyHistory}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        familyHistory: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="الأمراض الوراثية في العائلة..."
                  />
                </div>
              </div>

              {/* Social History */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التاريخ الاجتماعي
                </label>
                <textarea
                  value={formData.socialHistory}
                  onChange={(e) =>
                    setFormData({ ...formData, socialHistory: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="التدخين، الكحول، المهنة، نمط الحياة..."
                />
              </div>
            </div>
          </div>

          {/* Vital Signs Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FaStethoscope className="text-red-600" />
              العلامات الحيوية
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  درجة الحرارة (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.physicalExamination.vitalSigns.temperature}
                  onChange={(e) =>
                    handleVitalSignChange("temperature", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="36.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ضغط الدم (mmHg)
                </label>
                <input
                  type="text"
                  value={formData.physicalExamination.vitalSigns.bloodPressure}
                  onChange={(e) =>
                    handleVitalSignChange("bloodPressure", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="120/80"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نبضات القلب (bpm)
                </label>
                <input
                  type="number"
                  value={formData.physicalExamination.vitalSigns.heartRate}
                  onChange={(e) =>
                    handleVitalSignChange("heartRate", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="72"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  معدل التنفس (rpm)
                </label>
                <input
                  type="number"
                  value={
                    formData.physicalExamination.vitalSigns.respiratoryRate
                  }
                  onChange={(e) =>
                    handleVitalSignChange("respiratoryRate", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="16"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الطول (cm)
                </label>
                <input
                  type="number"
                  value={formData.physicalExamination.vitalSigns.height}
                  onChange={(e) =>
                    handleVitalSignChange("height", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="170"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الوزن (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.physicalExamination.vitalSigns.weight}
                  onChange={(e) =>
                    handleVitalSignChange("weight", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="70"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  مؤشر كتلة الجسم
                </label>
                <input
                  type="text"
                  value={formData.physicalExamination.vitalSigns.bmi}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  placeholder="يُحسب تلقائياً"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تشبع الأكسجين (%)
                </label>
                <input
                  type="number"
                  value={
                    formData.physicalExamination.vitalSigns.oxygenSaturation
                  }
                  onChange={(e) =>
                    handleVitalSignChange("oxygenSaturation", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="98"
                />
              </div>
            </div>
          </div>

          {/* Primary Diagnosis Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FaStethoscope className="text-purple-600" />
              التشخيص الأولي
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التشخيص
                </label>
                <input
                  type="text"
                  value={formData.assessment.primaryDiagnosis.condition}
                  onChange={(e) =>
                    handlePrimaryDiagnosisChange("condition", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="اسم التشخيص"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كود ICD-10
                </label>
                <input
                  type="text"
                  value={formData.assessment.primaryDiagnosis.icdCode}
                  onChange={(e) =>
                    handlePrimaryDiagnosisChange("icdCode", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="مثل: J00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الشدة
                </label>
                <select
                  value={formData.assessment.primaryDiagnosis.severity}
                  onChange={(e) =>
                    handlePrimaryDiagnosisChange("severity", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="mild">خفيف</option>
                  <option value="moderate">متوسط</option>
                  <option value="severe">شديد</option>
                  <option value="critical">حرج</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  درجة اليقين
                </label>
                <select
                  value={formData.assessment.primaryDiagnosis.certainty}
                  onChange={(e) =>
                    handlePrimaryDiagnosisChange("certainty", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="suspected">مشكوك فيه</option>
                  <option value="possible">ممكن</option>
                  <option value="probable">محتمل</option>
                  <option value="confirmed">مؤكد</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف التشخيص
              </label>
              <textarea
                value={formData.assessment.primaryDiagnosis.description}
                onChange={(e) =>
                  handlePrimaryDiagnosisChange("description", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="تفاصيل إضافية حول التشخيص..."
              />
            </div>
          </div>

          {/* Clinical Notes */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              الملاحظات السريرية
            </h3>
            <textarea
              value={formData.clinicalNotes}
              onChange={(e) =>
                setFormData({ ...formData, clinicalNotes: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="4"
              placeholder="ملاحظات إضافية وتوصيات..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 space-x-reverse pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <FaSave className="text-sm" />
              {isLoading ? "جاري الحفظ..." : "حفظ السجل"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMedicalRecordForm;
