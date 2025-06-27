import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Calendar,
  User,
  Stethoscope,
  Plus,
  X,
  DollarSign,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  invoicesAPI,
  appointmentsAPI,
  showSuccessMessage,
  handleApiError,
} from "../../services/api";
import toast from "react-hot-toast";

const CreateInvoiceFromAppointment = ({
  isOpen,
  onClose,
  appointment: initialAppointment,
  onInvoiceCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [availableAppointments, setAvailableAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    dueDate: "",
    lineItems: [],
    discountType: "none",
    discountValue: 0,
    taxRate: 15,
    notes: "",
  });

  // خدمات طبية محددة مسبقاً حسب نوع الموعد
  const medicalServices = {
    consultation: [
      {
        itemType: "consultation",
        itemName: "استشارة طبية عامة",
        description: "استشارة طبية شاملة مع الفحص السريري",
        unitPrice: 200,
        quantity: 1,
      },
    ],
    "follow-up": [
      {
        itemType: "consultation",
        itemName: "زيارة متابعة",
        description: "زيارة متابعة للحالة الطبية",
        unitPrice: 150,
        quantity: 1,
      },
    ],
    "routine-checkup": [
      {
        itemType: "medical_procedure",
        itemName: "فحص طبي دوري",
        description: "فحص طبي شامل دوري",
        unitPrice: 250,
        quantity: 1,
      },
      {
        itemType: "laboratory_test",
        itemName: "تحاليل أساسية",
        description: "تحاليل دم ومختبرية أساسية",
        unitPrice: 120,
        quantity: 1,
      },
    ],
    emergency: [
      {
        itemType: "consultation",
        itemName: "كشف طوارئ",
        description: "كشف طوارئ عاجل",
        unitPrice: 300,
        quantity: 1,
      },
      {
        itemType: "facility_fee",
        itemName: "رسوم طوارئ",
        description: "رسوم خدمة الطوارئ",
        unitPrice: 100,
        quantity: 1,
      },
    ],
    procedure: [
      {
        itemType: "medical_procedure",
        itemName: "إجراء طبي",
        description: "إجراء طبي متخصص",
        unitPrice: 500,
        quantity: 1,
      },
    ],
    diagnostic: [
      {
        itemType: "diagnostic_test",
        itemName: "فحص تشخيصي",
        description: "فحص تشخيصي شامل",
        unitPrice: 350,
        quantity: 1,
      },
    ],
    screening: [
      {
        itemType: "diagnostic_test",
        itemName: "فحص وقائي",
        description: "فحص وقائي للكشف المبكر",
        unitPrice: 180,
        quantity: 1,
      },
    ],
  };

  useEffect(() => {
    if (isOpen) {
      loadAvailableAppointments();
      if (initialAppointment) {
        setSelectedAppointment(initialAppointment);
        initializeForm(initialAppointment);
      }
    }
  }, [isOpen, initialAppointment]);

  useEffect(() => {
    if (selectedAppointment) {
      initializeForm(selectedAppointment);
    }
  }, [selectedAppointment]);

  const loadAvailableAppointments = async () => {
    try {
      const response = await appointmentsAPI.getByStatus("completed", {
        limit: 50,
      });
      const appointments = response.data?.data || [];

      // Filter appointments that don't have invoices yet
      const appointmentsWithoutInvoices = appointments.filter(
        (apt) => !apt.hasInvoice
      );
      setAvailableAppointments(appointmentsWithoutInvoices);
    } catch (error) {
      console.error("Error loading appointments:", error);
      setAvailableAppointments([]);
    }
  };

  const initializeForm = (appointment) => {
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 30);

    // إنشاء رقم فاتورة
    const invoiceNumber = generateInvoiceNumber();

    // تحديد الخدمات حسب نوع الموعد
    const appointmentType = appointment.appointmentType || "consultation";
    const defaultServices =
      medicalServices[appointmentType] || medicalServices.consultation;

    // إضافة خصم حسب التأمين أو نوع المريض
    let discountType = "none";
    let discountValue = 0;

    // إذا كان المريض لديه تأمين
    if (appointment.patient?.insurance?.provider) {
      discountType = "percentage";
      discountValue = appointment.patient.insurance.coveragePercentage || 80;
    }

    setFormData({
      invoiceNumber,
      dueDate: dueDate.toISOString().split("T")[0],
      lineItems: defaultServices.map((service) => ({
        ...service,
        totalPrice: service.quantity * service.unitPrice,
        discountAmount: 0,
      })),
      discountType,
      discountValue,
      taxRate: 15,
      notes: `فاتورة للموعد ${appointment._id} - ${
        appointment.reasonForVisit || "استشارة طبية"
      }`,
    });
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
    const subtotal = formData.lineItems.reduce(
      (sum, item) =>
        sum + (item.quantity * item.unitPrice - (item.discountAmount || 0)),
      0
    );

    let discountAmount = 0;
    if (formData.discountType === "percentage") {
      discountAmount = subtotal * (formData.discountValue / 100);
    } else if (formData.discountType === "fixed_amount") {
      discountAmount = formData.discountValue;
    }

    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (formData.taxRate / 100);
    const totalAmount = taxableAmount + taxAmount;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  };

  const addService = () => {
    const newService = {
      itemType: "other",
      itemName: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      discountAmount: 0,
      totalPrice: 0,
    };

    setFormData((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, newService],
    }));
  };

  const updateLineItem = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };

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

    if (!selectedAppointment) {
      toast.error("يجب اختيار موعد أولاً");
      return;
    }

    if (formData.lineItems.length === 0) {
      toast.error("يجب إضافة خدمة واحدة على الأقل");
      return;
    }

    setLoading(true);

    try {
      const totals = calculateTotals();

      const invoiceData = {
        patient: selectedAppointment.patient._id,
        doctor: selectedAppointment.doctor._id,
        appointment: selectedAppointment._id,
        invoiceNumber: formData.invoiceNumber,
        issueDate: new Date().toISOString(),
        dueDate: new Date(formData.dueDate).toISOString(),
        servicePeriod: {
          startDate: selectedAppointment.appointmentDate,
          endDate: selectedAppointment.appointmentDate,
        },
        invoiceType: selectedAppointment.appointmentType || "consultation",
        lineItems: formData.lineItems,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        taxRate: formData.taxRate,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        taxAmount: totals.taxAmount,
        totalAmount: totals.totalAmount,
        amountPaid: 0,
        remainingBalance: totals.totalAmount,
        paymentStatus: "unpaid",
        status: "draft",
        notes: formData.notes,
        createdBy: "system", // يمكن تعديلها لتحمل بيانات المستخدم الحالي
      };

      const response = await invoicesAPI.create(invoiceData);

      // تحديث حالة الموعد إلى "invoiced"
      await appointmentsAPI.update(selectedAppointment._id, {
        status: "completed",
        hasInvoice: true,
        invoiceId: response.data._id,
      });

      showSuccessMessage("تم إنشاء الفاتورة بنجاح");
      onInvoiceCreated && onInvoiceCreated(response.data);
      onClose();
    } catch (error) {
      handleApiError(error, "فشل في إنشاء الفاتورة");
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

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
        className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              <h2 className="text-xl font-bold">إنشاء فاتورة من الموعد</h2>
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
          {/* اختيار الموعد */}
          {!selectedAppointment && (
            <div className="p-6 bg-blue-50 border-b">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                اختيار الموعد
              </h3>
              <div className="space-y-3">
                {availableAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      لا توجد مواعيد مكتملة متاحة لإنشاء فواتير
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                    {availableAppointments.map((apt) => (
                      <button
                        key={apt._id}
                        onClick={() => setSelectedAppointment(apt)}
                        className="text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {apt.patient?.firstName} {apt.patient?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              د. {apt.doctor?.firstName} {apt.doctor?.lastName}{" "}
                              - {apt.doctor?.specialization}
                            </p>
                            <p className="text-sm text-blue-600">
                              {new Date(apt.appointmentDate).toLocaleDateString(
                                "ar-SA"
                              )}{" "}
                              - {apt.appointmentTime}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              {apt.appointmentType === "consultation"
                                ? "استشارة"
                                : apt.appointmentType === "follow-up"
                                ? "متابعة"
                                : apt.appointmentType === "emergency"
                                ? "طوارئ"
                                : apt.appointmentType || "غير محدد"}
                            </span>
                          </div>
                        </div>
                        {apt.reasonForVisit && (
                          <p className="text-sm text-gray-400 mt-2">
                            {apt.reasonForVisit}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* معلومات الموعد المحدد */}
          {selectedAppointment && (
            <div className="p-6 bg-gray-50 border-b">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  معلومات الموعد المحدد
                </h3>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  title="تغيير الموعد"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">المريض:</span>
                  <span className="font-medium">
                    {selectedAppointment?.patient?.firstName}{" "}
                    {selectedAppointment?.patient?.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">الطبيب:</span>
                  <span className="font-medium">
                    د. {selectedAppointment?.doctor?.firstName}{" "}
                    {selectedAppointment?.doctor?.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">التاريخ:</span>
                  <span className="font-medium">
                    {new Date(
                      selectedAppointment?.appointmentDate
                    ).toLocaleDateString("ar-SA")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">النوع:</span>
                  <span className="font-medium">
                    {selectedAppointment?.appointmentType === "consultation"
                      ? "استشارة"
                      : selectedAppointment?.appointmentType === "follow-up"
                      ? "متابعة"
                      : selectedAppointment?.appointmentType === "emergency"
                      ? "طوارئ"
                      : selectedAppointment?.appointmentType || "غير محدد"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {selectedAppointment && (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* معلومات الفاتورة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الفاتورة
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        invoiceNumber: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ الاستحقاق
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dueDate: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              {/* الخدمات الطبية */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    الخدمات الطبية
                  </h3>
                  <button
                    type="button"
                    onClick={addService}
                    className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة خدمة
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.lineItems.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            اسم الخدمة
                          </label>
                          <input
                            type="text"
                            value={item.itemName}
                            onChange={(e) =>
                              updateLineItem(index, "itemName", e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm"
                            required
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
                            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm"
                            min="1"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            السعر (ريال)
                          </label>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateLineItem(index, "unitPrice", e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm"
                            min="0"
                            step="0.01"
                            required
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
                            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm"
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            الإجمالي
                          </label>
                          <div className="px-2 py-1 bg-gray-100 rounded text-sm font-medium">
                            {item.totalPrice?.toFixed(2)} ريال
                          </div>
                        </div>

                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeLineItem(index)}
                            className="w-full bg-red-100 text-red-600 px-2 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                          >
                            حذف
                          </button>
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          الوصف
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            updateLineItem(index, "description", e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm"
                          placeholder="وصف الخدمة..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* الخصم والضريبة */}
              <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-gray-900">الخصم والضريبة</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نوع الخصم
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          discountType: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                        value={formData.discountValue}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            discountValue: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نسبة الضريبة (%)
                    </label>
                    <input
                      type="number"
                      value={formData.taxRate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          taxRate: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      min="0"
                      max="100"
                      step="0.01"
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
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="ملاحظات إضافية..."
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer - أزرار الإجراءات */}
        {selectedAppointment && (
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
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                disabled={loading || formData.lineItems.length === 0}
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                )}
                <CheckCircle className="w-4 h-4" />
                إنشاء الفاتورة
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CreateInvoiceFromAppointment;
