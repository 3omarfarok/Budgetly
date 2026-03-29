import { AlertTriangle, ArrowLeft, PackageCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Loader } from "../../../shared/components";
import { STATUS_META, formatQuantityLabel } from "../constants";
import { useLowStockWidget } from "../hooks";

export default function LowStockWidget() {
  const { houseId, summary, urgentItems, urgentCount, isLoading, error } = useLowStockWidget();

  if (!houseId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="rounded-[28px] border border-ios-border bg-ios-surface p-5 shadow-sm">
        <Loader text="بنحمّل تنبيهات المخزون..." />
      </div>
    );
  }

  if (error) {
    return (
      <section className="rounded-[28px] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 shadow-sm">
        تعذر تحميل تنبيهات المخزون الآن.
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-ios-border bg-ios-surface p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black text-ios-dark">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            تنبيهات المخزون
          </h2>
          <p className="mt-1 text-sm leading-6 text-ios-secondary">
            {summary?.urgentItems?.length
              ? `عندك ${urgentCount} صنف يحتاج متابعة.`
              : "كل الأصناف في وضع مطمئن حالياً."}
          </p>
        </div>

        <Link
          to="/inventory"
          className="inline-flex items-center gap-2 rounded-2xl bg-ios-primary px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          عرض المخزون
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      {urgentItems.length ? (
        <div className="space-y-3">
          {urgentItems.slice(0, 4).map((item) => {
            const statusMeta = STATUS_META[item.status] ?? STATUS_META.healthy;

            return (
              <div
                key={item._id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-ios-border bg-ios-light/70 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-ios-dark">{item.name}</p>
                  <p className="mt-1 text-sm text-ios-secondary">
                    {formatQuantityLabel(item.quantity, item.unit)}
                  </p>
                </div>

                <span
                  className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.badgeClassName}`}
                >
                  {statusMeta.label}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-ios-border bg-ios-bg/70 px-4 py-5 text-center text-sm text-ios-secondary">
          <PackageCheck className="mx-auto mb-3 h-6 w-6 text-emerald-600" />
          لا توجد أصناف منخفضة أو منتهية حالياً.
        </div>
      )}
    </section>
  );
}
