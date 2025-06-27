import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  BarChart3,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import {
  InvoiceForm,
  InvoiceViewer,
  PaymentModal,
  InvoiceStatistics,
  InvoiceFilters,
  InvoiceExport,
} from "../components/invoices";
import { invoicesAPI, handleApiError } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

const InvoicesNew = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentFilters, setCurrentFilters] = useState({});

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalInvoices: 0,
    limit: 10,
  });

  useEffect(() => {
    loadInvoices();
  }, [searchTerm, currentFilters, pagination.currentPage]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchTerm,
        ...currentFilters,
      };

      const response = await invoicesAPI.getAll(params);
      const data = response.data?.data;

      if (Array.isArray(data)) {
        setInvoices(data);
        setPagination((prev) => ({
          ...prev,
          totalPages: response.data?.pagination?.totalPages || 1,
          totalInvoices: response.data?.pagination?.total || data.length,
        }));
      } else {
        setInvoices([]);
        console.warn(
          "Expected invoices data to be an array, but got:",
          typeof data
        );
      }
    } catch (error) {
      handleApiError(error, "فشل في تحميل الفواتير");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleApplyFilters = (filters) => {
    setCurrentFilters(filters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleClearFilters = () => {
    setCurrentFilters({});
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setShowForm(true);
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowViewer(true);
  };

  const handlePayment = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPayment(true);
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الفاتورة؟")) {
      return;
    }

    try {
      await invoicesAPI.delete(invoiceId);
      await loadInvoices();
      alert("تم حذف الفاتورة بنجاح");
    } catch (error) {
      handleApiError(error, "فشل في حذف الفاتورة");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingInvoice(null);
    loadInvoices();
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setSelectedInvoice(null);
    loadInvoices();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ar-SA");
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: "مسودة", className: "bg-gray-100 text-gray-800" },
      issued: { label: "صادرة", className: "bg-blue-100 text-blue-800" },
      sent: { label: "مرسلة", className: "bg-yellow-100 text-yellow-800" },
      cancelled: { label: "ملغية", className: "bg-red-100 text-red-800" },
      void: { label: "باطلة", className: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusConfig = {
      unpaid: { label: "غير مدفوعة", className: "bg-red-100 text-red-800" },
      partially_paid: {
        label: "مدفوعة جزئياً",
        className: "bg-yellow-100 text-yellow-800",
      },
      paid: { label: "مدفوعة", className: "bg-green-100 text-green-800" },
      overdue: { label: "متأخرة", className: "bg-red-100 text-red-800" },
      refunded: {
        label: "مسترجعة",
        className: "bg-purple-100 text-purple-800",
      },
    };

    const config = statusConfig[paymentStatus] || {
      label: paymentStatus,
      className: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const hasActiveFilters =
    Object.keys(currentFilters).length > 0 || searchTerm.length > 0;

  if (loading && invoices.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الفواتير</h1>
          <p className="text-gray-600 mt-1">
            إجمالي الفواتير: {pagination.totalInvoices}
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في الفواتير..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(true)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                hasActiveFilters
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4" />
              مرشحات
              {hasActiveFilters && (
                <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                  {Object.keys(currentFilters).length + (searchTerm ? 1 : 0)}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowStatistics(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              إحصائيات
            </button>

            <button
              onClick={() => setShowExport(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              تصدير
            </button>

            <button
              onClick={loadInvoices}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              تحديث
            </button>

            <button
              onClick={handleCreateInvoice}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              فاتورة جديدة
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>المرشحات النشطة:</span>
                {searchTerm && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    البحث: "{searchTerm}"
                  </span>
                )}
                {Object.entries(currentFilters).map(([key, value]) => (
                  <span
                    key={key}
                    className="bg-gray-100 text-gray-800 px-2 py-1 rounded"
                  >
                    {key}:{" "}
                    {typeof value === "object" ? JSON.stringify(value) : value}
                  </span>
                ))}
              </div>
              <button
                onClick={handleClearFilters}
                className="text-sm text-red-600 hover:text-red-800"
              >
                مسح جميع المرشحات
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            <span className="mr-3 text-gray-600">جاري التحميل...</span>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">لا توجد فواتير</div>
            <button
              onClick={handleCreateInvoice}
              className="text-blue-600 hover:text-blue-800"
            >
              إنشاء فاتورة جديدة
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رقم الفاتورة
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المريض
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التاريخ
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المبلغ
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      حالة الفاتورة
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      حالة الدفع
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.invoiceNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {invoice.patient &&
                          typeof invoice.patient === "object"
                            ? `${invoice.patient.firstName} ${invoice.patient.lastName}`
                            : invoice.patientName || "مريض غير محدد"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(invoice.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(invoice.totalAmount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          مدفوع: {formatCurrency(invoice.paidAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentStatusBadge(invoice.paymentStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewInvoice(invoice)}
                            className="text-blue-600 hover:text-blue-900"
                            title="عرض"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditInvoice(invoice)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePayment(invoice)}
                            className="text-green-600 hover:text-green-900"
                            title="دفعة"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(invoice._id)}
                            className="text-red-600 hover:text-red-900"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          currentPage: Math.max(1, prev.currentPage - 1),
                        }))
                      }
                      disabled={pagination.currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      السابق
                    </button>
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          currentPage: Math.min(
                            prev.totalPages,
                            prev.currentPage + 1
                          ),
                        }))
                      }
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      التالي
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        عرض{" "}
                        <span className="font-medium">
                          {(pagination.currentPage - 1) * pagination.limit + 1}
                        </span>{" "}
                        إلى{" "}
                        <span className="font-medium">
                          {Math.min(
                            pagination.currentPage * pagination.limit,
                            pagination.totalInvoices
                          )}
                        </span>{" "}
                        من{" "}
                        <span className="font-medium">
                          {pagination.totalInvoices}
                        </span>{" "}
                        نتيجة
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              currentPage: Math.max(1, prev.currentPage - 1),
                            }))
                          }
                          disabled={pagination.currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          السابق
                        </button>
                        {Array.from(
                          { length: Math.min(5, pagination.totalPages) },
                          (_, i) => {
                            const pageNum =
                              i + Math.max(1, pagination.currentPage - 2);
                            if (pageNum > pagination.totalPages) return null;
                            return (
                              <button
                                key={pageNum}
                                onClick={() =>
                                  setPagination((prev) => ({
                                    ...prev,
                                    currentPage: pageNum,
                                  }))
                                }
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  pageNum === pagination.currentPage
                                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}
                        <button
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              currentPage: Math.min(
                                prev.totalPages,
                                prev.currentPage + 1
                              ),
                            }))
                          }
                          disabled={
                            pagination.currentPage === pagination.totalPages
                          }
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          التالي
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <InvoiceForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          invoice={editingInvoice}
          onSuccess={handleFormSuccess}
        />
      )}

      {showViewer && selectedInvoice && (
        <InvoiceViewer
          isOpen={showViewer}
          onClose={() => setShowViewer(false)}
          invoice={selectedInvoice}
          onEdit={() => {
            setShowViewer(false);
            handleEditInvoice(selectedInvoice);
          }}
          onPayment={() => {
            setShowViewer(false);
            handlePayment(selectedInvoice);
          }}
        />
      )}

      {showPayment && selectedInvoice && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          invoice={selectedInvoice}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {showStatistics && (
        <InvoiceStatistics
          isOpen={showStatistics}
          onClose={() => setShowStatistics(false)}
        />
      )}

      {showFilters && (
        <InvoiceFilters
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          onApplyFilters={handleApplyFilters}
          currentFilters={currentFilters}
        />
      )}

      {showExport && (
        <InvoiceExport
          isOpen={showExport}
          onClose={() => setShowExport(false)}
          currentFilters={currentFilters}
        />
      )}
    </div>
  );
};

export default InvoicesNew;
