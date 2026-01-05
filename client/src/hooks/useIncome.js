import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../utils/api";

export function useIncome() {
  const { user } = useAuth();
  const toast = useToast();
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchIncomes();
  }, [filters]);

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      // Fetching all payments for now and filtering for 'received'
      // Ideally backend accepts a type query param
      const { data } = await api.get("/payments");

      let filteredData = data.filter(
        (payment) => payment.transactionType === "received"
      );

      // Apply date filters if any
      if (filters.startDate) {
        filteredData = filteredData.filter(
          (p) => new Date(p.date) >= new Date(filters.startDate)
        );
      }
      if (filters.endDate) {
        filteredData = filteredData.filter(
          (p) => new Date(p.date) <= new Date(filters.endDate)
        );
      }

      setIncomes(filteredData);
    } catch (error) {
      console.error("غلط في تحميل الدخل:", error);
      toast.error("فيه مشكلة في تحميل بيانات الدخل");
      setError("فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = incomes.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );

  return {
    incomes,
    loading,
    error,
    filters,
    setFilters,
    totalIncome,
    refreshIncome: fetchIncomes,
  };
}
