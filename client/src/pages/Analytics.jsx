import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Calendar, DollarSign } from 'lucide-react';

const Analytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/analytics/monthly/${user._id}`);
      setAnalytics(data);
    } catch (error) {
      console.error('غلط في تحميل التحليلات:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400">
        بنحمّل التحليلات...
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-20 text-ios-error">
        فيه مشكلة في تحميل التحليلات
      </div>
    );
  }

  const { monthlyExpenses, categoryBreakdown, summary } = analytics;

  // Get category colors
  const getCategoryColor = (category) => {
    const colors = {
      'Food': 'bg-orange-500',
      'Transport': 'bg-blue-500',
      'Utilities': 'bg-yellow-500',
      'Housing': 'bg-purple-500',
      'Entertainment': 'bg-pink-500',
      'General': 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  // Get category name
  const getCategoryName = (category) => {
    const names = {
      'Food': 'أكل وشرب',
      'Transport': 'مواصلات',
      'Utilities': 'فواتير',
      'Housing': 'سكن',
      'Entertainment': 'ترفيه',
      'General': 'عام',
      'Other': 'حاجات تانية'
    };
    return names[category] || category;
  };

  // Convert monthlyExpenses object to sorted array
  const monthlyData = Object.entries(monthlyExpenses)
    .sort((a, b) => b[0].localeCompare(a[0])) // Sort descending
    .slice(0, 6); // Last 6 months

  return (
    <div className="pb-8 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 pt-4">
        <div className="p-3 bg-ios-primary/10 rounded-2xl">
          <BarChart3 className="text-ios-primary" size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التحليلات</h1>
          <p className="text-gray-500 text-sm">تحليل شامل لمصاريفك</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={20} className="text-blue-600" />
            <p className="text-sm text-blue-700">إجمالي المصاريف</p>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {summary.totalExpenses.toFixed(2)}
            <span className="text-sm font-normal"> جنيه</span>
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-2xl border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={20} className="text-green-600" />
            <p className="text-sm text-green-700">متوسط شهري</p>
          </div>
          <p className="text-2xl font-bold text-green-900">
            {summary.avgMonthlyExpense}
            <span className="text-sm font-normal"> جنيه</span>
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-2xl border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={20} className="text-purple-600" />
            <p className="text-sm text-purple-700">الأشهر المتتبعة</p>
          </div>
          <p className="text-2xl font-bold text-purple-900">{summary.monthsTracked}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-2xl border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={20} className="text-orange-600" />
            <p className="text-sm text-orange-700">عدد المعاملات</p>
          </div>
          <p className="text-2xl font-bold text-orange-900">{summary.totalTransactions}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <PieChart size={20} className="text-ios-primary" />
            <h2 className="text-lg font-bold text-gray-900">التوزيع حسب النوع</h2>
          </div>
          
          <div className="space-y-4">
            {Object.entries(categoryBreakdown)
              .sort((a, b) => b[1].amount - a[1].amount)
              .map(([category, data]) => (
                <div key={category}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {getCategoryName(category)}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {data.amount.toFixed(2)} جنيه ({data.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${getCategoryColor(category)}`}
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={20} className="text-ios-primary" />
            <h2 className="text-lg font-bold text-gray-900">آخر 6 شهور</h2>
          </div>

          <div className="space-y-3">
            {monthlyData.map(([month, data]) => {
              const date = new Date(month + '-01');
              const monthName = date.toLocaleDateString('ar-EG', { 
                month: 'long', 
                year: 'numeric',
                calendar: 'gregory'
              });

              return (
                <div key={month} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-800">{monthName}</p>
                    <p className="text-xs text-gray-500">{data.count} معاملة</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {data.total.toFixed(2)} <span className="text-sm">جنيه</span>
                  </p>
                </div>
              );
            })}
          </div>

          {monthlyData.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <BarChart3 size={48} className="mx-auto mb-3 opacity-30" />
              <p>مفيش بيانات لسه</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Categories This Month */}
      {monthlyData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingDown size={20} className="text-ios-primary" />
            <h2 className="text-lg font-bold text-gray-900">الشهر الحالي - حسب النوع</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(monthlyData[0][1].categories).map(([category, amount]) => (
              <div key={category} className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-600 mb-2">{getCategoryName(category)}</p>
                <p className="text-lg font-bold text-gray-900">{amount.toFixed(0)}</p>
                <p className="text-xs text-gray-500">جنيه</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
