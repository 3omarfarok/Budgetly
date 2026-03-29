import { useId } from "react";
import { PackagePlus } from "lucide-react";
import InventoryModalActions from "./InventoryModalActions";
import InventoryItemFormFields from "./InventoryItemFormFields";
import InventoryModalShell from "./InventoryModalShell";
import InventoryModalStatusMessage from "./InventoryModalStatusMessage";
import { useInventoryItemForm, useInventoryModalFeedback } from "../hooks";

export default function AddInventoryItemModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const fieldIdPrefix = useId();
  const {
    formValues,
    fieldErrors,
    handleChange,
    resetForm,
    validateForm,
    focusFirstInvalidField,
  } = useInventoryItemForm({
    isOpen,
    includeQuantity: true,
  });
  const { submitError, clearSubmitError, runWithSubmitFeedback, handleClose } =
    useInventoryModalFeedback({
      isOpen,
      isSubmitting,
      onClose,
      onReset: resetForm,
      submitErrorMessage: "فشل إضافة الصنف.",
    });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      focusFirstInvalidField(fieldIdPrefix);
      return;
    }

    const didSucceed = await runWithSubmitFeedback(() =>
      onSubmit({
        name: formValues.name.trim(),
        category: formValues.category,
        quantity: Number(formValues.quantity),
        unit: formValues.unit.trim(),
        lowStockThreshold: Number(formValues.lowStockThreshold),
      }),
    );

    if (didSucceed) {
      resetForm();
    }
  };

  return (
    <InventoryModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title="إضافة صنف جديد"
      description="سجّل بيانات الصنف عشان يظهر في قائمة المخزون ويتحسب ضمن التنبيهات."
      icon={<PackagePlus className="h-5 w-5" />}
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
          includeQuantity
          errors={fieldErrors}
        />

        <InventoryModalStatusMessage message={submitError} />

        <InventoryModalActions
          onCancel={handleClose}
          isSubmitting={isSubmitting}
          submitLabel="حفظ الصنف"
          submittingLabel="جاري الإضافة..."
        />
      </form>
    </InventoryModalShell>
  );
}
