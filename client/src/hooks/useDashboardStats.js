import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../utils/api";

export function useDashboardStats() {
  const { user } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const endpoint =
          user.role === "admin"
            ? "/stats/admin/dashboard"
            : `/stats/user/${user.id}`;
        const { data } = await api.get(endpoint);
        setStats(data);
      } catch (error) {
        console.error("خطأ في تحميل الإحصائيات:", error);
        toast.error("فيه مشكلة في تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user, toast]);

  return { stats, loading };
}
