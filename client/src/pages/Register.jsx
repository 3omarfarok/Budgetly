import { Link } from "react-router-dom";
import { User, AtSign, Lock, Mail } from "lucide-react";
import Input from "../components/Input";
import AuthCard from "../components/auth/AuthCard";
import { useRegister } from "../hooks/useRegister";

const Register = () => {
  const { formData, handleChange, error, loading, handleRegister } =
    useRegister();

  const footerLink = (
    <p className="text-ios-secondary">
      لديك حساب بالفعل؟{" "}
      <Link
        to="/login"
        className="text-ios-primary hover:underline font-semibold transition-colors"
      >
        تسجيل الدخول
      </Link>
    </p>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-primary">
      {/* AuthCard expects a container but handles its own centering. 
           However, Register page had an extra wrapper `min-h-screen flex items-center...` 
           AuthCard has `min-h-[85vh]` and centering. 
           To match exactly, I might need to adjust AuthCard or just use it directly.
           AuthCard uses `min-h-[85vh]` which is close.
           Let's just use AuthCard directly.
       */}
      <div className="w-full max-w-md">
        {/* Wait, AuthCard renders the container. */}
      </div>
    </div>
  );
  // Correction: AuthCard renders the full page structure (mostly).
  // Register has a slightly different outer Wrapper `min-h-screen`. AuthCard has `min-h-[85vh]`.
  // I should just replace the return.
};
// Re-writing the component properly below
const RegisterComponent = () => {
  const { formData, handleChange, error, loading, handleRegister } =
    useRegister();

  const footerLink = (
    <p className="text-ios-secondary">
      لديك حساب بالفعل؟{" "}
      <Link
        to="/login"
        className="text-ios-primary hover:underline font-semibold transition-colors"
      >
        تسجيل الدخول
      </Link>
    </p>
  );

  return (
    <AuthCard
      title="إنشاء حساب جديد"
      subtitle="أنشئ حسابك للبدء في إدارة ميزانيتك"
      error={error}
      loading={loading}
      loadingText="جاري التسجيل..."
      footer={footerLink}
    >
      <form onSubmit={handleRegister} className="space-y-5">
        <Input
          id="name"
          name="name"
          label="الاسم الكامل"
          type="text"
          value={formData.name}
          onChange={handleChange}
          icon={User}
          placeholder="أدخل اسمك الكامل"
          disabled={loading}
          required
        />

        <Input
          id="email"
          name="email"
          label="البريد الإلكتروني"
          type="email"
          value={formData.email}
          onChange={handleChange}
          icon={Mail}
          placeholder="example@email.com"
          disabled={loading}
          required
        />

        <Input
          id="username"
          name="username"
          label="اسم المستخدم"
          type="text"
          value={formData.username}
          onChange={handleChange}
          icon={AtSign}
          placeholder="اختر اسم مستخدم"
          disabled={loading}
          required
        />

        <Input
          id="password"
          name="password"
          label="كلمة المرور"
          type="password"
          value={formData.password}
          onChange={handleChange}
          icon={Lock}
          placeholder="أدخل كلمة مرور قوية"
          disabled={loading}
          required
          hint="يجب أن تكون 6 أحرف على الأقل"
        />

        <Input
          id="confirmPassword"
          name="confirmPassword"
          label="تأكيد كلمة المرور"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          icon={Lock}
          placeholder="أعد إدخال كلمة المرور"
          disabled={loading}
          required
          error={
            formData.confirmPassword &&
            formData.password !== formData.confirmPassword
              ? "كلمات المرور غير متطابقة"
              : ""
          }
          success={
            formData.confirmPassword &&
            formData.password === formData.confirmPassword
              ? "كلمات المرور متطابقة"
              : ""
          }
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ios-primary hover:bg-ios-primary/90 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {loading ? "جاري التسجيل..." : "إنشاء الحساب"}
        </button>
      </form>
    </AuthCard>
  );
};
export default RegisterComponent;
