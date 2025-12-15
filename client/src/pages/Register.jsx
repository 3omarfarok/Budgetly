import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { User, AtSign, Lock, AlertCircle } from "lucide-react";
import Input from "../components/Input";

const Register = () => {
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

  const handleSubmit = async (e) => {
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-primary">
      <div className="w-full max-w-md">
        <div className="bg-ios-surface backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-ios-border">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-ios-dark mb-2 ">
              إنشاء حساب جديد
            </h1>
            <p className="text-ios-secondary">
              أنشئ حسابك للبدء في إدارة ميزانيتك
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="bg-ios-error/10 text-ios-error p-4 rounded-2xl mb-6 text-sm text-center border border-ios-error/20 flex items-center gap-2 justify-center"
              role="alert"
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-ios-secondary">
              لديك حساب بالفعل؟{" "}
              <Link
                to="/login"
                className="text-ios-primary hover:underline font-semibold transition-colors"
              >
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
