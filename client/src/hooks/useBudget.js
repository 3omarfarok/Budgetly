import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../utils/api";

export function useBudget() {
  const { user } = useAuth();
  const toast = useToast();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    category: "",
    limit: "",
    period: "monthly", // monthly, weekly, yearly
  });

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      // Assuming GET /budgets endpoint exists
      const { data } = await api.get("/budgets");
      setBudgets(data);
    } catch (error) {
      console.error("غلط في تحميل الميزانية:", error);
      // Don't show toast on 404 if API doesn't exist yet, just empty list
      if (error.response && error.response.status !== 404) {
        toast.error("فيه مشكلة في تحميل الميزانية");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.limit) {
      toast.warning("لازم تدخل الفئة والحد الأقصى");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/budgets", formData);
      toast.success("تم إضافة الميزانية بنجاح");
      setShowAddModal(false);
      setFormData({ category: "", limit: "", period: "monthly" });
      fetchBudgets();
    } catch (error) {
      console.error("error adding budget", error);
      toast.error("فشل إضافة الميزانية");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("متأكد عايز تمسح الميزانية دي؟")) return;
    try {
      await api.delete(`/budgets/${id}`);
      toast.success("تم الحذف بنجاح");
      setBudgets((prev) => prev.filter((b) => b._id !== id));
    } catch (error) {
      toast.error("فشل الحذف");
    }
  };

  return {
    budgets,
    loading,
    error,
    showAddModal,
    setShowAddModal,
    formData,
    handleChange,
    handleSubmit,
    handleDelete,
    isSubmitting,
  };
}
