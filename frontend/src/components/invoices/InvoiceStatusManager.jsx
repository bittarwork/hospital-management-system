import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Edit3,
  FileText,
  CreditCard,
  Ban,
  RotateCcw,
  Send,
  Eye,
  Trash2,
} from "lucide-react";
import {
  invoicesAPI,
  showSuccessMessage,
  handleApiError,
} from "../../services/api";
import toast from "react-hot-toast";

const InvoiceStatusManager = ({
  isOpen,
  onClose,
  invoice,
  onStatusUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const [notes, setNotes] = useState("");

  const invoiceStatuses = [
    {
      value: "draft",
      label: "مسودة",
      icon: Edit3,
      color: "gray",
      description: "الفاتورة قيد الإعداد",
    },
    {
      value: "issued",
      label: "صادرة",
      icon: FileText,
      color: "blue",
      description: "تم إصدار الفاتورة",
    },
    {
      value: "sent",
      label: "مرسلة",
      icon: Send,
      color: "indigo",
      description: "تم إرسال الفاتورة للمريض",
    },
    {
      value: "cancelled",
      label: "ملغية",
      icon: Ban,
      color: "red",
      description: "تم إلغاء الفاتورة",
    },
    {
      value: "void",
      label: "باطلة",
      icon: X,
      color: "red",
      description: "الفاتورة باطلة ولاغية",
    },
  ];

  const paymentStatuses = [
    {
      value: "unpaid",
      label: "غير مدفوعة",
      icon: Clock,
      color: "red",
      description: "لم يتم الدفع بعد",
    },
    {
      value: "partially_paid",
      label: "مدفوعة جزئياً",
      icon: AlertCircle,
      color: "yellow",
      description: "تم دفع جزء من المبلغ",
    },
    {
      value: "paid",
      label: "مدفوعة",
      icon: CheckCircle,
      color: "green",
      description: "تم دفع المبلغ كاملاً",
    },
    {
      value: "overdue",
      label: "متأخرة",
      icon: AlertCircle,
      color: "red",
      description: "تجاوزت تاريخ الاستحقاق",
    },
    {
      value: "refunded",
      label: "مسترجعة",
      icon: RotateCcw,
      color: "purple",
      description: "تم استرداد المبلغ",
    },
  ];

  const handleUpdateStatus = async () => {
    if (!newStatus && !newPaymentStatus) {
      toast.error("يجب اختيار حالة واحدة على الأقل للتحديث");
      return;
    }

    setLoading(true);

    try {
      const updateData = {};

      if (newStatus) {
        updateData.status = newStatus;
      }

      if (newPaymentStatus) {
        updateData.paymentStatus = newPaymentStatus;
      }

      if (notes) {
        updateData.statusUpdateNotes = notes;
      }

      await invoicesAPI.update(invoice._id, updateData);

      showSuccessMessage("تم تحديث حالة الفاتورة بنجاح");
      onStatusUpdated && onStatusUpdated();
      onClose();
    } catch (error) {
      handleApiError(error, "فشل في تحديث حالة الفاتورة");
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status, statusArray) => {
    return statusArray.find((s) => s.value === status) || statusArray[0];
  };

  const getCurrentInvoiceStatus = () => {
    return getStatusInfo(invoice?.status || "draft", invoiceStatuses);
  };

  const getCurrentPaymentStatus = () => {
    return getStatusInfo(invoice?.paymentStatus || "unpaid", paymentStatuses);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
    }).format(amount || 0);
  };

  if (!isOpen || !invoice) return null;

  const currentInvoiceStatus = getCurrentInvoiceStatus();
  const currentPaymentStatus = getCurrentPaymentStatus();
  const CurrentInvoiceIcon = currentInvoiceStatus.icon;
  const CurrentPaymentIcon = currentPaymentStatus.icon;

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
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">إدارة حالة الفاتورة</h2>
                <p className="text-purple-100 text-sm">
                  فاتورة رقم: {invoice.invoiceNumber}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 p-6">
          {/* معلومات الفاتورة الحالية */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              معلومات الفاتورة
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-8 h-8 rounded-full bg-${currentInvoiceStatus.color}-100 flex items-center justify-center`}
                  >
                    <CurrentInvoiceIcon
                      className={`w-4 h-4 text-${currentInvoiceStatus.color}-600`}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      حالة الفاتورة الحالية
                    </p>
                    <p className="font-semibold text-gray-900">
                      {currentInvoiceStatus.label}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {currentInvoiceStatus.description}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-8 h-8 rounded-full bg-${currentPaymentStatus.color}-100 flex items-center justify-center`}
                  >
                    <CurrentPaymentIcon
                      className={`w-4 h-4 text-${currentPaymentStatus.color}-600`}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">حالة الدفع الحالية</p>
                    <p className="font-semibold text-gray-900">
                      {currentPaymentStatus.label}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {currentPaymentStatus.description}
                </p>
              </div>
            </div>

            {/* معلومات مالية */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">المبلغ الإجمالي</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(invoice.totalAmount)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">المبلغ المدفوع</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(invoice.amountPaid || 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">المبلغ المتبقي</p>
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(
                    invoice.remainingBalance || invoice.totalAmount
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* تحديث الحالة */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                تحديث الحالة
              </h3>

              {/* تحديث حالة الفاتورة */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    حالة الفاتورة الجديدة
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {invoiceStatuses.map((status) => {
                      const StatusIcon = status.icon;
                      return (
                        <button
                          key={status.value}
                          type="button"
                          onClick={() =>
                            setNewStatus(
                              status.value === newStatus ? "" : status.value
                            )
                          }
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            newStatus === status.value
                              ? `border-${status.color}-300 bg-${status.color}-50`
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full bg-${status.color}-100 flex items-center justify-center`}
                          >
                            <StatusIcon
                              className={`w-4 h-4 text-${status.color}-600`}
                            />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-900">
                              {status.label}
                            </p>
                            <p className="text-xs text-gray-500">
                              {status.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* تحديث حالة الدفع */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    حالة الدفع الجديدة
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {paymentStatuses.map((status) => {
                      const StatusIcon = status.icon;
                      return (
                        <button
                          key={status.value}
                          type="button"
                          onClick={() =>
                            setNewPaymentStatus(
                              status.value === newPaymentStatus
                                ? ""
                                : status.value
                            )
                          }
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            newPaymentStatus === status.value
                              ? `border-${status.color}-300 bg-${status.color}-50`
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full bg-${status.color}-100 flex items-center justify-center`}
                          >
                            <StatusIcon
                              className={`w-4 h-4 text-${status.color}-600`}
                            />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-900">
                              {status.label}
                            </p>
                            <p className="text-xs text-gray-500">
                              {status.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ملاحظات */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ملاحظات التحديث (اختياري)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="أدخل ملاحظات حول سبب تغيير الحالة..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {(newStatus || newPaymentStatus) && (
                <span className="text-green-600">
                  ✓ ستتم عملية التحديث فوراً
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                إلغاء
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                disabled={loading || (!newStatus && !newPaymentStatus)}
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                )}
                <CheckCircle className="w-4 h-4" />
                تحديث الحالة
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InvoiceStatusManager;
