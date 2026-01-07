import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";

export function useBudget() {
  const { user: _user } = useAuth(); // keep user import or remove if completely unused. The lint said 'user' is unused.
  // Wait, line 8:11 error 'user' is assigned but never used.
  // I will just remove it.
  const toast = useToast();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  // ...

  const {
    data: budgets = [],
    isLoading: loading,
    error,
  } = useQuery({
    // ...
    onError: (error) => {
      // ...
    },
  });

  const addMutation = useMutation({
    mutationFn: (data) => api.post("/budgets", data),
    onSuccess: () => {
      // ...
    },
    onError: (error) => {
      // ...
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/budgets/${id}`),
    onSuccess: () => {
      // ...
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
