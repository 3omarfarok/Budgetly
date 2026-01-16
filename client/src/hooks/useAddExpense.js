import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";

export function useAddExpense() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    description: "",
    category: "General",
    totalAmount: "",
    splitType: "equal",
    payer: user?._id || "",
  });
  const [error, setError] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Fetch Users
  const { data: users = [], isLoading: loading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await api.get("/users");
      return data;
    },
    onError: (error) => {
      console.error("خطأ في تحميل المستخدمين:", error);
      toast.error("فيه مشكلة في تحميل المستخدمين");
    },
  });

  useEffect(() => {
    if (user && !formData.payer) {
      setFormData((prev) => ({ ...prev, payer: user._id }));
    }
  }, [user, formData.payer]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSplitTypeChange = (e) => {
    const newSplitType = e.target.value;
    setFormData({ ...formData, splitType: newSplitType });
    if (newSplitType === "equal") {
      setSelectedUsers([]);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Add Mutation
  const addExpenseMutation = useMutation({
    mutationFn: (expenseData) => api.post("/expenses", expenseData),
    onSuccess: () => {
      queryClient.invalidateQueries(["expenses"]);
      queryClient.invalidateQueries(["myPayments"]); // If it affects payments/stats
      queryClient.invalidateQueries(["dashboardStats"]);

      if (user.role === "admin") {
        toast.success("تم تسجيل المصروف بنجاح!");
        navigate("/expenses");
      } else {
        toast.success("تم إرسال المصروف للمراجعة!");
        navigate("/my-invoices");
      }
    },
    onError: (err) => {
      const errorMessage =
        err.response?.data?.message || "خطأ في إنشاء المصروف";
      toast.error(errorMessage);
      setError(errorMessage);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.splitType === "specific" && selectedUsers.length === 0) {
      toast.warning("يرجى اختيار مستخدم واحد على الأقل");
      return;
    }

    const expenseData = {
      ...formData,
      totalAmount: Number(formData.totalAmount),
    };

    if (formData.splitType === "specific") {
      expenseData.selectedUsers = selectedUsers;
    }

    // Debug: log the payer value being sent
    console.log("Submitting expense with payer:", formData.payer);
    console.log("Full expense data:", expenseData);

    addExpenseMutation.mutate(expenseData);
  };

  return {
    user,
    formData,
    users,
    selectedUsers,
    loading,
    isSubmitting: addExpenseMutation.isPending,
    error,
    handleInputChange,
    handleSplitTypeChange,
    toggleUserSelection,
    handleSubmit,
  };
}
