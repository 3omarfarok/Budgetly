import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/api/queryKeys";
import { useAuth } from "../../../shared/context/AuthContext";
import { inventoryApi } from "../api";
import {
  DEFAULT_INVENTORY_FILTERS,
  STATUS_OPTIONS,
  areInventoryUiFiltersEqual,
  buildInventoryListRequestParams,
  getHouseId,
  normalizeInventoryUiFilters,
} from "../api/inventoryFilters";
import { useDebouncedValue } from "./useDebouncedValue";

const EMPTY_ITEMS = [];
const createMissingHouseError = () => new Error("Inventory houseId is required");
const INVENTORY_LIST_KEY_SEGMENT = "list";

const getInventoryStatus = (item) => {
  if ((item?.quantity ?? 0) === 0) {
    return "out";
  }

  if ((item?.quantity ?? 0) <= (item?.lowStockThreshold ?? 0)) {
    return "low";
  }

  return "healthy";
};

const inventorySort = (left, right) => {
  const statusOrder = {
    out: 0,
    low: 1,
    healthy: 2,
  };

  const statusComparison = statusOrder[left.status] - statusOrder[right.status];
  if (statusComparison !== 0) {
    return statusComparison;
  }

  const updatedAtComparison = new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  if (updatedAtComparison !== 0) {
    return updatedAtComparison;
  }

  return left.name.localeCompare(right.name, "ar");
};

const sortInventoryItems = (items = []) => [...items].sort(inventorySort);

const toOptimisticActor = (user) => {
  if (!user) {
    return null;
  }

  return {
    _id: user._id ?? user.id ?? "current-user",
    name: user.name,
    username: user.username,
  };
};

const toOptimisticInventoryItem = (item) => ({
  ...item,
  status: getInventoryStatus(item),
});

const getListFiltersFromQueryKey = (queryKey = []) => ({
  search: queryKey[3] ?? "",
  category: queryKey[4] ?? "",
  status: queryKey[5] ?? "",
});

const matchesInventoryFilters = (item, filters) => {
  const normalizedName = item.name?.toLowerCase?.() ?? "";
  const normalizedSearch = filters.search?.toLowerCase?.() ?? "";

  if (normalizedSearch && !normalizedName.includes(normalizedSearch)) {
    return false;
  }

  if (filters.category && item.category !== filters.category) {
    return false;
  }

  if (filters.status && item.status !== filters.status) {
    return false;
  }

  return true;
};

const upsertInventoryListItem = (items, nextItem, filters) => {
  const withoutItem = items.filter((item) => item._id !== nextItem._id);

  if (!matchesInventoryFilters(nextItem, filters)) {
    return withoutItem;
  }

  return sortInventoryItems([...withoutItem, nextItem]);
};

const updateUrgentItems = (urgentItems = [], previousItem, nextItem) => {
  const remainingItems = urgentItems.filter(
    (item) => item._id !== previousItem?._id && item._id !== nextItem?._id,
  );

  if (nextItem && nextItem.status !== "healthy") {
    remainingItems.push(nextItem);
  }

  return sortInventoryItems(remainingItems).filter((item) => item.status !== "healthy").slice(0, 4);
};

const updateSummaryCounts = (summary, previousStatus, nextStatus) => {
  if (!summary) {
    return summary;
  }

  const lowStockCount =
    summary.lowStockCount - (previousStatus === "low" ? 1 : 0) + (nextStatus === "low" ? 1 : 0);
  const outOfStockCount =
    summary.outOfStockCount - (previousStatus === "out" ? 1 : 0) + (nextStatus === "out" ? 1 : 0);

  return {
    ...summary,
    lowStockCount: Math.max(0, lowStockCount),
    outOfStockCount: Math.max(0, outOfStockCount),
  };
};

const getInventoryItemFromSnapshots = (snapshots = [], itemId) => {
  for (const [, data] of snapshots) {
    if (!Array.isArray(data)) {
      continue;
    }

    const matchedItem = data.find((item) => item._id === itemId);
    if (matchedItem) {
      return matchedItem;
    }
  }

  return null;
};

