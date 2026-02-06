import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../context/ToastContext";
import api from "../utils/api";

export function useExpenses() {
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const toast = useToast();
  const queryClient = useQueryClient();

  // Fetch users for filter dropdown
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await api.get("/users");
      return data;
    },
  });

  // Build query params based on filters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", 10);
    if (selectedUserId) params.append("createdBy", selectedUserId);
    return params.toString();
  };

  const fetchExpenses = async () => {
    const { data } = await api.get(`/expenses?${buildQueryParams()}`);
    return data;
  };

  const {
    data,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["expenses", page, selectedUserId],
    queryFn: fetchExpenses,
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("تم مسح المصروف بنجاح");
    },
    onError: (error) => {
      console.error("Error deleting expense:", error);
      toast.error("فيه مشكلة في مسح المصروف");
    },
  });

  // Client-side filtering for amount (API doesn't support amount filter)
  const filteredExpenses = useMemo(() => {
    let result = data?.expenses || [];

    if (minAmount !== "") {
      const min = parseFloat(minAmount);
      if (!isNaN(min)) {
        result = result.filter((exp) => exp.totalAmount >= min);
      }
    }

    if (maxAmount !== "") {
      const max = parseFloat(maxAmount);
      if (!isNaN(max)) {
        result = result.filter((exp) => exp.totalAmount <= max);
      }
    }

    return result;
  }, [data?.expenses, minAmount, maxAmount]);

  // Reset page when filters change
  const handleUserFilterChange = (userId) => {
    setSelectedUserId(userId);
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedUserId("");
    setMinAmount("");
    setMaxAmount("");
    setPage(1);
  };

  const hasActiveFilters = selectedUserId || minAmount || maxAmount;

  return {
    expenses: filteredExpenses,
    allExpenses: data?.expenses || [],
    loading,
    page,
    setPage,
    totalPages: data?.totalPages || 1,
    fetchExpenses: refetch,
    deleteExpense: deleteMutation.mutateAsync,
    // Filter related
    users,
    selectedUserId,
    setSelectedUserId: handleUserFilterChange,
    minAmount,
    setMinAmount,
    maxAmount,
    setMaxAmount,
    clearFilters,
    hasActiveFilters,
  };
}
