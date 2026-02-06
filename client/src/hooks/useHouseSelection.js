import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../utils/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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
    queryKey: ["houses"],
    queryFn: async () => {
      const { data } = await api.get("/houses");
      return data;
    },
  });

  // Create House
  const createHouseMutation = useMutation({
    mutationFn: (houseData) => api.post("/houses", houseData),
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
    mutationFn: ({ houseId, password }) =>
      api.post(`/houses/${houseId}/join`, { password }),
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
      const { data: userData } = await api.get("/auth/me");
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
