import { Link } from "react-router-dom";
import { PlusCircle, Filter } from "lucide-react";

export default function ExpensesHeader({
  showFilters,
  hasActiveFilters,
  onToggleFilters,
  isAdmin,
}) {
  return (
    <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">المصاريف</h1>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleFilters}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all duration-200 font-medium shadow-sm hover:shadow-md ${
            showFilters || hasActiveFilters
              ? "bg-(--color-primary) text-white"
              : "bg-white dark:bg-[#1C1C1E] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
          style={
            showFilters || hasActiveFilters
              ? { backgroundColor: "var(--color-primary)" }
              : {}
          }
        >
          <Filter size={18} />
          <span>فلترة</span>
          {hasActiveFilters && (
            <span className="flex items-center justify-center w-5 h-5 bg-white/20 rounded-full text-xs">
              !
            </span>
          )}
        </button>

        {isAdmin && (
          <Link
            to="/add-expense"
            className="flex items-center gap-2 px-4 py-2.5 bg-(--color-primary) text-white rounded-2xl hover:bg-(--color-primary)/80 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
          >
            <PlusCircle size={20} />
            <span>سجّل مصروف جديد</span>
          </Link>
        )}
      </div>
    </div>
  );
}
