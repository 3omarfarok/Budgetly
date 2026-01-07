import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";
import { useToast } from "../context/ToastContext";

const useProfile = (user, updateUser) => {
  const toast = useToast();

  // Fetch Profile Stats
  const {
    data: stats,
    isLoading: loadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ["profileStats", user?.id],
    queryFn: async () => {
      const [balancesRes, paymentsRes, expensesRes] = await Promise.all([
        api.get("/stats/balances"),
        api.get("/payments"),
        api.get("/expenses?limit=1000"),
      ]);

      const balances = balancesRes.data;
      const payments = paymentsRes.data;
      // Handle both paginated (object) and non-paginated (array) responses
      const expenses = Array.isArray(expensesRes.data)
        ? expensesRes.data
        : expensesRes.data.expenses || [];

      // Find current user's balance
      const userBalance =
        balances.find((b) => b.userId.toString() === user.id) || {};

      // Filter user's payments
      const userPayments = payments.filter(
        (p) => p.user && p.user._id === user.id
      );

      // Filter expenses that include this user
      const userExpenses = expenses.filter((e) =>
        e.splits.some((s) => s.user && s.user._id === user.id)
      );

      return {
        balance: userBalance.balance || 0,
        totalOwed: userBalance.totalOwed || 0,
        totalPaid: userBalance.totalPaid || 0,
        paymentsCount: userPayments.length,
        expensesCount: userExpenses.length,
        pendingPayments: userPayments.filter((p) => p.status === "pending")
          .length,
        approvedPayments: userPayments.filter((p) => p.status === "approved")
          .length,
      };
    },
    enabled: !!user,
  });

  // Update Profile Picture
  const updateAvatarMutation = useMutation({
    mutationFn: (avatar) =>
      api.patch("/users/me/profile-picture", { profilePicture: avatar }),
    onSuccess: (response) => {
      if (updateUser) updateUser(response.data);
      toast.success("تم حفظ صورة الملف الشخصي بنجاح!");
    },
    onError: (error) => {
      console.error("Error updating avatar:", error);
      toast.error("فيه مشكلة في حفظ الصورة");
    },
  });

  // Update Username
  const updateUsernameMutation = useMutation({
    mutationFn: (username) => api.patch("/users/me/username", { username }),
    onSuccess: (response) => {
      if (updateUser) updateUser(response.data);
      toast.success("تم تغيير اليوزرنيم بنجاح!");
    },
    onError: (error) => {
      console.error("Error updating username:", error);
      toast.error(
        error.response?.data?.message || "فيه مشكلة في تغيير اليوزرنيم"
      );
    },
  });

  // Update Name
  const updateNameMutation = useMutation({
    mutationFn: (name) => api.patch("/users/me/name", { name }),
    onSuccess: (response) => {
      if (updateUser) updateUser(response.data);
      toast.success("تم تغيير الاسم بنجاح!");
    },
    onError: (error) => {
      console.error("Error updating name:", error);
      toast.error(error.response?.data?.message || "فيه مشكلة في تغيير الاسم");
    },
  });

  // Update Email
  const updateEmailMutation = useMutation({
    mutationFn: (email) => api.patch("/users/me/profile", { email }),
    onSuccess: (response) => {
      if (updateUser) updateUser(response.data.user);
      toast.success("تم تحديث البريد الإلكتروني بنجاح!");
    },
    onError: (error) => {
      console.error("Error updating email:", error);
      toast.error(
        error.response?.data?.message || "فيه مشكلة في تحديث البريد الإلكتروني"
      );
    },
  });

  return {
    stats,
    loadingStats,
    statsError,
    updateAvatar: updateAvatarMutation.mutateAsync,
    updateUsername: updateUsernameMutation.mutateAsync,
    updateName: updateNameMutation.mutateAsync,
    updateEmail: updateEmailMutation.mutateAsync,
    isUpdatingAvatar: updateAvatarMutation.isPending,
    isUpdatingUsername: updateUsernameMutation.isPending,
    isUpdatingName: updateNameMutation.isPending,
    isUpdatingEmail: updateEmailMutation.isPending,
  };
};

export default useProfile;
