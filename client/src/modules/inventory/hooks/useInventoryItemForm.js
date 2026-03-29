import { useCallback, useState } from "react";
import {
  buildInventoryItemFormValues,
  validateInventoryItemForm,
} from "../validation";
import { useResetOnModalOpen } from "./useResetOnModalOpen";

export function useInventoryItemForm({
  isOpen,
  item = null,
  includeQuantity = false,
}) {
  const [formValues, setFormValues] = useState(() => buildInventoryItemFormValues(item));
  const [fieldErrors, setFieldErrors] = useState({});
  const resetForm = useCallback(() => {
    setFormValues(buildInventoryItemFormValues(item));
    setFieldErrors({});
  }, [item]);

  useResetOnModalOpen({
    isOpen,
    itemId: item?._id ?? null,
    onReset: resetForm,
  });

  const handleChange = (field, value) => {
    setFormValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validateForm = () => {
    const validationErrors = validateInventoryItemForm(formValues, { includeQuantity });

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return false;
    }

    return true;
  };

  const focusFirstInvalidField = (idPrefix) => {
    const fieldOrder = includeQuantity
      ? ["name", "quantity", "unit", "lowStockThreshold"]
      : ["name", "unit", "lowStockThreshold"];
    const fieldSuffixByKey = {
      name: "name",
      quantity: "quantity",
      unit: "unit",
      lowStockThreshold: "threshold",
    };

    const firstInvalidField = fieldOrder.find((field) => Boolean(fieldErrors[field]));

    if (firstInvalidField) {
      document.getElementById(`${idPrefix}-${fieldSuffixByKey[firstInvalidField]}`)?.focus();
    }
  };

  return {
    formValues,
    fieldErrors,
    handleChange,
    resetForm,
    validateForm,
    focusFirstInvalidField,
  };
}
