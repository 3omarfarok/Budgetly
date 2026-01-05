import { useState, useEffect, useCallback } from "react";
import { useToast } from "../context/ToastContext";
import api from "../utils/api";

export function useExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();

  const fetchExpenses = useCallback(
    async (currentPage) => {
      try {
        setLoading(true);
        const { data } = await api.get(
          `/expenses?page=${currentPage}&limit=10`
        );
        if (data.expenses) {
          setExpenses(data.expenses);
          setTotalPages(data.totalPages);
        } else {
          setExpenses(data); // Fallback
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
        toast.error("فيه مشكلة في تحميل المصاريف");
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchExpenses(page);
  }, [page, fetchExpenses]);

  const deleteExpense = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((e) => e._id !== id));
      toast.success("تم مسح المصروف بنجاح");
      return true;
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("فيه مشكلة في مسح المصروف");
      return false;
    }
  };

  return {
    expenses,
    loading,
    page,
    setPage,
    totalPages,
    fetchExpenses,
    deleteExpense,
  };
}
