import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";

export function useMyInvoices() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const userId = user?.id || user?._id;
  const [activeTab, setActiveTab] = useState("invoices"); // "invoices" | "requests"
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date_desc"); // "date_desc" | "date_asc" | "amount_desc" | "amount_asc" | "status"
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  // Queries
  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ["myInvoices", userId],
    queryFn: async () => {
      const { data } = await api.get("/invoices/my-invoices");
      return data;
    },
    enabled: !!userId,
  });

  const { data: myRequests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["myRequests", userId],
    queryFn: async () => {
      const { data } = await api.get(`/expenses?createdBy=${userId}`);
      return data.expenses || [];
    },
    enabled: !!userId,
  });

  // Bulk payment state
  const [isBulkPayModalOpen, setIsBulkPayModalOpen] = useState(false);

  const loading = loadingInvoices || loadingRequests;

  // Mutations
  // Pay Single Invoice Mutation
  const payInvoiceMutation = useMutation({
    mutationFn: (invoiceId) => api.post(`/invoices/${invoiceId}/pay`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myInvoices"] });
      queryClient.invalidateQueries({ queryKey: ["profileStats"] });
      toast.success("تم إرسال طلب الدفع بنجاح!");
      setIsConfirmModalOpen(false);
      setSelectedInvoiceId(null);
    },
    onError: (error) => {
      console.error("Payment error:", error);
      const msg = error.response?.data?.message || "فشل إرسال طلب الدفع";
      toast.error(msg);
    },
  });

  // Pay All Invoices Mutation
  const payAllInvoicesMutation = useMutation({
    mutationFn: () => api.post("/invoices/bulk-pay"),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["myInvoices"] });
      queryClient.invalidateQueries({ queryKey: ["profileStats"] });
      toast.success(`تم إرسال طلبات الدفع لـ ${data.data.count} فاتورة بنجاح!`);
      setIsBulkPayModalOpen(false);
    },
    onError: (error) => {
      console.error("Bulk Payment error:", error);
      const msg =
        error.response?.data?.message || "حدث خطأ أثناء الدفع الجماعي";
      toast.error(msg);
    },
  });

  // Delete Request State and Mutation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const deleteRequestMutation = useMutation({
    mutationFn: (requestId) => api.delete(`/expenses/${requestId}/my-request`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myRequests"] });
      toast.success("تم حذف الطلب بنجاح!");
      setIsDeleteModalOpen(false);
      setSelectedRequestId(null);
    },
    onError: (error) => {
      console.error("Delete request error:", error);
      const msg = error.response?.data?.message || "فشل حذف الطلب";
      toast.error(msg);
    },
  });

  // Handlers
  const handlePay = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setIsConfirmModalOpen(true);
  };

  const confirmPayment = () => {
    if (selectedInvoiceId) {
      payInvoiceMutation.mutate(selectedInvoiceId);
    }
  };

  const handleBulkPay = () => {
    setIsBulkPayModalOpen(true);
  };

  const confirmBulkPayment = () => {
    payAllInvoicesMutation.mutate();
  };

  const handleDeleteRequest = (requestId) => {
    setSelectedRequestId(requestId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteRequest = () => {
    if (selectedRequestId) {
      deleteRequestMutation.mutate(selectedRequestId);
    }
  };

  // Sort function
  const sortData = (data) => {
    const sorted = [...data];
    switch (sortBy) {
      case "date_desc":
        return sorted.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
      case "date_asc":
        return sorted.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        );
      case "amount_desc":
        return sorted.sort(
          (a, b) => (b.amount || b.totalAmount) - (a.amount || a.totalAmount),
        );
      case "amount_asc":
        return sorted.sort(
          (a, b) => (a.amount || a.totalAmount) - (b.amount || b.totalAmount),
        );
      case "status":
        return sorted.sort((a, b) => a.status.localeCompare(b.status));
      default:
        return sorted;
    }
  };

  // Filter Logic
  const filteredData = sortData(
    activeTab === "invoices"
      ? invoices.filter((inv) => {
          const matchesSearch = inv.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const matchesStatus =
            filterStatus === "all" || inv.status === filterStatus;
          return matchesSearch && matchesStatus;
        })
      : myRequests.filter((req) => {
          const matchesSearch = req.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const matchesStatus =
            filterStatus === "all" || req.status === filterStatus;
          return matchesSearch && matchesStatus;
        }),
  );

  const totalPending = invoices
    .filter((inv) => inv.status === "pending")
    .reduce((sum, inv) => sum + inv.amount, 0);

  return {
    activeTab,
    setActiveTab,
    invoices,
    myRequests,
    loading,
    filterStatus,
    setFilterStatus,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filteredData,
    totalPending,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    handlePay,
    confirmPayment,
    isPaying: payInvoiceMutation.isPending,
    // Bulk Payment Exports
    isBulkPayModalOpen,
    setIsBulkPayModalOpen,
    handleBulkPay,
    confirmBulkPayment,
    isBulkPaying: payAllInvoicesMutation.isPending,
    // Delete Request Exports
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    handleDeleteRequest,
    confirmDeleteRequest,
    isDeleting: deleteRequestMutation.isPending,
  };
}
