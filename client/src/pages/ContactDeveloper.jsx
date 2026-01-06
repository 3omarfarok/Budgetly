import { useState } from "react";
import { Mail, Send, User, MessageSquare } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Input from "../components/Input";

const ContactDeveloper = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const text = `رسالة جديدة من تطبيق Budgetly 📱\nالاسم: ${formData.name}\nالإيميل: ${formData.email}\nالموضوع: ${formData.subject}\n----------------\n${formData.message}`;
      const encodedText = encodeURIComponent(text);
      const whatsappUrl = `https://wa.me/201005291205?text=${encodedText}`;

      window.open(whatsappUrl, "_blank");

      toast.success("بيتم تحويلك للواتساب...");

      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("حصلت مشكلة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto font-primary">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-2xl bg-ios-primary/10">
          <Mail className="text-ios-primary" size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-ios-text">تواصل مع المطور</h1>
          <p className="text-ios-secondary mt-1">
            عندك اقتراح؟ مشكلة؟ أو مجرد عايز تسلم؟ ابعتلنا!
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="backdrop-blur-xl p-8 rounded-3xl space-y-6 shadow-lg bg-ios-card border border-ios-border"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="الاسم"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            icon={User}
            required
            disabled={isSubmitting}
          />
          <Input
            label="البريد الإلكتروني"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            icon={Mail}
            required
            disabled={isSubmitting}
          />
        </div>

        <Input
          label="الموضوع"
          value={formData.subject}
          onChange={(e) =>
            setFormData({ ...formData, subject: e.target.value })
          }
          icon={MessageSquare}
          required
          disabled={isSubmitting}
          placeholder="بخصوص..."
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-ios-text block">
            الرسالة
          </label>
          <textarea
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            required
            disabled={isSubmitting}
            rows={5}
            className="w-full px-4 py-3 rounded-xl bg-ios-bg border border-ios-border focus:border-ios-primary focus:ring-1 focus:ring-ios-primary transition-all duration-200 outline-none resize-none text-ios-text placeholder-ios-secondary"
            placeholder="اكتب رسالتك هنا..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-4 bg-ios-primary text-white font-bold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            "جاري الإرسال..."
          ) : (
            <>
              <Send size={20} />
              إرسال الرسالة
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ContactDeveloper;