const snapshotInventoryQueries = (queryClient, houseId) =>
  queryClient.getQueriesData({ queryKey: queryKeys.inventory.all(houseId) });

const restoreInventoryQueries = (queryClient, snapshots = []) => {
  snapshots.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data);
  });
};

const updateInventoryListCaches = (queryClient, houseId, updater) => {
  queryClient
    .getQueriesData({ queryKey: queryKeys.inventory.all(houseId) })
    .forEach(([queryKey, data]) => {
      if (!Array.isArray(data) || queryKey[2] !== INVENTORY_LIST_KEY_SEGMENT) {
        return;
      }

      const filters = getListFiltersFromQueryKey(queryKey);
      queryClient.setQueryData(queryKey, updater(data, filters));
    });
};

const updateInventorySummaryCache = (queryClient, houseId, updater) => {
  const summaryKey = queryKeys.inventory.summary(houseId);
  const currentSummary = queryClient.getQueryData(summaryKey);

  if (!currentSummary) {
    return;
  }

  queryClient.setQueryData(summaryKey, updater(currentSummary));
};

const applyCreateOptimisticUpdate = ({ queryClient, houseId, nextItem }) => {
  updateInventoryListCaches(queryClient, houseId, (items, filters) => upsertInventoryListItem(items, nextItem, filters));

  updateInventorySummaryCache(queryClient, houseId, (summary) => ({
    ...updateSummaryCounts(summary, null, nextItem.status),
    totalItems: summary.totalItems + 1,
    urgentItems: updateUrgentItems(summary.urgentItems, null, nextItem),
  }));
};

const applyUpdateOptimisticUpdate = ({ queryClient, houseId, previousItem, nextItem }) => {
  updateInventoryListCaches(queryClient, houseId, (items, filters) => upsertInventoryListItem(items, nextItem, filters));

  updateInventorySummaryCache(queryClient, houseId, (summary) => ({
    ...updateSummaryCounts(summary, previousItem.status, nextItem.status),
    urgentItems: updateUrgentItems(summary.urgentItems, previousItem, nextItem),
  }));
};

const applyDeleteOptimisticUpdate = ({ queryClient, houseId, previousItem }) => {
  updateInventoryListCaches(queryClient, houseId, (items) => items.filter((item) => item._id !== previousItem._id));

  updateInventorySummaryCache(queryClient, houseId, (summary) => ({
    ...updateSummaryCounts(summary, previousItem.status, null),
    totalItems: Math.max(0, summary.totalItems - 1),
    urgentItems: updateUrgentItems(summary.urgentItems, previousItem, null),
  }));
};

