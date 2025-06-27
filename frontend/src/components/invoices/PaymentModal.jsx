import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Banknote,
  DollarSign,
  Calendar,
  FileText,
  X,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  invoicesAPI,
  showSuccessMessage,
  handleApiError,
} from "../../services/api";
import toast from "react-hot-toast";

const PaymentModal = ({ isOpen, onClose, invoice, onPaymentAdded }) => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMethod: "cash",
    paymentDate: new Date().toISOString().split("T")[0],
    transactionId: "",
    notes: "",
    receivedBy: "",
  });

  const paymentMethods = [
    { value: "cash", label: "نقداً", icon: Banknote },
    { value: "credit_card", label: "بطاقة ائتمان", icon: CreditCard },
    { value: "debit_card", label: "بطاقة مدين", icon: CreditCard },
    { value: "bank_transfer", label: "تحويل بنكي", icon: DollarSign },
    { value: "check", label: "شيك", icon: FileText },
    { value: "insurance", label: "تأمين طبي", icon: CheckCircle },
    { value: "online", label: "دفع إلكتروني", icon: CreditCard },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paymentData.amount || paymentData.amount <= 0) {
      toast.error("يجب إدخال مبلغ صحيح");
      return;
    }

    if (paymentData.amount > invoice.remainingBalance) {
      toast.error("المبلغ المدخل أكبر من المبلغ المتبقي");
      return;
    }

    setLoading(true);

    try {
      await invoicesAPI.addPayment(invoice._id, paymentData);
      showSuccessMessage("تم إضافة الدفعة بنجاح");
      onPaymentAdded();
      onClose();
    } catch (error) {
      handleApiError(error, "فشل في إضافة الدفعة");
    } finally {
      setLoading(false);
    }
  };

  const handleFullPayment = () => {
    setPaymentData((prev) => ({
      ...prev,
      amount: invoice.remainingBalance,
    }));
  };

  const getMethodIcon = (method) => {
    const methodObj = paymentMethods.find((m) => m.value === method);
    return methodObj ? methodObj.icon : DollarSign;
  };

  if (!isOpen || !invoice) return null;

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
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">إضافة دفعة</h2>
                <p className="text-green-100 text-sm">
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
          {/* معلومات الفاتورة */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              ملخص الفاتورة
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">المبلغ الإجمالي:</span>
                  <span className="font-semibold">
                    {invoice.totalAmount?.toFixed(2)} ريال
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">المبلغ المدفوع:</span>
                  <span className="font-semibold text-green-600">
                    {invoice.amountPaid?.toFixed(2)} ريال
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">المبلغ المتبقي:</span>
                  <span className="font-semibold text-red-600">
                    {invoice.remainingBalance?.toFixed(2)} ريال
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">حالة الدفع:</span>
                  <span
                    className={`font-semibold ${
                      invoice.paymentStatus === "paid"
                        ? "text-green-600"
                        : invoice.paymentStatus === "partially_paid"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {invoice.paymentStatus === "paid"
                      ? "مدفوعة"
                      : invoice.paymentStatus === "partially_paid"
                      ? "مدفوعة جزئياً"
                      : "غير مدفوعة"}
                  </span>
                </div>
              </div>
            </div>

            {invoice.remainingBalance > 0 && (
              <div className="mt-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={handleFullPayment}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  دفع المبلغ المتبقي كاملاً (
                  {invoice.remainingBalance?.toFixed(2)} ريال)
                </button>
              </div>
            )}
          </div>

          {/* نموذج الدفع */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* المبلغ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                مبلغ الدفعة (ريال) *
              </label>
              <div className="relative">
                <DollarSign className="w-5 h-5 text-gray-400 absolute right-3 top-3" />
                <input
                  type="number"
                  name="amount"
                  value={paymentData.amount}
                  onChange={handleInputChange}
                  className="input-field pr-10"
                  placeholder="0.00"
                  min="0.01"
                  max={invoice.remainingBalance}
                  step="0.01"
                  required
                />
              </div>
              {paymentData.amount > invoice.remainingBalance && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  المبلغ أكبر من المبلغ المتبقي
                </p>
              )}
            </div>

            {/* طريقة الدفع */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                طريقة الدفع *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <label
                      key={method.value}
                      className={`cursor-pointer border rounded-lg p-3 flex items-center gap-2 transition-colors ${
                        paymentData.paymentMethod === method.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={paymentData.paymentMethod === method.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{method.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* تاريخ الدفع */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تاريخ الدفع *
              </label>
              <div className="relative">
                <Calendar className="w-5 h-5 text-gray-400 absolute right-3 top-3" />
                <input
                  type="date"
                  name="paymentDate"
                  value={paymentData.paymentDate}
                  onChange={handleInputChange}
                  className="input-field pr-10"
                  required
                />
              </div>
            </div>

            {/* رقم المعاملة */}
            {paymentData.paymentMethod !== "cash" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم المعاملة / المرجع
                </label>
                <input
                  type="text"
                  name="transactionId"
                  value={paymentData.transactionId}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="أدخل رقم المعاملة أو المرجع"
                />
              </div>
            )}

            {/* الموظف المستلم */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم الموظف المستلم
              </label>
              <input
                type="text"
                name="receivedBy"
                value={paymentData.receivedBy}
                onChange={handleInputChange}
                className="input-field"
                placeholder="اسم الموظف الذي استلم الدفعة"
              />
            </div>

            {/* ملاحظات */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ملاحظات
              </label>
              <textarea
                name="notes"
                value={paymentData.notes}
                onChange={handleInputChange}
                rows={3}
                className="input-field"
                placeholder="ملاحظات إضافية حول الدفعة..."
              />
            </div>
          </form>
        </div>

        {/* Footer - أزرار الإجراءات */}
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
              disabled={
                loading ||
                !paymentData.amount ||
                paymentData.amount <= 0 ||
                paymentData.amount > invoice.remainingBalance
              }
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              )}
              <DollarSign className="w-4 h-4" />
              تسجيل الدفعة
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaymentModal;
