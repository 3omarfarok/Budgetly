import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../utils/api";

export function useMyPayments() {
  const { user } = useAuth();
  const toast = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMyPayments();
    fetchUserBalance();
  }, []);

  const fetchMyPayments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/payments/user/${user.id}`);
      setPayments(data);
    } catch (error) {
      console.error("غلط في تحميل مدفوعاتي:", error);
      toast.error("فيه مشكلة في تحميل مدفوعاتك");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBalance = async () => {
    try {
      const { data } = await api.get(`/stats/user/${user.id}`);
      setUserBalance(data.balance || 0);
    } catch (error) {
      console.error("غلط في تحميل الرصيد:", error);
      toast.error("فيه مشكلة في تحميل الرصيد");
    }
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

    try {
      setIsSubmitting(true);
      if (editingPayment) {
        // تعديل دفعة موجودة - keep original type if exists, or default to payment
        await api.put(`/payments/${editingPayment._id}`, {
          amount: formData.amount,
          description: formData.description,
          date: formData.date,
          transactionType: editingPayment.transactionType || "payment",
        });
        toast.success("تم تعديل الدفعة بنجاح!");
      } else {
        // إضافة دفعة جديدة - ALWAYS payment (User Paying)
        await api.post("/payments", {
          user: user.id,
          amount: formData.amount,
          description: formData.description,
          date: formData.date,
          transactionType: "payment",
        });
        toast.success("تم تسجيل الدفعة بنجاح!");
      }

      // إعادة تعيين الفورم
      setFormData({
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      setShowAddForm(false);
      setEditingPayment(null);
      fetchMyPayments();
      fetchUserBalance();
    } catch (error) {
      console.error("غلط في تسجيل الدفعة:", error);
      const errorMsg = "فيه مشكلة في تسجيل الدفعة";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
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

  const confirmDelete = async () => {
    try {
      setIsSubmitting(true);
      await api.delete(`/payments/${deletingPaymentId}`);
      toast.success("تم حذف الدفعة بنجاح");
      fetchMyPayments();
      fetchUserBalance();
      setShowDeleteModal(false);
      setDeletingPaymentId(null);
    } catch (error) {
      console.error("غلط في مسح الدفعة:", error);
      toast.error("فيه مشكلة في حذف الدفعة");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingPayment(null);
    setFormData({
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
    setShowAddForm(false);
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
    isSubmitting,
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
