import { Loader } from "../../../shared/components";
import InventoryEmptyState from "./InventoryEmptyState";
import InventoryItemCard from "./InventoryItemCard";
import InventoryTable from "./InventoryTable";

export default function InventoryList({
  items,
  isLoading,
  hasItemsError = false,
  hasActiveFilters,
  onResetFilters,
  onAddItem,
  canAddItem = true,
  onRetry,
  onEdit,
  onDecrease,
  adjustingItemId = null,
  onRestock,
  onDelete,
}) {
  if (isLoading) {
    return <Loader text="بنحمّل المخزون..." />;
  }

  if (hasItemsError && !items.length) {
    return <InventoryEmptyState variant="error" onPrimaryAction={onRetry} />;
  }

  if (!items.length) {
    return (
      <InventoryEmptyState
        variant={hasActiveFilters ? "filtered" : "base"}
        onPrimaryAction={hasActiveFilters ? onResetFilters : onAddItem}
        isPrimaryActionDisabled={!hasActiveFilters && !canAddItem}
      />
    );
  }

  return (
    <>
      <section className="grid gap-4 md:hidden" aria-label="قائمة المخزون على الجوال">
        {items.map((item) => (
          <InventoryItemCard
            key={item._id}
            item={item}
            onEdit={onEdit}
            onDecrease={onDecrease}
            adjustingItemId={adjustingItemId}
            onRestock={onRestock}
            onDelete={onDelete}
          />
        ))}
      </section>

      <div className="hidden md:block">
        <InventoryTable
          items={items}
          onEdit={onEdit}
          onDecrease={onDecrease}
          adjustingItemId={adjustingItemId}
          onRestock={onRestock}
          onDelete={onDelete}
        />
      </div>
    </>
  );
}
