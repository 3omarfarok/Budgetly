export const CATEGORY_LABELS = {
  cleaning: "تنظيف",
  kitchen: "المطبخ",
  bathroom: "الحمام",
  laundry: "الغسيل",
  other: "أخرى",
};

export const CATEGORY_OPTIONS = [
  { value: "all", label: "كل التصنيفات" },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
];

export const STATUS_META = {
  healthy: {
    label: "متوفر",
    badgeClassName:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/18 dark:text-emerald-100 dark:border-emerald-400/30",
    accentClassName: "text-emerald-600",
    surfaceClassName: "bg-emerald-500/10",
  },
  low: {
    label: "كمية قليلة",
    badgeClassName:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-400/18 dark:text-amber-100 dark:border-amber-300/30",
    accentClassName: "text-amber-600",
    surfaceClassName: "bg-amber-500/10",
  },
  out: {
    label: "غير متوفر",
    badgeClassName:
      "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/18 dark:text-rose-100 dark:border-rose-300/30",
    accentClassName: "text-rose-600",
    surfaceClassName: "bg-rose-500/10",
  },
};

export const formatQuantityLabel = (quantity, unit) => `${quantity} ${unit}`;

export const formatInventoryUpdatedAt = (value) => {
  if (!value) {
    return "غير محدد";
  }

  return new Date(value).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    calendar: "gregory",
  });
};
