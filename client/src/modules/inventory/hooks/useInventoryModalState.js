import { useMemo, useState } from "react";

const EMPTY_MODAL = { type: null, itemId: null, seedItem: null };

const resolveSelectedItem = (items, itemId, seedItem) =>
  items.find((item) => item._id === itemId) ?? seedItem ?? null;

export function useInventoryModalState(items) {
  const [activeModal, setActiveModal] = useState(EMPTY_MODAL);

  const selectedItem = useMemo(
    () => resolveSelectedItem(items, activeModal.itemId, activeModal.seedItem),
    [activeModal.itemId, activeModal.seedItem, items],
  );

  const openAddModal = () => {
    setActiveModal({ type: "add", itemId: null, seedItem: null });
  };

  const openItemModal = (type) => ({ id, seedItem = null }) => {
    setActiveModal({ type, itemId: id, seedItem });
  };

  const closeModal = () => {
    setActiveModal(EMPTY_MODAL);
  };

  return {
    currentItem: selectedItem,
    isAddOpen: activeModal.type === "add",
    isEditOpen: activeModal.type === "edit" && Boolean(selectedItem),
    isRestockOpen: activeModal.type === "restock" && Boolean(selectedItem),
    isDeleteOpen: activeModal.type === "delete" && Boolean(selectedItem),
    openAddModal,
    closeAddModal: closeModal,
    openEditModalForItem: (item) => openItemModal("edit")({ id: item?._id, seedItem: item }),
    closeEditModal: closeModal,
    openRestockModalForItem: (item) =>
      openItemModal("restock")({ id: item?._id, seedItem: item }),
    closeRestockModal: closeModal,
    openDeleteModalForItem: (item) =>
      openItemModal("delete")({ id: item?._id, seedItem: item }),
    closeDeleteModal: closeModal,
  };
}
