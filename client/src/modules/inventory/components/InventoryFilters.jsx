import { RotateCcw, Search, SlidersHorizontal, Tag } from "lucide-react";
import { Input, Select } from "../../../shared/components";
import { CATEGORY_OPTIONS } from "../constants";

export default function InventoryFilters({
  filters,
  statusOptions,
  hasActiveFilters,
  itemCount,
  isFilterSyncing = false,
  onChange,
  onReset,
}) {
  return (
    <section className="rounded-[28px] border border-ios-border bg-ios-surface p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-ios-dark">
            <SlidersHorizontal className="h-5 w-5 text-ios-primary" />
            فلترة المخزون
          </h2>
          <p className="mt-1 text-sm text-ios-secondary" aria-live="polite">
            {isFilterSyncing
              ? "جاري تحديث النتائج حسب البحث..."
              : `${itemCount} نتيجة مطابقة للبحث الحالي`}
          </p>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex cursor-pointer items-center gap-2 self-start rounded-2xl border border-ios-border px-4 py-2 text-sm font-semibold text-ios-secondary transition-colors hover:bg-ios-light hover:text-ios-dark"
          >
            <RotateCcw className="h-4 w-4" />
            إعادة ضبط الفلاتر
          </button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(220px,0.8fr)_minmax(220px,0.8fr)]">
        <Input
          id="inventory-filters-search"
          name="inventorySearch"
          label="ابحث عن صنف"
          placeholder="مثلاً: سائل غسيل أو مناديل مطبخ"
          value={filters.search}
          onChange={(event) => onChange({ search: event.target.value })}
          icon={Search}
        />

        <Select
          id="inventory-filters-category"
          name="inventoryCategory"
          label="التصنيف"
          value={filters.category}
          onChange={(event) => onChange({ category: event.target.value })}
          icon={Tag}
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Select
          id="inventory-filters-status"
          name="inventoryStatus"
          label="الحالة"
          value={filters.statusLabel}
          onChange={(event) => onChange({ statusLabel: event.target.value })}
          icon={SlidersHorizontal}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
      </div>
    </section>
  );
}
