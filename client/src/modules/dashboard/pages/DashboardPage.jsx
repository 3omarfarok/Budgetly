import { Wallet } from "lucide-react";
import { useAuth } from "../../../shared/context/AuthContext";
import { Loader } from "../../../shared/components";
import { DishwashingWidget } from "../../house/components";
import { useDashboardStats } from "../hooks";
import {
  AdminDashboard,
  QuoteCard,
  UserDashboard,
  WelcomeModal,
} from "../components";

const Dashboard = () => {
  const { user } = useAuth();
  const { stats, loading } = useDashboardStats();

  // Get house ID from user
  const houseId =
    typeof user?.house === "object" ? user?.house?._id : user?.house;

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

      {/* Dishwashing Widget */}
      {houseId && (
        <div className="mb-6">
          <DishwashingWidget houseId={houseId} />
        </div>
      )}

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
