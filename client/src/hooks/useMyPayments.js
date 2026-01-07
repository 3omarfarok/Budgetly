import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";

export function useMyPayments() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState(null);

  // Queries
  const { data: payments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ["myPayments", user.id],
    queryFn: async () => {
      const { data } = await api.get(`/payments/user/${user.id}`);
      return data;
    },
  });

  const { data: userBalance = 0, isLoading: loadingBalance } = useQuery({
    queryKey: ["userBalance", user.id],
    queryFn: async () => {
      const { data } = await api.get(`/stats/user/${user.id}`);
      return data.balance || 0;
    },
  });

  const loading = loadingPayments || loadingBalance;

  // Mutations
  const addMutation = useMutation({
    mutationFn: (data) => api.post("/payments", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["myPayments"]);
      queryClient.invalidateQueries(["userBalance"]);
      toast.success("تم تسجيل الدفعة بنجاح!");
      resetForm();
    },
    onError: (error) => {
      console.error("غلط في تسجيل الدفعة:", error);
      const errorMsg = "فيه مشكلة في تسجيل الدفعة";
      setError(errorMsg);
      toast.error(errorMsg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/payments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["myPayments"]);
      queryClient.invalidateQueries(["userBalance"]);
      toast.success("تم تعديل الدفعة بنجاح!");
      resetForm();
    },
    onError: (error) => {
      console.error("غلط في تعديل الدفعة:", error);
      toast.error("فيه مشكلة في تعديل الدفعة");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/payments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["myPayments"]);
      queryClient.invalidateQueries(["userBalance"]);
      toast.success("تم حذف الدفعة بنجاح");
      setShowDeleteModal(false);
      setDeletingPaymentId(null);
    },
    onError: (error) => {
      console.error("غلط في مسح الدفعة:", error);
      toast.error("فيه مشكلة في حذف الدفعة");
    },
  });

  const resetForm = () => {
    setFormData({
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
    setShowAddForm(false);
    setEditingPayment(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.amount) {
      const errorMsg = "لازم تكتب المبلغ";
      setError(errorMsg);
      toast.warning(errorMsg);
      return;
    }

    if (editingPayment) {
      updateMutation.mutate({
        id: editingPayment._id,
        data: {
          amount: formData.amount,
          description: formData.description,
          date: formData.date,
          transactionType: editingPayment.transactionType || "payment",
        },
      });
    } else {
      addMutation.mutate({
        user: user.id,
        amount: formData.amount,
        description: formData.description,
        date: formData.date,
        transactionType: "payment",
      });
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setFormData({
      amount: payment.amount,
      description: payment.description || "",
      date: payment.date
        ? new Date(payment.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    });
    setShowAddForm(true);
  };

  const handleDelete = (paymentId) => {
    setDeletingPaymentId(paymentId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(deletingPaymentId);
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  // Calculations
  const totalPaid = payments
    .filter(
      (p) =>
        p.status === "approved" &&
        (!p.transactionType || p.transactionType === "payment")
    )
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalReceived = payments
    .filter((p) => p.status === "approved" && p.transactionType === "received")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const pendingAmount = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const amountOwed = userBalance < 0 ? Math.abs(userBalance) : 0;

  return {
    payments,
    loading,
    showAddForm,
    setShowAddForm,
    editingPayment,
    userBalance,
    formData,
    setFormData,
    error,
    showDeleteModal,
    setShowDeleteModal,
    deletingPaymentId,
    setDeletingPaymentId,
    isSubmitting:
      addMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
    handleSubmit,
    handleEdit,
    handleDelete,
    confirmDelete,
    handleCancelEdit,
    totalPaid,
    totalReceived,
    pendingAmount,
    amountOwed,
  };
}
