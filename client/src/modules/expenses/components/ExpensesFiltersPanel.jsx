import { Filter, X, User, DollarSign } from "lucide-react";

export default function ExpensesFiltersPanel({
  users,
  selectedUserId,
  onUserChange,
  minAmount,
  onMinAmountChange,
  maxAmount,
  onMaxAmountChange,
  hasActiveFilters,
  onClearFilters,
}) {
  return (
    <div
      className="mb-6 p-5 rounded-2xl shadow-sm animate-in slide-in-from-top-2 duration-200"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="font-semibold flex items-center gap-2"
          style={{ color: "var(--color-dark)" }}
        >
          <Filter size={18} style={{ color: "var(--color-primary)" }} />
          خيارات الفلترة
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors"
            style={{
              color: "var(--color-error)",
              backgroundColor: "var(--color-status-rejected-bg)",
            }}
          >
            <X size={14} />
            مسح الكل
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            className="block text-sm font-medium mb-2 flex items-center gap-1.5"
            style={{ color: "var(--color-secondary)" }}
          >
            <User size={14} />
            المستخدم
          </label>
          <select
            value={selectedUserId}
            onChange={(e) => onUserChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl outline-none transition-all duration-200"
            style={{
              backgroundColor: "var(--color-light)",
              border: "1px solid var(--color-border)",
              color: "var(--color-dark)",
            }}
          >
            <option value="">كل المستخدمين</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2 flex items-center gap-1.5"
            style={{ color: "var(--color-secondary)" }}
          >
            <DollarSign size={14} />
            الحد الأدنى (جنيه)
          </label>
          <input
            type="number"
            value={minAmount}
            onChange={(e) => onMinAmountChange(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full px-4 py-2.5 rounded-xl outline-none transition-all duration-200"
            style={{
              backgroundColor: "var(--color-light)",
              border: "1px solid var(--color-border)",
              color: "var(--color-dark)",
            }}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2 flex items-center gap-1.5"
            style={{ color: "var(--color-secondary)" }}
          >
            <DollarSign size={14} />
            الحد الأقصى (جنيه)
          </label>
          <input
            type="number"
            value={maxAmount}
            onChange={(e) => onMaxAmountChange(e.target.value)}
            placeholder="∞"
            min="0"
            className="w-full px-4 py-2.5 rounded-xl outline-none transition-all duration-200"
            style={{
              backgroundColor: "var(--color-light)",
              border: "1px solid var(--color-border)",
              color: "var(--color-dark)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
