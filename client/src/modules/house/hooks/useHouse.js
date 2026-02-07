import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { queryKeys } from "../../../shared/api/queryKeys";
import { houseApi } from "../api";

const useHouse = (houseId) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

  const {
    data: house,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: queryKeys.house.byId(houseId),
    queryFn: () => houseApi.getHouseById(houseId),
    enabled: !!houseId,
  });

  const updateNameMutation = useMutation({
    mutationFn: (name) => houseApi.updateHouseName({ houseId, name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.house.byId(houseId) });
      toast.success("تم تغيير اسم البيت بنجاح");
    },
    onError: (error) => {
      console.error("Error updating house name:", error);
      toast.error(error.response?.data?.message || "فشل تغيير اسم البيت");
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (password) => houseApi.updateHousePassword({ houseId, password }),
    onSuccess: () => {
      toast.success("تم تغيير باسوورد البيت بنجاح");
    },
    onError: (error) => {
      console.error("Error updating house password:", error);
      toast.error(error.response?.data?.message || "فشل تغيير باسوورد البيت");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId) => houseApi.removeHouseMember({ houseId, memberId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.house.byId(houseId) });
      toast.success("تم حذف العضو من البيت");
    },
    onError: (error) => {
      console.error("Error removing member:", error);
      toast.error("فشل حذف العضو");
    },
  });

  const leaveHouseMutation = useMutation({
    mutationFn: () => houseApi.leaveHouse(houseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.current });
      toast.success("تم مغادرة البيت بنجاح");
      navigate("/house-selection");
    },
    onError: (error) => {
      console.error("Error leaving house:", error);
      toast.error("فشل مغادرة البيت");
    },
  });

  const deleteHouseMutation = useMutation({
    mutationFn: () => houseApi.deleteHouse(houseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.current });
      toast.success("تم حذف البيت بنجاح");
      navigate("/house-selection");
    },
    onError: (error) => {
      console.error("Error deleting house:", error);
      toast.error("فشل حذف البيت");
    },
  });

  // Clear all house data (expenses, invoices, payments)
  const clearAllDataMutation = useMutation({
    mutationFn: () => houseApi.clearHouseData(houseId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.allInvoices.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.myInvoices.all });
      const { deleted } = response.data;
      toast.success(
        `تم حذف ${deleted.expenses} مصروف و ${deleted.invoices} فاتورة و ${deleted.payments} عملية دفع`,
      );
    },
    onError: (error) => {
      console.error("Error clearing house data:", error);
      toast.error(error.response?.data?.message || "فشل حذف البيانات");
    },
  });

  // Export house data as CSV
  const exportData = async (type) => {
    try {
      const response = await houseApi.exportHouseData({ houseId, type });

      // Create download link
      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from header or create one
      const contentDisposition = response.headers["content-disposition"];
      let filename = `${type}_export.csv`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) filename = filenameMatch[1];
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(
        `تم تصدير ${type === "expenses" ? "المصاريف" : "الفواتير"} بنجاح`,
      );
    } catch (error) {
      console.error("Error exporting data:", error);
      const message = error.response?.data?.message || "فشل تصدير البيانات";
      toast.error(message);
    }
  };

  return {
    house,
    loading,
    error,
    updateName: updateNameMutation.mutateAsync,
    updatePassword: updatePasswordMutation.mutateAsync,
    removeMember: removeMemberMutation.mutateAsync,
    leaveHouse: leaveHouseMutation.mutateAsync,
    deleteHouse: deleteHouseMutation.mutateAsync,
    clearAllData: clearAllDataMutation.mutateAsync,
    exportData,
    isUpdatingName: updateNameMutation.isPending,
    isUpdatingPassword: updatePasswordMutation.isPending,
    isClearingData: clearAllDataMutation.isPending,
  };
};

export default useHouse;
