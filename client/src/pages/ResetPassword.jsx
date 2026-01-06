import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Lock, Loader, CheckCircle } from "lucide-react";
import api from "../utils/api";
import { useToast } from "../context/ToastContext";
import { motion } from "framer-motion";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { token } = useParams();
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
      await api.put(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
      toast.success("تم تغيير كلمة المرور بنجاح");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "حدث خطأ أثناء تغيير كلمة المرور"
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
            إعادة تعيين كلمة المرور
          </h1>
          {!success && (
            <p className="text-[var(--color-text-secondary)]">
              أدخل كلمة المرور الجديدة
            </p>
          )}
        </div>

        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
              تم التغيير بنجاح!
            </h3>
            <p className="text-[var(--color-text-secondary)] mb-6">
              سيتم توجيهك إلى صفحة تسجيل الدخول...
            </p>
            <Link
              to="/login"
              className="text-[var(--color-primary)] hover:underline"
            >
              الذهاب لتسجيل الدخول الآن
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text)]"
                  placeholder="******"
                  required
                  minLength={6}
                />
                <Lock
                  className="absolute left-3 top-2.5 text-[var(--color-text-secondary)]"
                  size={20}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text)]"
                  placeholder="******"
                  required
                  minLength={6}
                />
                <Lock
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
                "تغيير كلمة المرور"
              )}
            </motion.button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
