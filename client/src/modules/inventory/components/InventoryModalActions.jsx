export default function InventoryModalActions({
  onCancel,
  isSubmitting,
  submitLabel,
  submittingLabel,
  submitClassName = "bg-ios-primary",
  disableCancelWhileSubmitting = true,
}) {
  const isCancelDisabled = disableCancelWhileSubmitting && isSubmitting;

  return (
    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        disabled={isCancelDisabled}
        className="rounded-2xl border border-ios-border px-5 py-3 text-sm font-bold text-ios-secondary transition-colors hover:bg-ios-light disabled:cursor-not-allowed disabled:opacity-60"
      >
        إلغاء
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className={`rounded-2xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 ${submitClassName}`}
      >
        {isSubmitting ? submittingLabel : submitLabel}
      </button>
    </div>
  );
}
