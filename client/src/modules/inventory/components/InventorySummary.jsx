import { AlertCircle, Boxes, Layers3, ShieldCheck } from "lucide-react";

const buildCards = (summary, { hasSummaryError, isSummaryLoading }) => {
  const resolvedValue = (value) => {
    if (isSummaryLoading) {
      return "...";
    }

    if (hasSummaryError) {
      return "--";
    }

    return value ?? 0;
  };

  return [
  {
    key: "totalItems",
    title: "إجمالي الأصناف",
    value: resolvedValue(summary?.totalItems),
    subtitle: "كل العناصر المضافة حاليًا",
    icon: Boxes,
    className: "from-ios-primary/12 to-transparent text-ios-primary",
  },
  {
    key: "lowStockCount",
    title: "كمية قليلة",
    value: resolvedValue(summary?.lowStockCount),
    subtitle: "أصناف تقترب من حد التنبيه",
    icon: AlertCircle,
    className: "from-amber-500/12 to-transparent text-amber-600",
  },
  {
    key: "outOfStockCount",
    title: "غير متوفر",
    value: resolvedValue(summary?.outOfStockCount),
    subtitle: "أصناف انتهت وتحتاج شراء",
    icon: ShieldCheck,
    className: "from-rose-500/12 to-transparent text-rose-600",
  },
  {
    key: "categoryCount",
    title: "التصنيفات النشطة",
    value: resolvedValue(summary?.categoryCount),
    subtitle: "تنظيم المخزون عبر البيت",
    icon: Layers3,
    className: "from-violet-500/12 to-transparent text-violet-600",
  },
  ];
};

export default function InventorySummary({
  summary,
  hasSummaryError = false,
  isSummaryLoading = false,
}) {
  const cards = buildCards(summary, { hasSummaryError, isSummaryLoading });

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="ملخص المخزون">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.key}
            className="rounded-[28px] border border-ios-border bg-ios-surface p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ios-secondary">{card.title}</p>
                <p className="mt-3 text-3xl font-black text-ios-dark">{card.value}</p>
              </div>
              <div className={`rounded-2xl bg-gradient-to-br p-3 ${card.className}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-ios-secondary">{card.subtitle}</p>
          </article>
        );
      })}
    </section>
  );
}
