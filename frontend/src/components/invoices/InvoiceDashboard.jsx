import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Target,
  Activity,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { invoicesAPI, handleApiError } from "../../services/api";

const InvoiceDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [timeRange, setTimeRange] = useState("month"); // week, month, quarter, year

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await invoicesAPI.getDashboard({ timeRange });
      setDashboardData(response.data?.data || {});
    } catch (error) {
      handleApiError(error, "فشل في تحميل بيانات Dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const getPercentageColor = (value) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getTimeRangeLabel = (range) => {
    switch (range) {
      case "week":
        return "هذا الأسبوع";
      case "month":
        return "هذا الشهر";
      case "quarter":
        return "هذا الربع";
      case "year":
        return "هذا العام";
      default:
        return "هذا الشهر";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
        <span className="mr-3 text-gray-600">جاري تحميل Dashboard...</span>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          لا توجد بيانات متاحة
        </h3>
        <p className="text-gray-500">
          لم يتم العثور على بيانات كافية لعرض Dashboard
        </p>
      </div>
    );
  }

  const {
    overview = {},
    revenue = {},
    recentInvoices = [],
    topPatients = [],
    paymentMethods = [],
    statusDistribution = [],
    trends = {},
  } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Dashboard الفواتير
          </h2>
          <p className="text-gray-600 mt-1">
            نظرة شاملة على أداء النظام المالي
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          {["week", "month", "quarter", "year"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                timeRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {getTimeRangeLabel(range)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">
                إجمالي الإيرادات
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(revenue.total)}
              </p>
              {revenue.growth !== undefined && (
                <div className="flex items-center mt-2">
                  {revenue.growth >= 0 ? (
                    <ArrowUp className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDown className="w-4 h-4 mr-1" />
                  )}
                  <span className="text-sm">
                    {formatPercentage(Math.abs(revenue.growth))} من الفترة
                    السابقة
                  </span>
                </div>
              )}
            </div>
            <DollarSign className="w-8 h-8 text-blue-200" />
          </div>
        </motion.div>

        {/* Total Invoices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                إجمالي الفواتير
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {overview.totalInvoices || 0}
              </p>
              {overview.invoicesGrowth !== undefined && (
                <div
                  className={`flex items-center mt-2 ${getPercentageColor(
                    overview.invoicesGrowth
                  )}`}
                >
                  {overview.invoicesGrowth >= 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  <span className="text-sm">
                    {formatPercentage(Math.abs(overview.invoicesGrowth))}
                  </span>
                </div>
              )}
            </div>
            <Receipt className="w-8 h-8 text-blue-600" />
          </div>
        </motion.div>

        {/* Paid Amount */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">المبلغ المحصل</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(revenue.paid)}
              </p>
              <div className="text-sm text-gray-500 mt-1">
                {revenue.total > 0 && (
                  <>
                    معدل التحصيل:{" "}
                    {formatPercentage((revenue.paid / revenue.total) * 100)}
                  </>
                )}
              </div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </motion.div>

        {/* Outstanding Amount */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                المبلغ المتبقي
              </p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(revenue.outstanding)}
              </p>
              <div className="text-sm text-gray-500 mt-1">
                {overview.overdueCount > 0 && (
                  <>{overview.overdueCount} فاتورة متأخرة</>
                )}
              </div>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </motion.div>
      </div>

      {/* Charts and Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            توزيع حالات الدفع
          </h3>
          <div className="space-y-4">
            {statusDistribution.map((status, index) => {
              const percentage =
                overview.totalInvoices > 0
                  ? (status.count / overview.totalInvoices) * 100
                  : 0;

              const statusConfig = {
                paid: { label: "مدفوعة", color: "bg-green-500" },
                partially_paid: {
                  label: "مدفوعة جزئياً",
                  color: "bg-yellow-500",
                },
                unpaid: { label: "غير مدفوعة", color: "bg-red-500" },
                overdue: { label: "متأخرة", color: "bg-red-600" },
              };

              const config = statusConfig[status._id] || {
                label: status._id,
                color: "bg-gray-500",
              };

              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${config.color}`}
                    ></div>
                    <span className="text-sm text-gray-700">
                      {config.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {status.count}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            طرق الدفع الأكثر استخداماً
          </h3>
          <div className="space-y-4">
            {paymentMethods.map((method, index) => {
              const methodConfig = {
                cash: { label: "نقداً", icon: DollarSign },
                card: { label: "بطاقة", icon: CreditCard },
                transfer: { label: "تحويل", icon: Activity },
                insurance: { label: "تأمين", icon: Target },
              };

              const config = methodConfig[method._id] || {
                label: method._id,
                icon: DollarSign,
              };
              const IconComponent = config.icon;

              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {config.label}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(method.totalAmount)}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            الفواتير الأخيرة
          </h3>
          <div className="space-y-3">
            {recentInvoices.slice(0, 5).map((invoice, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </div>
                  <div className="text-xs text-gray-500">
                    {invoice.patientName || "مريض غير محدد"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(invoice.totalAmount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(invoice.date).toLocaleDateString("ar-SA")}
                  </div>
                </div>
              </div>
            ))}
            {recentInvoices.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                لا توجد فواتير حديثة
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Patients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-lg p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            أهم المرضى
          </h3>
          <div className="space-y-3">
            {topPatients.slice(0, 5).map((patient, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {patient.patientName || "مريض غير محدد"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {patient.invoiceCount} فاتورة
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium text-green-600">
                  {formatCurrency(patient.totalAmount)}
                </div>
              </div>
            ))}
            {topPatients.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                لا توجد بيانات مرضى
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          الإجراءات السريعة
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <Receipt className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">
              فاتورة جديدة
            </span>
          </button>

          <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <FileText className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium text-gray-900">
              تقرير مالي
            </span>
          </button>

          <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <Users className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium text-gray-900">
              إدارة المرضى
            </span>
          </button>

          <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <TrendingUp className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-medium text-gray-900">
              الإحصائيات
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default InvoiceDashboard;
