import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../utils/api";

export function useIncome() {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });

  const fetchIncomes = async () => {
    // Determine endpoint based on role to be safe, or stick to /payments if that's what backend expects for "all income" view
    // Original code: await api.get("/payments")
    const { data } = await api.get("/payments");
    return data;
  };

  const {
    data: allPayments = [],
    isLoading: loading,
    error,
    refetch: refreshIncome,
  } = useQuery({
    queryKey: ["allPaymentsForIncome"], // Distinct key? Or share with payments?
    // "payments" key in usePayments uses role/id logic.
    // If we use "payments" here without partial logic, we might conflict if we want shared cache.
    // Let's use a unique key for now unless we are sure.
    queryFn: fetchIncomes,
  });

  // Filter Logic
  const incomes = allPayments.filter((payment) => {
    if (payment.transactionType !== "received") return false;

    if (
      filters.startDate &&
      new Date(payment.date) < new Date(filters.startDate)
    )
      return false;
    if (filters.endDate && new Date(payment.date) > new Date(filters.endDate))
      return false;

    return true;
  });

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
    refreshIncome,
  };
}
