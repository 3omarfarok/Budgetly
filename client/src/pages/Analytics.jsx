import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../utils/api";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
} from "lucide-react";
import Loader from "../components/Loader";

const Analytics = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/analytics/monthly");
      setAnalytics(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err.message);
      toast.error("فيه مشكلة في تحميل التحليلات");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="بنحمّل التحليلات..." />;

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">
        فيه مشكلة في تحميل التحليلات
      </div>
    );
  }

  const { monthlyExpenses, categoryBreakdown, summary } = analytics;

  // Get category colors
  const getCategoryColor = (category) => {
    const colors = {
      Food: "bg-orange-500",
      Transport: "bg-blue-500",
      Utilities: "bg-yellow-500",
      Housing: "bg-purple-500",
      Entertainment: "bg-pink-500",
      General: "bg-gray-500",
    };
    return colors[category] || "bg-gray-500";
  };

  // Get category name
  const getCategoryName = (category) => {
    const names = {
      Food: "أكل وشرب",
      Transport: "مواصلات",
      Utilities: "فواتير",
      Housing: "سكن",
      Entertainment: "ترفيه",
      General: "عام",
      Other: "حاجات تانية",
    };
    return names[category] || category;
  };

  // Convert monthlyExpenses object to sorted array
  const monthlyData = Object.entries(monthlyExpenses)
    .sort((a, b) => b[0].localeCompare(a[0])) // Sort descending
    .slice(0, 6); // Last 6 months

  return (
    <div className="pb-8 px-4 max-w-6xl mx-auto font-primary">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 pt-4">
        <div className="p-3 bg-ios-primary/10 rounded-2xl">
          <BarChart3 className="text-ios-primary" size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-dark)]">
            التحليلات
          </h1>
          <p className="text-[var(--color-muted)] text-sm">
            تحليل شامل لمصاريفك
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-[var(--color-ios-primary)]/5 to-[var(--color-ios-primary)]/10 p-5 rounded-2xl border border-[var(--color-ios-primary)]/20">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={20} className="text-[var(--color-ios-primary)]" />
            <p className="text-sm text-[var(--color-ios-primary)]">
              إجمالي المصاريف
            </p>
          </div>
          <p className="text-2xl font-bold text-[var(--color-dark)]">
            {summary.totalExpenses.toFixed(2)}
            <span className="text-sm font-normal"> جنيه</span>
          </p>
        </div>

        <div className="bg-gradient-to-br from-[var(--color-success)]/5 to-[var(--color-success)]/10 p-5 rounded-2xl border border-[var(--color-success)]/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={20} className="text-[var(--color-success)]" />
            <p className="text-sm text-[var(--color-success)]">متوسط شهري</p>
          </div>
          <p className="text-2xl font-bold text-[var(--color-dark)]">
            {summary.avgMonthlyExpense}
            <span className="text-sm font-normal"> جنيه</span>
          </p>
        </div>

        <div className="bg-gradient-to-br from-[var(--color-info)]/5 to-[var(--color-info)]/10 p-5 rounded-2xl border border-[var(--color-info)]/20">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={20} className="text-[var(--color-info)]" />
            <p className="text-sm text-[var(--color-info)]">الأشهر المتتبعة</p>
          </div>
          <p className="text-2xl font-bold text-[var(--color-dark)]">
            {summary.monthsTracked}
          </p>
        </div>

        <div className="bg-gradient-to-br from-[var(--color-warning)]/5 to-[var(--color-warning)]/10 p-5 rounded-2xl border border-[var(--color-warning)]/20">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={20} className="text-[var(--color-warning)]" />
            <p className="text-sm text-[var(--color-warning)]">عدد المعاملات</p>
          </div>
          <p className="text-2xl font-bold text-[var(--color-dark)]">
            {summary.totalTransactions}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-[var(--color-bg)] rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-5">
            <PieChart size={20} className="text-ios-primary" />
            <h2 className="text-lg font-bold text-[var(--color-dark)]">
              التوزيع حسب النوع
            </h2>
          </div>

          <div className="space-y-4">
            {Object.entries(categoryBreakdown)
              .sort((a, b) => b[1].amount - a[1].amount)
              .map(([category, data]) => (
                <div key={category}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-[var(--color-secondary)]">
                      {getCategoryName(category)}
                    </span>
                    <span className="text-sm font-bold text-[var(--color-dark)]">
                      {data.amount.toFixed(2)} جنيه ({data.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-[var(--color-muted-bg)] rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${getCategoryColor(
                        category
                      )}`}
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="bg-[var(--color-bg)] rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={20} className="text-ios-primary" />
            <h2 className="text-lg font-bold text-[var(--color-dark)]">
              آخر 6 شهور
            </h2>
          </div>

          <div className="space-y-3">
            {monthlyData.map(([month, data]) => {
              const date = new Date(month + "-01");
              const monthName = date.toLocaleDateString("ar-EG", {
                month: "long",
                year: "numeric",
                calendar: "gregory",
              });

              return (
                <div
                  key={month}
                  className="flex justify-between items-center p-3 bg-[var(--color-surface)] rounded-xl hover:bg-[var(--color-hover)] transition-colors"
                >
                  <div>
                    <p className="font-semibold text-[var(--color-dark)]">
                      {monthName}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {data.count} معاملة
                    </p>
                  </div>
                  <p className="text-lg font-bold text-[var(--color-dark)]">
                    {data.total.toFixed(2)}{" "}
                    <span className="text-sm">جنيه</span>
                  </p>
                </div>
              );
            })}
          </div>

          {monthlyData.length === 0 && (
            <div className="text-center py-10 text-[var(--color-muted)]">
              <BarChart3 size={48} className="mx-auto mb-3 opacity-30" />
              <p>مفيش بيانات لسه</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Categories This Month */}
      {monthlyData.length > 0 && (
        <div className="bg-[var(--color-bg)] rounded-2xl p-6 shadow-sm border border-[var(--color-border)] mt-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingDown size={20} className="text-ios-primary" />
            <h2 className="text-lg font-bold text-[var(--color-dark)]">
              الشهر الحالي - حسب النوع
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(monthlyData[0][1].categories).map(
              ([category, amount]) => (
                <div
                  key={category}
                  className="text-center p-4 bg-[var(--color-surface)] rounded-xl"
                >
                  <p className="text-xs text-[var(--color-muted)] mb-2">
                    {getCategoryName(category)}
                  </p>
                  <p className="text-lg font-bold text-[var(--color-dark)]">
                    {amount.toFixed(0)}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">جنيه</p>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
