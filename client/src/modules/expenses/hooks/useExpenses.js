import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../../context/ToastContext";
import { queryKeys } from "../../../shared/api/queryKeys";
import { expensesApi } from "../api";

export function useExpenses() {
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: queryKeys.users.all,
    queryFn: expensesApi.getUsers,
  });

  const { data, isLoading: loading, refetch } = useQuery({
    queryKey: queryKeys.expenses.list(page, selectedUserId),
    queryFn: () => expensesApi.getExpenses({ page, limit: 10, createdBy: selectedUserId }),
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: expensesApi.deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
      toast.success("تم مسح المصروف بنجاح");
    },
    onError: (error) => {
      console.error("Error deleting expense:", error);
      toast.error("فيه مشكلة في مسح المصروف");
    },
  });

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
