import { useAuth } from "../../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/api/queryKeys";
import { dashboardApi } from "../api";

export function useDashboardStats() {
  const { user } = useAuth();
  const userId = user?.id || user?._id;

  const {
    data: stats,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: queryKeys.dashboardStats.byUserRole(userId, user?.role),
    queryFn: () => dashboardApi.getStats({ user, userId }),
    enabled: !!user && !!userId,
  });

  return { stats, loading, error };
}
