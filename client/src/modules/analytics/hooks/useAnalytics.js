import { useQuery } from "@tanstack/react-query";
import api from "../../../utils/api";
import { queryKeys } from "../../../shared/api/queryKeys";

const useAnalytics = () => {
  const {
    data: analytics,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: queryKeys.analytics.all,
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
