import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../utils/api";

const usePayments = () => {
  const [payments, setPayments] = useState([]);
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const endpoint =
        user.role === "admin" ? "/payments" : `/payments/user/${user.id}`;
      const { data } = await api.get(endpoint);
      setPayments(data);
      setSelectedPayments([]); // Reset selection on fetch
    } catch (error) {
      console.error("غلط في تحميل المدفوعات:", error);
      toast.error("فيه مشكلة في تحميل المدفوعات");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/payments/${id}/approve`);
      toast.success("تم الموافقة على الدفعة بنجاح");
      fetchPayments();
    } catch (error) {
      console.error("غلط في الموافقة:", error);
      toast.error("فيه مشكلة في الموافقة");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/payments/${id}/reject`);
      toast.success("تم رفض الدفعة");
      fetchPayments();
    } catch (error) {
      console.error("غلط في الرفض:", error);
      toast.error("فيه مشكلة في الرفض");
    }
  };

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
          selectedPayments.map((id) => api.delete(`/payments/${id}`))
        );
        toast.success(`تم حذف ${selectedPayments.length} دفعة بنجاح`);
        setSelectedPayments([]);
        setIsSelectionMode(false);
      } else {
        await api.delete(`/payments/${deletingPaymentId}`);
        toast.success("تم حذف الدفعة بنجاح");
      }
      setShowDeleteModal(false);
      setDeletingPaymentId(null);
      fetchPayments();
    } catch (error) {
      console.error("غلط في الحذف:", error);
      toast.error("فيه مشكلة في حذف الدفعة");
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
        pendingSelected.map((p) => api.patch(`/payments/${p._id}/approve`))
      );
      toast.success(`تمت الموافقة على ${pendingSelected.length} دفعة`);
      setSelectedPayments([]);
      setIsSelectionMode(false);
      fetchPayments();
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
