import {
  Info,
  Receipt,
  Users,
  DollarSign,
  BarChart3,
  CheckCircle,
  Target,
  Zap,
  Sparkles,
  Shield,
  Clock,
} from "lucide-react";

const About = () => {
  return (
    <div className="pb-8 max-w-6xl mx-auto px-4">
      {/* Hero Header with Gradient */}
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-ios-primary/10 via-ios-primary/5 to-transparent rounded-3xl blur-3xl -z-10" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-3xl backdrop-blur-xl border border-ios-border/50 bg-gradient-to-br from-ios-surface/80 to-ios-surface/40">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-ios-primary/20 rounded-2xl blur-xl animate-pulse" />
              <div className="relative p-4 bg-gradient-to-br from-ios-primary to-ios-dark rounded-2xl shadow-lg">
                <Info className="text-white" size={40} />
              </div>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-ios-primary to-ios-dark bg-clip-text text-transparent mb-2">
                عن بدجتلي
              </h1>
              <p className="text-ios-secondary text-lg flex items-center gap-2">
                <Sparkles size={18} className="text-ios-primary" />
                نظام ذكي لإدارة المصاريف المشتركة
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Description with Gradient Border */}
      <div className="relative mb-10 group">
        <div className="absolute inset-0 bg-gradient-to-r from-ios-primary via-ios-info to-ios-success rounded-3xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-500" />
        <div className="relative backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-ios-border bg-ios-surface">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-ios-primary/10 rounded-xl">
              <Sparkles className="text-ios-primary" size={24} />
            </div>
            <h2 className="text-3xl font-bold text-ios-dark">إيه هو بدجتلي؟</h2>
          </div>
          <p className="text-lg leading-relaxed mb-4 text-ios-secondary">
            بدجتلي هو تطبيق ويب مصمم خصيصاً لإدارة المصاريف المشتركة بين مجموعة
            من الأشخاص. سواء كنت بتشارك شقة مع أصحابك، أو بتدير مصاريف عيلتك، أو
            بتنظم فلوس مجموعة من الأصدقاء - بدجتلي هنا عشان يسهل عليك الموضوع!
          </p>
          <div className="p-4 bg-gradient-to-r from-ios-primary/5 to-ios-info/5 rounded-2xl border border-ios-primary/20">
            <p className="text-md leading-relaxed text-ios-dark font-medium">
              ✨ التطبيق بيتيح لك تسجيل المصاريف، متابعة المدفوعات، ومعرفة مين
              عليه فلوس ومين ليه فلوس - كل حاجة في مكان واحد ومنظم.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid with Hover Effects */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-ios-dark mb-6 flex items-center gap-3">
          <Shield className="text-ios-primary" size={32} />
          المميزات الرئيسية
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Receipt,
              title: "إدارة المصاريف",
              desc: "سجّل المصاريف وقسمها بطريقة عادلة",
              color: "ios-primary",
              gradient: "from-blue-500 to-purple-500",
            },
            {
              icon: DollarSign,
              title: "تتبع الدفعات",
              desc: "راقب كل دفعة واعرف الرصيد المتبقي",
              color: "ios-success",
              gradient: "from-green-500 to-emerald-500",
            },
            {
              icon: Users,
              title: "إدارة الأعضاء",
              desc: "أضف أعضاء وتابع نشاطهم",
              color: "ios-warning",
              gradient: "from-amber-500 to-orange-500",
            },
            {
              icon: BarChart3,
              title: "تحليلات متقدمة",
              desc: "إحصائيات ورسوم بيانية تفصيلية",
              color: "ios-info",
              gradient: "from-cyan-500 to-blue-500",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="group relative p-6 rounded-2xl bg-ios-surface border border-ios-border hover:border-ios-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
              />
              <div className="relative">
                <div
                  className={`inline-flex p-3 rounded-xl bg-${feature.color}/10 mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon size={28} className={`text-${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-ios-dark mb-2 group-hover:text-ios-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-ios-secondary text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How to Use - Timeline Style */}
      <div className="relative mb-10">
        <div className="backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-ios-border bg-ios-surface">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-ios-dark">
            <Target size={32} className="text-ios-primary" />
            إزاي تستخدم بدجتلي؟
          </h2>

          <div className="relative space-y-8">
            {/* Timeline Line */}
            <div className="absolute right-5 top-5 bottom-5 w-0.5 bg-gradient-to-b from-ios-primary via-ios-info to-ios-success hidden md:block" />

            {[
              {
                num: 1,
                title: "سجّل دخول للتطبيق",
                desc: "استخدم اسم المستخدم والباسورد بتاعك عشان تدخل. لو أول مرة، هيديك الأدمن حساب جديد.",
                icon: Shield,
                color: "primary",
              },
              {
                num: 2,
                title: "اختار صورتك الشخصية",
                desc: "روح على صفحة الملف الشخصي واختار أفاتار من الصور المتاحة.",
                icon: Users,
                color: "info",
              },
              {
                num: 3,
                title: "شوف المصاريف والمدفوعات",
                desc: "من صفحة المصاريف، هتشوف كل المصاريف اللي اتسجلت ونصيبك فيها.",
                icon: Receipt,
                color: "success",
              },
              {
                num: 4,
                title: "سجّل مصاريف ودفعات جديدة",
                desc: "لو أنت أدمن، تقدر تضيف مصاريف جديدة وتسجل دفعات.",
                icon: DollarSign,
                color: "warning",
                badge: "للأدمن فقط",
              },
              {
                num: 5,
                title: "تابع رصيدك",
                desc: "من الصفحة الرئيسية، هتشوف رصيدك الحالي بالتفصيل.",
                icon: Clock,
                color: "primary",
              },
            ].map((step, idx) => (
              <div key={idx} className="flex gap-4 relative group">
                <div className={`flex-shrink-0 relative z-10`}>
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br from-ios-${step.color} to-ios-dark shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    {step.num}
                  </div>
                </div>
                <div className="flex-1 pb-8">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-ios-surface to-ios-bg border border-ios-border group-hover:border-ios-primary/50 group-hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <step.icon
                        size={20}
                        className={`text-ios-${step.color}`}
                      />
                      <h3 className="text-lg font-bold text-ios-dark">
                        {step.title}
                      </h3>
                      {step.badge && (
                        <span className="text-xs px-2 py-1 rounded-full bg-ios-warning/10 text-ios-warning border border-ios-warning/20">
                          {step.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-ios-secondary text-sm leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Benefits - Bento Grid Style */}
      <div className="backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-ios-border bg-ios-surface">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-ios-dark">
          <Zap size={32} className="text-ios-primary" />
          ليه تستخدم بدجتلي؟
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "بسيط وسهل", desc: "واجهة نظيفة وسهلة الاستخدام" },
            { title: "شفاف ودقيق", desc: "كل المصاريف مسجلة بدقة" },
            { title: "ثيمات متنوعة", desc: "6 ثيمات مختلفة تناسب ذوقك" },
            { title: "دارك مود", desc: "وضع داكن للاستخدام الليلي" },
            { title: "موبايل فريندلي", desc: "يشتغل على كل الأجهزة" },
            { title: "تحليلات مفصلة", desc: "رسوم بيانية وإحصائيات" },
          ].map((benefit, idx) => (
            <div
              key={idx}
              className="group flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-ios-bg to-ios-surface border border-ios-border hover:border-ios-success/50 hover:shadow-lg transition-all duration-300"
            >
              <CheckCircle
                size={24}
                className="text-ios-success flex-shrink-0 group-hover:scale-110 transition-transform"
              />
              <div>
                <h4 className="font-bold text-ios-dark mb-1 group-hover:text-ios-success transition-colors">
                  {benefit.title}
                </h4>
                <p className="text-sm text-ios-secondary">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-ios-primary/10 via-ios-info/10 to-ios-success/10 border border-ios-primary/20">
          <div className="text-center">
            <Sparkles className="mx-auto mb-3 text-ios-primary" size={32} />
            <h3 className="text-2xl font-bold text-ios-dark mb-2">
              جاهز تبدأ؟
            </h3>
            <p className="text-ios-secondary mb-4">
              ابدأ في تنظيم مصاريفك دلوقتي وخلّي حياتك أسهل!
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <div className="px-4 py-2 rounded-xl bg-ios-success/10 text-ios-success font-semibold text-sm border border-ios-success/20">
                ✓ مجاني تماماً
              </div>
              <div className="px-4 py-2 rounded-xl bg-ios-info/10 text-ios-info font-semibold text-sm border border-ios-info/20">
                ✓ سهل الاستخدام
              </div>
              <div className="px-4 py-2 rounded-xl bg-ios-primary/10 text-ios-primary font-semibold text-sm border border-ios-primary/20">
                ✓ آمن ومحمي
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
