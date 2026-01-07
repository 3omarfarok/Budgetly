import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../context/ToastContext";
import api from "../utils/api";

export function useExpenses() {
  const [page, setPage] = useState(1);
  const toast = useToast();
  const queryClient = useQueryClient();

  const fetchExpenses = async (page) => {
    const { data } = await api.get(`/expenses?page=${page}&limit=10`);
    return data;
  };

  const {
    data,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["expenses", page],
    queryFn: () => fetchExpenses(page),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["expenses"]);
      toast.success("تم مسح المصروف بنجاح");
    },
    onError: (error) => {
      console.error("Error deleting expense:", error);
      toast.error("فيه مشكلة في مسح المصروف");
    },
  });

  return {
    expenses: data?.expenses || [],
    loading,
    page,
    setPage,
    totalPages: data?.totalPages || 1,
    fetchExpenses: refetch,
    deleteExpense: deleteMutation.mutateAsync,
  };
}
