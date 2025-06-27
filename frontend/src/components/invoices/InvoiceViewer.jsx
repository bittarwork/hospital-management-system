import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Printer,
  DollarSign,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  X,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  invoicesAPI,
  showSuccessMessage,
  handleApiError,
} from "../../services/api";

const InvoiceViewer = ({
  isOpen,
  onClose,
  invoice,
  onEdit,
  onDelete,
  onAddPayment,
  onInvoiceUpdated,
}) => {
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ar-SA");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-100";
      case "partially_paid":
        return "text-yellow-600 bg-yellow-100";
      case "overdue":
        return "text-red-600 bg-red-100";
      case "cancelled":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "paid":
        return "مدفوعة";
      case "partially_paid":
        return "مدفوعة جزئياً";
      case "overdue":
        return "متأخرة";
      case "cancelled":
        return "ملغية";
      case "pending":
        return "في الانتظار";
      case "draft":
        return "مسودة";
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return CheckCircle;
      case "partially_paid":
        return Clock;
      case "overdue":
        return AlertCircle;
      case "cancelled":
        return X;
      default:
        return Clock;
    }
  };

  const handleMarkAsPaid = async () => {
    if (window.confirm("هل أنت متأكد من تمييز هذه الفاتورة كمدفوعة؟")) {
      setLoading(true);
      try {
        await invoicesAPI.markAsPaid(invoice._id, {
          paymentMethod: "cash",
          notes: "تم تمييزها كمدفوعة من واجهة المستخدم",
          receivedBy: "النظام",
        });
        showSuccessMessage("تم تمييز الفاتورة كمدفوعة");
        onInvoiceUpdated();
      } catch (error) {
        handleApiError(error, "فشل في تحديث حالة الفاتورة");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVoidInvoice = async () => {
    const reason = window.prompt("ما سبب إلغاء هذه الفاتورة؟");
    if (reason !== null) {
      setLoading(true);
      try {
        await invoicesAPI.voidInvoice(invoice._id, { reason });
        showSuccessMessage("تم إلغاء الفاتورة");
        onInvoiceUpdated();
      } catch (error) {
        handleApiError(error, "فشل في إلغاء الفاتورة");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDuplicate = async () => {
    setLoading(true);
    try {
      await invoicesAPI.duplicate(invoice._id);
      showSuccessMessage("تم إنشاء نسخة من الفاتورة");
      onInvoiceUpdated();
    } catch (error) {
      handleApiError(error, "فشل في نسخ الفاتورة");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    setLoading(true);
    try {
      const response = await invoicesAPI.generatePDF(invoice._id);
      const pdfData = response.data.data.pdfData;

      // هنا يمكن إضافة منطق إنشاء PDF في المتصفح
      // أو إرسال البيانات لخدمة PDF خارجية
      console.log("PDF Data:", pdfData);
      showSuccessMessage("تم إنشاء ملف PDF بنجاح");
    } catch (error) {
      handleApiError(error, "فشل في إنشاء ملف PDF");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !invoice) return null;

  const StatusIcon = getStatusIcon(invoice.paymentStatus);

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
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">
                  فاتورة رقم: {invoice.invoiceNumber}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <StatusIcon className="w-4 h-4" />
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      invoice.paymentStatus
                    )}`}
                  >
                    {getStatusLabel(invoice.paymentStatus)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* أزرار الإجراءات */}
              {invoice.paymentStatus !== "paid" &&
                invoice.paymentStatus !== "cancelled" && (
                  <>
                    <button
                      onClick={onAddPayment}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                    >
                      <DollarSign className="w-4 h-4" />
                      دفع
                    </button>

                    <button
                      onClick={handleMarkAsPaid}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm"
                      disabled={loading}
                    >
                      تمييز كمدفوعة
                    </button>
                  </>
                )}

              <button
                onClick={onEdit}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
              >
                <Edit className="w-4 h-4" />
                تعديل
              </button>

              <button
                onClick={handleGeneratePDF}
                className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                disabled={loading}
              >
                <Download className="w-4 h-4" />
                PDF
              </button>

              <button
                onClick={handlePrint}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
              >
                <Printer className="w-4 h-4" />
                طباعة
              </button>

              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6">
          {/* معلومات المستشفى والمريض */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* معلومات المستشفى */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                مستشفى المشروع الأول الطبي
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>الرياض، المملكة العربية السعودية</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+966-11-1234567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>info@first-medical-project.com</span>
                </div>
              </div>
            </div>

            {/* معلومات المريض */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-5 h-5" />
                معلومات المريض
              </h3>
              {invoice.patient && (
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="font-medium text-gray-900">
                    {invoice.patient.firstName} {invoice.patient.lastName}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{invoice.patient.phone}</span>
                  </div>
                  {invoice.patient.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{invoice.patient.email}</span>
                    </div>
                  )}
                  {invoice.patient.nationalId && (
                    <div>
                      <span className="text-gray-500">الهوية: </span>
                      <span>{invoice.patient.nationalId}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* تفاصيل الفاتورة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm text-gray-600">تاريخ الإصدار</label>
              <div className="font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(invoice.issueDate)}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm text-gray-600">تاريخ الاستحقاق</label>
              <div className="font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(invoice.dueDate)}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm text-gray-600">نوع الفاتورة</label>
              <div className="font-semibold">
                {invoice.invoiceType === "consultation"
                  ? "استشارة طبية"
                  : invoice.invoiceType === "procedure"
                  ? "إجراء طبي"
                  : invoice.invoiceType === "surgery"
                  ? "عملية جراحية"
                  : invoice.invoiceType}
              </div>
            </div>
          </div>

          {/* الطبيب */}
          {invoice.doctor && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                الطبيب المعالج
              </h3>
              <div className="text-gray-700">
                د. {invoice.doctor.firstName} {invoice.doctor.lastName}
                {invoice.doctor.specialization && (
                  <span className="text-gray-500">
                    {" "}
                    - {invoice.doctor.specialization}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* عناصر الفاتورة */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">عناصر الفاتورة</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-right p-3 border-b">الوصف</th>
                    <th className="text-right p-3 border-b">الكمية</th>
                    <th className="text-right p-3 border-b">السعر الوحدة</th>
                    <th className="text-right p-3 border-b">الخصم</th>
                    <th className="text-right p-3 border-b">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems?.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{item.itemName}</div>
                          {item.description && (
                            <div className="text-sm text-gray-500">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">{item.quantity}</td>
                      <td className="p-3">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-3">
                        {item.discountAmount
                          ? formatCurrency(item.discountAmount)
                          : "-"}
                      </td>
                      <td className="p-3 font-semibold">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ملخص المبالغ */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">ملخص المبالغ</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-semibold">
                  {formatCurrency(invoice.subtotal)}
                </span>
              </div>

              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>الخصم:</span>
                  <span className="font-semibold">
                    -{formatCurrency(invoice.discountAmount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>الضريبة ({invoice.taxRate}%):</span>
                <span className="font-semibold">
                  {formatCurrency(invoice.taxAmount)}
                </span>
              </div>

              <hr className="my-2" />

              <div className="flex justify-between text-lg font-bold text-green-600">
                <span>الإجمالي النهائي:</span>
                <span>{formatCurrency(invoice.totalAmount)}</span>
              </div>

              <div className="flex justify-between text-blue-600">
                <span>المبلغ المدفوع:</span>
                <span className="font-semibold">
                  {formatCurrency(invoice.amountPaid || 0)}
                </span>
              </div>

              <div className="flex justify-between text-red-600">
                <span>المبلغ المتبقي:</span>
                <span className="font-semibold">
                  {formatCurrency(
                    invoice.remainingBalance || invoice.totalAmount
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* المدفوعات */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                سجل المدفوعات
              </h3>
              <div className="space-y-2">
                {invoice.payments.map((payment, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">
                        {formatCurrency(payment.amount)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.paymentMethod === "cash"
                          ? "نقداً"
                          : payment.paymentMethod === "credit_card"
                          ? "بطاقة ائتمان"
                          : payment.paymentMethod === "bank_transfer"
                          ? "تحويل بنكي"
                          : payment.paymentMethod}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {formatDate(payment.paymentDate)}
                      </div>
                      {payment.transactionId && (
                        <div className="text-xs text-gray-500">
                          #{payment.transactionId}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ملاحظات */}
          {invoice.notes && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">ملاحظات</h3>
              <div className="bg-gray-50 rounded-lg p-3 text-gray-700">
                {invoice.notes}
              </div>
            </div>
          )}

          {/* إجراءات إضافية */}
          {invoice.paymentStatus !== "cancelled" && (
            <div className="flex items-center gap-2 pt-4 border-t">
              <button
                onClick={handleDuplicate}
                className="btn-secondary flex items-center gap-2"
                disabled={loading}
              >
                <FileText className="w-4 h-4" />
                نسخ الفاتورة
              </button>

              {invoice.paymentStatus !== "paid" && (
                <button
                  onClick={handleVoidInvoice}
                  className="btn-danger flex items-center gap-2"
                  disabled={loading}
                >
                  <X className="w-4 h-4" />
                  إلغاء الفاتورة
                </button>
              )}

              <button
                onClick={onDelete}
                className="btn-danger flex items-center gap-2"
                disabled={loading || invoice.paymentStatus === "paid"}
              >
                <Trash2 className="w-4 h-4" />
                حذف
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InvoiceViewer;
