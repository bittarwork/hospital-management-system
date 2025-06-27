import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  DollarSign,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  CreditCard,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import {
  invoicesAPI,
  patientsAPI,
  showSuccessMessage,
  handleApiError,
} from "../services/api";
import {
  InvoiceForm,
  PaymentModal,
  InvoiceViewer,
  InvoiceStatistics,
  InvoiceFilters,
  InvoiceExport,
  CreateInvoiceFromAppointment,
  FinancialDashboard,
  InvoiceStatusManager,
} from "../components/invoices";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentFilters, setCurrentFilters] = useState({});
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // add, edit, view, delete, payment
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [invoicesPerPage] = useState(10);

  // Form state
  const [formData, setFormData] = useState({
    patientId: "",
    invoiceNumber: "",
    issueDate: "",
    dueDate: "",
    items: [],
    totalAmount: 0,
    paidAmount: 0,
    remainingAmount: 0,
    status: "pending",
    paymentMethod: "",
    notes: "",
    discountPercentage: 0,
    taxPercentage: 15,
  });

  // Payment form state
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMethod: "cash",
    paymentDate: "",
    notes: "",
  });

  const invoiceStatuses = [
    { value: "draft", label: "مسودة", color: "gray" },
    { value: "unpaid", label: "غير مدفوعة", color: "red" },
    { value: "pending", label: "في الانتظار", color: "blue" },
    { value: "partially_paid", label: "مدفوعة جزئياً", color: "yellow" },
    { value: "paid", label: "مدفوعة", color: "green" },
    { value: "overdue", label: "متأخرة", color: "red" },
    { value: "cancelled", label: "ملغية", color: "gray" },
  ];

  const paymentMethods = [
    { value: "cash", label: "نقداً" },
    { value: "card", label: "بطاقة ائتمان" },
    { value: "bank_transfer", label: "تحويل بنكي" },
    { value: "insurance", label: "تأمين طبي" },
    { value: "check", label: "شيك" },
  ];

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalInvoices: 0,
    limit: 10,
  });

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showFinancialDashboard, setShowFinancialDashboard] = useState(false);
  const [showCreateFromAppointment, setShowCreateFromAppointment] =
    useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showStatusManager, setShowStatusManager] = useState(false);
  const [selectedInvoiceForStatus, setSelectedInvoiceForStatus] =
    useState(null);

  const [editingInvoice, setEditingInvoice] = useState(null);

  // Load data on component mount
  useEffect(() => {
    loadInvoices();
    loadPatients();
  }, []);

  // Initialize filteredInvoices when invoices are loaded
  useEffect(() => {
    if (
      Array.isArray(invoices) &&
      invoices.length > 0 &&
      filteredInvoices.length === 0 &&
      !searchTerm &&
      !statusFilter
    ) {
      setFilteredInvoices(invoices);
    }
  }, [invoices]);

  // Filter invoices based on search term and status
  useEffect(() => {
    if (!Array.isArray(invoices)) {
      setFilteredInvoices([]);
      return;
    }

    let filtered = invoices;

    if (searchTerm) {
      filtered = invoices.filter((invoice) => {
        // Find patient only if patients is an array
        const patient = Array.isArray(patients)
          ? patients.find(
              (p) => p._id === invoice.patient?._id || invoice.patientId
            )
          : null;

        return (
          invoice.invoiceNumber
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (patient &&
            (patient.firstName
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
              patient.lastName
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              patient.nationalId?.includes(searchTerm)))
        );
      });
    }

    if (statusFilter) {
      filtered = filtered.filter(
        (invoice) => invoice.paymentStatus === statusFilter
      );
    }

    setFilteredInvoices(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, invoices, patients]);

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
      let data = response.data?.data;

      // Handle different response structures
      if (data && typeof data === "object" && !Array.isArray(data)) {
        // If data is an object, try to find the invoices array
        if (data.invoices && Array.isArray(data.invoices)) {
          data = data.invoices;
        } else if (data.results && Array.isArray(data.results)) {
          data = data.results;
        } else {
          console.warn(
            "Expected invoices data to be an array, but got object:",
            data
          );
          data = [];
        }
      }

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

  const loadPatients = async () => {
    try {
      const response = await patientsAPI.getAll();
      let data = response.data?.data;

      // Handle different response structures
      if (data && typeof data === "object" && !Array.isArray(data)) {
        if (data.patients && Array.isArray(data.patients)) {
          data = data.patients;
        } else if (data.results && Array.isArray(data.results)) {
          data = data.results;
        } else {
          console.warn(
            "Expected patients data to be an array, but got object:",
            data
          );
          data = [];
        }
      }

      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading patients:", error);
      setPatients([]);
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: "",
      invoiceNumber: "",
      issueDate: "",
      dueDate: "",
      items: [],
      totalAmount: 0,
      paidAmount: 0,
      remainingAmount: 0,
      status: "pending",
      paymentMethod: "",
      notes: "",
      discountPercentage: 0,
      taxPercentage: 15,
    });
  };

  const resetPaymentForm = () => {
    setPaymentData({
      amount: 0,
      paymentMethod: "cash",
      paymentDate: "",
      notes: "",
    });
  };

  const openModal = (type, invoice = null) => {
    setModalType(type);
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType("add");
    setSelectedInvoice(null);
    resetForm();
    resetPaymentForm();
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
    const subtotal = formData.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const discountAmount = subtotal * (formData.discountPercentage / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (formData.taxPercentage / 100);
    const total = taxableAmount + taxAmount;

    setFormData((prev) => ({
      ...prev,
      totalAmount: total,
      remainingAmount: total - prev.paidAmount,
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.discountPercentage, formData.taxPercentage]);

  const handleInvoiceSubmit = async (formData) => {
    if (modalType === "add") {
      await invoicesAPI.create(formData);
      showSuccessMessage("تم إنشاء الفاتورة بنجاح");
    } else if (modalType === "edit") {
      await invoicesAPI.update(selectedInvoice._id, formData);
      showSuccessMessage("تم تحديث الفاتورة بنجاح");
    }
    loadInvoices();
  };

  const handlePaymentAdded = () => {
    loadInvoices();
  };

  const handleDelete = async () => {
    try {
      await invoicesAPI.delete(selectedInvoice._id);
      showSuccessMessage("تم حذف الفاتورة بنجاح");
      closeModal();
      loadInvoices();
    } catch (error) {
      handleApiError(error, "فشل في حذف الفاتورة");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, unitPrice: 0 }],
    }));
  };

  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]:
                field === "quantity" || field === "unitPrice"
                  ? Number(value)
                  : value,
            }
          : item
      ),
    }));
  };

  const getPatientName = (invoice) => {
    // Try to get patient from invoice.patient first, then by ID
    if (invoice.patient && typeof invoice.patient === "object") {
      const firstName = invoice.patient.firstName || "";
      const lastName = invoice.patient.lastName || "";
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
    }

    // Try different patient ID fields
    const patientId =
      invoice.patient?._id ||
      invoice.patientId ||
      invoice.patient_id ||
      (typeof invoice.patient === "string" ? invoice.patient : null);

    // Ensure patients is an array before using find
    if (Array.isArray(patients) && patientId) {
      const patient = patients.find(
        (p) => p._id === patientId || p.id === patientId
      );
      if (patient) {
        const firstName = patient.firstName || "";
        const lastName = patient.lastName || "";
        if (firstName || lastName) {
          return `${firstName} ${lastName}`.trim();
        }
        // Fallback to patient ID or national ID
        return patient.nationalId || patient._id || patientId;
      }
    }

    // Final fallback
    return patientId || "غير محدد";
  };

  const getStatusColor = (status) => {
    // Map payment statuses to colors
    switch (status) {
      case "paid":
        return "green";
      case "partially_paid":
        return "yellow";
      case "unpaid":
        return "red";
      case "overdue":
        return "red";
      case "cancelled":
        return "gray";
      case "pending":
        return "blue";
      case "draft":
        return "gray";
      default:
        const statusObj = invoiceStatuses.find((s) => s.value === status);
        return statusObj ? statusObj.color : "gray";
    }
  };

  const getStatusLabel = (status) => {
    // Map payment statuses to Arabic labels
    switch (status) {
      case "paid":
        return "مدفوعة";
      case "partially_paid":
        return "مدفوعة جزئياً";
      case "unpaid":
        return "غير مدفوعة";
      case "overdue":
        return "متأخرة";
      case "cancelled":
        return "ملغية";
      case "pending":
        return "في الانتظار";
      case "draft":
        return "مسودة";
      default:
        const statusObj = invoiceStatuses.find((s) => s.value === status);
        return statusObj ? statusObj.label : status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ar-SA");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
    }).format(amount);
  };

  // Pagination
  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices = Array.isArray(filteredInvoices)
    ? filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice)
    : [];
  const totalPages = Array.isArray(filteredInvoices)
    ? Math.ceil(filteredInvoices.length / invoicesPerPage)
    : 0;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

  const handleStatusManager = (invoice) => {
    setSelectedInvoiceForStatus(invoice);
    setShowStatusManager(true);
  };

  const handleStatusUpdated = () => {
    setShowStatusManager(false);
    setSelectedInvoiceForStatus(null);
    loadInvoices();
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Receipt className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الفواتير</h1>
            <p className="text-gray-600">
              إجمالي الفواتير:{" "}
              {Array.isArray(filteredInvoices) ? filteredInvoices.length : 0}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFinancialDashboard(true)}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
            title="لوحة المعلومات المالية"
          >
            <BarChart3 className="w-4 h-4" />
            التقارير المالية
          </button>

          <button
            onClick={() => setShowCreateFromAppointment(true)}
            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
            title="إنشاء فاتورة من موعد"
          >
            <Calendar className="w-4 h-4" />
            من موعد
          </button>

          <button
            onClick={() => openModal("add")}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إنشاء فاتورة جديدة
          </button>
        </div>
      </div>

      {/* Quick Service Prices */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            الأسعار الشائعة
          </h3>
          <button
            onClick={() => setShowStatistics(true)}
            className="text-indigo-600 hover:text-indigo-800 transition-colors text-sm"
          >
            عرض المزيد →
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-white rounded-lg p-3 border border-indigo-100">
            <p className="text-gray-600 mb-1">استشارة عامة</p>
            <p className="font-bold text-indigo-900">200 ريال</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-indigo-100">
            <p className="text-gray-600 mb-1">فحص دم شامل</p>
            <p className="font-bold text-indigo-900">120 ريال</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-indigo-100">
            <p className="text-gray-600 mb-1">أشعة سينية</p>
            <p className="font-bold text-indigo-900">150 ريال</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-indigo-100">
            <p className="text-gray-600 mb-1">كشف طوارئ</p>
            <p className="font-bold text-indigo-900">300 ريال</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">
                إجمالي الفواتير
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {Array.isArray(invoices) ? invoices.length : 0}
              </p>
            </div>
            <Receipt className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">مدفوعة</p>
              <p className="text-2xl font-bold text-green-900">
                {Array.isArray(invoices)
                  ? invoices.filter((inv) => inv.paymentStatus === "paid")
                      .length
                  : 0}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">في الانتظار</p>
              <p className="text-2xl font-bold text-yellow-900">
                {Array.isArray(invoices)
                  ? invoices.filter(
                      (inv) =>
                        inv.paymentStatus === "pending" ||
                        inv.paymentStatus === "unpaid"
                    ).length
                  : 0}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">متأخرة</p>
              <p className="text-2xl font-bold text-red-900">
                {Array.isArray(invoices)
                  ? invoices.filter((inv) => inv.paymentStatus === "overdue")
                      .length
                  : 0}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute right-3 top-3" />
              <input
                type="text"
                placeholder="البحث في الفواتير (رقم الفاتورة، اسم المريض)..."
                className="input-field pr-10"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field w-48"
            >
              <option value="">كل الحالات</option>
              {invoiceStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(true)}
                className={`p-2 rounded-lg transition-colors ${
                  hasActiveFilters
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="مرشحات متقدمة"
              >
                <Filter className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowExport(true)}
                className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                title="تصدير البيانات"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={loadInvoices}
                className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                title="تحديث البيانات"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 border-r pr-4">
              <Filter className="w-4 h-4" />
              النتائج:{" "}
              {Array.isArray(filteredInvoices) ? filteredInvoices.length : 0}
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
              <span className="mr-3">جاري التحميل...</span>
            </div>
          ) : !Array.isArray(currentInvoices) ||
            currentInvoices.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {searchTerm || statusFilter
                  ? "لا توجد نتائج"
                  : "لا توجد فواتير"}
              </h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter
                  ? "جرب البحث بكلمات أخرى"
                  : "ابدأ بإنشاء فاتورة جديدة"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        رقم الفاتورة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المريض
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        تاريخ الإصدار
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المبلغ الإجمالي
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المبلغ المدفوع
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المبلغ المتبقي
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentInvoices.map((invoice) => {
                      const statusColor = getStatusColor(
                        invoice.paymentStatus || invoice.status
                      );

                      return (
                        <motion.tr
                          key={invoice._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {invoice.invoiceNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-green-600" />
                              </div>
                              <div className="mr-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {getPatientName(invoice)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {formatDate(invoice.issueDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(invoice.totalAmount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatCurrency(
                                invoice.amountPaid || invoice.paidAmount || 0
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-red-600">
                              {formatCurrency(
                                invoice.remainingBalance ||
                                  invoice.remainingAmount ||
                                  invoice.totalAmount
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                statusColor === "green"
                                  ? "bg-green-100 text-green-800"
                                  : statusColor === "blue"
                                  ? "bg-blue-100 text-blue-800"
                                  : statusColor === "yellow"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : statusColor === "red"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {getStatusLabel(
                                invoice.paymentStatus || invoice.status
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openModal("view", invoice)}
                                className="text-blue-600 hover:text-blue-900"
                                title="عرض"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openModal("edit", invoice)}
                                className="text-green-600 hover:text-green-900"
                                title="تعديل"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStatusManager(invoice)}
                                className="text-purple-600 hover:text-purple-900"
                                title="إدارة الحالة"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                              {(invoice.remainingBalance ||
                                invoice.remainingAmount) > 0 && (
                                <button
                                  onClick={() => openModal("payment", invoice)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                  title="دفع"
                                >
                                  <CreditCard className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => openModal("delete", invoice)}
                                className="text-red-600 hover:text-red-900"
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-3 bg-gray-50 border-t flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    عرض {indexOfFirstInvoice + 1} إلى{" "}
                    {Math.min(
                      indexOfLastInvoice,
                      Array.isArray(filteredInvoices)
                        ? filteredInvoices.length
                        : 0
                    )}{" "}
                    من{" "}
                    {Array.isArray(filteredInvoices)
                      ? filteredInvoices.length
                      : 0}{" "}
                    فاتورة
                  </div>
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => paginate(page)}
                          className={`px-3 py-1 rounded ${
                            currentPage === page
                              ? "bg-primary text-white"
                              : "bg-white text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <InvoiceForm
        isOpen={showModal && (modalType === "add" || modalType === "edit")}
        onClose={closeModal}
        onSubmit={handleInvoiceSubmit}
        initialData={selectedInvoice}
        mode={modalType}
      />

      <InvoiceViewer
        isOpen={showModal && modalType === "view"}
        onClose={closeModal}
        invoice={selectedInvoice}
        onEdit={() => {
          setModalType("edit");
        }}
        onDelete={() => {
          setModalType("delete");
        }}
        onAddPayment={() => {
          setModalType("payment");
        }}
        onInvoiceUpdated={loadInvoices}
      />

      <PaymentModal
        isOpen={showModal && modalType === "payment"}
        onClose={closeModal}
        invoice={selectedInvoice}
        onPaymentAdded={handlePaymentAdded}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showModal && modalType === "delete" && (
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
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  هل أنت متأكد من حذف هذه الفاتورة؟
                </h4>
                <p className="text-gray-600 mb-6">
                  سيتم حذف الفاتورة رقم {selectedInvoice?.invoiceNumber} نهائياً
                </p>
                <div className="flex justify-center gap-4">
                  <button onClick={handleDelete} className="btn-danger">
                    حذف نهائياً
                  </button>
                  <button onClick={closeModal} className="btn-secondary">
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Financial Dashboard */}
      <FinancialDashboard
        isOpen={showFinancialDashboard}
        onClose={() => setShowFinancialDashboard(false)}
      />

      {/* Create Invoice from Appointment */}
      <CreateInvoiceFromAppointment
        isOpen={showCreateFromAppointment}
        onClose={() => setShowCreateFromAppointment(false)}
        appointment={selectedAppointment}
        onInvoiceCreated={(invoice) => {
          setShowCreateFromAppointment(false);
          setSelectedAppointment(null);
          loadInvoices();
          showSuccessMessage("تم إنشاء الفاتورة من الموعد بنجاح");
        }}
      />

      {/* Invoice Statistics */}
      <InvoiceStatistics
        isOpen={showStatistics}
        onClose={() => setShowStatistics(false)}
        invoices={invoices}
      />

      {/* Invoice Filters */}
      <InvoiceFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        currentFilters={currentFilters}
      />

      {/* Invoice Export */}
      <InvoiceExport
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        invoices={filteredInvoices}
        filters={currentFilters}
      />

      {/* Invoice Status Manager */}
      <InvoiceStatusManager
        isOpen={showStatusManager}
        onClose={() => setShowStatusManager(false)}
        invoice={selectedInvoiceForStatus}
        onStatusUpdated={handleStatusUpdated}
      />
    </motion.div>
  );
};

export default Invoices;
