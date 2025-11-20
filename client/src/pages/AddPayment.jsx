import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { Banknote, PlusCircle, User as UserIcon } from "lucide-react";

const AddPayment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [balances, setBalances] = useState([]);
  const [formData, setFormData] = useState({
    user: "",
    amount: "",
    description: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const [usersRes, balancesRes] = await Promise.all([
        api.get("/users"),
        api.get("/stats/balances"),
      ]);

      const activeUsers = usersRes.data.filter((u) => u.isActive);
      const balancesMap = new Map(
        balancesRes.data.map((b) => [b.userId.toString(), b])
      );

      // Merge users with their balance info
      const usersWithBalance = activeUsers.map((u) => ({
        ...u,
        balance: balancesMap.get(u._id.toString())?.balance || 0,
        totalOwed: balancesMap.get(u._id.toString())?.totalOwed || 0,
        totalPaid: balancesMap.get(u._id.toString())?.totalPaid || 0,
      }));

      setUsers(usersWithBalance);
      setBalances(balancesRes.data);
    } catch (error) {
      console.error("غلط في تحميل الأعضاء:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.user || !formData.amount) {
      setError("لازم تختار العضو والمبلغ");
      return;
    }

    try {
      await api.post("/payments", formData);
      navigate("/payments");
    } catch (error) {
      console.error("غلط في تسجيل الدفعة:", error);
      setError("فيه مشكلة في تسجيل الدفعة");
    }
  };

  // لازم يكون أدمن
  if (user.role !== "admin") {
    return (
      <div className="text-center py-20">
        <p className="text-ios-error">الصفحة دي للأدمن بس</p>
      </div>
    );
  }

  return (
    <div className="pb-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-ios-primary/10 rounded-2xl">
          <Banknote className="text-ios-primary" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-ios-dark">سجّل دفعة جديدة</h1>
      </div>

      {error && (
        <div className="bg-[var(--color-status-rejected-bg)] text-[var(--color-error)] p-4 rounded-2xl mb-6 text-sm border border-[var(--color-status-rejected-border)]">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-ios-light/50 space-y-6 shadow-lg"
      >
        <div>
          <label className="block text-sm font-semibold text-ios-dark mb-2">
            اختار العضو
          </label>
          <select
            value={formData.user}
            onChange={(e) => setFormData({ ...formData, user: e.target.value })}
            className="w-full px-5 py-3.5 bg-ios-bg border border-ios-border rounded-2xl text-ios-dark transition-all"
            required
          >
            <option value="">-- اختار عضو --</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} (@{u.username})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-ios-dark mb-2">
              المبلغ (جنيه)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className="w-full px-5 py-3.5 bg-ios-bg border border-ios-border rounded-2xl text-ios-dark transition-all"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ios-dark mb-2">
              التاريخ
            </label>
            <input
              type="date"
              value={formData.date || new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-5 py-3.5 bg-ios-bg border border-ios-border rounded-2xl text-ios-dark transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-ios-dark mb-2">
            وصف (اختياري)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-5 py-3.5 bg-ios-bg border border-ios-border rounded-2xl text-ios-dark transition-all resize-none"
            rows="3"
            placeholder="أي ملاحظات..."
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 px-4 bg-ios-primary hover:bg-ios-dark text-white font-bold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl mt-4 flex items-center justify-center gap-2"
        >
          <PlusCircle size={20} />
          سجّل الدفعة
        </button>
      </form>

      {/* قائمة الأعضاء للمرجع */}
      <div className="mt-8 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-ios-light/50 shadow-lg">
        <h3 className="text-lg font-bold text-ios-dark mb-4 flex items-center gap-2">
          <UserIcon size={20} />
          الأعضاء النشطين
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {users.map((u) => (
            <div
              key={u._id}
              className="p-3 bg-ios-bg rounded-xl border border-ios-border hover:border-ios-primary transition-colors cursor-pointer"
              onClick={() => setFormData({ ...formData, user: u._id })}
            >
              <p className="font-semibold text-ios-dark">{u.name}</p>
              <p className="text-xs text-ios-secondary">@{u.username}</p>
              {u.balance !== 0 && (
                <p
                  className={`text-sm font-bold mt-1 ${
                    u.balance < 0 ? "text-ios-error" : "text-ios-success"
                  }`}
                >
                  {u.balance < 0
                    ? `عليه ${Math.abs(u.balance).toFixed(2)} جنيه`
                    : `ليه ${u.balance.toFixed(2)} جنيه`}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddPayment;
