import { Wallet } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useDashboardStats } from "../hooks/useDashboardStats";
import Loader from "../components/Loader";
import QuoteCard from "../components/QuoteCard";
import WelcomeModal from "../components/WelcomeModal";
import AdminDashboard from "../components/dashboard/AdminDashboard";
import UserDashboard from "../components/dashboard/UserDashboard";

const Dashboard = () => {
  const { user } = useAuth();
  const { stats, loading } = useDashboardStats();

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

export default Dashboard;
