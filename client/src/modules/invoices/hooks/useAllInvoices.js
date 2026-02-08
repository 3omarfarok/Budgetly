import { useState, useMemo } from "react";
import { useToast } from "../../../shared/context/ToastContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/api/queryKeys";
import { invoicesApi } from "../api/invoicesApi";

export function useAllInvoices() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState(null);

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: queryKeys.users.all,
    queryFn: invoicesApi.getUsers,
  });

  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: queryKeys.allInvoices.all,
    queryFn: invoicesApi.getAllInvoices,
  });

  const { data: pendingRequests = [], isLoading: loadingRequests } = useQuery({
    queryKey: queryKeys.expenses.pendingRequests,
    queryFn: invoicesApi.getPendingRequests,
  });

  const loading = loadingUsers || loadingInvoices || loadingRequests;

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.allInvoices.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.expenses.pendingRequests });
  };

  const approvePaymentMutation = useMutation({
    mutationFn: invoicesApi.approveInvoice,
    onSuccess: () => {
      toast.success("تم الموافقة على الدفع");
      queryClient.invalidateQueries({ queryKey: queryKeys.allInvoices.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: (err) => {
      console.error("Approval error:", err);
      toast.error("فشل الموافقة على الدفع");
    },
  });

  const rejectPaymentMutation = useMutation({
    mutationFn: invoicesApi.rejectInvoice,
    onSuccess: () => {
      toast.info("تم رفض الدفع");
      queryClient.invalidateQueries({ queryKey: queryKeys.allInvoices.all });
    },
    onError: (err) => {
      console.error("Rejection error:", err);
      toast.error("فشل رفض الدفع");
    },
  });

  const approveRequestMutation = useMutation({
    mutationFn: invoicesApi.approveRequest,
    onSuccess: () => {
      toast.success("تم الموافقة على الطلب وإنشاء الفواتير");
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.pendingRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.allInvoices.all });
    },
    onError: (err) => {
      console.error("Approval error:", err);
      toast.error("فشل الموافقة على الطلب");
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: invoicesApi.rejectRequest,
    onSuccess: () => {
      toast.info("تم رفض الطلب");
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.pendingRequests });
    },
    onError: (err) => {
      console.error("Rejection error:", err);
      toast.error("فشل رفض الطلب");
    },
  });

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

  const userStats = useMemo(() => {
    return users.map((u) => {
      const uInvoices = invoices.filter((inv) => (inv.user?._id || inv.user) === u._id);
      const pendingCount = uInvoices.filter((inv) => inv.status === "pending").length;
      const awaitingCount = uInvoices.filter((inv) => inv.status === "awaiting_approval").length;
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
        ? invoices.filter((inv) => (inv.user?._id || inv.user) === selectedUserId)
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
