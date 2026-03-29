import { useToast } from "../../../shared/context/ToastContext";

const INVENTORY_TOAST_MESSAGES = {
  createSuccess: "تمت إضافة الصنف بنجاح.",
  createError: "فشل إضافة الصنف.",
  updateSuccess: "تم تحديث بيانات الصنف.",
  updateError: "فشل تحديث الصنف.",
  decreaseSuccess: "تم تقليل الكمية من المخزون.",
  decreaseError: "فشل تقليل الكمية.",
  restockSuccess: "تمت إعادة تعبئة الصنف.",
  restockError: "فشل تحديث الكمية.",
  deleteSuccess: "تم حذف الصنف من المخزون.",
  deleteError: "فشل حذف الصنف.",
};

export function useInventoryMutationActions({
  createItem,
  updateItem,
  adjustItem,
  deleteItem,
  closeAddModal,
  closeEditModal,
  closeRestockModal,
  closeDeleteModal,
}) {
  const toast = useToast();

  const showToastAfterModalClose = (callback) => {
    window.setTimeout(callback, 0);
  };

  const runInventoryAction = async ({
    action,
    onSuccess,
    successMessage,
    errorMessage,
    showErrorToast = false,
  }) => {
    try {
      await action();
      onSuccess?.();
      showToastAfterModalClose(() => {
        toast.success(successMessage);
      });
      return true;
    } catch {
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      return false;
    }
  };

  return {
    createItem: (payload) =>
      runInventoryAction({
        action: () => createItem(payload),
        onSuccess: closeAddModal,
        successMessage: INVENTORY_TOAST_MESSAGES.createSuccess,
        errorMessage: INVENTORY_TOAST_MESSAGES.createError,
        showErrorToast: false,
      }),
    updateItem: (payload) =>
      runInventoryAction({
        action: () => updateItem(payload),
        onSuccess: closeEditModal,
        successMessage: INVENTORY_TOAST_MESSAGES.updateSuccess,
        errorMessage: INVENTORY_TOAST_MESSAGES.updateError,
        showErrorToast: false,
      }),
    decreaseItem: (payload) =>
      runInventoryAction({
        action: () => adjustItem(payload),
        successMessage: INVENTORY_TOAST_MESSAGES.decreaseSuccess,
        errorMessage: INVENTORY_TOAST_MESSAGES.decreaseError,
        showErrorToast: true,
      }),
    restockItem: (payload) =>
      runInventoryAction({
        action: () => adjustItem(payload),
        onSuccess: closeRestockModal,
        successMessage: INVENTORY_TOAST_MESSAGES.restockSuccess,
        errorMessage: INVENTORY_TOAST_MESSAGES.restockError,
        showErrorToast: false,
      }),
    deleteItem: (id) => {
      if (!id) {
        return Promise.resolve(false);
      }

      return runInventoryAction({
        action: () => deleteItem(id),
        onSuccess: closeDeleteModal,
        successMessage: INVENTORY_TOAST_MESSAGES.deleteSuccess,
        errorMessage: INVENTORY_TOAST_MESSAGES.deleteError,
        showErrorToast: false,
      });
    },
  };
}
