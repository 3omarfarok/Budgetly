import { Calendar, User, Trash2, Eye } from "lucide-react";
import {
  getCategoryIcon,
  getCategoryStyles,
  translateCategory,
} from "../../utils/expenseUtils.jsx";

export default function ExpenseCard({
  expense,
  onDelete,
  onViewDetails,
  isAdmin,
}) {
  return (
    <div
      className="group rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden h-full flex flex-col"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="flex justify-between items-start mb-3">
        {/* Icon */}
        <div
          className="p-2.5 rounded-xl"
          style={getCategoryStyles(expense.category)}
        >
          {getCategoryIcon(expense.category)}
        </div>

        {/* Amount */}
        <div className="text-right">
          <span
            className="block text-xl font-bold"
            style={{ color: "var(--color-dark)" }}
          >
            {expense.totalAmount.toFixed(2)}
            <span
              className="text-xs font-normal mr-1"
              style={{ color: "var(--color-muted)" }}
            >
              جنيه
            </span>
          </span>
        </div>
      </div>

      {/* Description */}
      <h3
        className="font-semibold mb-2 line-clamp-1"
        style={{ color: "var(--color-secondary)" }}
        title={expense.description}
      >
        {expense.description}
      </h3>

      {/* Category Tag */}
      <span
        className="inline-block px-2.5 py-1 text-xs font-medium rounded-full mb-4 w-fit"
        style={{
          backgroundColor: "var(--color-light)",
          color: "var(--color-secondary)",
        }}
      >
        {translateCategory(expense.category)}
      </span>

      {/* Info Footer */}
      <div
        className="flex items-center justify-between pt-4 mt-auto"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <div
          className="flex flex-col gap-1 text-xs"
          style={{ color: "var(--color-muted)" }}
        >
          <div className="flex items-center gap-1.5">
            <Calendar size={12} />
            <span>
              {new Date(expense.date).toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "short",
                day: "numeric",
                calendar: "gregory",
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <User size={12} />
            <span>
              {expense.createdBy ? expense.createdBy.name : "مستخدم محذوف"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* View Details Button */}
          <button
            onClick={() => onViewDetails && onViewDetails(expense)}
            className="p-2 rounded-lg transition-colors cursor-pointer"
            style={{ color: "var(--color-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--color-primary)";
              e.currentTarget.style.backgroundColor = "var(--color-light)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--color-muted)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            title="عرض التفاصيل"
          >
            <Eye size={18} />
          </button>

          {/* Delete Button */}
          {isAdmin && (
            <button
              onClick={() => onDelete(expense._id)}
              className="p-2 rounded-lg transition-colors cursor-pointer"
              style={{ color: "var(--color-muted)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--color-error)";
                e.currentTarget.style.backgroundColor =
                  "var(--color-status-rejected-bg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--color-muted)";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              title="امسح"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
