import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { queryKeys } from "../../../shared/api/queryKeys";
import { houseApi } from "../api";

const useHouseSelection = () => {
  const toast = useToast();
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  // Fetch Available Houses
  const {
    data: houses,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: queryKeys.houses.all,
    queryFn: houseApi.getAvailableHouses,
  });

  // Create House
  const createHouseMutation = useMutation({
    mutationFn: houseApi.createHouse,
    onSuccess: (response) => {
      const token = response?.data?.token;
      if (token) {
        localStorage.setItem("token", token);
      }
      refreshUserAndNavigate();
      toast.success("تم إنشاء البيت بنجاح!");
    },
    onError: (error) => {
      console.error("Error creating house:", error);
      toast.error(error.response?.data?.message || "فشل إنشاء البيت");
    },
  });

  // Join House
  const joinHouseMutation = useMutation({
    mutationFn: houseApi.joinHouse,
    onSuccess: () => {
      refreshUserAndNavigate();
      toast.success("تم الانضمام للبيت بنجاح!");
    },
    onError: (error) => {
      console.error("Error joining house:", error);
      toast.error(error.response?.data?.message || "فشل الانضمام للبيت");
    },
  });

  const refreshUserAndNavigate = async () => {
    try {
      const userData = await houseApi.getCurrentUser();
      updateUser(userData);
      navigate("/");
    } catch (err) {
      console.error("Error refreshing user data:", err);
      navigate("/");
    }
  };

  return {
    houses,
    loading,
    error,
    createHouse: createHouseMutation.mutateAsync,
    joinHouse: joinHouseMutation.mutateAsync,
    isCreating: createHouseMutation.isPending,
    isJoining: joinHouseMutation.isPending,
  };
};

export default useHouseSelection;
