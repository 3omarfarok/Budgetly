export const buildInventoryItemFormValues = (item = null) => ({
  name: item?.name ?? "",
  category: item?.category ?? "cleaning",
  quantity: item?.quantity?.toString() ?? "",
  unit: item?.unit ?? "",
  lowStockThreshold: item?.lowStockThreshold?.toString() ?? "",
});

export const validateInventoryItemForm = (values, options = {}) => {
  const { includeQuantity = false } = options;
  const errors = {};

  if (!values.name.trim()) {
    errors.name = "اسم الصنف مطلوب.";
  }

  if (!values.unit.trim()) {
    errors.unit = "وحدة القياس مطلوبة.";
  }

  const threshold = Number(values.lowStockThreshold);
  if (!Number.isFinite(threshold) || threshold < 0) {
    errors.lowStockThreshold = "حد التنبيه لازم يكون رقم أكبر من أو يساوي صفر.";
  }

  if (includeQuantity) {
    const quantity = Number(values.quantity);
    if (!Number.isFinite(quantity) || quantity < 0) {
      errors.quantity = "الكمية الحالية لازم تكون رقم أكبر من أو يساوي صفر.";
    }
  }

  return errors;
};
