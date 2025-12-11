import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../utils/api";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
} from "lucide-react";

import Loader from "../components/Loader";
import QuoteCard from "../components/QuoteCard";
import WelcomeModal from "../components/WelcomeModal";

// صفحة لوحة التحكم - محسّنة للإتاحة
const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const endpoint =
          user.role === "admin"
            ? "/stats/admin/dashboard"
            : `/stats/user/${user.id}`;
        const { data } = await api.get(endpoint);
        setStats(data);
      } catch (error) {
        console.error("خطأ في تحميل الإحصائيات:", error);
        toast.error("فيه مشكلة في تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user, toast]);

  if (loading) return <Loader text="بنحمّل لوحة التحكم..." />;
  if (!stats)
    return (
      <div className="text-center p-8 text-ios-error" role="alert">
        في مشكلة في تحميل البيانات
      </div>
    );

  return (
    <div className="pb-8 font-primary" id="main-content">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-ios-primary/10 rounded-2xl">
          <Wallet className="text-ios-primary" size={32} aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-ios-dark">الصفحة الرئيسية</h1>
      </div>

      <WelcomeModal />

      <div className="mb-8">
        <QuoteCard />
      </div>

      {user.role === "admin" ? (
        <AdminDashboard stats={stats} />
      ) : (
        <UserDashboard stats={stats} />
      )}
    </div>
  );
};

// بطاقة الإحصائيات - محسّنة
const StatCard = ({ title, value, subtext, type = "neutral", icon: Icon }) => {
  const getColors = () => {
    switch (type) {
      case "positive":
        return "bg-ios-success/10 border-ios-success/20 text-ios-success";
      case "negative":
        return "bg-ios-error/10 border-ios-error/20 text-ios-error";
      default:
        return "bg-ios-surface border-ios-border text-ios-dark";
    }
  };

  return (
    <div
      className={`${getColors()} backdrop-blur-xl p-6 rounded-3xl border shadow-md hover:shadow-lg transition-all`}
      role="article"
    >
      {Icon && (
        <div className="mb-3" aria-hidden="true">
          <Icon size={24} className="opacity-60" />
        </div>
      )}
      <h3 className="text-sm font-semibold opacity-70 mb-2 tracking-wider">
        {title}
      </h3>
      <p className="text-3xl font-bold">
        {value}
        {subtext && (
          <span className="text-base font-normal opacity-60 mr-2">
            {subtext}
          </span>
        )}
      </p>
    </div>
  );
};

// لوحة تحكم المدير
const AdminDashboard = ({ stats }) => (
  <div className="space-y-8">
    <section aria-labelledby="overview-heading">
      <h2 id="overview-heading" className="sr-only">
        نظرة عامة
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي المصاريف"
          value={`${stats.overview.totalExpenseAmount.toFixed(2)} جنيه`}
          icon={TrendingUp}
        />
        <StatCard
          title="إجمالي المدفوع"
          value={`${stats.overview.totalPaymentAmount.toFixed(2)} جنيه`}
          icon={DollarSign}
        />
        <StatCard
          title="إجمالي المستحق"
          value={`${stats.overview.totalOwed.toFixed(2)} جنيه`}
          icon={TrendingDown}
        />
        <StatCard
          title="عدد الأعضاء"
          value={stats.overview.totalUsers}
          icon={Users}
        />
      </div>
    </section>

    <section
      aria-labelledby="debtors-heading"
      className="bg-ios-surface backdrop-blur-xl rounded-3xl border border-ios-border overflow-hidden shadow-md"
    >
      <div className="p-6 border-b border-ios-border">
        <h2 id="debtors-heading" className="text-xl font-bold text-ios-dark">
          الناس اللي عليها فلوس
        </h2>
      </div>
      <div className="divide-y divide-ios-border">
        {stats.usersOwing.length > 0 ? (
          <ul className="divide-y divide-ios-border">
            {stats.usersOwing.map((u) => (
              <li
                key={u.userId}
                className="p-5 flex justify-between items-center hover:bg-ios-hover transition-colors"
              >
                <span className="font-semibold text-ios-dark">
                  {u.name}{" "}
                  <span className="text-ios-secondary text-sm">
                    (@{u.username})
                  </span>
                </span>
                <span className="text-ios-error font-bold">
                  عليه {u.owes.toFixed(2)} جنيه
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-6 text-ios-secondary text-center">
            مفيش حد عليه فلوس!
          </p>
        )}
      </div>
    </section>
  </div>
);

// لوحة تحكم المستخدم
const UserDashboard = ({ stats }) => (
  <div className="space-y-8">
    <section aria-labelledby="balance-heading">
      <h2 id="balance-heading" className="sr-only">
        رصيدي
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="رصيدي"
          value={`${Math.abs(stats.balance).toFixed(2)} جنيه`}
          subtext={stats.balance >= 0 ? "(ليّا فلوس)" : "(عليّا فلوس)"}
          type={stats.balance >= 0 ? "positive" : "negative"}
          icon={Wallet}
        />
        <StatCard
          title="اللي دفعته"
          value={`${stats.totalPaid.toFixed(2)} جنيه`}
          icon={DollarSign}
        />
        <StatCard
          title="اجمالي المصاريف"
          value={`${stats.totalOwed.toFixed(2)} جنيه`}
          icon={TrendingDown}
        />
      </div>
    </section>

    <section
      aria-labelledby="activity-heading"
      className="bg-ios-surface backdrop-blur-xl rounded-3xl border border-ios-border overflow-hidden shadow-md"
    >
      <div className="p-6 border-b border-ios-border">
        <h2 id="activity-heading" className="text-xl font-bold text-ios-dark">
          آخر المصاريف
        </h2>
      </div>
      <div className="divide-y divide-ios-border">
        {stats.recentExpenses.length > 0 ? (
          <ul className="divide-y divide-ios-border">
            {stats.recentExpenses.map((expense) => (
              <li
                key={expense._id}
                className="p-5 flex justify-between items-center hover:bg-ios-hover transition-colors"
              >
                <span className="text-ios-dark font-medium">
                  {expense.description}
                </span>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-ios-primary">
                    {expense.totalAmount.toFixed(2)} جنيه
                  </span>
                  {expense.userShare && (
                    <span className="text-sm text-ios-error">
                      حصتك: {expense.userShare.toFixed(2)} جنيه
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-6 text-ios-secondary text-center">مفيش مصاريف لسه</p>
        )}
      </div>
    </section>
  </div>
);

export default Dashboard;
