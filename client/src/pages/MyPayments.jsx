import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../utils/api";
import {
  Banknote,
  PlusCircle,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
} from "lucide-react";

import Loader from "../components/Loader";

const MyPayments = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0], // التاريخ الحالي افتراضي
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyPayments();
    fetchUserBalance();
  }, []);

  const fetchMyPayments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/payments/user/${user.id}`);
      setPayments(data);
    } catch (error) {
      console.error("غلط في تحميل مدفوعاتي:", error);
      toast.error("فيه مشكلة في تحميل مدفوعاتك");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBalance = async () => {
    try {
      const { data } = await api.get(`/stats/user/${user.id}`);
      setUserBalance(data.balance || 0);
    } catch (error) {
      console.error("غلط في تحميل الرصيد:", error);
      toast.error("فيه مشكلة في تحميل الرصيد");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.amount) {
      const errorMsg = "لازم تكتب المبلغ";
      setError(errorMsg);
      toast.warning(errorMsg);
      return;
    }

    try {
      if (editingPayment) {
        // تعديل دفعة موجودة
        await api.put(`/payments/${editingPayment._id}`, {
          amount: formData.amount,
          description: formData.description,
          date: formData.date,
        });
        toast.success("تم تعديل الدفعة بنجاح!");
      } else {
        // إضافة دفعة جديدة
        await api.post("/payments", {
          user: user.id,
          amount: formData.amount,
          description: formData.description,
          date: formData.date,
        });
        toast.success("تم تسجيل الدفعة بنجاح!");
      }

      // إعادة تعيين الفورم
      setFormData({
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      setShowAddForm(false);
      setEditingPayment(null);
      fetchMyPayments();
      fetchUserBalance(); // تحديث الرصيد
    } catch (error) {
      console.error("غلط في تسجيل الدفعة:", error);
      const errorMsg = "فيه مشكلة في تسجيل الدفعة";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setFormData({
      amount: payment.amount,
      description: payment.description || "",
      date: payment.date
        ? new Date(payment.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    });
    setShowAddForm(true);
  };

  const handleDelete = async (paymentId) => {
    if (!window.confirm("متأكد إنك عايز تمسح الدفعة دي؟")) return;

    try {
      await api.delete(`/payments/${paymentId}`);
      toast.success("تم حذف الدفعة بنجاح");
      fetchMyPayments();
      fetchUserBalance();
    } catch (error) {
      console.error("غلط في مسح الدفعة:", error);
      toast.error("فيه مشكلة في حذف الدفعة");
    }
  };

  const handleCancelEdit = () => {
    setEditingPayment(null);
    setFormData({
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
    setShowAddForm(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        color: "bg-yellow-100 text-yellow-600",
        icon: Clock,
        text: "مستني",
      },
      approved: {
        color: "bg-green-100 text-green-600",
        icon: CheckCircle,
        text: "موافق عليه",
      },
      rejected: {
        color: "bg-red-100 text-red-600",
        icon: XCircle,
        text: "مرفوض",
      },
    };
    return badges[status] || badges.pending;
  };

  // حساب المجموع
  const totalPaid = payments
    .filter((p) => p.status === "approved")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const pendingAmount = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // المبلغ المطلوب (إذا كان سالب يعني عليه فلوس)
  const amountOwed = userBalance < 0 ? Math.abs(userBalance) : 0;

  if (loading) return <Loader text="بنحمّل مدفوعاتك..." />;

  return (
    <div className="pb-8 px-4 max-w-4xl mx-auto font-primary">
      {/* الهيدر */}
      <div className="mb-8 pt-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-dark)]">
              مدفوعاتي
            </h1>
            <p className="text-[var(--color-muted)] text-sm mt-1">
              سجّل الفلوس اللي دفعتها
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 bg-ios-primary hover:bg-ios-dark text-white font-semibold rounded-2xl transition-all shadow-lg flex items-center gap-2"
          >
            <PlusCircle size={18} />
            {showAddForm ? "إلغاء" : "سجّل دفعة"}
          </button>
        </div>

        {/* ملخص المدفوعات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* المبلغ المطلوب سداده */}
          <div
            className={`${
              amountOwed > 0
                ? "bg-gradient-to-br from-red-50 to-red-100 border-red-200"
                : "bg-gradient-to-br from-green-50 to-green-100 border-green-200"
            } p-4 rounded-2xl border`}
          >
            <p
              className={`text-sm ${
                amountOwed > 0 ? "text-red-700" : "text-green-700"
              } mb-1 flex items-center gap-1`}
            >
              {amountOwed > 0 ? "💸 المطلوب دفعه" : "✅ رصيدك"}
            </p>
            <p
              className={`text-2xl font-bold ${
                amountOwed > 0 ? "text-red-900" : "text-green-900"
              }`}
            >
              {amountOwed > 0
                ? amountOwed.toFixed(2)
                : Math.abs(userBalance).toFixed(2)}
              <span className="text-sm"> جنيه</span>
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl border border-green-200">
            <p className="text-sm text-green-700 mb-1">الموافق عليه</p>
            <p className="text-2xl font-bold text-green-900">
              {totalPaid.toFixed(2)} <span className="text-sm">جنيه</span>
            </p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-2xl border border-yellow-200">
            <p className="text-sm text-yellow-700 mb-1">المستني موافقة</p>
            <p className="text-2xl font-bold text-yellow-900">
              {pendingAmount.toFixed(2)} <span className="text-sm">جنيه</span>
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl border border-blue-200">
            <p className="text-sm text-blue-700 mb-1">إجمالي المدفوعات</p>
            <p className="text-2xl font-bold text-blue-900">
              {payments.length}
            </p>
          </div>
        </div>
      </div>

      {/* فورم إضافة/تعديل دفعة */}
      {showAddForm && (
        <div className="bg-[var(--color-surface)] backdrop-blur-xl p-6 rounded-3xl border border-[var(--color-border)] mb-8 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-[var(--color-dark)]">
              {editingPayment ? "عدّل الدفعة" : "سجّل دفعة جديدة"}
            </h3>
            {amountOwed > 0 && (
              <div className="bg-red-50 px-4 py-2 rounded-xl border border-red-200">
                <p className="text-xs text-red-600 mb-0.5">المطلوب دفعه:</p>
                <p className="text-lg font-bold text-red-700">
                  {amountOwed.toFixed(2)} جنيه
                </p>
              </div>
            )}
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-2xl mb-4 text-sm border border-red-200">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-dark)] mb-1">
                  المبلغ (جنيه)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl text-[var(--color-dark)] transition-all"
                  placeholder="0.00"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-dark)] mb-1">
                  التاريخ
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl text-[var(--color-dark)] transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-dark)] mb-1">
                وصف (اختياري)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl text-ios-dark transition-all"
                placeholder="مثال: دفعة شهر يناير"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-ios-primary hover:bg-ios-dark text-white font-bold rounded-2xl transition-all shadow-lg"
              >
                {editingPayment ? "حفظ التعديل" : "سجّل الدفعة"}
              </button>
              {editingPayment && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-[var(--color-secondary)] font-bold rounded-2xl transition-all"
                >
                  إلغاء
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* قائمة المدفوعات */}
      <div className="space-y-4">
        {!loading &&
          payments.map((payment) => {
            const statusBadge = getStatusBadge(payment.status);
            const StatusIcon = statusBadge.icon;

            return (
              <div
                key={payment._id}
                className="bg-[var(--color-surface)] rounded-2xl p-5 shadow-sm border border-[var(--color-border)] hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div
                    className={`px-3 py-1.5 rounded-xl ${statusBadge.color} flex items-center gap-1.5`}
                  >
                    <StatusIcon size={14} />
                    <span className="text-xs font-semibold">
                      {statusBadge.text}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-xl font-bold text-[var(--color-dark)]">
                      {payment.amount?.toFixed(2) || "0.00"}
                      <span className="text-xs text-[var(--color-muted)] font-normal mr-1">
                        جنيه
                      </span>
                    </span>
                  </div>
                </div>

                {payment.description && (
                  <p className="text-[var(--color-secondary)] mb-2">
                    {payment.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                  <Calendar size={12} />
                  <span>
                    {new Date(
                      payment.date || payment.createdAt
                    ).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      calendar: "gregory",
                    })}
                  </span>
                </div>

                {/* أزرار التعديل والحذف (للمدفوعات pending فقط) */}
                {payment.status === "pending" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
                    <button
                      onClick={() => handleEdit(payment)}
                      className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <Edit2 size={14} />
                      عدّل
                    </button>
                    <button
                      onClick={() => handleDelete(payment._id)}
                      className="flex-1 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 size={14} />
                      امسح
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* لو مفيش مدفوعات */}
      {!loading && payments.length === 0 && !showAddForm && (
        <div className="text-center py-20 bg-[var(--color-surface)] rounded-3xl border-2 border-dashed border-[var(--color-border)]">
          <Banknote size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-[var(--color-muted)] font-medium mb-3">
            مسجلتش أي دفعة لسه
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-ios-primary hover:bg-ios-dark text-white font-semibold rounded-2xl transition-all shadow-lg inline-flex items-center gap-2"
          >
            <PlusCircle size={18} />
            سجّل أول دفعة
          </button>
        </div>
      )}
    </div>
  );
};

export default MyPayments;
