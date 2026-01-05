import { PieChart, Plus, Trash2, AlertCircle } from "lucide-react";
import Loader from "../components/Loader";
import Input from "../components/Input";
import Select from "../components/Select";
import { useBudget } from "../hooks/useBudget";
import { expenseCategories } from "../utils/expenseUtils.jsx";

const BudgetPage = () => {
  const {
    budgets,
    loading,
    showAddModal,
    setShowAddModal,
    formData,
    handleChange,
    handleSubmit,
    handleDelete,
    isSubmitting,
  } = useBudget();

  if (loading) return <Loader text="بنحمّل الميزانيات..." />;

  // Calculate percentage used for demo visualization
  // In a real app we'd compare with actual expenses per category
  const calculateProgress = (budget) => {
    const spent = budget.spent || 0; // Assuming backend returns spent amount
    const limit = budget.limit || 1;
    return Math.min((spent / limit) * 100, 100);
  };

  return (
    <div className="pb-8 font-primary">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-2xl"
            style={{ backgroundColor: "var(--color-primary-bg)" }}
          >
            <PieChart size={32} style={{ color: "var(--color-primary)" }} />
          </div>
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--color-dark)" }}
            >
              الميزانية
            </h1>
            <p style={{ color: "var(--color-secondary)" }}>
              خطط لمصاريفك وتحكم في ميزانيتك
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-white font-bold transition-all shadow-lg hover:shadow-xl"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          <Plus size={20} />
          <span>ميزانية جديدة</span>
        </button>
      </div>

      {/* Budget List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.length > 0 ? (
          budgets.map((budget) => {
            const progress = calculateProgress(budget);
            const isOverBudget = (budget.spent || 0) > budget.limit;

            return (
              <div
                key={budget._id}
                className="p-6 rounded-3xl shadow-sm relative overflow-hidden transition-all hover:shadow-md"
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3
                      className="text-xl font-bold mb-1"
                      style={{ color: "var(--color-dark)" }}
                    >
                      {expenseCategories.find((c) => c.id === budget.category)
                        ?.label || budget.category}
                    </h3>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {budget.period === "monthly"
                        ? "شهري"
                        : budget.period === "weekly"
                        ? "أسبوعي"
                        : "سنوي"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(budget._id)}
                    className="p-2 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>

                <div className="mb-2 flex justify-between items-end">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {budget.spent || 0}
                    <span className="text-sm font-normal text-gray-400 mr-1">
                      مصروف
                    </span>
                  </span>
                  <span
                    className="text-lg font-bold"
                    style={{ color: "var(--color-secondary)" }}
                  >
                    {budget.limit}
                    <span className="text-sm font-normal text-gray-400 mr-1">
                      الحد
                    </span>
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: isOverBudget
                        ? "var(--color-error)"
                        : "var(--color-primary)",
                    }}
                  />
                </div>

                {isOverBudget && (
                  <div className="mt-3 flex items-center gap-1 text-sm text-red-500 font-medium">
                    <AlertCircle size={14} />
                    <span>تخطيت الميزانية!</span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 rounded-3xl border-2 border-dashed border-gray-200">
            <PieChart size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400 font-medium">
              مفيش ميزانيات متحددة لسه
            </p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="w-full max-w-md p-6 rounded-3xl animate-scale-in"
            style={{ backgroundColor: "var(--color-surface)" }}
          >
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: "var(--color-dark)" }}
            >
              إضافة ميزانية جديدة
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Select
                  label="الفئة"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">اختار الفئة</option>
                  {expenseCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                  <option value="general">عام</option>
                </Select>
              </div>

              <Input
                label="الحد الأقصى (جنيه)"
                type="number"
                name="limit"
                value={formData.limit}
                onChange={handleChange}
                placeholder="0.00"
                required
              />

              <div>
                <Select
                  label="الفترة"
                  name="period"
                  value={formData.period}
                  onChange={handleChange}
                >
                  <option value="weekly">أسبوعي</option>
                  <option value="monthly">شهري</option>
                  <option value="yearly">سنوي</option>
                </Select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 font-bold rounded-2xl"
                  style={{
                    backgroundColor: "var(--color-light)",
                    color: "var(--color-secondary)",
                  }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 text-white font-bold rounded-2xl"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  {isSubmitting ? "جاري الحفظ..." : "حفظ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPage;
