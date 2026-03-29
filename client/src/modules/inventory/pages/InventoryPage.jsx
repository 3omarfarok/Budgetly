import { AlertTriangle, RefreshCcw } from "lucide-react";
import { useInventoryPageController } from "../hooks";
import AddInventoryItemModal from "../components/AddInventoryItemModal";
import DeleteInventoryItemModal from "../components/DeleteInventoryItemModal";
import InventoryEmptyState from "../components/InventoryEmptyState";
import EditInventoryItemModal from "../components/EditInventoryItemModal";
import InventoryFilters from "../components/InventoryFilters";
import InventoryHeader from "../components/InventoryHeader";
import InventoryList from "../components/InventoryList";
import InventorySummary from "../components/InventorySummary";
import RestockInventoryModal from "../components/RestockInventoryModal";

export default function InventoryPage() {
  const {
    view,
    queryState,
    filterControls,
    modalState,
    mutationState,
    actions,
  } = useInventoryPageController();

  const hasError = Boolean(queryState.itemsError || queryState.summaryError);

  if (!view.houseId) {
    return (
      <div className="mx-auto max-w-4xl px-4 pb-10 pt-6 font-primary" dir="rtl">
        <InventoryEmptyState variant="unavailable" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pb-10 font-primary" dir="rtl">
      <InventoryHeader
        totalItems={view.summary?.totalItems ?? view.items.length}
        urgentCount={view.urgentCount}
        onAddItem={modalState.openAddModal}
        canAddItem={view.canAddItem}
      />

      <InventorySummary
        summary={view.summary}
        hasSummaryError={Boolean(queryState.summaryError)}
        isSummaryLoading={view.isSummaryLoading}
      />

      <InventoryFilters
        filters={filterControls.filters}
        statusOptions={view.statusOptions}
        hasActiveFilters={view.hasActiveFilters}
        itemCount={view.items.length}
        isFilterSyncing={filterControls.isFilterSyncing}
        onChange={filterControls.updateFilters}
        onReset={filterControls.resetFilters}
      />

      {hasError && (
        <section
          role="status"
          aria-live="polite"
          className="flex flex-col gap-4 rounded-[28px] border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold">تعذر تحميل بعض بيانات المخزون</h2>
              <p className="mt-1 text-sm leading-6">
                جرّب التحديث مرة ثانية. لو استمرت المشكلة، راجع الاتصال أو حاول لاحقًا.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={queryState.refreshInventory}
            disabled={!view.houseId}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw className="h-4 w-4" />
            إعادة المحاولة
          </button>
        </section>
      )}

      <InventoryList
        items={view.items}
        isLoading={queryState.isLoading && !view.items.length}
        hasItemsError={Boolean(queryState.itemsError)}
        hasActiveFilters={view.hasActiveFilters}
        onResetFilters={filterControls.resetFilters}
        onAddItem={modalState.openAddModal}
        canAddItem={view.canAddItem}
        onRetry={queryState.refreshInventory}
        onEdit={modalState.openEditModalForItem}
        onDecrease={actions.decreaseItem}
        adjustingItemId={mutationState.adjustingItemId}
        onRestock={modalState.openRestockModalForItem}
        onDelete={modalState.openDeleteModalForItem}
      />

      <AddInventoryItemModal
        isOpen={modalState.isAddOpen}
        onClose={modalState.closeAddModal}
        onSubmit={actions.createItem}
        isSubmitting={mutationState.isCreating}
      />

      <EditInventoryItemModal
        isOpen={modalState.isEditOpen}
        item={modalState.selectedEditItem}
        onClose={modalState.closeEditModal}
        onSubmit={actions.updateItem}
        isSubmitting={mutationState.isUpdating}
      />

      <RestockInventoryModal
        isOpen={modalState.isRestockOpen}
        item={modalState.selectedRestockItem}
        onClose={modalState.closeRestockModal}
        onSubmit={actions.restockItem}
        isSubmitting={mutationState.isAdjusting}
      />

      <DeleteInventoryItemModal
        isOpen={modalState.isDeleteOpen}
        item={modalState.selectedDeleteItem}
        onClose={modalState.closeDeleteModal}
        onSubmit={actions.deleteItem}
        isSubmitting={mutationState.isDeleting}
      />
    </div>
  );
}
