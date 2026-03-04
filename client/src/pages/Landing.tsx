import { useEffect, useState, useRef } from "react";
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
  MessageCircle,
  MapPin,
  FileText,
  Zap,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer,
  BarChart, Bar, LineChart, Line,
} from "recharts";

// ── Mock chart data ────────────────────────────────
const riskTrendData = [
  { d: "Mon", v: 18 }, { d: "Tue", v: 32 }, { d: "Wed", v: 22 },
  { d: "Thu", v: 48 }, { d: "Fri", v: 35 }, { d: "Sat", v: 55 },
  { d: "Sun", v: 30 },
];
const conditionData = [
  { name: "Fever", c: 42 }, { name: "Migraine", c: 31 },
  { name: "Fatigue", c: 26 }, { name: "Allergy", c: 19 },
  { name: "Cold", c: 38 },
];
const heartRateData = [
  { t: 1, bpm: 72 }, { t: 2, bpm: 78 }, { t: 3, bpm: 74 },
  { t: 4, bpm: 82 }, { t: 5, bpm: 70 }, { t: 6, bpm: 76 },
  { t: 7, bpm: 80 }, { t: 8, bpm: 73 }, { t: 9, bpm: 77 },
];
const weeklyChecks = [
  { w: "W1", v: 12 }, { w: "W2", v: 19 }, { w: "W3", v: 15 },
  { w: "W4", v: 28 }, { w: "W5", v: 22 }, { w: "W6", v: 34 },
];

// ── Animated number counter ────────────────────────
function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ── Fade-in on scroll ──────────────────────────────
function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

interface LandingProps {
  onLogin: () => void;
  onSignup: () => void;
}

