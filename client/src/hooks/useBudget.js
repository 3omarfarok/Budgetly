import { useState } from "react";
import { useToast } from "../context/ToastContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";

const initialFormData = {
  category: "",
  limit: "",
  period: "monthly",
};

export function useBudget() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  const {
    data: budgets = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const { data } = await api.get("/budgets");
      return Array.isArray(data) ? data : data?.budgets || [];
    },
  });

  const addMutation = useMutation({
    mutationFn: (payload) =>
      api.post("/budgets", {
        ...payload,
        limit: Number(payload.limit),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("تم إضافة الميزانية بنجاح");
      setShowAddModal(false);
      setFormData(initialFormData);
    },
    onError: (mutationError) => {
      const message =
        mutationError.response?.data?.message || "فشل إضافة الميزانية";
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/budgets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("تم حذف الميزانية");
    },
    onError: () => {
      toast.error("فشل الحذف");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category || !formData.limit) {
      toast.warning("لازم تدخل الفئة والحد الأقصى");
      return;
    }
    addMutation.mutate(formData);
  };

  const handleDelete = (id) => {
    if (!window.confirm("متأكد عايز تمسح الميزانية دي؟")) return;
    deleteMutation.mutate(id);
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
    isSubmitting: addMutation.isPending,
  };
}
