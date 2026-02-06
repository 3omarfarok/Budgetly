import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";
import { useToast } from "../context/ToastContext";

const useDishwashing = (houseId) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  // Get dishwashing settings
  const {
    data: settings,
    isLoading: loadingSettings,
    error: settingsError,
  } = useQuery({
    queryKey: ["dishwashing", houseId, "settings"],
    queryFn: async () => {
      const { data } = await api.get(`/houses/${houseId}/dishwashing`);
      return data;
    },
    enabled: !!houseId,
  });

  // Get today's assignment
  const {
    data: todayData,
    isLoading: loadingToday,
    error: todayError,
    refetch: refetchToday,
  } = useQuery({
    queryKey: ["dishwashing", houseId, "today"],
    queryFn: async () => {
      const { data } = await api.get(`/houses/${houseId}/dishwashing/today`);
      return data;
    },
    enabled: !!houseId,
  });

  // Get schedule
  const getSchedule = async (days = 7) => {
    const { data } = await api.get(
      `/houses/${houseId}/dishwashing/schedule?days=${days}`,
    );
    return data;
  };

  const {
    data: scheduleData,
    isLoading: loadingSchedule,
    error: scheduleError,
    refetch: refetchSchedule,
  } = useQuery({
    queryKey: ["dishwashing", houseId, "schedule"],
    queryFn: () => getSchedule(7),
    enabled: !!houseId,
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: ({ enabled, startDate, order }) =>
      api.put(`/houses/${houseId}/dishwashing`, { enabled, startDate, order }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dishwashing", houseId] });
      toast.success("تم حفظ إعدادات جدول غسيل الأطباق");
    },
    onError: (error) => {
      console.error("Update dishwashing settings error:", error);
      toast.error(error.response?.data?.message || "فشل حفظ إعدادات الجدول");
    },
  });

  // Delete settings mutation
  const deleteSettingsMutation = useMutation({
    mutationFn: () => api.delete(`/houses/${houseId}/dishwashing`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dishwashing", houseId] });
      toast.success("تم إلغاء جدول غسيل الأطباق");
    },
    onError: (error) => {
      console.error("Delete dishwashing settings error:", error);
      toast.error("فشل إلغاء الجدول");
    },
  });

  return {
    // Settings
    settings,
    loadingSettings,
    settingsError,
    updateSettings: updateSettingsMutation.mutateAsync,
    deleteSettings: deleteSettingsMutation.mutateAsync,
    isUpdatingSettings: updateSettingsMutation.isPending,

    // Today
    today: todayData,
    loadingToday,
    todayError,
    refetchToday,

    // Schedule
    schedule: scheduleData?.schedule || [],
    loadingSchedule,
    scheduleError,
    refetchSchedule,
    getSchedule,
  };
};

export default useDishwashing;
