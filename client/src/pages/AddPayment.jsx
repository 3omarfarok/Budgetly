import {
  Banknote,
  User as UserIcon,
  Coins,
  FileText,
  Calendar,
  ArrowDownCircle,
} from "lucide-react";

import Loader from "../components/Loader";
import Input from "../components/Input";
import Select from "../components/Select";
import { useAddPayment } from "../hooks/useAddPayment";

const AddPayment = () => {
  const {
    users,
    loading,
    formData,
    handleChange,
    handleUserChange,
    handleSubmit,
    error,
    isSubmitting,
    user,
  } = useAddPayment();

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
          استلام دفعة
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
            label="استلمت من مين؟"
            name="user"
            value={formData.user}
            onChange={(e) => handleUserChange(e.target.value)}
            required
            variant="default"
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
            label="المبلغ المستلم (جنيه)"
            name="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            icon={Coins}
            placeholder="0.00"
            required
          />

          <Input
            label="تاريخ الاستلام"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            icon={Calendar}
          />
        </div>

        <Input
          label="وصف (اختياري)"
          name="description"
          type="text"
          value={formData.description}
          onChange={handleChange}
          icon={FileText}
          placeholder="أي ملاحظات..."
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 px-4 cursor-pointer text-white font-bold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl mt-4 flex items-center justify-center gap-2 ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
          style={{
            backgroundColor: "var(--color-primary)",
          }}
        >
          {isSubmitting ? (
            "جاري التسجيل..."
          ) : (
            <>
              <ArrowDownCircle size={20} />
              تسجيل استلام الدفعة
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
              onClick={() => handleUserChange(u._id)}
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
