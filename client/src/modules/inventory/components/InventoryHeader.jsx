import { Boxes, Plus } from "lucide-react";

export default function InventoryHeader({ totalItems, urgentCount, onAddItem, canAddItem = true }) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-ios-border bg-ios-surface p-6 shadow-sm dark:border-white/8 dark:bg-[#16161c] dark:shadow-[0_24px_60px_rgba(0,0,0,0.26)] sm:p-8">

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-ios-primary/15 bg-ios-primary/8 px-4 py-2 text-sm font-semibold text-ios-primary dark:border-ios-primary/30 dark:bg-black/20 dark:text-[#ffd65a]">
            <Boxes className="h-4 w-4" />
            متابعة مستلزمات البيت
          </div>

          <h1 className="text-3xl font-black tracking-tight text-ios-dark dark:text-white sm:text-4xl">
            المخزون
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-ios-secondary dark:text-slate-200 sm:text-lg">
            راقب الكميات، التقط الأصناف الناقصة بسرعة، وخلي قرارات الشراء أوضح لكل أفراد البيت.
          </p>

          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            <span className="rounded-full bg-white/80 px-4 py-2 text-ios-dark shadow-sm dark:bg-white/10 dark:text-white dark:shadow-none">
              {totalItems} صنف مسجّل
            </span>
            <span className="rounded-full bg-amber-50 px-4 py-2 text-amber-700 shadow-sm dark:bg-amber-300/12 dark:text-amber-100 dark:shadow-none">
              {urgentCount} صنف يحتاج متابعة
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-start lg:justify-end">
          <button
            type="button"
            onClick={onAddItem}
            disabled={!canAddItem}
            className="inline-flex cursor-pointer items-center gap-2 rounded-[24px] bg-ios-primary px-5 py-3.5 text-base font-bold text-white shadow-lg shadow-ios-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none"
          >
            <Plus className="h-5 w-5" />
            إضافة صنف
          </button>
        </div>
      </div>
    </section>
  );
}
