import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../utils/api";
import {
  Receipt,
  Calendar,
  User,
  Trash2,
  ShoppingBag,
  Car,
  Zap,
  Home,
  Smile,
  Package,
  PlusCircle,
} from "lucide-react";
import Loader from "../components/Loader";

const Expenses = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/expenses");
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("فيه مشكلة في تحميل المصاريف");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("متأكد تمسح المصروف ده؟")) return;

    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(expenses.filter((e) => e._id !== id));
      toast.success("تم مسح المصروف بنجاح");
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("فيه مشكلة في مسح المصروف");
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Food: <ShoppingBag size={20} />,
      Transport: <Car size={20} />,
      Utilities: <Zap size={20} />,
      Housing: <Home size={20} />,
      Entertainment: <Smile size={20} />,
      General: <Package size={20} />,
    };
    return icons[category] || <Package size={20} />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      Food: "bg-orange-100 text-orange-600",
      Transport: "bg-blue-100 text-blue-600",
      Utilities: "bg-yellow-100 text-yellow-600",
      Housing: "bg-purple-100 text-purple-600",
      Entertainment: "bg-pink-100 text-pink-600",
      General: "bg-gray-100 text-gray-600",
    };
    return colors[category] || "bg-gray-100 text-gray-600";
  };

  const translateCategory = (category) => {
    const translations = {
      Food: "أكل وشرب",
      Transport: "مواصلات",
      Utilities: "فواتير",
      Housing: "سكن",
      Entertainment: "ترفيه",
      General: "عام",
    };
    return translations[category] || category;
  };

  if (loading) return <Loader text="بنحمّل المصاريف..." />;

  return (
    <div className="pb-8 px-4 max-w-6xl mx-auto">
      {/* Header with title and add button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-(--color-dark)">المصاريف</h1>
        {user.role === "admin" && (
          <Link
            to="/add-expense"
            className="flex items-center gap-2 px-4 py-2.5 bg-ios-primary text-white rounded-2xl hover:bg-ios-primary/90 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
          >
            <PlusCircle size={20} />
            <span>سجّل مصروف جديد</span>
          </Link>
        )}
      </div>

      {/* قائمة المصاريف */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {expenses.map((expense) => (
          <div
            key={expense._id}
            className="group bg-(--color-bg) rounded-2xl p-5 shadow-sm border border-(--color-muted) hover:shadow-md transition-all duration-200 relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-3">
              {/* أيقونة التصنيف */}
              <div
                className={`p-2.5 rounded-xl ${getCategoryColor(
                  expense.category
                )}`}
              >
                {getCategoryIcon(expense.category)}
              </div>

              {/* المبلغ */}
              <div className="text-right">
                <span className="block text-xl font-bold text-(--color-dark)">
                  {expense.totalAmount.toFixed(2)}
                  <span className="text-xs text-(--color-muted) font-normal mr-1">
                    جنيه
                  </span>
                </span>
              </div>
            </div>

            {/* العنوان */}
            <h3
              className="font-semibold text-(--color-secondary) mb-2 line-clamp-1"
              title={expense.description}
            >
              {expense.description}
            </h3>

            {/* التصنيف */}
            <span className="inline-block px-2.5 py-1 bg-ios-surface text-(--color-muted) text-xs font-medium rounded-full mb-4">
              {translateCategory(expense.category)}
            </span>

            {/* المعلومات */}
            <div className="flex items-center justify-between pt-4 border-t border-(--color-hover) mt-auto">
              <div className="flex flex-col gap-1 text-xs text-(--color-muted)">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  <span>
                    {new Date(expense.date).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      calendar: "gregory", // ميلادي
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User size={12} />
                  <span>{expense.createdBy.name}</span>
                </div>
              </div>

              {/* زر المسح (للأدمن بس) */}
              {user.role === "admin" && (
                <button
                  onClick={() => handleDelete(expense._id)}
                  className="p-2 text-(--color-border) hover:text-(--color-error) hover:bg-(--color-status-rejected-bg) rounded-lg transition-colors cursor-pointer"
                  title="امسح"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* لو مفيش مصاريف */}
      {!loading && expenses.length === 0 && (
        <div className="text-center py-20 bg-(--color-surface) rounded-3xl border-2 border-dashed border-[--color-border]">
          <Receipt size={48} className="mx-auto mb-3 text-(--color-border)" />
          <p className="text-(--color-muted) font-medium">
            مفيش مصاريف متسجلة لسه
          </p>
          <p className="text-(--color-muted) text-sm mt-1">
            ابدأ سجّل أول مصروف
          </p>
        </div>
      )}
    </div>
  );
};

export default Expenses;
