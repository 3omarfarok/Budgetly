import { Link } from "react-router-dom";
import { User, Lock } from "lucide-react";
import Input from "../components/Input";
import AuthCard from "../components/auth/AuthCard";
import { useLogin } from "../hooks/useLogin";

// صفحة تسجيل الدخول - محسّنة للإتاحة
const Login = () => {
  const {
    username,
    setUsername,
    password,
    setPassword,
    error,
    loading,
    handleLogin,
  } = useLogin();

  const footerLink = (
    <p className="text-ios-secondary">
      معندكش حساب؟{" "}
      <Link
        to="/register"
        className="text-ios-primary hover:underline font-semibold transition-colors"
      >
        سجل دلوقتي
      </Link>
    </p>
  );

  return (
    <AuthCard
      subtitle="اسهل طريقة عشان تتابع فيها مصاريف السكن"
      error={error}
      loading={loading}
      loadingText="بندخلك اهو اصبر شوية..."
      footer={footerLink}
    >
      <form onSubmit={handleLogin} className="space-y-5">
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

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 transition-colors"
          >
            نسيت كلمة المرور؟
          </Link>
        </div>

        <button
          type="submit"
          className="w-full py-4 px-4 bg-ios-primary hover:bg-ios-primary/90 text-white font-bold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-4 focus:ring-ios-primary/20"
          aria-label="دخول التطبيق"
        >
          ادخل
        </button>
      </form>
    </AuthCard>
  );
};

export default Login;
