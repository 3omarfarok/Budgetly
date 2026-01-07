import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";

export function useMyInvoices() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("invoices"); // "invoices" | "requests"
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  // Queries
  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ["myInvoices", user?.id],
    queryFn: async () => {
      const { data } = await api.get("/invoices/my-invoices");
      return data;
    },
    enabled: !!user,
  });

  const { data: myRequests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["myRequests", user?.id],
    queryFn: async () => {
      const userId = user.id || user._id;
      const { data } = await api.get(`/expenses?createdBy=${userId}`);
      return data.expenses || [];
    },
    enabled: !!user,
  });

  const loading = loadingInvoices || loadingRequests;

  // Mutations
  const payMutation = useMutation({
    mutationFn: (invoiceId) => api.post(`/invoices/${invoiceId}/pay`),
    onSuccess: () => {
      queryClient.invalidateQueries(["myInvoices"]);
      toast.success("تم إرسال طلب الدفع بنجاح!");
      setIsConfirmModalOpen(false);
      setSelectedInvoiceId(null);
    },
    onError: (error) => {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || "فشل إرسال طلب الدفع");
    },
  });

  const handlePay = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setIsConfirmModalOpen(true);
  };

  const confirmPayment = () => {
    if (!selectedInvoiceId) return;
    payMutation.mutate(selectedInvoiceId);
  };

  // Filter Logic
  const filteredData =
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
        });

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
    filteredData,
    totalPending,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    handlePay,
    confirmPayment,
    isPaying: payMutation.isPending,
  };
}
