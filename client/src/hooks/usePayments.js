import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";

const usePayments = () => {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Selection
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState(null);

  const fetchPayments = async () => {
    const endpoint =
      user.role === "admin" ? "/payments" : `/payments/user/${user.id}`;
    const { data } = await api.get(endpoint);
    return data;
  };

  const { data: payments = [], isLoading: loading } = useQuery({
    queryKey: ["payments", user.role, user.id],
    queryFn: fetchPayments,
  });

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (id) => api.patch(`/payments/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries(["payments"]);
      toast.success("تم الموافقة على الدفعة بنجاح");
    },
    onError: (error) => {
      console.error("غلط في الموافقة:", error);
      toast.error("فيه مشكلة في الموافقة");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => api.patch(`/payments/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries(["payments"]);
      toast.success("تم رفض الدفعة");
    },
    onError: (error) => {
      console.error("غلط في الرفض:", error);
      toast.error("فيه مشكلة في الرفض");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/payments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["payments"]);
    },
    onError: (error) => {
      console.error("غلط في الحذف:", error);
      toast.error("فيه مشكلة في حذف الدفعة");
    },
  });

  const handleApprove = (id) => approveMutation.mutate(id);
  const handleReject = (id) => rejectMutation.mutate(id);

  // Single Delete
  const handleDeleteClick = (id) => {
    setDeletingPaymentId(id);
    setShowDeleteModal(true);
  };

  // Bulk Delete
  const handleBulkDeleteClick = () => {
    if (selectedPayments.length === 0) return;
    setDeletingPaymentId("bulk");
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (deletingPaymentId === "bulk") {
        await Promise.all(
          selectedPayments.map((id) => deleteMutation.mutateAsync(id))
        );
        toast.success(`تم حذف ${selectedPayments.length} دفعة بنجاح`);
        setSelectedPayments([]);
        setIsSelectionMode(false);
      } else {
        await deleteMutation.mutateAsync(deletingPaymentId);
        toast.success("تم حذف الدفعة بنجاح");
      }
      setShowDeleteModal(false);
      setDeletingPaymentId(null);
    } catch {
      // Error handled in mutation onError
    }
  };

  // Bulk Approve
  const handleBulkApprove = async () => {
    try {
      const pendingSelected = payments.filter(
        (p) => selectedPayments.includes(p._id) && p.status === "pending"
      );
      if (pendingSelected.length === 0) {
        toast.info("مفيش مدفوعات معلقة في المحدد");
        return;
      }
      await Promise.all(
        pendingSelected.map((p) => approveMutation.mutateAsync(p._id))
      );
      toast.success(`تمت الموافقة على ${pendingSelected.length} دفعة`);
      setSelectedPayments([]);
      setIsSelectionMode(false);
    } catch (error) {
      console.error("Bulk approve error:", error);
      toast.error("حصلت مشكلة في الموافقة الجماعية");
    }
  };

  // Selection Logic
  const toggleSelect = (id) => {
    setSelectedPayments((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  // Filter Logic
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paidBy?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === "all" ||
      (filterType === "payment" &&
        (!payment.transactionType || payment.transactionType === "payment")) ||
      (filterType === "received" && payment.transactionType === "received");

    const matchesStatus =
      filterStatus === "all" || payment.status === filterStatus;

    const matchesDate =
      !filterDate ||
      new Date(payment.date).toISOString().split("T")[0] === filterDate;

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    if (selectedPayments.length === paginatedPayments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(paginatedPayments.map((p) => p._id));
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    setSelectedPayments([]); // Clear selection when fitlers change
  }, [searchTerm, filterType, filterStatus, filterDate]);

  return {
    loading,
    payments,
    paginatedPayments,
    totalPages,
    currentPage,
    setCurrentPage,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    filterDate,
    setFilterDate,
    selectedPayments,
    isSelectionMode,
    setIsSelectionMode,
    toggleSelect,
    toggleSelectAll,
    handleDeleteClick,
    handleBulkDeleteClick,
    handleBulkApprove,
    handleApprove,
    handleReject,
    showDeleteModal,
    setShowDeleteModal,
    deletingPaymentId,
    setDeletingPaymentId,
    confirmDelete,
  };
};

export default usePayments;
