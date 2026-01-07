import { useState, useMemo } from "react";
import { useToast } from "../context/ToastContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";

export function useAllInvoices() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Queries
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await api.get("/users");
      return data;
    },
    onError: (err) => console.error("Error fetching users", err),
  });

  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ["allInvoices"],
    queryFn: async () => {
      const { data } = await api.get("/invoices/all");
      return data;
    },
    onError: (err) => console.error("Error fetching invoices", err),
  });

  const { data: pendingRequests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["pendingRequests"],
    queryFn: async () => {
      const { data } = await api.get("/expenses?status=pending");
      return data.expenses || [];
    },
    onError: (err) => console.error("Error fetching pending requests", err),
  });

  const loading = loadingUsers || loadingInvoices || loadingRequests;

  const refreshData = () => {
    queryClient.invalidateQueries(["users"]);
    queryClient.invalidateQueries(["allInvoices"]);
    queryClient.invalidateQueries(["pendingRequests"]);
  };

  // Mutations
  const approvePaymentMutation = useMutation({
    mutationFn: (id) => api.put(`/invoices/${id}/approve`),
    onSuccess: () => {
      toast.success("تم الموافقة على الدفع");
      queryClient.invalidateQueries(["allInvoices"]);
      queryClient.invalidateQueries(["users"]); // Updates user stats
    },
    onError: (err) => {
      console.error("Approval error:", err);
      toast.error("فشل الموافقة على الدفع");
    },
  });

  const rejectPaymentMutation = useMutation({
    mutationFn: ({ id, reason }) =>
      api.put(`/invoices/${id}/reject`, { reason }),
    onSuccess: () => {
      toast.info("تم رفض الدفع");
      queryClient.invalidateQueries(["allInvoices"]);
    },
    onError: (err) => {
      console.error("Rejection error:", err);
      toast.error("فشل رفض الدفع");
    },
  });

  const approveRequestMutation = useMutation({
    mutationFn: (id) => api.put(`/expenses/${id}/approve`),
    onSuccess: () => {
      toast.success("تم الموافقة على الطلب وإنشاء الفواتير");
      queryClient.invalidateQueries(["pendingRequests"]);
      queryClient.invalidateQueries(["allInvoices"]); // New invoices created
    },
    onError: (err) => {
      console.error("Approval error:", err);
      toast.error("فشل الموافقة على الطلب");
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: ({ id, reason }) =>
      api.put(`/expenses/${id}/reject`, { reason }),
    onSuccess: () => {
      toast.info("تم رفض الطلب");
      queryClient.invalidateQueries(["pendingRequests"]);
    },
    onError: (err) => {
      console.error("Rejection error:", err);
      toast.error("فشل رفض الطلب");
    },
  });

  // Handlers
  const handleApprove = (id) => {
    if (!window.confirm("هل أنت متأكد من الموافقة على الدفع؟")) return;
    approvePaymentMutation.mutate(id);
  };

  const handleReject = (id) => {
    const reason = window.prompt("سبب الرفض:");
    if (!reason) return;
    rejectPaymentMutation.mutate({ id, reason });
  };

  const handleApproveRequest = (id) => {
    if (!window.confirm("هل أنت متأكد من الموافقة على هذا الطلب؟")) return;
    approveRequestMutation.mutate(id);
  };

  const handleRejectRequest = (id) => {
    const reason = window.prompt("سبب الرفض:");
    if (!reason) return;
    rejectRequestMutation.mutate({ id, reason });
  };

  // Derived Data
  const userStats = useMemo(() => {
    return users.map((u) => {
      const uInvoices = invoices.filter(
        (inv) => (inv.user?._id || inv.user) === u._id
      );
      const pendingCount = uInvoices.filter(
        (inv) => inv.status === "pending"
      ).length;
      const awaitingCount = uInvoices.filter(
        (inv) => inv.status === "awaiting_approval"
      ).length;
      return {
        ...u,
        pendingCount,
        awaitingCount,
        totalInvoices: uInvoices.length,
      };
    });
  }, [users, invoices]);

  const selectedUser = useMemo(
    () => users.find((u) => u._id === selectedUserId),
    [users, selectedUserId]
  );

  const selectedUserInvoices = useMemo(
    () =>
      selectedUserId
        ? invoices.filter(
            (inv) => (inv.user?._id || inv.user) === selectedUserId
          )
        : [],
    [invoices, selectedUserId]
  );

  return {
    users,
    invoices,
    pendingRequests,
    loading,
    refreshData,
    selectedUserId,
    setSelectedUserId,
    userStats,
    selectedUser,
    selectedUserInvoices,
    handleApprove,
    handleReject,
    handleApproveRequest,
    handleRejectRequest,
  };
}
