import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";

export function useAddPayment() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    user: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [error, setError] = useState("");

  const { data: users = [], isLoading: loading } = useQuery({
    queryKey: ["usersWithBalances"],
    queryFn: async () => {
      const [usersRes, balancesRes] = await Promise.all([
        api.get("/users"),
        api.get("/stats/balances"),
      ]);

      const activeUsers = usersRes.data.filter((u) => u.isActive);
      const balancesMap = new Map(
        balancesRes.data.map((b) => [b.userId.toString(), b])
      );

      return activeUsers.map((u) => ({
        ...u,
        balance: balancesMap.get(u._id.toString())?.balance || 0,
        totalOwed: balancesMap.get(u._id.toString())?.totalOwed || 0,
        totalPaid: balancesMap.get(u._id.toString())?.totalPaid || 0,
      }));
    },
    onError: (error) => {
      console.error("غلط في تحميل الأعضاء:", error);
      toast.error("فيه مشكلة في تحميل الأعضاء");
    },
  });

  const addPaymentMutation = useMutation({
    mutationFn: (data) =>
      api.post("/payments", { ...data, transactionType: "payment" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["payments"]);
      queryClient.invalidateQueries(["myPayments"]);
      queryClient.invalidateQueries(["userBalance"]);
      toast.success("تم تسجيل استلام الدفعة بنجاح!");
      navigate("/payments");
    },
    onError: (error) => {
      console.error("غلط في تسجيل الدفعة:", error);
      const errorMsg = "فيه مشكلة في تسجيل الدفعة";
      setError(errorMsg);
      toast.error(errorMsg);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserChange = (userId) => {
    setFormData((prev) => ({ ...prev, user: userId }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.user || !formData.amount) {
      const errorMsg = "لازم تختار العضو والمبلغ";
      setError(errorMsg);
      toast.warning(errorMsg);
      return;
    }

    addPaymentMutation.mutate(formData);
  };

  return {
    users,
    loading,
    formData,
    handleChange,
    handleUserChange,
    handleSubmit,
    error,
    isSubmitting: addPaymentMutation.isPending,
    user,
  };
}
