import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import api from "../utils/api";

export function useDashboardStats() {
  const { user } = useAuth();
  const userId = user?.id || user?._id;

  const fetchStats = async () => {
    if (!user) return null;
    const endpoint =
      user.role === "admin"
        ? "/stats/admin/dashboard"
        : `/stats/user/${userId}`;
    const { data } = await api.get(endpoint);
    return data;
  };

  const {
    data: stats,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["dashboardStats", userId, user?.role],
    queryFn: fetchStats,
    enabled: !!user && !!userId,
  });

  return { stats, loading, error };
}
