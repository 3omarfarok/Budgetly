import React from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  CreditCard,
  Bot,
  ChevronRight,
  Home,
  Users,
} from "lucide-react";

const GuidePage = () => {
  const sections = [
    {
      id: "dashboard",
      title: "لوحة التحكم (Dashboard)",
      icon: LayoutDashboard,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      content:
        "دي شاشتك الرئيسية، بتشوف فيها ملخص لحالتك المالية، مين عليه فلوس، وآخر المصاريف اللي اتضافت في البيت.",
    },
    {
      id: "expenses",
      title: "إضافة المصاريف",
      icon: PlusCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      content:
        "لما تشتري حاجة للبيت، سجلها من هنا. بتحدد المبلغ، وتختار مين مشارك في المصروف ده، والموقع بيحسب التقسيمة اوتوماتيك.",
    },
    {
      id: "payments",
      title: "سداد الديون (Payments)",
      icon: CreditCard,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      content:
        "لما تدفع فلوس لحد عشان تسوي حسابك، سجل الدفع هنا عشان يتخصم من اللي عليك.",
    },
    {
      id: "ai",
      title: "المساعد الذكي (AI)",
      icon: Bot,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      content:
        "مساعدنا الذكي موجود يجاوب على أسئلتك، يديك نصايل للميزانية، ويلخصلك الدنيا ماشية ازاي.",
    },
    {
      id: "house",
      title: "إدارة البيت",
      icon: Home,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      content:
        "تقدر تشوف تفاصيل البيت، مين الأعضاء الموجودين، وتفاصيل كل واحد من صفحة تفاصيل البيت.",
    },
  ];

  return (
    <div className="pb-12 font-primary animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-ios-dark mb-4">
          دليل استخدام Budgetly 📚
        </h1>
        <p className="text-lg text-ios-secondary">
          دليلك الشامل عشان تفهم كل فتفوتة في الموقع وتدير ميزانية بيتك
          باحترافية.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
        {sections.map((section) => (
          <div
            key={section.id}
            className="bg-ios-surface border border-ios-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className={`w-12 h-12 rounded-2xl ${section.bgColor} flex items-center justify-center mb-4`}
            >
              <section.icon className={`w-6 h-6 ${section.color}`} />
            </div>
            <h3 className="text-xl font-bold text-ios-dark mb-2">
              {section.title}
            </h3>
            <p className="text-ios-secondary leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="bg-ios-surface border border-ios-border rounded-3xl p-8 text-center max-w-3xl mx-auto shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-ios-dark mb-4">جاهز تبدأ؟</h2>
          <p className="text-ios-secondary mb-6">
            دلوقتي انت بقيت جاهز تستخدم Budgetly وتظبط ميزانيتك. ابدأ دلوقتي!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-ios-primary hover:bg-ios-primary/90 text-white font-bold py-3 px-8 rounded-2xl transition-all hover:scale-105 shadow-md"
          >
            <span>روح للوحة التحكم</span>
            <ChevronRight className="rotate-180" size={20} />
          </Link>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-ios-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>
    </div>
  );
};

export default GuidePage;
