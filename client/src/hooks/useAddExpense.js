import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../utils/api";

export function useAddExpense() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    description: "",
    category: "General",
    totalAmount: "",
    splitType: "equal",
  });
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/users");
      setUsers(data);
    } catch (error) {
      console.error("خطأ في تحميل المستخدمين:", error);
      toast.error("فيه مشكلة في تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.splitType === "specific" && selectedUsers.length === 0) {
      toast.warning("يرجى اختيار مستخدم واحد على الأقل");
      return;
    }

    try {
      setIsSubmitting(true);
      const expenseData = {
        ...formData,
        totalAmount: Number(formData.totalAmount),
      };

      if (formData.splitType === "specific") {
        expenseData.selectedUsers = selectedUsers;
      }

      await api.post("/expenses", expenseData);

      if (user.role === "admin") {
        toast.success("تم تسجيل المصروف بنجاح!");
        navigate("/expenses");
      } else {
        toast.success("تم إرسال المصروف للمراجعة!");
        navigate("/my-invoices"); // Or wherever users should go
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "خطأ في إنشاء المصروف";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    user,
    formData,
    users,
    selectedUsers,
    loading,
    isSubmitting,
    error,
    handleInputChange,
    handleSplitTypeChange,
    toggleUserSelection,
    handleSubmit,
  };
}
