import { useCallback, useId, useState } from "react";
import { PlusCircle } from "lucide-react";
import { Input } from "../../../shared/components";
import InventoryModalActions from "./InventoryModalActions";
import InventoryModalShell from "./InventoryModalShell";
import InventoryModalStatusMessage from "./InventoryModalStatusMessage";
import { useInventoryModalFeedback, useResetOnModalOpen } from "../hooks";

export default function RestockInventoryModal({
  isOpen,
  item,
  onClose,
  onSubmit,
  isSubmitting,
}) {
  const fieldIdPrefix = useId();
  const [amount, setAmount] = useState("");
  const [fieldError, setFieldError] = useState("");
  const resetRestockState = useCallback(() => {
    setAmount("");
    setFieldError("");
  }, []);
  const { submitError, clearSubmitError, runWithSubmitFeedback, handleClose } =
    useInventoryModalFeedback({
      isOpen,
      isSubmitting,
      onClose,
      onReset: resetRestockState,
      submitErrorMessage: "فشل تحديث الكمية.",
    });

  useResetOnModalOpen({
    isOpen,
    itemId: item?._id ?? null,
    onReset: resetRestockState,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!item?._id) {
      return;
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFieldError("اكتب كمية صحيحة أكبر من صفر.");
      document.getElementById(`${fieldIdPrefix}-amount`)?.focus();
      return;
    }

    await runWithSubmitFeedback(() =>
      onSubmit({
        id: item._id,
        action: "increment",
        amount: numericAmount,
      }),
    );
  };

  return (
    <InventoryModalShell
      isOpen={isOpen && Boolean(item)}
      onClose={handleClose}
      title="إعادة تعبئة الصنف"
      description={
        item
          ? `أضف كمية جديدة إلى ${item.name} بدون تعديل بياناته الأساسية.`
          : ""
      }
      icon={<PlusCircle className="h-5 w-5" />}
      iconClassName="bg-emerald-500/10 text-emerald-600"
      maxWidthClassName="max-w-xl"
      isBusy={isSubmitting}
    >
      <form className="p-6" onSubmit={handleSubmit} noValidate>
        <div className="mb-4 rounded-2xl border border-ios-border bg-ios-light/70 px-4 py-3 text-sm text-ios-secondary">
          الكمية الحالية: <span className="font-bold text-ios-dark">{item?.quantity} {item?.unit}</span>
        </div>

        <Input
          id={`${fieldIdPrefix}-amount`}
          label="كمية الإضافة"
          type="number"
          min="1"
          placeholder={item ? `أدخل عدد ${item.unit}` : ""}
          value={amount}
          onChange={(event) => {
            setAmount(event.target.value);
            setFieldError("");
            clearSubmitError();
          }}
          error={fieldError || undefined}
          aria-invalid={Boolean(fieldError)}
          aria-describedby={fieldError ? `${fieldIdPrefix}-amount-error` : undefined}
          required
        />
        {fieldError ? (
          <p
            id={`${fieldIdPrefix}-amount-error`}
            role="alert"
            aria-live="assertive"
            className="mt-1.5 text-xs text-ios-error"
          >
            {fieldError}
          </p>
        ) : null}

        <InventoryModalStatusMessage message={submitError} />

        <InventoryModalActions
          onCancel={handleClose}
          isSubmitting={isSubmitting}
          submitLabel="تأكيد الإضافة"
          submittingLabel="جاري التحديث..."
          submitClassName="bg-emerald-600"
        />
      </form>
    </InventoryModalShell>
  );
}
