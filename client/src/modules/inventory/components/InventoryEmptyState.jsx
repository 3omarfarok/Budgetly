import { FilterX, PackagePlus } from "lucide-react";

const EMPTY_STATE_COPY = {
  base: {
    icon: PackagePlus,
    title: "لسه مفيش أصناف في المخزون",
    description: "ابدأ بإضافة أول صنف عشان تتابع احتياجات البيت وتعرف إمتى الوقت المناسب لإعادة الشراء.",
    primaryLabel: "إضافة صنف",
  },
  filtered: {
    icon: FilterX,
    title: "مفيش نتائج مطابقة",
    description: "جرّب تغيّر كلمة البحث أو التصنيف أو الحالة، أو ارجع للفلاتر الافتراضية وشوف كل الأصناف.",
    primaryLabel: "إعادة ضبط الفلاتر",
  },
  error: {
    icon: FilterX,
    title: "تعذر تحميل الأصناف",
    description: "حصلت مشكلة أثناء تحميل قائمة المخزون. جرّب التحديث مرة ثانية أو حاول لاحقًا.",
    primaryLabel: "إعادة المحاولة",
  },
  unavailable: {
    icon: PackagePlus,
    title: "المخزون غير متاح حالياً",
    description: "لا يمكن تحميل بيانات المخزون لأن معلومات البيت غير متوفرة في الجلسة الحالية.",
    primaryLabel: null,
  },
};

export default function InventoryEmptyState({
  variant = "base",
  onPrimaryAction,
  isPrimaryActionDisabled = false,
}) {
  const state = EMPTY_STATE_COPY[variant] ?? EMPTY_STATE_COPY.base;
  const Icon = state.icon;

  return (
    <div className="rounded-[28px] border border-dashed border-ios-border bg-ios-surface p-8 text-center shadow-sm sm:p-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-ios-primary/10 text-ios-primary">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-5 text-2xl font-black text-ios-dark">{state.title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ios-secondary sm:text-base">
        {state.description}
      </p>

      {state.primaryLabel ? (
        <button
          type="button"
          onClick={onPrimaryAction}
          disabled={isPrimaryActionDisabled}
          className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-2xl bg-ios-primary px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.primaryLabel}
        </button>
      ) : null}
    </div>
  );
}
