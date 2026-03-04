import {
  Activity,
  Heart,
  ShieldCheck,
  Brain,
  ArrowRight,
  Stethoscope,
  BarChart2,
  Clock,
  Users,
  Sparkles,
  ChevronRight,
} from "lucide-react";

interface LandingProps {
  onLogin: () => void;
  onSignup: () => void;
}

export default function Landing({ onLogin, onSignup }: LandingProps) {
  return (
    <div className="min-h-screen bg-[hsl(223,17%,8%)] text-white overflow-x-hidden">
      {/* ── Background Glows ─────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] right-[-8%] w-[700px] h-[700px] bg-primary/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-primary/3 rounded-full blur-[100px]" />
      </div>

      {/* ── Navbar ────────────────────────────────────── */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 lg:px-20 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Activity className="w-6 h-6 text-[hsl(223,17%,8%)]" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight">RuralCare</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all"
          >
            Sign In
          </button>
          <button
            onClick={onSignup}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-[hsl(223,17%,8%)] hover:bg-[#b8e855] shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ── Hero Section ─────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8">
            <Sparkles size={14} className="text-primary" />
            <span className="text-xs font-semibold text-primary">AI-Powered Health Assistant</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black leading-[1.1] mb-6">
            Your Health,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#b8e855]">
              Simplified
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered symptom analysis, personalized health insights, and first-aid guidance — 
            designed for rural communities with limited healthcare access.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onSignup}
              className="group px-8 py-4 rounded-2xl font-bold text-base bg-primary text-[hsl(223,17%,8%)] hover:bg-[#b8e855] shadow-xl shadow-primary/25 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-2"
            >
              Start Free Assessment
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onLogin}
              className="px-8 py-4 rounded-2xl font-bold text-base text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
            >
              I Have an Account
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-white/30 text-xs font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} />
              <span>Private & Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>Results in Seconds</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>Built for Rural Communities</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-black mb-4">
              Everything You Need
            </h2>
            <p className="text-white/40 max-w-lg mx-auto">
              Comprehensive health tools powered by artificial intelligence, accessible from any device.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Brain,
                title: "AI Symptom Analysis",
                desc: "Describe your symptoms and get instant risk assessment with possible conditions and recommended actions.",
                color: "from-violet-500/20 to-violet-500/5",
                iconBg: "bg-violet-500/15",
                iconColor: "text-violet-400",
              },
              {
                icon: Stethoscope,
                title: "Guided Checkup",
                desc: "Smart follow-up questions adapt to your symptoms for a more accurate health evaluation.",
                color: "from-blue-500/20 to-blue-500/5",
                iconBg: "bg-blue-500/15",
                iconColor: "text-blue-400",
              },
              {
                icon: BarChart2,
                title: "Health Reports",
                desc: "Track risk trends, symptom frequency, and export detailed PDF/CSV reports of your history.",
                color: "from-primary/20 to-primary/5",
                iconBg: "bg-primary/15",
                iconColor: "text-primary",
              },
              {
                icon: Heart,
                title: "BMI & Health Metrics",
                desc: "Calculate BMI, track medications, and monitor your health metrics all in one place.",
                color: "from-rose-500/20 to-rose-500/5",
                iconBg: "bg-rose-500/15",
                iconColor: "text-rose-400",
              },
              {
                icon: ShieldCheck,
                title: "First Aid Guides",
                desc: "Essential first-aid instructions for heatstroke, snake bites, wounds, and more — accessible offline.",
                color: "from-emerald-500/20 to-emerald-500/5",
                iconBg: "bg-emerald-500/15",
                iconColor: "text-emerald-400",
              },
              {
                icon: Clock,
                title: "Complete History",
                desc: "Every symptom check is saved securely. Review past assessments and track your health journey.",
                color: "from-amber-500/20 to-amber-500/5",
                iconBg: "bg-amber-500/15",
                iconColor: "text-amber-400",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`group bg-gradient-to-b ${feature.color} border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] hover:-translate-y-1 transition-all duration-300`}
              >
                <div className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4`}>
                  <feature.icon size={22} className={feature.iconColor} />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-black mb-4">
              How It Works
            </h2>
            <p className="text-white/40">Three simple steps to better health awareness</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Describe Symptoms",
                desc: "Select from common symptoms or type in your own description of how you feel.",
              },
              {
                step: "02",
                title: "Answer Questions",
                desc: "Our AI asks smart follow-up questions to better understand your condition.",
              },
              {
                step: "03",
                title: "Get Insights",
                desc: "Receive a risk assessment, possible conditions, and recommended next steps.",
              },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center">
                <div className="text-5xl font-display font-black text-primary/15 mb-3">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
                {i < 2 && (
                  <ChevronRight
                    size={24}
                    className="hidden md:block absolute top-8 -right-4 text-white/10"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-b from-primary/10 to-primary/5 border border-primary/20 rounded-3xl p-10 md:p-14 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-6">
              <Activity size={32} className="text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-black mb-4">
              Ready to Check Your Health?
            </h2>
            <p className="text-white/40 max-w-md mx-auto mb-8">
              Create a free account and get your first AI-powered health assessment in under a minute.
            </p>
            <button
              onClick={onSignup}
              className="group px-8 py-4 rounded-2xl font-bold text-base bg-primary text-[hsl(223,17%,8%)] hover:bg-[#b8e855] shadow-xl shadow-primary/25 hover:shadow-2xl hover:-translate-y-1 transition-all inline-flex items-center gap-2"
            >
              Create Free Account
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.06] px-6 md:px-12 lg:px-20 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white/30 text-sm">
            <Activity size={16} className="text-primary" />
            <span className="font-semibold">RuralCare</span>
            <span className="ml-1">© {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-white/20 text-center sm:text-right max-w-md">
            This tool provides educational health information only and is not a substitute for professional medical advice, diagnosis, or treatment.
          </p>
        </div>
      </footer>
    </div>
  );
}
