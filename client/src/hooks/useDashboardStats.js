import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import api from "../utils/api";

export function useDashboardStats() {
  const { user } = useAuth();

  const fetchStats = async () => {
    if (!user) return null;
    const endpoint =
      user.role === "admin"
        ? "/stats/admin/dashboard"
        : `/stats/user/${user.id}`;
    const { data } = await api.get(endpoint);
    return data;
  };

  const {
    data: stats,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["dashboardStats", user?.id, user?.role],
    queryFn: fetchStats,
    enabled: !!user,
  });

  return { stats, loading, error };
}
