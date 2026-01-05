import { PlusCircle, Check, FileText, Coins } from "lucide-react";
import Loader from "../components/Loader";
import Input from "../components/Input";
import Select from "../components/Select";
import { useAddExpense } from "../hooks/useAddExpense";

// صفحة إضافة مصروف - تصميم iOS
const AddExpense = () => {
  const {
    user,
    formData,
    users,
    selectedUsers,
    loading,
    isSubmitting,
    error,
    handleInputChange,
    handleSplitTypeChange,
    toggleUserSelection,
    handleSubmit,
  } = useAddExpense();

  if (loading) return <Loader text="بنحمّل البيانات..." />;

  return (
    <div className="max-w-2xl mx-auto font-primary">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-2xl bg-[var(--color-primary-bg)]">
          <PlusCircle className="text-[var(--color-primary)]" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-[var(--color-dark)]">
          {user?.role === "admin" ? "سجّل مصروف جديد" : "طلب تسجيل مصروف"}
        </h1>
      </div>

      {error && (
        <div className="p-4 rounded-2xl mb-6 bg-[var(--color-status-rejected-bg)] text-[var(--color-status-rejected)] border border-[var(--color-status-rejected-bg)]">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="backdrop-blur-xl p-8 rounded-3xl space-y-6 shadow-lg bg-[var(--color-surface)] border border-[var(--color-border)]"
      >
        <Input
          label="وصف المصروف"
          type="text"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          icon={FileText}
          placeholder="مثال: فاتورة الكهرباء"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Select
              label="النوع"
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
            >
              <option value="General">عام</option>
              <option value="Food">أكل وشرب</option>
              <option value="Transport">مواصلات</option>
              <option value="Utilities">فواتير</option>
              <option value="Entertainment">ترفيه</option>
              <option value="CashOut">سحب كاش (فلوس في اليد)</option>
              <option value="Housing">سكن</option>
              <option value="Other">حاجات تانية</option>
            </Select>
          </div>

          <Input
            label="الفلوس (جنيه)"
            type="number"
            step="0.01"
            value={formData.totalAmount}
            onChange={(e) => handleInputChange("totalAmount", e.target.value)}
            icon={Coins}
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <Select
            label="هنقسمها إزاي"
            value={formData.splitType}
            onChange={handleSplitTypeChange}
          >
            <option value="equal">قسّمها على الكل</option>
            <option value="specific">قسّمها على ناس معينة</option>
          </Select>
        </div>

        {formData.splitType === "specific" && (
          <div className="p-5 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)]">
            <label className="block text-sm font-semibold mb-3 text-[var(--color-dark)]">
              اختار مين هيدفع
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {users.map((u) => (
                <div
                  key={u._id}
                  onClick={() => toggleUserSelection(u._id)}
                  className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${
                    selectedUsers.includes(u._id)
                      ? "bg-[var(--color-primary-bg)] border-[var(--color-primary)]"
                      : "bg-[var(--color-surface)] border-[var(--color-border)] hover:bg-[var(--color-hover)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedUsers.includes(u._id)
                          ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
                          : "border-[var(--color-secondary)]"
                      }`}
                    >
                      {selectedUsers.includes(u._id) && (
                        <Check size={16} className="text-white" />
                      )}
                    </div>
                    <span className="font-semibold text-[var(--color-dark)]">
                      {u.name}
                    </span>
                  </div>
                  <span className="text-sm text-[var(--color-secondary)]">
                    @{u.username}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs mt-3 text-[var(--color-secondary)]">
              اخترت: {selectedUsers.length} من {users.length} شخص
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 px-4 cursor-pointer text-white font-bold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl mt-4 flex items-center justify-center gap-2 ${
            isSubmitting
              ? "opacity-70 cursor-not-allowed bg-[var(--color-secondary)]"
              : "bg-[var(--color-primary)] hover:brightness-110"
          }`}
        >
          {isSubmitting
            ? "جاري المعالجة..."
            : user?.role === "admin"
            ? "تسجيل المصروف"
            : "إرسال للموافقة"}
        </button>
      </form>
    </div>
  );
};

export default AddExpense;
