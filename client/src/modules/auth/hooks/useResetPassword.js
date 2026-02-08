import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../shared/context/ToastContext";
import { authApi } from "../api";

export function useResetPassword(token) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("كلمات المرور غير متطابقة");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      setSuccess(true);
      toast.success("تم تغيير كلمة المرور بنجاح");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || "حدث خطأ أثناء تغيير كلمة المرور");
    } finally {
      setLoading(false);
    }
  };

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    success,
    handleSubmit,
  };
}
