import { useQuery } from "@tanstack/react-query";
import api from "../utils/api";

const useAnalytics = () => {
  const {
    data: analytics,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const { data } = await api.get("/analytics/monthly");
      return data;
    },
    // Cache for 5 minutes as analytics don't change by the second
    staleTime: 5 * 60 * 1000,
  });

  return {
    analytics,
    loading,
    error,
  };
};

export default useAnalytics;