export function useInventory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const houseId = getHouseId(user);

  const [filters, setFiltersState] = useState(() => ({
    ...DEFAULT_INVENTORY_FILTERS,
  }));

  const normalizedFilters = useMemo(() => normalizeInventoryUiFilters(filters), [filters]);
  const debouncedSearch = useDebouncedValue(normalizedFilters.search, 350);
  const queryFilters = useMemo(
    () => ({ ...normalizedFilters, search: debouncedSearch }),
    [debouncedSearch, normalizedFilters],
  );
  const requestParams = useMemo(
    () => buildInventoryListRequestParams(queryFilters),
    [queryFilters],
  );

  const setFilters = useCallback((nextFilters) => {
    setFiltersState((currentFilters) => {
      const resolvedFilters =
        typeof nextFilters === "function" ? nextFilters(currentFilters) : nextFilters;
      const mergedFilters = {
        ...currentFilters,
        ...(resolvedFilters ?? {}),
      };
      const nextNormalizedFilters = normalizeInventoryUiFilters(mergedFilters);

      if (areInventoryUiFiltersEqual(currentFilters, nextNormalizedFilters)) {
        return currentFilters;
      }

      return nextNormalizedFilters;
    });
  }, []);

  const {
    data: itemsData,
    isLoading: isItemsLoading,
    isFetching: isItemsFetching,
    error: itemsError,
    refetch: refetchItems,
  } = useQuery({
    queryKey: queryKeys.inventory.list(houseId, queryFilters),
    queryFn: () => inventoryApi.getItems({ houseId, filters: queryFilters }),
    enabled: !!houseId,
  });

  const items = itemsData ?? EMPTY_ITEMS;

  const {
    data: summary = null,
    isLoading: isSummaryLoading,
    isFetching: isSummaryFetching,
    error: summaryError,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: queryKeys.inventory.summary(houseId),
    queryFn: () => inventoryApi.getSummary({ houseId }),
    enabled: !!houseId,
  });

  const invalidateInventoryQueriesForHouse = useCallback(
    (targetHouseId) => {
      if (!targetHouseId) {
        return Promise.resolve();
      }

      return queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all(targetHouseId) });
    },
    [queryClient],
  );

  const createItemMutation = useMutation({
    mutationFn: inventoryApi.createItem,
    onMutate: async (variables) => {
      const mutationHouseId = variables.houseId;
      await queryClient.cancelQueries({ queryKey: queryKeys.inventory.all(mutationHouseId) });

      const snapshot = snapshotInventoryQueries(queryClient, mutationHouseId);
      const actor = toOptimisticActor(user);
      const now = new Date().toISOString();
      const optimisticItem = toOptimisticInventoryItem({
        _id: `optimistic-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        house: mutationHouseId,
        name: variables.name,
        category: variables.category,
        quantity: variables.quantity,
        unit: variables.unit,
        lowStockThreshold: variables.lowStockThreshold,
        createdBy: actor,
        updatedBy: actor,
        createdAt: now,
        updatedAt: now,
      });

      applyCreateOptimisticUpdate({
        queryClient,
        houseId: mutationHouseId,
        nextItem: optimisticItem,
      });

      return { houseId: mutationHouseId, snapshot };
    },
    onError: (_error, _variables, context) => {
      restoreInventoryQueries(queryClient, context?.snapshot);
    },
    onSettled: async (_data, _error, variables, context) => {
      await invalidateInventoryQueriesForHouse(context?.houseId ?? variables.houseId);
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: inventoryApi.updateItem,
    onMutate: async (variables) => {
      const mutationHouseId = variables.houseId;
      await queryClient.cancelQueries({ queryKey: queryKeys.inventory.all(mutationHouseId) });

      const snapshot = snapshotInventoryQueries(queryClient, mutationHouseId);
      const previousItem = getInventoryItemFromSnapshots(snapshot, variables.id);

      if (!previousItem) {
        return { houseId: mutationHouseId, snapshot };
      }

      const actor = toOptimisticActor(user);
      const { houseId: _houseId, id: _id, ...changes } = variables;
      const optimisticItem = toOptimisticInventoryItem({
        ...previousItem,
        ...changes,
        updatedBy: actor,
        updatedAt: new Date().toISOString(),
      });

      applyUpdateOptimisticUpdate({
        queryClient,
        houseId: mutationHouseId,
        previousItem,
        nextItem: optimisticItem,
      });

      return { houseId: mutationHouseId, snapshot };
    },
    onError: (_error, _variables, context) => {
      restoreInventoryQueries(queryClient, context?.snapshot);
    },
    onSettled: async (_data, _error, variables, context) => {
      await invalidateInventoryQueriesForHouse(context?.houseId ?? variables.houseId);
    },
  });

  const adjustItemMutation = useMutation({
    mutationFn: inventoryApi.adjustItem,
    onMutate: async (variables) => {
      const mutationHouseId = variables.houseId;
      await queryClient.cancelQueries({ queryKey: queryKeys.inventory.all(mutationHouseId) });

      const snapshot = snapshotInventoryQueries(queryClient, mutationHouseId);
      const previousItem = getInventoryItemFromSnapshots(snapshot, variables.id);

      if (!previousItem) {
        return { houseId: mutationHouseId, snapshot };
      }

      let nextQuantity = previousItem.quantity;

      if (variables.action === "increment") {
        nextQuantity += variables.amount;
      }

      if (variables.action === "set") {
        nextQuantity = variables.amount;
      }

      if (variables.action === "decrement") {
        if (previousItem.quantity < variables.amount) {
          return { houseId: mutationHouseId, snapshot };
        }

        nextQuantity -= variables.amount;
      }

      const optimisticItem = toOptimisticInventoryItem({
        ...previousItem,
        quantity: nextQuantity,
        updatedBy: toOptimisticActor(user),
        updatedAt: new Date().toISOString(),
      });

      applyUpdateOptimisticUpdate({
        queryClient,
        houseId: mutationHouseId,
        previousItem,
        nextItem: optimisticItem,
      });

      return { houseId: mutationHouseId, snapshot };
    },
    onError: (_error, _variables, context) => {
      restoreInventoryQueries(queryClient, context?.snapshot);
    },
    onSettled: async (_data, _error, variables, context) => {
      await invalidateInventoryQueriesForHouse(context?.houseId ?? variables.houseId);
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: inventoryApi.deleteItem,
    onMutate: async (variables) => {
      const mutationHouseId = variables.houseId;
      await queryClient.cancelQueries({ queryKey: queryKeys.inventory.all(mutationHouseId) });

      const snapshot = snapshotInventoryQueries(queryClient, mutationHouseId);
      const previousItem = getInventoryItemFromSnapshots(snapshot, variables.id);

      if (previousItem) {
        applyDeleteOptimisticUpdate({
          queryClient,
          houseId: mutationHouseId,
          previousItem,
        });
      }

      return { houseId: mutationHouseId, snapshot };
    },
    onError: (_error, _variables, context) => {
      restoreInventoryQueries(queryClient, context?.snapshot);
    },
    onSettled: async (_data, _error, variables, context) => {
      await invalidateInventoryQueriesForHouse(context?.houseId ?? variables.houseId);
    },
  });

  const refreshInventory = useCallback(async () => {
    if (!houseId) {
      return;
    }

    await Promise.all([refetchItems(), refetchSummary()]);
  }, [houseId, refetchItems, refetchSummary]);

  const { mutateAsync: createItemAsync } = createItemMutation;
  const { mutateAsync: updateItemAsync } = updateItemMutation;
  const { mutateAsync: adjustItemAsync } = adjustItemMutation;
  const { mutateAsync: deleteItemAsync } = deleteItemMutation;
  const adjustingItemId = adjustItemMutation.isPending ? adjustItemMutation.variables?.id ?? null : null;

  const createItem = useCallback(
    (payload) => {
      if (!houseId) {
        return Promise.reject(createMissingHouseError());
      }

      return createItemAsync({ houseId, ...payload });
    },
    [createItemAsync, houseId],
  );

  const updateItem = useCallback(
    (payload) => {
      if (!houseId) {
        return Promise.reject(createMissingHouseError());
      }

      return updateItemAsync({ houseId, ...payload });
    },
    [updateItemAsync, houseId],
  );

  const adjustItem = useCallback(
    (payload) => {
      if (!houseId) {
        return Promise.reject(createMissingHouseError());
      }

      return adjustItemAsync({ houseId, ...payload });
    },
    [adjustItemAsync, houseId],
  );

  const deleteItem = useCallback(
    (id) => {
      if (!houseId) {
        return Promise.reject(createMissingHouseError());
      }

      return deleteItemAsync({ houseId, id });
    },
    [deleteItemAsync, houseId],
  );

  return {
    houseId,
    items,
    summary,
    filters: normalizedFilters,
    queryFilters,
    isFilterSyncing: normalizedFilters.search !== queryFilters.search,
    setFilters,
    requestParams,
    statusOptions: STATUS_OPTIONS,
    refreshInventory,
    createItem,
    updateItem,
    adjustItem,
    deleteItem,
    isLoading: isItemsLoading || isSummaryLoading,
    isFetching: isItemsFetching || isSummaryFetching,
    isItemsLoading,
    isItemsFetching,
    isSummaryLoading,
    isSummaryFetching,
    itemsError,
    summaryError,
    isCreating: createItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isAdjusting: adjustItemMutation.isPending,
    adjustingItemId,
    isDeleting: deleteItemMutation.isPending,
    createError: createItemMutation.error,
    updateError: updateItemMutation.error,
    adjustError: adjustItemMutation.error,
    deleteError: deleteItemMutation.error,
  };
}
