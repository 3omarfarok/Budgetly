import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/api/queryKeys";
import { useAuth } from "../../../shared/context/AuthContext";
import { inventoryApi } from "../api";
import { getHouseId } from "../api/inventoryFilters";

export function useLowStockWidget() {
  const { user } = useAuth();
  const houseId = getHouseId(user);

  const { data: summary, isLoading, error } = useQuery({
    queryKey: queryKeys.inventory.summary(houseId),
    queryFn: () => inventoryApi.getSummary({ houseId }),
    enabled: !!houseId,
  });

  const urgentItems = useMemo(() => summary?.urgentItems ?? [], [summary]);
  const urgentCount = (summary?.lowStockCount ?? 0) + (summary?.outOfStockCount ?? 0);

  return {
    houseId,
    summary,
    urgentItems,
    urgentCount,
    isLoading,
    error,
  };
}
