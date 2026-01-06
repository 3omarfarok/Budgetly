import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, Loader } from "lucide-react";
import api from "../utils/api";
import { useToast } from "../context/ToastContext";
import { motion } from "framer-motion";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success(
        "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني"
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || "حدث خطأ أثناء إرسال البريد الإلكتروني"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface)] p-8 rounded-2xl shadow-lg w-full max-w-md border border-[var(--color-border)]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
            نسيت كلمة المرور؟
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
          </p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={32} />
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
              تفقّد بريدك الإلكتروني
            </h3>
            <p className="text-[var(--color-text-secondary)] mb-6">
              لقد أرسلنا رابط إعادة التعيين إلى {email}
            </p>
            <Link
              to="/login"
              className="text-[var(--color-primary)] hover:underline flex items-center justify-center gap-2"
            >
              <ArrowRight size={16} />
              العودة لتسجيل الدخول
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text)] dir-ltr"
                  placeholder="name@example.com"
                  required
                />
                <Mail
                  className="absolute left-3 top-2.5 text-[var(--color-text-secondary)]"
                  size={20}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-primary)] text-white py-2 rounded-lg hover:brightness-90 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                "إرسال الرابط"
              )}
            </motion.button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
              >
                العودة لتسجيل الدخول
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
