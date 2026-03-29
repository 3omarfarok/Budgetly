export const STATUS_DEFINITIONS = [
  { value: "all", label: "الكل", requestValue: undefined },
  { value: "healthy", label: "متوفر", requestValue: "healthy" },
  { value: "low", label: "كمية قليلة", requestValue: "low" },
  { value: "out", label: "غير متوفر", requestValue: "out" },
];

export const DEFAULT_STATUS_LABEL = STATUS_DEFINITIONS[0].label;

export const STATUS_LABEL_TO_VALUE = Object.fromEntries(
  STATUS_DEFINITIONS.map(({ label, requestValue }) => [label, requestValue]),
);

export const STATUS_VALUE_TO_LABEL = Object.fromEntries(
  STATUS_DEFINITIONS.map(({ value, label }) => [value, label]),
);

export const STATUS_OPTIONS = STATUS_DEFINITIONS.map(({ label }) => label);

export const DEFAULT_INVENTORY_FILTERS = {
  search: "",
  category: "all",
  statusLabel: DEFAULT_STATUS_LABEL,
};

export const getHouseId = (user) => {
  const rawHouseId = user?.house?._id ?? user?.house;

  return typeof rawHouseId === "string" ? rawHouseId : null;
};

export const normalizeInventoryUiFilters = (filters = {}) => {
  const search = typeof filters.search === "string" ? filters.search.trim() : "";
  const trimmedCategory = typeof filters.category === "string" ? filters.category.trim() : "";
  const normalizedCategory = trimmedCategory.toLowerCase() === "all" ? "all" : trimmedCategory;
  const category = normalizedCategory || DEFAULT_INVENTORY_FILTERS.category;
  const trimmedStatusLabel =
    typeof filters.statusLabel === "string" ? filters.statusLabel.trim() : "";
  const statusLabel =
    Object.hasOwn(STATUS_LABEL_TO_VALUE, trimmedStatusLabel)
      ? trimmedStatusLabel
      : DEFAULT_INVENTORY_FILTERS.statusLabel;

  return {
    search,
    category,
    statusLabel,
  };
};

export const areInventoryUiFiltersEqual = (leftFilters = {}, rightFilters = {}) => {
  const left = normalizeInventoryUiFilters(leftFilters);
  const right = normalizeInventoryUiFilters(rightFilters);

  return (
    left.search === right.search &&
    left.category === right.category &&
    left.statusLabel === right.statusLabel
  );
};

export const buildInventoryListRequestParams = (uiFilters = {}) => {
  const normalizedFilters = normalizeInventoryUiFilters(uiFilters);
  const status = STATUS_LABEL_TO_VALUE[normalizedFilters.statusLabel];

  return {
    ...(normalizedFilters.search ? { search: normalizedFilters.search } : {}),
    ...(normalizedFilters.category !== "all" ? { category: normalizedFilters.category } : {}),
    ...(status ? { status } : {}),
  };
};

export const buildInventoryListQueryKeyParts = (uiFilters = {}) => {
  const params = buildInventoryListRequestParams(uiFilters);

  return [params.search ?? "", params.category ?? "", params.status ?? ""];
};
