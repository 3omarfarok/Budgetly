import { useMemo } from "react";
import { DEFAULT_INVENTORY_FILTERS } from "../api/inventoryFilters";
import { useInventory } from "./useInventory";
import { useInventoryModalState } from "./useInventoryModalState";
import { useInventoryMutationActions } from "./useInventoryMutationActions";

export function useInventoryPageController() {
  const inventory = useInventory();
  const modalController = useInventoryModalState(inventory.items);

  const hasActiveFilters = useMemo(
    () =>
      inventory.filters.search !== DEFAULT_INVENTORY_FILTERS.search ||
      inventory.filters.category !== DEFAULT_INVENTORY_FILTERS.category ||
      inventory.filters.statusLabel !== DEFAULT_INVENTORY_FILTERS.statusLabel,
    [inventory.filters.category, inventory.filters.search, inventory.filters.statusLabel],
  );

  const visibleUrgentCount = useMemo(
    () => inventory.items.filter((item) => item.status === "low" || item.status === "out").length,
    [inventory.items],
  );
  const urgentCount = inventory.summaryError
    ? visibleUrgentCount
    : (inventory.summary?.lowStockCount ?? 0) + (inventory.summary?.outOfStockCount ?? 0);

  const updateFilters = (partialFilters) => {
    inventory.setFilters((current) => ({ ...current, ...partialFilters }));
  };

  const resetFilters = () => {
    inventory.setFilters(DEFAULT_INVENTORY_FILTERS);
  };
  const mutationActions = useInventoryMutationActions({
    createItem: inventory.createItem,
    updateItem: inventory.updateItem,
    adjustItem: inventory.adjustItem,
    deleteItem: inventory.deleteItem,
    closeAddModal: modalController.closeAddModal,
    closeEditModal: modalController.closeEditModal,
    closeRestockModal: modalController.closeRestockModal,
    closeDeleteModal: modalController.closeDeleteModal,
  });

  return {
    view: {
      houseId: inventory.houseId,
      items: inventory.items,
      summary: inventory.summary,
      isSummaryLoading: inventory.isSummaryLoading,
      statusOptions: inventory.statusOptions,
      urgentCount,
      hasActiveFilters,
      canAddItem: Boolean(inventory.houseId),
    },
    queryState: {
      isLoading: inventory.isLoading,
      isFetching: inventory.isFetching,
      itemsError: inventory.itemsError,
      summaryError: inventory.summaryError,
      refreshInventory: inventory.refreshInventory,
    },
    filterControls: {
      filters: inventory.filters,
      isFilterSyncing: inventory.isFilterSyncing,
      updateFilters,
      resetFilters,
    },
    modalState: {
      isAddOpen: modalController.isAddOpen,
      isEditOpen: modalController.isEditOpen,
      isRestockOpen: modalController.isRestockOpen,
      isDeleteOpen: modalController.isDeleteOpen,
      selectedEditItem: modalController.isEditOpen ? modalController.currentItem : null,
      selectedRestockItem: modalController.isRestockOpen ? modalController.currentItem : null,
      selectedDeleteItem: modalController.isDeleteOpen ? modalController.currentItem : null,
      openAddModal: modalController.openAddModal,
      closeAddModal: modalController.closeAddModal,
      openEditModalForItem: modalController.openEditModalForItem,
      closeEditModal: modalController.closeEditModal,
      openRestockModalForItem: modalController.openRestockModalForItem,
      closeRestockModal: modalController.closeRestockModal,
      openDeleteModalForItem: modalController.openDeleteModalForItem,
      closeDeleteModal: modalController.closeDeleteModal,
    },
    mutationState: {
      isCreating: inventory.isCreating,
      isUpdating: inventory.isUpdating,
      isAdjusting: inventory.isAdjusting,
      adjustingItemId: inventory.adjustingItemId,
      isDeleting: inventory.isDeleting,
    },
    actions: mutationActions,
  };
}
