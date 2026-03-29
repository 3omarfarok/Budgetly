import { Trash2 } from "lucide-react";
import InventoryModalActions from "./InventoryModalActions";
import InventoryModalShell from "./InventoryModalShell";
import InventoryModalStatusMessage from "./InventoryModalStatusMessage";
import { useInventoryModalFeedback } from "../hooks";

export default function DeleteInventoryItemModal({
  isOpen,
  item,
  onClose,
  onSubmit,
  isSubmitting,
}) {
  const { submitError, runWithSubmitFeedback, handleClose } = useInventoryModalFeedback({
    isOpen,
    isSubmitting,
    onClose,
    submitErrorMessage: "فشل حذف الصنف.",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!item?._id) {
      return;
    }

    await runWithSubmitFeedback(() => onSubmit(item._id));
  };

  return (
    <InventoryModalShell
      isOpen={isOpen && Boolean(item)}
      onClose={handleClose}
      title="حذف الصنف"
      description={`هل تريد حذف ${item?.name || "هذا الصنف"} من المخزون؟`}
      icon={<Trash2 className="h-5 w-5" />}
      iconClassName="bg-rose-500/10 text-rose-600"
      maxWidthClassName="max-w-xl"
      isBusy={isSubmitting}
    >
      <form className="p-6" onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
          الصنف المحذوف سيختفي من قائمة المخزون والتنبيهات الحالية.
        </div>

        <InventoryModalStatusMessage message={submitError} />

        <InventoryModalActions
          onCancel={handleClose}
          isSubmitting={isSubmitting}
          submitLabel="حذف الصنف"
          submittingLabel="جاري الحذف..."
          submitClassName="bg-rose-600"
        />
      </form>
    </InventoryModalShell>
  );
}
