import { Archive, Loader2, Minus, Pencil, Plus, Trash2, TriangleAlert } from "lucide-react";
import {
  CATEGORY_LABELS,
  STATUS_META,
  formatInventoryUpdatedAt,
  formatQuantityLabel,
} from "../constants";

export default function InventoryTable({
  items,
  onEdit,
  onDecrease,
  adjustingItemId = null,
  onRestock,
  onDelete,
}) {
  return (
    <div className="overflow-x-auto rounded-[28px] border border-ios-border bg-ios-surface shadow-sm dark:border-white/8">
        <table className="min-w-[980px] w-full border-collapse text-right text-ios-dark dark:text-white" dir="rtl">
          <thead className="bg-ios-light/60 dark:bg-white/5">
            <tr>
              {[
                "الصنف",
                "التصنيف",
                "الحالة",
                "الكمية الحالية",
                "حد التنبيه",
                "آخر تحديث",
                "الإجراءات",
              ].map((label) => (
                <th
                  key={label}
                  scope="col"
                  className="px-4 py-4 text-xs font-black tracking-wide text-ios-secondary dark:text-slate-300"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-ios-border dark:divide-white/8">
            {items.map((item) => {
              const statusMeta = STATUS_META[item.status] ?? STATUS_META.healthy;
              const categoryLabel = CATEGORY_LABELS[item.category] ?? CATEGORY_LABELS.other;
              const isUrgent = item.status === "low" || item.status === "out";
              const isAdjustingRow = adjustingItemId === item._id;
              const isDecreaseDisabled = isAdjustingRow || item.quantity <= 0;
              const rowClassName =
                item.status === "out"
                  ? "bg-rose-500/6 dark:bg-rose-500/10"
                  : item.status === "low"
                    ? "bg-amber-400/6 dark:bg-amber-400/10"
                    : "bg-transparent";

              return (
                <tr key={item._id} className={`${rowClassName} transition-colors hover:bg-ios-light/70 dark:hover:bg-white/4`}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${statusMeta.surfaceClassName}`}>
                        {isUrgent ? (
                          <TriangleAlert className={`h-4 w-4 ${statusMeta.accentClassName}`} />
                        ) : (
                          <Archive className={`h-4 w-4 ${statusMeta.accentClassName}`} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-ios-dark dark:text-white" title={item.name}>
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs text-ios-secondary dark:text-slate-300">
                          حدّثه {item.updatedBy?.name || item.createdBy?.name || "عضو من البيت"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm font-semibold text-ios-secondary dark:text-slate-200">
                    {categoryLabel}
                  </td>

                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.badgeClassName}`}>
                      {isUrgent ? <TriangleAlert className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                      {statusMeta.label}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-sm font-bold text-ios-dark dark:text-white">
                    {formatQuantityLabel(item.quantity, item.unit)}
                  </td>

                  <td className="px-4 py-4 text-sm font-semibold text-ios-secondary dark:text-slate-200">
                    {formatQuantityLabel(item.lowStockThreshold, item.unit)}
                  </td>

                  <td className="px-4 py-4 text-sm text-ios-secondary dark:text-slate-300">
                    {formatInventoryUpdatedAt(item.updatedAt)}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onDecrease({ id: item._id, action: "decrement", amount: 1 })}
                        disabled={isDecreaseDisabled}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-ios-border bg-ios-light/70 px-3 py-2 text-xs font-bold text-ios-dark transition-colors hover:bg-ios-light disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/6 dark:text-white dark:hover:bg-white/10"
                        aria-label={`خصم قطعة واحدة من ${item.name}`}
                        title="خصم قطعة واحدة"
                      >
                        {isAdjustingRow ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Minus className="h-3.5 w-3.5" />
                        )}
                        {isAdjustingRow ? "جاري الخصم..." : "خصم 1"}
                      </button>

                      <button
                        type="button"
                        onClick={() => onRestock(item)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-ios-primary px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
                        aria-label={`إعادة تعبئة ${item.name}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        إعادة تعبئة
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="rounded-xl border border-ios-border p-2 text-ios-secondary transition-colors hover:bg-ios-light hover:text-ios-primary dark:border-white/10 dark:hover:bg-white/8"
                        aria-label={`تعديل ${item.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="rounded-xl border border-rose-200 p-2 text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-300/30 dark:bg-rose-500/10 dark:text-rose-100 dark:hover:bg-rose-500/18"
                        aria-label={`حذف ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
    </div>
  );
}
