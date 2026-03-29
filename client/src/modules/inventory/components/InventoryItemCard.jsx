import {
  Archive,
  Loader2,
  Minus,
  Pencil,
  Plus,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import {
  CATEGORY_LABELS,
  STATUS_META,
  formatInventoryUpdatedAt,
  formatQuantityLabel,
} from "../constants";

export default function InventoryItemCard({
  item,
  onEdit,
  onDecrease,
  adjustingItemId = null,
  onRestock,
  onDelete,
}) {
  const statusMeta = STATUS_META[item.status] ?? STATUS_META.healthy;
  const categoryLabel = CATEGORY_LABELS[item.category] ?? CATEGORY_LABELS.other;
  const isUrgent = item.status === "low" || item.status === "out";
  const isAdjustingRow = adjustingItemId === item._id;
  const isDecreaseDisabled = isAdjustingRow || item.quantity <= 0;
  const statusMessage =
    item.status === "out"
      ? "الصنف خلص تمامًا ويحتاج إعادة تعبئة فورًا."
      : item.status === "low"
        ? "الكمية قربت تخلص، الأفضل تعيد التخزين قريب."
        : null;

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-ios-primary/40 to-transparent" />

      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-ios-light px-3 py-1 text-xs font-semibold text-ios-secondary">
              {categoryLabel}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.badgeClassName}`}
            >
              {isUrgent ? (
                <TriangleAlert className="h-3.5 w-3.5" />
              ) : (
                <Archive className="h-3.5 w-3.5" />
              )}
              {statusMeta.label}
            </span>
          </div>

          <h3
            className="truncate text-lg font-bold text-ios-dark"
            title={item.name}
          >
            {item.name}
          </h3>
          <p className="mt-1 text-sm text-ios-secondary">
            آخر تحديث {formatInventoryUpdatedAt(item.updatedAt)}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${statusMeta.surfaceClassName}`}
        >
          <Archive className={`h-5 w-5 ${statusMeta.accentClassName}`} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-ios-light/80 p-4">
          <p className="mb-1 text-xs font-semibold text-ios-secondary">
            الكمية الحالية
          </p>
          <p className="text-xl font-bold text-ios-dark">
            {formatQuantityLabel(item.quantity, item.unit)}
          </p>
        </div>

        <div className="rounded-2xl bg-ios-light/80 p-4">
          <p className="mb-1 text-xs font-semibold text-ios-secondary">
            حد التنبيه
          </p>
          <p className="text-xl font-bold text-ios-dark">
            {formatQuantityLabel(item.lowStockThreshold, item.unit)}
          </p>
        </div>
      </div>

      {statusMessage ? (
        <div className="mt-4 rounded-2xl border border-dashed border-ios-border/80 bg-ios-bg/70 px-4 py-3 text-sm text-ios-secondary">
          {statusMessage}
        </div>
      ) : null}

      <div className="mt-4 border-t border-ios-border pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-ios-secondary">
            حدّثه{" "}
            {item.updatedBy?.name || item.createdBy?.name || "عضو من البيت"}
          </div>
        </div>

        <div className="mt-3  p-2 backdrop-blur-sm  ">
          <div className="flex flex-wrap items-center gap-2">
            <div className="grid min-w-[220px] flex-1 grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  onDecrease({ id: item._id, action: "decrement", amount: 1 })
                }
                disabled={isDecreaseDisabled}
                className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-ios-border bg-ios-surface px-3 text-sm font-bold text-ios-dark transition-all duration-200 hover:border-ios-primary/25 hover:bg-ios-light disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
                aria-label={`خصم قطعة واحدة من ${item.name}`}
                title="خصم قطعة واحدة"
              >
                {isAdjustingRow ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                ) : (
                  <Minus className="h-4 w-4 shrink-0" />
                )}
                <span>{isAdjustingRow ? "جاري الخصم..." : "خصم 1"}</span>
              </button>

              <button
                type="button"
                onClick={() => onRestock(item)}
                className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-ios-primary px-3 text-sm font-bold text-white shadow-lg shadow-ios-primary/15 transition-all duration-200 hover:-translate-y-0.5 hover:opacity-92"
                aria-label={`إعادة تعبئة ${item.name}`}
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span>إعادة تعبئة</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-ios-border bg-ios-surface text-ios-secondary transition-all duration-200 hover:border-ios-primary/25 hover:bg-ios-light hover:text-ios-primary dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
                aria-label={`تعديل ${item.name}`}
              >
                <Pencil className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => onDelete(item)}
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-200/80 bg-rose-50/70 text-rose-600 transition-all duration-200 hover:border-rose-300 hover:bg-rose-100/70 dark:border-rose-300/25 dark:bg-rose-500/10 dark:text-rose-100 dark:hover:bg-rose-500/18"
                aria-label={`حذف ${item.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
