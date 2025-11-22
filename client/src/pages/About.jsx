import { Users, DollarSign, TrendingUp, Facebook } from "lucide-react";

const About = () => {
  return (
    <div className="pb-8 max-w-4xl mx-auto">
      {/* Header with Logo */}
      <div className="flex flex-col items-center text-center mb-8">
        <img
          src="/assets/logo.png"
          alt="Budgetly Logo"
          className="w-32 mb-4 dark:invert"
        />
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* What is Budgetly */}
        <div
          className="p-6 rounded-3xl shadow-sm"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2
            className="text-xl font-bold mb-3"
            style={{ color: "var(--color-dark)" }}
          >
            إيه هو Budgetly؟
          </h2>
          <p
            className="leading-relaxed"
            style={{ color: "var(--color-secondary)" }}
          >
            Budgetly هو تطبيق إدارة المصاريف المشتركة المثالي للأصدقاء والعائلات
            اللي عايشين مع بعض. التطبيق بيساعدك تسجل المصاريف، تتابع المدفوعات،
            وتعرف مين عليه فلوس ومين ليه فلوس بكل سهولة.
          </p>
        </div>

        {/* Features */}
        <div
          className="p-6 rounded-3xl shadow-sm"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2
            className="text-xl font-bold mb-4"
            style={{ color: "var(--color-dark)" }}
          >
            المميزات الرئيسية
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded-xl"
                style={{ backgroundColor: "var(--color-primary-bg)" }}
              >
                <DollarSign
                  size={20}
                  style={{ color: "var(--color-primary)" }}
                />
              </div>
              <div>
                <h3
                  className="font-semibold mb-1"
                  style={{ color: "var(--color-dark)" }}
                >
                  تسجيل المصاريف
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-secondary)" }}
                >
                  سجل أي مصروف بسهولة ووزعه على الناس اللي معاك، سواء بالتساوي
                  أو حسب كل واحد.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded-xl"
                style={{ backgroundColor: "var(--color-primary-bg)" }}
              >
                <Users size={20} style={{ color: "var(--color-primary)" }} />
              </div>
              <div>
                <h3
                  className="font-semibold mb-1"
                  style={{ color: "var(--color-dark)" }}
                >
                  إدارة الأعضاء
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-secondary)" }}
                >
                  ضيف أصدقائك أو أفراد عيلتك، وتابع مصاريف كل واحد ومدفوعاته.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded-xl"
                style={{ backgroundColor: "var(--color-primary-bg)" }}
              >
                <TrendingUp
                  size={20}
                  style={{ color: "var(--color-primary)" }}
                />
              </div>
              <div>
                <h3
                  className="font-semibold mb-1"
                  style={{ color: "var(--color-dark)" }}
                >
                  تحليلات شاملة
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-secondary)" }}
                >
                  شوف تحليلات مفصلة عن مصاريفك الشهرية وفلوسك عشان تعرف فين
                  بتصرف أكتر.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How to Use */}
        <div
          className="p-6 rounded-3xl shadow-sm"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2
            className="text-xl font-bold mb-4"
            style={{ color: "var(--color-dark)" }}
          >
            إزاي تستخدم التطبيق؟
          </h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                1
              </div>
              <div>
                <p
                  className="font-semibold"
                  style={{ color: "var(--color-dark)" }}
                >
                  سجل دخول
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-secondary)" }}
                >
                  ادخل على حسابك في البيت اللي انت فيه
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                2
              </div>
              <div>
                <p
                  className="font-semibold"
                  style={{ color: "var(--color-dark)" }}
                >
                  سجل المصاريف
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-secondary)" }}
                >
                  كل ما تشتري حاجة، سجلها في التطبيق ووزعها على الناس
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                3
              </div>
              <div>
                <p
                  className="font-semibold"
                  style={{ color: "var(--color-dark)" }}
                >
                  سجل الدفعات
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-secondary)" }}
                >
                  لما حد يدفع لك فلوس، سجل الدفعة عشان الرصيد يتحدث
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                4
              </div>
              <div>
                <p
                  className="font-semibold"
                  style={{ color: "var(--color-dark)" }}
                >
                  تابع رصيدك
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-secondary)" }}
                >
                  شوف في أي وقت إنت عليك كام أو ليك كام من الرئيسية
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div
          className="p-6 rounded-3xl shadow-sm"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2
            className="text-xl font-bold mb-4"
            style={{ color: "var(--color-dark)" }}
          >
            نصايح للاستخدام الأمثل
          </h2>
          <ul className="space-y-2">
            <li
              className="flex items-start gap-2"
              style={{ color: "var(--color-secondary)" }}
            >
              <span style={{ color: "var(--color-primary)" }}>•</span>
              <span>سجل المصاريف أول ما تحصل عشان ما تنساش</span>
            </li>
            <li
              className="flex items-start gap-2"
              style={{ color: "var(--color-secondary)" }}
            >
              <span style={{ color: "var(--color-primary)" }}>•</span>
              <span>راجع التحليلات كل شهر عشان تعرف على إيه بتصرف</span>
            </li>
            <li
              className="flex items-start gap-2"
              style={{ color: "var(--color-secondary)" }}
            >
              <span style={{ color: "var(--color-primary)" }}>•</span>
              <span>سدد فلوسك بانتظام عشان ما تتجمعش عليك</span>
            </li>
            <li
              className="flex items-start gap-2"
              style={{ color: "var(--color-secondary)" }}
            >
              <span style={{ color: "var(--color-primary)" }}>•</span>
              <span>
                استخدم الفلاتر في صفحة المصاريف لو بتدور على حاجة معينة
              </span>
            </li>
          </ul>
        </div>

        {/* Contact Us Section */}
        <div
          className="p-6 rounded-3xl shadow-sm"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2
            className="text-xl font-bold mb-3"
            style={{ color: "var(--color-dark)" }}
          >
            تواصل معانا
          </h2>
          <p
            className="leading-relaxed mb-4"
            style={{ color: "var(--color-secondary)" }}
          >
            عندك شكوى، اقتراح، أو ملاحظة؟ نحن نحب نسمع منك! رأيك مهم لينا عشان
            نطور التطبيق ونخليه أفضل.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:budgetly.app@example.com"
              className="flex-1 px-6 py-3 rounded-2xl text-center font-semibold transition-all"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "white",
              }}
            >
              📧 ابعتلنا إيميل
            </a>
            <a
              href="https://wa.me/201005291205"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-6 py-3 rounded-2xl text-center font-semibold transition-all"
              style={{
                backgroundColor: "#25D366",
                color: "white",
              }}
            >
              💬 واتساب
            </a>
          </div>
          <p
            className="text-xs text-center mt-3"
            style={{ color: "var(--color-secondary)" }}
          >
            هنرد عليك في أسرع وقت ممكن
          </p>
        </div>

        {/* Social Media / Contact */}
        <div
          className="p-6 rounded-3xl shadow-sm text-center"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2
            className="text-xl font-bold mb-4"
            style={{ color: "var(--color-dark)" }}
          >
            تابعنا
          </h2>
          <p
            className="text-sm mb-4"
            style={{ color: "var(--color-secondary)" }}
          >
            ابقى متابع لآخر الأخبار والتحديثات
          </p>
          <a
            href="https://facebook.com/yourpage"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl transition-all hover:opacity-80"
            style={{
              backgroundColor: "#1877F2",
              color: "white",
            }}
          >
            <Facebook size={24} />
            <span className="font-semibold">تابعنا على فيسبوك</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
