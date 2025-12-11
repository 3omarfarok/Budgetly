import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../utils/api";
import {
  Banknote,
  PlusCircle,
  User as UserIcon,
  Coins,
  FileText,
  Calendar,
} from "lucide-react";

import Loader from "../components/Loader";
import Input from "../components/Input";
import Select from "../components/Select";

const AddPayment = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [balances, setBalances] = useState([]);
  const [formData, setFormData] = useState({
    user: "",
    amount: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
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
      toast.error("فيه مشكلة في تحميل الأعضاء");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.user || !formData.amount) {
      const errorMsg = "لازم تختار العضو والمبلغ";
      setError(errorMsg);
      toast.warning(errorMsg);
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/payments", formData);
      toast.success("تم تسجيل الدفعة بنجاح!");
      navigate("/payments");
    } catch (error) {
      console.error("غلط في تسجيل الدفعة:", error);
      const errorMsg = "فيه مشكلة في تسجيل الدفعة";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // لازم يكون أدمن
  if (user.role !== "admin") {
    return (
      <div className="text-center py-20">
        <p style={{ color: "var(--color-error)" }}>الصفحة دي للأدمن بس</p>
      </div>
    );
  }

  if (loading) return <Loader text="بنحمّل الأعضاء..." />;

  return (
    <div className="pb-8 max-w-2xl mx-auto font-primary">
      <div className="flex items-center gap-3 mb-8">
        <div
          className="p-3 rounded-2xl"
          style={{
            backgroundColor: "var(--color-primary-bg)",
          }}
        >
          <Banknote style={{ color: "var(--color-primary)" }} size={32} />
        </div>
        <h1
          className="text-3xl font-bold"
          style={{ color: "var(--color-dark)" }}
        >
          سجّل دفعة جديدة
        </h1>
      </div>

      {error && (
        <div
          className="p-4 rounded-2xl mb-6 text-sm"
          style={{
            backgroundColor: "var(--color-status-rejected-bg)",
            color: "var(--color-error)",
            border: "1px solid var(--color-status-rejected-border)",
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="backdrop-blur-xl p-8 rounded-3xl space-y-6 shadow-lg"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div>
          <Select
            label="اختار العضو"
            value={formData.user}
            onChange={(e) => setFormData({ ...formData, user: e.target.value })}
            required
            variant="filled" // matches other inputs in form which used filled (actually they used Input default which is 'default' variant, but AddPayment inputs used 'filled' look via manual styles previously?)
            // Wait, in previous step I didn't specify variant='filled' for AddPayment inputs, so they are default.
            // But AddPayment previously used manual styles with bg-ios-bg...
            // Let's verify what variant implies. Default is bg-ios-bg border border-ios-border.
            // Manual styles: bg-ios-bg border-ios-border. So 'default' variant is correct.
            // EXCEPT, I might want to use icon UserIcon.
            icon={UserIcon}
          >
            <option value="">-- اختار عضو --</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} (@{u.username})
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="المبلغ (جنيه)"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            icon={Coins}
            placeholder="0.00"
            required
          />

          <Input
            label="التاريخ"
            type="date"
            value={formData.date || new Date().toISOString().split("T")[0]}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            icon={Calendar}
          />
        </div>

        <Input
          label="وصف (اختياري)"
          type="text"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          icon={FileText}
          placeholder="أي ملاحظات..."
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 px-4 cursor-pointer text-white hover:bg-[--color-dark] hover:text-[--color-primary] font-bold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl mt-4 flex items-center justify-center gap-2 ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {isSubmitting ? (
            "جاري التسجيل..."
          ) : (
            <>
              <PlusCircle size={20} />
              سجّل الدفعة
            </>
          )}
        </button>
      </form>

      {/* قائمة الأعضاء للمرجع */}
      <div
        className="mt-8 backdrop-blur-xl p-6 rounded-3xl shadow-lg"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <h3
          className="text-lg font-bold mb-4 flex items-center gap-2"
          style={{ color: "var(--color-dark)" }}
        >
          <UserIcon size={20} />
          الأعضاء النشطين
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {users.map((u) => (
            <div
              key={u._id}
              className="p-3 rounded-xl transition-colors cursor-pointer"
              style={{
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-border)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "var(--color-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "var(--color-border)")
              }
              onClick={() => setFormData({ ...formData, user: u._id })}
            >
              <p
                className="font-semibold"
                style={{ color: "var(--color-dark)" }}
              >
                {u.name}
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--color-secondary)" }}
              >
                @{u.username}
              </p>
              {u.balance !== 0 && (
                <p
                  className="text-sm font-bold mt-1"
                  style={{
                    color:
                      u.balance < 0
                        ? "var(--color-error)"
                        : "var(--color-success)",
                  }}
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
