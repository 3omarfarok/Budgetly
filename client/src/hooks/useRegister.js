import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export function useRegister() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.username || !formData.password || !formData.name) {
      setError("جميع الحقول مطلوبة");
      toast.warning("جميع الحقول مطلوبة");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      toast.error("كلمات المرور غير متطابقة");
      return;
    }

    if (formData.password.length < 6) {
      setError("يجب أن تكون كلمة المرور 6 أحرف على الأقل");
      toast.warning("يجب أن تكون كلمة المرور 6 أحرف على الأقل");
      return;
    }

    setLoading(true);
    try {
      await register(formData.username, formData.password, formData.name);
      toast.success("تم إنشاء الحساب بنجاح!");
      navigate("/house-selection");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "حدث خطأ أثناء التسجيل";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    handleChange,
    error,
    loading,
    handleRegister,
  };
}
