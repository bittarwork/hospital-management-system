import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";
import { invoicesAPI, handleApiError } from "../../services/api";

const InvoiceStatistics = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (isOpen) {
      loadStatistics();
    }
  }, [isOpen, dateRange]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response = await invoicesAPI.getStats(dateRange);
      setStats(response.data?.data || {});
    } catch (error) {
      handleApiError(error, "فشل في تحميل الإحصائيات");
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ar-SA");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return CheckCircle;
      case "partially_paid":
        return Clock;
      case "overdue":
        return AlertTriangle;
      default:
        return Receipt;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-100";
      case "partially_paid":
        return "text-yellow-600 bg-yellow-100";
      case "overdue":
        return "text-red-600 bg-red-100";
      default:
        return "text-blue-600 bg-blue-100";
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
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6" />
              <h2 className="text-xl font-bold">إحصائيات الفواتير</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Date Range Selector */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">من:</span>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="bg-white/20 text-white placeholder-white/70 border border-white/30 rounded px-2 py-1 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">إلى:</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="bg-white/20 text-white placeholder-white/70 border border-white/30 rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
              <span className="mr-3 text-gray-600">
                جاري تحميل الإحصائيات...
              </span>
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">
                        إجمالي الفواتير
                      </p>
                      <p className="text-2xl font-bold text-blue-900">
                        {stats.summary?.totalInvoices || 0}
                      </p>
                    </div>
                    <Receipt className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">
                        إجمالي الإيرادات
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        {formatCurrency(stats.summary?.totalRevenue)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-600 text-sm font-medium">
                        المبلغ المدفوع
                      </p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {formatCurrency(stats.summary?.totalPaid)}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-600 text-sm font-medium">
                        المتأخرة
                      </p>
                      <p className="text-2xl font-bold text-red-900">
                        {stats.summary?.overdueCount || 0}
                      </p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  الملخص المالي
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(stats.summary?.totalRevenue)}
                    </div>
                    <div className="text-sm text-gray-600">
                      إجمالي الإيرادات
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(stats.summary?.totalPaid)}
                    </div>
                    <div className="text-sm text-gray-600">المبلغ المحصل</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(stats.summary?.totalOutstanding)}
                    </div>
                    <div className="text-sm text-gray-600">المبلغ المتبقي</div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-lg font-medium text-gray-700">
                      معدل التحصيل:{" "}
                      <span className="font-bold text-purple-600">
                        {stats.summary?.totalRevenue > 0
                          ? Math.round(
                              (stats.summary.totalPaid /
                                stats.summary.totalRevenue) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                لا توجد إحصائيات متاحة
              </h3>
              <p className="text-gray-500">
                لا توجد بيانات كافية لعرض الإحصائيات في الفترة المحددة
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InvoiceStatistics;
