import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { User, Lock, AlertCircle } from "lucide-react";
import Loader from "../components/Loader";
import Input from "../components/Input";

// صفحة تسجيل الدخول - محسّنة للإتاحة
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setLoading(true);
    try {
      await login(username, password);
      toast.success("أهلاً بيك!");
      navigate("/");
    } catch (err) {
      const errorMsg = "اليوزر أو الباسورد غلط";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] font-primary">
      <div className="bg-ios-surface backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-md border border-ios-border">
        <div className="flex justify-center mb-6">
          <img
            src="/assets/logo.png"
            alt="بدجتلي - Budgetly"
            className="w-28 h-auto dark:invert"
          />
        </div>

        <p className="text-ios-secondary text-center mb-8">
          اسهل طريقة عشان تتابع فيها مصاريف السكن
        </p>

        {loading ? (
          <Loader text="بندخلك اهو اصبر شوية..." />
        ) : (
          <>
            {error && (
              <div
                className="bg-ios-error/10 text-ios-error p-4 rounded-2xl mb-6 text-sm text-center border border-ios-error/20 flex items-center gap-2 justify-center"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle size={18} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                id="username"
                label="اسم المستخدم"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                icon={User}
                required
                autoComplete="username"
                error={error ? " " : ""}
              />

              <Input
                id="password"
                label="الباسورد"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                required
                autoComplete="current-password"
                error={error ? " " : ""}
              />

              <button
                type="submit"
                className="w-full py-4 px-4 bg-ios-primary hover:bg-ios-primary/90 text-white font-bold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-4 focus:ring-ios-primary/20"
                aria-label="دخول التطبيق"
              >
                ادخل
              </button>
            </form>

            {/* Registration Link */}
            <div className="mt-6 text-center">
              <p className="text-ios-secondary">
                معندكش حساب؟{" "}
                <Link
                  to="/register"
                  className="text-ios-primary hover:underline font-semibold transition-colors"
                >
                  سجل دلوقتي
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
