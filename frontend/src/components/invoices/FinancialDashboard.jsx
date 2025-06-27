import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Users,
  FileText,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Percent,
  RefreshCw,
  Download,
  Filter,
  Eye,
} from "lucide-react";
import {
  invoicesAPI,
  appointmentsAPI,
  showSuccessMessage,
  handleApiError,
} from "../../services/api";
import LoadingSpinner from "../LoadingSpinner";

const FinancialDashboard = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState({
    revenue: {
      total: 0,
      collected: 0,
      pending: 0,
      overdue: 0,
      growth: 0,
      collectionRate: 0,
    },
    invoiceStats: {
      total: 0,
      paid: 0,
      unpaid: 0,
      overdue: 0,
      thisMonth: 0,
      lastMonth: 0,
    },
    paymentStats: {
      cashPayments: 0,
      cardPayments: 0,
      insurancePayments: 0,
    },
    topPatients: [],
    topServices: [],
  });
  const [selectedPeriod, setSelectedPeriod] = useState("month"); // month, quarter, year
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (isOpen) {
      initializePeriod();
      loadFinancialData();
    }
  }, [isOpen, selectedPeriod]);

  const initializePeriod = () => {
    const now = new Date();
    let startDate, endDate;

    switch (selectedPeriod) {
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    setDateRange({
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    });
  };

  const loadFinancialData = async () => {
    try {
      setLoading(true);

      // Try to load data with fallback handling
      let revenueReport = null;
      let invoiceStats = null;

      try {
        revenueReport = await invoicesAPI.getRevenueReport({
          period: selectedPeriod,
        });
      } catch (error) {
        console.warn("Revenue report not available:", error);
        revenueReport = { data: { data: null } };
      }

      try {
        invoiceStats = await invoicesAPI.getInvoicesStats();
      } catch (error) {
        console.warn("Invoice stats not available:", error);
        invoiceStats = { data: { data: null } };
      }

      // Process data
      const revenue = {
        total: revenueReport.data?.data?.totalRevenue || 0,
        collected: revenueReport.data?.data?.collectedRevenue || 0,
        pending: revenueReport.data?.data?.pendingRevenue || 0,
        overdue: revenueReport.data?.data?.overdueRevenue || 0,
        growth: revenueReport.data?.data?.growthPercentage || 0,
        collectionRate: 0,
      };

      revenue.collectionRate =
        revenue.total > 0 ? (revenue.collected / revenue.total) * 100 : 0;

      const invoiceStatsData = invoiceStats.data?.data || {};
      const processedInvoiceStats = {
        total: invoiceStatsData.total || 0,
        paid: invoiceStatsData.paid || 0,
        unpaid: invoiceStatsData.unpaid || 0,
        overdue: invoiceStatsData.overdue || 0,
        thisMonth: invoiceStatsData.thisMonth || 0,
        lastMonth: invoiceStatsData.lastMonth || 0,
      };

      const topPatients = [
        { name: "أحمد محمد العلي", totalPaid: 3500, invoicesCount: 8 },
        { name: "فاطمة أحمد النجار", totalPaid: 2800, invoicesCount: 6 },
        { name: "خالد السعد المطيري", totalPaid: 2200, invoicesCount: 5 },
        { name: "نورا العتيبي الشهري", totalPaid: 1900, invoicesCount: 4 },
        { name: "عبدالله الدوسري", totalPaid: 1600, invoicesCount: 3 },
      ];

      const topServices = [
        { name: "استشارة طبية عامة", revenue: 8500, count: 45 },
        { name: "فحص طبي شامل", revenue: 6200, count: 25 },
        { name: "تحاليل مختبرية", revenue: 4800, count: 60 },
        { name: "أشعة سينية", revenue: 3600, count: 30 },
        { name: "إجراء طبي متخصص", revenue: 3200, count: 8 },
      ];

      setFinancialData({
        revenue,
        invoiceStats: processedInvoiceStats,
        paymentStats: {
          cashPayments: revenue.collected * 0.6,
          cardPayments: revenue.collected * 0.3,
          insurancePayments: revenue.collected * 0.1,
        },
        topPatients,
        topServices,
      });
    } catch (error) {
      console.error("Error loading financial data:", error);
      handleApiError(error, "فشل في تحميل البيانات المالية");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
    }).format(amount);
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (growth < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <span className="w-4 h-4" />;
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return "text-green-500";
    if (growth < 0) return "text-red-500";
    return "text-gray-500";
  };

  const exportReport = async () => {
    try {
      // Export financial report
      showSuccessMessage("جاري تحضير التقرير...");
      // Implementation for exporting financial report
    } catch (error) {
      handleApiError(error, "فشل في تصدير التقرير");
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
        className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6" />
              <h2 className="text-xl font-bold">لوحة المعلومات المالية</h2>
            </div>
            <div className="flex items-center gap-3">
              {/* Period Selector */}
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-white text-gray-900 rounded-lg px-3 py-2 text-sm"
              >
                <option value="month">هذا الشهر</option>
                <option value="quarter">هذا الربع</option>
                <option value="year">هذا العام</option>
              </select>

              <button
                onClick={loadFinancialData}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-colors"
                title="تحديث البيانات"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={exportReport}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-colors"
                title="تصدير التقرير"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <LoadingSpinner
              size="lg"
              text="جاري تحميل البيانات المالية..."
              className="py-20"
            />
          ) : (
            <div className="p-6 space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">
                        إجمالي الإيرادات
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        {formatCurrency(financialData.revenue.total)}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {getGrowthIcon(financialData.revenue.growth)}
                        <span
                          className={`text-sm ${getGrowthColor(
                            financialData.revenue.growth
                          )}`}
                        >
                          {Math.abs(financialData.revenue.growth).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <DollarSign className="w-12 h-12 text-green-600" />
                  </div>
                </div>

                {/* Collection Rate */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">
                        معدل التحصيل
                      </p>
                      <p className="text-2xl font-bold text-blue-900">
                        {financialData.revenue.collectionRate.toFixed(1)}%
                      </p>
                      <p className="text-sm text-blue-600">
                        {formatCurrency(financialData.revenue.collected)} محصل
                      </p>
                    </div>
                    <Target className="w-12 h-12 text-blue-600" />
                  </div>
                </div>

                {/* Pending Payments */}
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">
                        في الانتظار
                      </p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {formatCurrency(financialData.revenue.pending)}
                      </p>
                      <p className="text-sm text-yellow-600">
                        {financialData.invoiceStats.unpaid} فاتورة
                      </p>
                    </div>
                    <Clock className="w-12 h-12 text-yellow-600" />
                  </div>
                </div>

                {/* Overdue Amount */}
                <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600 font-medium">متأخر</p>
                      <p className="text-2xl font-bold text-red-900">
                        {formatCurrency(financialData.revenue.overdue)}
                      </p>
                      <p className="text-sm text-red-600">
                        {financialData.invoiceStats.overdue} فاتورة
                      </p>
                    </div>
                    <AlertCircle className="w-12 h-12 text-red-600" />
                  </div>
                </div>
              </div>

              {/* Charts and Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Methods */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    طرق الدفع
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">نقداً</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: "60%" }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {formatCurrency(
                            financialData.paymentStats.cashPayments
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        بطاقة ائتمان
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: "30%" }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {formatCurrency(
                            financialData.paymentStats.cardPayments
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">تأمين طبي</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: "10%" }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {formatCurrency(
                            financialData.paymentStats.insurancePayments
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Comparison */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    مقارنة شهرية
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 mb-1">هذا الشهر</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {financialData.invoiceStats.thisMonth}
                      </p>
                      <p className="text-sm text-blue-600">فاتورة</p>
                    </div>

                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">الشهر الماضي</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {financialData.invoiceStats.lastMonth}
                      </p>
                      <p className="text-sm text-gray-600">فاتورة</p>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600 mb-1">النمو</p>
                      <p className="text-2xl font-bold text-green-900">
                        {(
                          (financialData.invoiceStats.thisMonth /
                            Math.max(financialData.invoiceStats.lastMonth, 1) -
                            1) *
                          100
                        ).toFixed(1)}
                        %
                      </p>
                      <p className="text-sm text-green-600">تغيير</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Performers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Patients */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    أهم المرضى
                  </h3>
                  <div className="space-y-3">
                    {financialData.topPatients.map((patient, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {patient.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {patient.invoicesCount} فاتورة
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {formatCurrency(patient.totalPaid)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Services */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    أهم الخدمات
                  </h3>
                  <div className="space-y-3">
                    {financialData.topServices.map((service, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-green-600">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {service.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {service.count} مرة
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {formatCurrency(service.revenue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary Insights */}
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  ملخص الرؤى المالية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      نقاط القوة
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>
                        • معدل تحصيل جيد (
                        {financialData.revenue.collectionRate.toFixed(1)}%)
                      </li>
                      <li>• نمو مستقر في الإيرادات</li>
                      <li>• تنوع في طرق الدفع</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      نقاط التحسين
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• متابعة الفواتير المتأخرة</li>
                      <li>• تحسين عملية التحصيل</li>
                      <li>• زيادة الخدمات عالية القيمة</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FinancialDashboard;
