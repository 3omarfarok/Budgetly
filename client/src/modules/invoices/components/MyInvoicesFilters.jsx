import { Search, ArrowUpDown } from "lucide-react";

const statusFilterLabelsByTab = {
  invoices: {
    all: "الكل",
    pending: "مطلوب سداده",
    awaiting_approval: "في انتظار الموافقة",
    paid: "تم الدفع",
  },
  requests: {
    all: "الكل",
    pending: "قيد المراجعة",
    approved: "تمت الموافقة",
    rejected: "مرفوض",
  },
};

const filterOptionsByTab = {
  invoices: ["all", "pending", "awaiting_approval", "paid"],
  requests: ["all", "pending", "approved", "rejected"],
};

export default function MyInvoicesFilters({
  activeTab,
  onTabChange,
  filterStatus,
  onFilterChange,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
}) {
  const statusFilterLabels = statusFilterLabelsByTab[activeTab];
  const filterOptions = filterOptionsByTab[activeTab];

  return (
    <>
      <div className="flex bg-(--color-surface) p-1 rounded-xl border border-(--color-border) w-fit">
        <button
          onClick={() => onTabChange("invoices")}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === "invoices"
              ? "bg-(--color-primary) text-white shadow-sm"
              : "text-(--color-secondary) hover:bg-(--color-hover)"
          }`}
        >
          فواتيري
        </button>
        <button
          onClick={() => onTabChange("requests")}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === "requests"
              ? "bg-(--color-primary) text-white shadow-sm"
              : "text-(--color-secondary) hover:bg-(--color-hover)"
          }`}
        >
          طلباتي
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-(--color-surface) p-4 rounded-xl shadow-sm border border-(--color-border)">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={
              activeTab === "invoices" ? "ابحث في الفواتير..." : "ابحث في الطلبات..."
            }
            className="w-full pr-10 pl-4 py-2 bg-(--color-bg) border border-(--color-border) rounded-lg focus:ring-2 focus:ring-(--color-primary) focus:border-transparent outline-none transition-all text-(--color-dark)"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none pl-8 pr-4 py-2 bg-(--color-bg) border border-(--color-border) rounded-lg focus:ring-2 focus:ring-(--color-primary) focus:border-transparent outline-none transition-all text-(--color-dark) cursor-pointer min-w-[160px]"
          >
            <option value="date_desc">الأحدث أولاً</option>
            <option value="date_asc">الأقدم أولاً</option>
            <option value="amount_desc">المبلغ: الأعلى</option>
            <option value="amount_asc">المبلغ: الأقل</option>
            <option value="status">الحالة</option>
          </select>
          <ArrowUpDown
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            size={16}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {filterOptions.map((status) => (
            <button
              key={status}
              onClick={() => onFilterChange(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterStatus === status
                  ? "bg-(--color-primary) text-white"
                  : "bg-(--color-bg) text-(--color-secondary) hover:bg-(--color-hover)"
              }`}
            >
              {statusFilterLabels[status]}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