export default function Landing({ onLogin, onSignup }: LandingProps) {
  return (
    <div className="min-h-screen bg-[hsl(223,17%,8%)] text-white overflow-x-hidden">

      {/* ── Background Glows ─────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] right-[-8%] w-[700px] h-[700px] bg-primary/8 rounded-full blur-[140px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-[pulse_10s_ease-in-out_infinite_2s]" />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-primary/3 rounded-full blur-[100px] animate-[pulse_6s_ease-in-out_infinite_1s]" />
      </div>

      {/* ── Background Graph Decorations ─────────────── */}
      <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
        {/* Top-right area chart */}
        <div className="absolute top-[5%] right-[-2%] w-[420px] h-[200px] opacity-[0.06]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={riskTrendData}>
              <defs>
                <linearGradient id="bgGrad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(79,83%,69%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(79,83%,69%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="hsl(79,83%,69%)" strokeWidth={2} fill="url(#bgGrad1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Left bar chart */}
        <div className="absolute top-[55%] left-[-1%] w-[300px] h-[180px] opacity-[0.05] rotate-[-8deg]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={conditionData}>
              <Bar dataKey="c" fill="hsl(79,83%,69%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom-right line chart */}
        <div className="absolute bottom-[8%] right-[5%] w-[350px] h-[150px] opacity-[0.05]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={heartRateData}>
              <Line type="monotone" dataKey="bpm" stroke="hsl(79,83%,69%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Middle-left small area */}
        <div className="absolute top-[25%] left-[8%] w-[250px] h-[120px] opacity-[0.04] rotate-[5deg]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyChecks}>
              <Area type="monotone" dataKey="v" stroke="hsl(79,83%,69%)" fill="hsl(79,83%,69%)" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
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
      <section className="relative z-10 px-6 md:px-12 lg:px-20 pt-10 pb-20 md:pt-16 md:pb-28">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left — Text */}
          <div className="flex-1 text-center lg:text-left">
            <FadeIn>
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
                <Sparkles size={14} className="text-primary" />
                <span className="text-xs font-semibold text-primary">AI-Powered Health Assistant</span>
              </div>
            </FadeIn>

            <FadeIn delay={100}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black leading-[1.1] mb-6">
               From symptoms to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#b8e855]">
                 smart care decisions
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={200}>
              <p className="text-lg md:text-xl text-white/50 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Tell us your symptoms. Our AI analyzes them instantly — giving you a clear risk level, possible conditions, and what to do next. No medical jargon, no confusion.
              </p>
            </FadeIn>

            <FadeIn delay={300}>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
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
            </FadeIn>

            <FadeIn delay={400}>
              <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-white/30 text-xs font-medium">
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
            </FadeIn>
          </div>

          {/* Right — Robot + mini chart card */}
          <FadeIn delay={400} className="flex-shrink-0 relative">
            <div className="relative w-[280px] md:w-[340px]">
              {/* Glow behind robot */}
              <div className="absolute inset-0 bg-primary/15 rounded-full blur-[80px] scale-75" />

              <img
                src="/robo.png"
                alt="Health AI Robot"
                className="relative z-10 w-full drop-shadow-[0_20px_50px_rgba(199,243,107,0.25)] animate-[float_4s_ease-in-out_infinite]"
              />

              {/* Floating mini chart card */}
              <div className="absolute -bottom-4 -left-8 z-20 bg-[#1a1d24] border border-white/10 rounded-2xl p-3 shadow-2xl w-[170px] animate-[float_5s_ease-in-out_infinite_0.5s]">
                <div className="flex items-center gap-2 mb-1.5">
                  <Heart size={12} className="text-rose-400" />
                  <span className="text-[10px] font-semibold text-white/60">Risk Trend</span>
                </div>
                <div className="h-[50px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={riskTrendData}>
                      <defs>
                        <linearGradient id="heroMini" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(79,83%,69%)" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="hsl(79,83%,69%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke="hsl(79,83%,69%)" strokeWidth={2} fill="url(#heroMini)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute top-6 -right-6 z-20 bg-[#1a1d24] border border-white/10 rounded-xl px-3 py-2 shadow-2xl animate-[float_4.5s_ease-in-out_infinite_1s]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <ShieldCheck size={12} className="text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-white">Low Risk</div>
                    <div className="text-[9px] text-white/40">Score: 18/100</div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Stats Counter Strip ──────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 md:p-10 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Health Checks", value: 28, suffix: "+" },
              { label: "Active Users", value: 40, suffix: "+" },
              { label: "Avg Response", value: 3, suffix: "s" },
              { label: "Conditions Covered", value: 20, suffix: "+" },
            ].map((stat) => (
              <FadeIn key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-display font-black text-primary mb-1">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-white/40 font-medium">{stat.label}</div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── What is RuralCare (Plain Explanation) ─────── */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 pb-24">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          {/* Left — Robot 2 */}
          <FadeIn className="flex-shrink-0 relative order-2 lg:order-1">
            <div className="relative w-[240px] md:w-[280px]">
              <div className="absolute inset-0 bg-violet-500/10 rounded-full blur-[70px] scale-75" />
              <img
                src="/robo2.png"
                alt="AI Doctor Robot"
                className="relative z-10 w-full drop-shadow-[0_15px_40px_rgba(139,92,246,0.2)] animate-[float_5s_ease-in-out_infinite_0.5s]"
              />
            </div>
          </FadeIn>

          {/* Right — Explanation */}
          <div className="flex-1 order-1 lg:order-2">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-display font-black mb-6 text-center lg:text-left">
                What is{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#b8e855]">
                  RuralCare
                </span>
                ?
              </h2>
            </FadeIn>

            <FadeIn delay={100}>
              <p className="text-white/50 text-base md:text-lg leading-relaxed mb-6 text-center lg:text-left">
                RuralCare is a <span className="text-white font-semibold">free AI health assistant</span> built for people who don't have easy access to doctors or clinics. You simply tell it how you're feeling — and within seconds it explains:
              </p>
            </FadeIn>

            <div className="space-y-4">
              {[
                { icon: Zap, text: "How serious your symptoms might be (Low / Medium / High risk)", color: "text-primary bg-primary/10" },
                { icon: Brain, text: "What conditions could be causing them (explained simply)", color: "text-violet-400 bg-violet-500/10" },
                { icon: MessageCircle, text: "What you should do next — rest, home remedy, or see a doctor", color: "text-blue-400 bg-blue-500/10" },
                { icon: MapPin, text: "Nearby hospitals if you need urgent care", color: "text-rose-400 bg-rose-500/10" },
                { icon: FileText, text: "Your full health history saved as reports (PDF/CSV)", color: "text-amber-400 bg-amber-500/10" },
              ].map((item, i) => (
                <FadeIn key={i} delay={150 + i * 80}>
                  <div className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.06] transition-colors">
                    <div className={`w-9 h-9 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <item.icon size={18} />
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">{item.text}</p>
                  </div>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={600}>
              <p className="text-white/30 text-sm mt-6 text-center lg:text-left">
                No sign-up fees. No complicated medical terms. Just clear answers.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Live Dashboard Preview ───────────────────── */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 pb-24">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-black mb-4">See Your Health at a Glance</h2>
              <p className="text-white/40 max-w-lg mx-auto">
                Beautiful charts and clear metrics help you understand your health journey over time.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Risk Trend Chart */}
              <div className="md:col-span-2 bg-[#1a1d24] border border-white/[0.08] rounded-2xl p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold">Health Risk Trend</h3>
                    <p className="text-xs text-white/40">7-day analysis</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[10px] text-white/40">Risk Score</span>
                  </div>
                </div>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={riskTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="prevGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(79,83%,69%)" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="hsl(79,83%,69%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fill: '#555', fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#555', fontSize: 11 }} />
                      <Area type="monotone" dataKey="v" stroke="hsl(79,83%,69%)" strokeWidth={2.5} fill="url(#prevGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Conditions */}
              <div className="bg-[#1a1d24] border border-white/[0.08] rounded-2xl p-6">
                <h3 className="text-sm font-bold mb-1">Top Conditions</h3>
                <p className="text-xs text-white/40 mb-4">Community data</p>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={conditionData} layout="vertical" margin={{ left: -10, right: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={60} tick={{ fill: '#888', fontSize: 11 }} />
                      <Bar dataKey="c" fill="hsl(79,83%,69%)" radius={[0, 4, 4, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Heart Rate */}
              <div className="bg-[#1a1d24] border border-white/[0.08] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Heart size={14} className="text-rose-400" />
                  <h3 className="text-sm font-bold">Vitals Monitor</h3>
                </div>
                <p className="text-xs text-white/40 mb-4">Sample heart rate</p>
                <div className="h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={heartRateData}>
                      <Line type="monotone" dataKey="bpm" stroke="#f43f5e" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mt-2 text-2xl font-display font-black text-rose-400">76 <span className="text-xs font-normal text-white/40">bpm</span></div>
              </div>

              {/* Weekly Checks */}
              <div className="md:col-span-2 bg-[#1a1d24] border border-white/[0.08] rounded-2xl p-6">
                <h3 className="text-sm font-bold mb-1">Weekly Symptom Checks</h3>
                <p className="text-xs text-white/40 mb-4">Community engagement</p>
                <div className="h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyChecks} margin={{ left: -20 }}>
                      <XAxis dataKey="w" axisLine={false} tickLine={false} tick={{ fill: '#555', fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#555', fontSize: 11 }} />
                      <Bar dataKey="v" fill="hsl(79,83%,69%)" radius={[4, 4, 0, 0]} barSize={28} fillOpacity={0.7} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Features Grid ────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 pb-24">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-display font-black mb-4">
                Everything You Need
              </h2>
              <p className="text-white/40 max-w-lg mx-auto">
                Comprehensive health tools powered by artificial intelligence, accessible from any device.
              </p>
            </div>
          </FadeIn>

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
            ].map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 80}>
                <div
                  className={`group bg-gradient-to-b ${feature.color} border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] hover:-translate-y-1 transition-all duration-300 h-full`}
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon size={22} className={feature.iconColor} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 pb-24">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-display font-black mb-4">
                How It Works
              </h2>
              <p className="text-white/40">Three simple steps to better health awareness</p>
            </div>
          </FadeIn>

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
              <FadeIn key={item.step} delay={i * 120}>
                <div className="relative text-center">
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
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 pb-24">
        <FadeIn>
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-b from-primary/10 to-primary/5 border border-primary/20 rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
              {/* background mini chart */}
              <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[...riskTrendData, ...riskTrendData]}>
                    <Area type="monotone" dataKey="v" stroke="hsl(79,83%,69%)" fill="hsl(79,83%,69%)" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="relative z-10">
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
          </div>
        </FadeIn>
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

      {/* ── Inline keyframes for float animation ─────── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}
