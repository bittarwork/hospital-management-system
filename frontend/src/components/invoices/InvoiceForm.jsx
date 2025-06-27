import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Calculator,
  User,
  Calendar,
  FileText,
  DollarSign,
  Percent,
  X,
} from "lucide-react";
import {
  patientsAPI,
  doctorsAPI,
  showSuccessMessage,
  handleApiError,
} from "../../services/api";
import toast from "react-hot-toast";

const InvoiceForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  mode = "create", // create, edit, view
}) => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patient: "",
    doctor: "",
    appointment: "",
    invoiceNumber: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    invoiceType: "consultation",
    lineItems: [],
    discountType: "none",
    discountValue: 0,
    taxRate: 15,
    notes: "",
  });

  const [totals, setTotals] = useState({
    subtotal: 0,
    discountAmount: 0,
    taxAmount: 0,
    totalAmount: 0,
  });

  const invoiceTypes = [
    { value: "consultation", label: "استشارة طبية" },
    { value: "procedure", label: "إجراء طبي" },
    { value: "surgery", label: "عملية جراحية" },
    { value: "laboratory", label: "فحوصات مختبرية" },
    { value: "radiology", label: "فحوصات الأشعة" },
    { value: "pharmacy", label: "أدوية" },
    { value: "hospitalization", label: "إقامة في المستشفى" },
    { value: "emergency", label: "طوارئ" },
  ];

  const lineItemTypes = [
    { value: "consultation", label: "استشارة" },
    { value: "medical_procedure", label: "إجراء طبي" },
    { value: "diagnostic_test", label: "فحص تشخيصي" },
    { value: "laboratory_test", label: "فحص مختبري" },
    { value: "radiology", label: "أشعة" },
    { value: "surgery", label: "جراحة" },
    { value: "medication", label: "دواء" },
    { value: "medical_supplies", label: "مستلزمات طبية" },
    { value: "room_charges", label: "رسوم الغرفة" },
    { value: "equipment_usage", label: "استخدام الأجهزة" },
    { value: "professional_fee", label: "أتعاب مهنية" },
    { value: "facility_fee", label: "رسوم المرفق" },
    { value: "other", label: "أخرى" },
  ];

  useEffect(() => {
    if (isOpen) {
      loadPatients();
      loadDoctors();

      if (initialData && mode !== "create") {
        setFormData({
          patient: initialData.patient?._id || "",
          doctor: initialData.doctor?._id || "",
          appointment: initialData.appointment?._id || "",
          invoiceNumber: initialData.invoiceNumber || "",
          issueDate: initialData.issueDate
            ? initialData.issueDate.split("T")[0]
            : "",
          dueDate: initialData.dueDate ? initialData.dueDate.split("T")[0] : "",
          invoiceType: initialData.invoiceType || "consultation",
          lineItems: initialData.lineItems || [],
          discountType: initialData.discountType || "none",
          discountValue: initialData.discountValue || 0,
          taxRate: initialData.taxRate || 15,
          notes: initialData.notes || "",
        });
      } else {
        // إعداد البيانات الافتراضية للفاتورة الجديدة
        const today = new Date();
        const dueDate = new Date(today);
        dueDate.setDate(dueDate.getDate() + 30);

        setFormData((prev) => ({
          ...prev,
          invoiceNumber: generateInvoiceNumber(),
          dueDate: dueDate.toISOString().split("T")[0],
        }));
      }
    }
  }, [isOpen, initialData, mode]);

  useEffect(() => {
    calculateTotals();
  }, [
    formData.lineItems,
    formData.discountType,
    formData.discountValue,
    formData.taxRate,
  ]);

  const loadPatients = async () => {
    try {
      const response = await patientsAPI.getAll();
      let data = response.data?.data;

      // Ensure we have an array
      if (!Array.isArray(data)) {
        if (data && data.patients && Array.isArray(data.patients)) {
          data = data.patients;
        } else if (data && data.results && Array.isArray(data.results)) {
          data = data.results;
        } else {
          console.warn("Patients data is not an array:", data);
          data = [];
        }
      }

      setPatients(data);
    } catch (error) {
      console.error("Error loading patients:", error);
      setPatients([]);
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await doctorsAPI.getAll();
      let data = response.data?.data;

      // Ensure we have an array
      if (!Array.isArray(data)) {
        if (data && data.doctors && Array.isArray(data.doctors)) {
          data = data.doctors;
        } else if (data && data.results && Array.isArray(data.results)) {
          data = data.results;
        } else {
          console.warn("Doctors data is not an array:", data);
          data = [];
        }
      }

      setDoctors(data);
    } catch (error) {
      console.error("Error loading doctors:", error);
      setDoctors([]);
    }
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `INV-${year}${month}-${random}`;
  };

  const calculateTotals = () => {
    // حساب المجموع الفرعي
    const subtotal = formData.lineItems.reduce((sum, item) => {
      return (
        sum + (item.quantity * item.unitPrice - (item.discountAmount || 0))
      );
    }, 0);

    // حساب الخصم الإجمالي
    let discountAmount = 0;
    if (formData.discountType === "percentage") {
      discountAmount = subtotal * (formData.discountValue / 100);
    } else if (formData.discountType === "fixed_amount") {
      discountAmount = formData.discountValue;
    }

    // حساب الضريبة
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (formData.taxRate / 100);

    // المجموع النهائي
    const totalAmount = taxableAmount + taxAmount;

    setTotals({
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addLineItem = () => {
    const newItem = {
      itemType: "consultation",
      itemName: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      discountAmount: 0,
      totalPrice: 0,
    };

    setFormData((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem],
    }));
  };

  const updateLineItem = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };

          // إعادة حساب السعر الإجمالي للعنصر
          if (
            field === "quantity" ||
            field === "unitPrice" ||
            field === "discountAmount"
          ) {
            const quantity =
              field === "quantity"
                ? parseFloat(value) || 0
                : updatedItem.quantity;
            const unitPrice =
              field === "unitPrice"
                ? parseFloat(value) || 0
                : updatedItem.unitPrice;
            const discountAmount =
              field === "discountAmount"
                ? parseFloat(value) || 0
                : updatedItem.discountAmount;

            updatedItem.totalPrice = quantity * unitPrice - discountAmount;
          }

          return updatedItem;
        }
        return item;
      }),
    }));
  };

  const removeLineItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.lineItems.length === 0) {
      toast.error("يجب إضافة عنصر واحد على الأقل للفاتورة");
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        taxAmount: totals.taxAmount,
        totalAmount: totals.totalAmount,
        remainingBalance: totals.totalAmount,
        amountPaid: 0,
        paymentStatus: "unpaid",
        status: "draft",
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      handleApiError(error, "فشل في حفظ الفاتورة");
    } finally {
      setLoading(false);
    }
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
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              <h2 className="text-xl font-bold">
                {mode === "create"
                  ? "إنشاء فاتورة جديدة"
                  : mode === "edit"
                  ? "تعديل الفاتورة"
                  : "عرض الفاتورة"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <form onSubmit={handleSubmit} className="p-6 space-y-6 h-full">
            {/* معلومات أساسية */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الفاتورة
                </label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  disabled={mode === "view"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تاريخ الإصدار
                </label>
                <input
                  type="date"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  disabled={mode === "view"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تاريخ الاستحقاق
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  disabled={mode === "view"}
                />
              </div>
            </div>

            {/* اختيار المريض والطبيب */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 inline ml-1" />
                  المريض
                </label>
                <select
                  name="patient"
                  value={formData.patient}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  disabled={mode === "view"}
                >
                  <option value="">اختر المريض</option>
                  {Array.isArray(patients) &&
                    patients.map((patient) => (
                      <option key={patient._id} value={patient._id}>
                        {patient.firstName} {patient.lastName} - {patient.phone}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الطبيب
                </label>
                <select
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleInputChange}
                  className="input-field"
                  disabled={mode === "view"}
                >
                  <option value="">اختر الطبيب (اختياري)</option>
                  {Array.isArray(doctors) &&
                    doctors.map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>
                        د. {doctor.firstName} {doctor.lastName} -{" "}
                        {doctor.specialization}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* نوع الفاتورة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نوع الفاتورة
              </label>
              <select
                name="invoiceType"
                value={formData.invoiceType}
                onChange={handleInputChange}
                className="input-field"
                disabled={mode === "view"}
              >
                {invoiceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* عناصر الفاتورة */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  عناصر الفاتورة
                </h3>
                {mode !== "view" && (
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة عنصر
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {formData.lineItems.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          النوع
                        </label>
                        <select
                          value={item.itemType}
                          onChange={(e) =>
                            updateLineItem(index, "itemType", e.target.value)
                          }
                          className="input-field text-sm"
                          disabled={mode === "view"}
                        >
                          {lineItemTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          اسم العنصر
                        </label>
                        <input
                          type="text"
                          value={item.itemName}
                          onChange={(e) =>
                            updateLineItem(index, "itemName", e.target.value)
                          }
                          className="input-field text-sm"
                          placeholder="اسم الخدمة أو المنتج"
                          disabled={mode === "view"}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          الكمية
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateLineItem(index, "quantity", e.target.value)
                          }
                          className="input-field text-sm"
                          min="0.01"
                          step="0.01"
                          disabled={mode === "view"}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          السعر الوحدة (ريال)
                        </label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateLineItem(index, "unitPrice", e.target.value)
                          }
                          className="input-field text-sm"
                          min="0"
                          step="0.01"
                          disabled={mode === "view"}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          خصم (ريال)
                        </label>
                        <input
                          type="number"
                          value={item.discountAmount || 0}
                          onChange={(e) =>
                            updateLineItem(
                              index,
                              "discountAmount",
                              e.target.value
                            )
                          }
                          className="input-field text-sm"
                          min="0"
                          step="0.01"
                          disabled={mode === "view"}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-gray-600">الإجمالي: </span>
                          <span className="font-semibold text-green-600">
                            {item.totalPrice?.toFixed(2)} ريال
                          </span>
                        </div>
                        {mode !== "view" && (
                          <button
                            type="button"
                            onClick={() => removeLineItem(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        وصف إضافي
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(index, "description", e.target.value)
                        }
                        className="input-field text-sm"
                        placeholder="وصف تفصيلي للخدمة..."
                        disabled={mode === "view"}
                      />
                    </div>
                  </div>
                ))}

                {formData.lineItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    لم يتم إضافة أي عناصر بعد
                    {mode !== "view" && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={addLineItem}
                          className="btn-secondary"
                        >
                          إضافة أول عنصر
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* الخصم والضريبة */}
            <div className="bg-blue-50 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                الخصم والضريبة
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نوع الخصم
                  </label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    className="input-field"
                    disabled={mode === "view"}
                  >
                    <option value="none">بدون خصم</option>
                    <option value="percentage">نسبة مئوية</option>
                    <option value="fixed_amount">مبلغ ثابت</option>
                  </select>
                </div>

                {formData.discountType !== "none" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      قيمة الخصم{" "}
                      {formData.discountType === "percentage"
                        ? "(%)"
                        : "(ريال)"}
                    </label>
                    <input
                      type="number"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      className="input-field"
                      min="0"
                      step="0.01"
                      max={
                        formData.discountType === "percentage"
                          ? "100"
                          : undefined
                      }
                      disabled={mode === "view"}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نسبة الضريبة (%)
                  </label>
                  <input
                    type="number"
                    name="taxRate"
                    value={formData.taxRate}
                    onChange={handleInputChange}
                    className="input-field"
                    min="0"
                    max="100"
                    step="0.01"
                    disabled={mode === "view"}
                  />
                </div>
              </div>
            </div>

            {/* ملخص المبالغ */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                ملخص المبالغ
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span className="font-semibold">
                    {totals.subtotal.toFixed(2)} ريال
                  </span>
                </div>

                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>الخصم:</span>
                    <span className="font-semibold">
                      -{totals.discountAmount.toFixed(2)} ريال
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>الضريبة ({formData.taxRate}%):</span>
                  <span className="font-semibold">
                    {totals.taxAmount.toFixed(2)} ريال
                  </span>
                </div>

                <hr className="my-2" />

                <div className="flex justify-between text-lg font-bold text-green-600">
                  <span>الإجمالي النهائي:</span>
                  <span>{totals.totalAmount.toFixed(2)} ريال</span>
                </div>
              </div>
            </div>

            {/* ملاحظات */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ملاحظات
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="input-field"
                placeholder="ملاحظات إضافية..."
                disabled={mode === "view"}
              />
            </div>
          </form>
        </div>

        {/* Footer - أزرار الإجراءات */}
        {mode !== "view" && (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                إلغاء
              </button>

              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                disabled={loading || formData.lineItems.length === 0}
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                )}
                {mode === "create" ? "إنشاء الفاتورة" : "حفظ التغييرات"}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default InvoiceForm;
