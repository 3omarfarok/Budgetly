import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";

const useHouse = (houseId) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

  const {
    data: house,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["house", houseId],
    queryFn: async () => {
      const { data } = await api.get(`/houses/${houseId}`);
      return data;
    },
    enabled: !!houseId,
  });

  const updateNameMutation = useMutation({
    mutationFn: (name) => api.patch(`/houses/${houseId}/name`, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries(["house", houseId]);
      toast.success("تم تغيير اسم البيت بنجاح");
    },
    onError: (error) => {
      console.error("Error updating house name:", error);
      toast.error(error.response?.data?.message || "فشل تغيير اسم البيت");
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (password) =>
      api.patch(`/houses/${houseId}/password`, { password }),
    onSuccess: () => {
      toast.success("تم تغيير باسوورد البيت بنجاح");
    },
    onError: (error) => {
      console.error("Error updating house password:", error);
      toast.error(error.response?.data?.message || "فشل تغيير باسوورد البيت");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId) =>
      api.delete(`/houses/${houseId}/members/${memberId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["house", houseId]);
      toast.success("تم حذف العضو من البيت");
    },
    onError: (error) => {
      console.error("Error removing member:", error);
      toast.error("فشل حذف العضو");
    },
  });

  const leaveHouseMutation = useMutation({
    mutationFn: () => api.post(`/houses/${houseId}/leave`),
    onSuccess: () => {
      queryClient.invalidateQueries(["user"]); // Invalidate user to update their house status
      toast.success("تم مغادرة البيت بنجاح");
      navigate("/house-selection");
    },
    onError: (error) => {
      console.error("Error leaving house:", error);
      toast.error("فشل مغادرة البيت");
    },
  });

  const deleteHouseMutation = useMutation({
    mutationFn: () => api.delete(`/houses/${houseId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["user"]);
      toast.success("تم حذف البيت بنجاح");
      navigate("/house-selection");
    },
    onError: (error) => {
      console.error("Error deleting house:", error);
      toast.error("فشل حذف البيت");
    },
  });

  return {
    house,
    loading,
    error,
    updateName: updateNameMutation.mutateAsync,
    updatePassword: updatePasswordMutation.mutateAsync,
    removeMember: removeMemberMutation.mutateAsync,
    leaveHouse: leaveHouseMutation.mutateAsync,
    deleteHouse: deleteHouseMutation.mutateAsync,
    isUpdatingName: updateNameMutation.isPending,
    isUpdatingPassword: updatePasswordMutation.isPending,
  };
};

export default useHouse;
