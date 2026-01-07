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
        <div className="p-3 rounded-2xl bg-(--color-primary-bg)">
          <PlusCircle className="text-(--color-primary)" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-(--color-dark)">
          {user?.role === "admin" ? "سجّل مصروف جديد" : "طلب تسجيل مصروف"}
        </h1>
      </div>

      {error && (
        <div className="p-4 rounded-2xl mb-6 bg-(--color-status-rejected-bg) text-(--color-status-rejected) border border-(--color-status-rejected-bg)">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="backdrop-blur-xl p-8 rounded-3xl space-y-6 shadow-lg bg-(--color-surface) border border-(--color-border)"
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

        {user?.role === "admin" && (
          <Select
            label="مين اللي دفع؟"
            value={formData.payer}
            onChange={(e) => handleInputChange("payer", e.target.value)}
          >
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </Select>
        )}

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
          <div className="p-5 rounded-2xl bg-(--color-bg) border border-(--color-border)">
            <label className="block text-sm font-semibold mb-3 text-(--color-dark)">
              اختار مين هيدفع
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-1 custom-scrollbar">
              {users.map((u) => {
                const isSelected = selectedUsers.includes(u._id);
                return (
                  <div
                    key={u._id}
                    onClick={() => toggleUserSelection(u._id)}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group flex flex-col items-center gap-3 ${
                      isSelected
                        ? "bg-(--color-primary)/10 border-(--color-primary) text-white shadow-lg scale-[1.02]"
                        : "bg-(--color-surface) border-(--color-border) hover:border-(--color-primary) hover:shadow-md"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-(--color-primary) text-white rounded-full p-0.5 shadow-sm">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}

                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 ${
                        isSelected
                          ? "bg-white/20 border-white/50 text-white"
                          : "bg-(--color-bg) border-(--color-border) text-(--color-primary)"
                      }`}
                    >
                      {u.name.charAt(0)}
                    </div>

                    <div className="text-center w-full">
                      <p
                        className={`font-bold truncate text-sm mb-0.5 ${
                          isSelected ? "text-white" : "text-(--color-dark)"
                        }`}
                      >
                        {u.name}
                      </p>
                      <p
                        className={`text-xs truncate ${
                          isSelected
                            ? "text-white/80"
                            : "text-(--color-secondary)"
                        }`}
                      >
                        @{u.username}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs mt-4 text-(--color-secondary) font-medium text-center">
              تم اختيار {selectedUsers.length} من أصل {users.length} شخص
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 px-4 cursor-pointer text-white font-bold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl mt-4 flex items-center justify-center gap-2 ${
            isSubmitting
              ? "opacity-70 cursor-not-allowed bg-(--color-secondary)"
              : "bg-(--color-primary) hover:brightness-110"
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
