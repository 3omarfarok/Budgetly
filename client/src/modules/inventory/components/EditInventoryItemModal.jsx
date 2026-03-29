import { useId } from "react";
import { PackageCheck } from "lucide-react";
import InventoryModalActions from "./InventoryModalActions";
import InventoryItemFormFields from "./InventoryItemFormFields";
import InventoryModalShell from "./InventoryModalShell";
import InventoryModalStatusMessage from "./InventoryModalStatusMessage";
import { useInventoryItemForm, useInventoryModalFeedback } from "../hooks";

export default function EditInventoryItemModal({
  isOpen,
  item,
  onClose,
  onSubmit,
  isSubmitting,
}) {
  const fieldIdPrefix = useId();
  const {
    formValues,
    fieldErrors,
    handleChange,
    validateForm,
    focusFirstInvalidField,
  } = useInventoryItemForm({
    isOpen,
    item,
  });
  const { submitError, clearSubmitError, runWithSubmitFeedback, handleClose } =
    useInventoryModalFeedback({
      isOpen,
      isSubmitting,
      onClose,
      submitErrorMessage: "فشل تحديث الصنف.",
    });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!item?._id) {
      return;
    }

    if (!validateForm()) {
      focusFirstInvalidField(fieldIdPrefix);
      return;
    }

    await runWithSubmitFeedback(() =>
      onSubmit({
        id: item._id,
        name: formValues.name.trim(),
        category: formValues.category,
        unit: formValues.unit.trim(),
        lowStockThreshold: Number(formValues.lowStockThreshold),
      }),
    );
  };

  return (
    <InventoryModalShell
      isOpen={isOpen && Boolean(item)}
      onClose={handleClose}
      title="تعديل بيانات الصنف"
      description="حدّث اسم الصنف أو التصنيف أو وحدة القياس وحد التنبيه بدون تغيير الكمية الحالية."
      icon={<PackageCheck className="h-5 w-5" />}
      isBusy={isSubmitting}
    >
      <form className="p-6" onSubmit={handleSubmit} noValidate>
        <InventoryItemFormFields
          idPrefix={fieldIdPrefix}
          values={formValues}
          onChange={(field, value) => {
            clearSubmitError();
            handleChange(field, value);
          }}
          errors={fieldErrors}
        />

        <div className="mt-4 rounded-2xl border border-ios-border bg-ios-light/70 px-4 py-3 text-sm text-ios-secondary">
          الكمية الحالية: <span className="font-bold text-ios-dark">{item?.quantity} {item?.unit}</span>
        </div>

        <InventoryModalStatusMessage message={submitError} />

        <InventoryModalActions
          onCancel={handleClose}
          isSubmitting={isSubmitting}
          submitLabel="حفظ التعديلات"
          submittingLabel="جاري الحفظ..."
        />
      </form>
    </InventoryModalShell>
  );
}
