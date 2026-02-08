import { useState } from "react";
import { useToast } from "../../../shared/context/ToastContext";
import { authApi } from "../api";

export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
      toast.success("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني");
    } catch (err) {
      toast.error(err.response?.data?.message || "حدث خطأ أثناء إرسال البريد الإلكتروني");
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    loading,
    sent,
    handleSubmit,
  };
}
