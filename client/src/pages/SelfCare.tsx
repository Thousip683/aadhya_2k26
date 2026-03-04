import { useState, useEffect } from "react";
import { useSymptomChecks } from "@/hooks/use-symptom-checks";
import {
  Leaf,
  Droplets,
  Moon,
  Brain,
  Heart,
  Apple,
  Wind,
  Footprints,
  Shield,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Music,
  Sun,
  Bug,
  Thermometer,
  HeadphonesIcon,
  Coffee,
  Eye,
  Trophy,
} from "lucide-react";

// ─── Daily Health Checklist ─────────────────────────
const DEFAULT_CHECKLIST = [
  { id: "water", label: "Drank 8 glasses of water", icon: Droplets, category: "physical" },
  { id: "walk", label: "Walked for 20 minutes", icon: Footprints, category: "physical" },
  { id: "vegetables", label: "Ate fruits & vegetables", icon: Apple, category: "physical" },
  { id: "sleep", label: "Slept 7+ hours last night", icon: Moon, category: "physical" },
  { id: "breathing", label: "Did 5 min deep breathing", icon: Wind, category: "mental" },
  { id: "screen", label: "Took screen breaks", icon: Eye, category: "mental" },
  { id: "talk", label: "Talked to someone I trust", icon: Heart, category: "mental" },
  { id: "handwash", label: "Washed hands regularly", icon: Shield, category: "preventive" },
];

// ─── Symptom-Based Self-Care Map ────────────────────
const SYMPTOM_CARE: Record<string, { tips: string[]; icon: any }> = {
  fever: {
    icon: Thermometer,
    tips: [
      "Drink plenty of fluids — water, ORS, coconut water",
      "Rest and avoid strenuous activity",
      "Monitor your temperature every 4 hours",
      "Use a cool damp cloth on forehead",
      "Eat light, easily digestible food",
    ],
  },
  headache: {
    icon: Brain,
    tips: [
      "Stay hydrated — drink water regularly",
      "Reduce screen time and rest eyes",
      "Rest in a quiet, dark room",
      "Apply cold compress to forehead",
      "Try gentle neck stretches",
    ],
  },
  cough: {
    icon: Wind,
    tips: [
      "Drink warm water with honey and ginger",
      "Gargle with warm salt water",
      "Avoid cold drinks and dusty areas",
      "Use steam inhalation before bed",
      "Stay hydrated throughout the day",
    ],
  },
  fatigue: {
    icon: Moon,
    tips: [
      "Ensure 7-8 hours of quality sleep",
      "Eat iron-rich foods (spinach, lentils, dates)",
      "Take short breaks during work",
      "Go for a gentle 15 min walk",
      "Reduce caffeine intake",
    ],
  },
  "chest pain": {
    icon: Heart,
    tips: [
      "⚠️ Seek immediate medical attention",
      "Sit upright and try to stay calm",
      "Do not exert yourself physically",
      "Call emergency services (108) if severe",
      "Note the time symptoms started",
    ],
  },
  nausea: {
    icon: Apple,
    tips: [
      "Sip small amounts of clear fluids",
      "Eat bland foods — rice, bananas, toast",
      "Avoid strong smells and oily food",
      "Rest in a comfortable position",
      "Try ginger tea for relief",
    ],
  },
  dizziness: {
    icon: Brain,
    tips: [
      "Sit or lie down immediately when dizzy",
      "Drink water — dehydration causes dizziness",
      "Avoid sudden position changes",
      "Eat regular small meals",
      "Get up slowly from bed or chair",
    ],
  },
  stress: {
    icon: HeadphonesIcon,
    tips: [
      "Practice 4-7-8 breathing (inhale 4s, hold 7s, exhale 8s)",
      "Go for a short walk in nature",
      "Reduce caffeine and sugar intake",
      "Talk to a trusted friend or family member",
      "Listen to calming music for 10 minutes",
    ],
  },
  anxiety: {
    icon: Wind,
    tips: [
      "Practice deep breathing — 5 minutes",
      "Ground yourself: name 5 things you see",
      "Write your feelings in a notebook",
      "Limit news and social media",
      "Spend time outdoors if possible",
    ],
  },
  "muscle ache": {
    icon: Footprints,
    tips: [
      "Gentle stretching and light movement",
      "Apply warm compress to affected area",
      "Stay hydrated and eat potassium-rich foods",
      "Rest the affected muscles",
      "Try gentle yoga poses",
    ],
  },
  "breathing difficulty": {
    icon: Wind,
    tips: [
      "⚠️ Seek medical help if severe",
      "Sit upright to ease breathing",
      "Practice pursed-lip breathing",
      "Stay in a well-ventilated area",
      "Avoid smoke, dust, and allergens",
    ],
  },
};

// ─── Risk-Based Card Data ───────────────────────────
const RISK_CARE = [
  {
    level: "Low",
    color: "bg-green-50 border-green-200",
    textColor: "text-green-700",
    badgeColor: "bg-green-100 text-green-800",
    icon: CheckCircle2,
    iconColor: "text-green-500",
    title: "Continue Self-Care",
    advice: [
      "Your symptoms appear manageable at home",
      "Follow the self-care tips provided",
      "Monitor symptoms for any changes",
      "Maintain healthy daily habits",
      "Re-check if symptoms persist beyond 3 days",
    ],
  },
  {
    level: "Medium",
    color: "bg-amber-50 border-amber-200",
    textColor: "text-amber-700",
    badgeColor: "bg-amber-100 text-amber-800",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    title: "Self-Care + Visit PHC Soon",
    advice: [
      "Follow self-care tips alongside medical advice",
      "Visit your nearest Primary Health Centre (PHC)",
      "Track your symptoms — note timing and severity",
      "Don't ignore worsening symptoms",
      "Bring symptom history to your doctor",
    ],
  },
  {
    level: "High / Critical",
    color: "bg-red-50 border-red-200",
    textColor: "text-red-700",
    badgeColor: "bg-red-100 text-red-800",
    icon: Shield,
    iconColor: "text-red-500",
    title: "Immediate Hospital Visit",
    advice: [
      "⚠️ Self-care alone is NOT sufficient",
      "Visit the nearest hospital immediately",
      "Call emergency services (108) if needed",
      "Do not delay — early treatment saves lives",
      "Have someone accompany you if possible",
    ],
  },
];

// ─── Preventive Care Data ───────────────────────────
const PREVENTIVE_TIPS = [
  { icon: Droplets, title: "Safe Drinking Water", tips: ["Boil or filter water before drinking", "Store water in clean covered containers", "Avoid drinking from unknown sources"] },
  { icon: Shield, title: "Hand Hygiene", tips: ["Wash hands with soap for 20 seconds", "Before eating and after using toilet", "Use sanitizer when soap isn't available"] },
  { icon: Bug, title: "Mosquito Prevention", tips: ["Use mosquito nets while sleeping", "Don't let water stagnate near home", "Wear long sleeves in the evening"] },
  { icon: Sun, title: "Summer Precautions", tips: ["Drink water frequently — don't wait for thirst", "Wear light, loose cotton clothing", "Avoid going out during peak heat (12–3 PM)"] },
  { icon: Wind, title: "Monsoon Precautions", tips: ["Avoid walking in stagnant water", "Keep surroundings dry and clean", "Watch for symptoms of dengue and malaria"] },
  { icon: Apple, title: "Nutrition Basics", tips: ["Eat balanced meals — grains, dal, vegetables", "Include iron-rich foods (spinach, jaggery, dates)", "Reduce excess sugar and processed food"] },
];

export default function SelfCare() {
  const { data: checks } = useSymptomChecks();

  // ─── Daily Checklist State (persisted in localStorage) ────
  const todayKey = new Date().toISOString().slice(0, 10);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(`selfcare-checklist-${todayKey}`);
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem(`selfcare-checklist-${todayKey}`, JSON.stringify(checkedItems));
  }, [checkedItems, todayKey]);

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const healthScore = Math.round((checkedCount / DEFAULT_CHECKLIST.length) * 100);

  // ─── Detect recent symptoms for personalized care ─────
  const recentSymptoms = new Set<string>();
  let latestRiskLevel = "Low";
  if (checks && checks.length > 0) {
    const latest = checks[0];
    latestRiskLevel = latest.riskLevel;
    // Collect from symptoms array
    (latest.symptoms as string[]).forEach(s => recentSymptoms.add(s.toLowerCase()));
    // Also check description for keywords
    const desc = (latest.description || "").toLowerCase();
    Object.keys(SYMPTOM_CARE).forEach(key => {
      if (desc.includes(key)) recentSymptoms.add(key);
    });
  }

  const matchedSymptomCare = Array.from(recentSymptoms)
    .filter(s => {
      // Find matching key
      return Object.keys(SYMPTOM_CARE).some(key => s.includes(key) || key.includes(s));
    })
    .map(s => {
      const key = Object.keys(SYMPTOM_CARE).find(k => s.includes(k) || k.includes(s))!;
      return { symptom: s, ...SYMPTOM_CARE[key] };
    })
    .slice(0, 4);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <header className="flex items-center gap-4 border-b border-border/50 pb-6">
        <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 shadow-lg shadow-green-500/10">
          <Leaf size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-display font-extrabold text-foreground">Self-Care Hub</h1>
          <p className="text-muted-foreground mt-1">Personalized wellness tips, daily checklist & preventive care</p>
        </div>
      </header>

      {/* ─── Daily Health Checklist ──────────────────── */}
      <section className="bg-white rounded-3xl p-6 shadow-lg shadow-black/[0.03] border border-border/50">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Trophy size={20} className="text-amber-500" />
            Daily Health Checklist
          </h2>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Today's Score</p>
              <p className={`text-2xl font-black ${healthScore >= 75 ? "text-green-500" : healthScore >= 50 ? "text-amber-500" : "text-red-400"}`}>
                {healthScore}%
              </p>
            </div>
            <div className="w-14 h-14 relative">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none"
                  stroke={healthScore >= 75 ? "#22c55e" : healthScore >= 50 ? "#f59e0b" : "#f87171"}
                  strokeWidth="3"
                  strokeDasharray={`${healthScore * 0.974} ${97.4 - healthScore * 0.974}`}
                  strokeLinecap="round"
                />
              </svg>
              <Sparkles size={14} className="absolute inset-0 m-auto text-amber-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DEFAULT_CHECKLIST.map(item => {
            const checked = checkedItems[item.id] || false;
            return (
              <button
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                  checked
                    ? "bg-green-50 border-green-300 text-green-800"
                    : "bg-white border-border/50 text-foreground hover:border-primary/30 hover:bg-primary/5"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  checked ? "bg-green-500 text-white" : "bg-secondary text-muted-foreground"
                }`}>
                  {checked ? <CheckCircle2 size={16} /> : <item.icon size={16} />}
                </div>
                <span className={`text-sm font-medium ${checked ? "line-through opacity-70" : ""}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {healthScore === 100 && (
          <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-700 font-bold text-lg">🎉 Perfect Score! Amazing job today!</p>
            <p className="text-green-600 text-sm mt-1">You're taking great care of your health.</p>
          </div>
        )}
      </section>

      {/* ─── Risk-Based Self-Care ────────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-primary" />
          Risk-Based Self-Care Guide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RISK_CARE.map(risk => {
            const isActive =
              (risk.level === "Low" && (latestRiskLevel === "Low")) ||
              (risk.level === "Medium" && latestRiskLevel === "Medium") ||
              (risk.level === "High / Critical" && (latestRiskLevel === "High" || latestRiskLevel === "Critical"));
            return (
              <div
                key={risk.level}
                className={`rounded-2xl border-2 p-5 transition-all ${risk.color} ${
                  isActive ? "ring-2 ring-offset-2 ring-primary scale-[1.02] shadow-lg" : "opacity-80"
                }`}
              >
                {isActive && (
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full mb-3 inline-block">
                    Your Current Level
                  </span>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <risk.icon size={20} className={risk.iconColor} />
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${risk.badgeColor}`}>
                    {risk.level} Risk
                  </span>
                </div>
                <h3 className={`font-bold text-base mb-3 ${risk.textColor}`}>{risk.title}</h3>
                <ul className="space-y-1.5">
                  {risk.advice.map((tip, i) => (
                    <li key={i} className={`text-xs leading-relaxed ${risk.textColor} opacity-90`}>
                      • {tip}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Personalized Symptom-Based Care ─────────── */}
      {matchedSymptomCare.length > 0 && (
        <section className="bg-white rounded-3xl p-6 shadow-lg shadow-black/[0.03] border border-border/50">
          <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            Personalized Self-Care
          </h2>
          <p className="text-xs text-muted-foreground mb-5">Based on your latest symptom check</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchedSymptomCare.map(({ symptom, tips, icon: Icon }) => (
              <div key={symptom} className="bg-gradient-to-br from-primary/5 to-transparent border border-primary/15 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground capitalize">{symptom}</h3>
                </div>
                <ul className="space-y-2">
                  {tips.map((tip, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5 shrink-0">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Basic Physical Self-Care ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <section className="bg-white rounded-2xl p-5 shadow-lg shadow-black/[0.03] border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
              <Apple size={18} className="text-orange-500" />
            </div>
            <h3 className="font-bold text-foreground">Nutrition</h3>
          </div>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><span className="text-orange-400">🥗</span> Eat balanced meals (rice/roti + dal + vegetables)</li>
            <li className="flex items-start gap-2"><span className="text-orange-400">🚫</span> Reduce junk food & excess sugar</li>
            <li className="flex items-start gap-2"><span className="text-orange-400">💧</span> Drink enough clean water daily</li>
            <li className="flex items-start gap-2"><span className="text-orange-400">💪</span> Iron-rich foods: spinach, jaggery, dates</li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl p-5 shadow-lg shadow-black/[0.03] border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Footprints size={18} className="text-blue-500" />
            </div>
            <h3 className="font-bold text-foreground">Daily Movement</h3>
          </div>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><span className="text-blue-400">🚶</span> 20–30 mins walking daily</li>
            <li className="flex items-start gap-2"><span className="text-blue-400">🧘</span> Simple stretching in the morning</li>
            <li className="flex items-start gap-2"><span className="text-blue-400">🙏</span> Light yoga for all ages</li>
            <li className="flex items-start gap-2"><span className="text-blue-400">🏃</span> Take stairs instead of elevator</li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl p-5 shadow-lg shadow-black/[0.03] border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Moon size={18} className="text-indigo-500" />
            </div>
            <h3 className="font-bold text-foreground">Sleep Care</h3>
          </div>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><span className="text-indigo-400">😴</span> Get 7–8 hours of sleep</li>
            <li className="flex items-start gap-2"><span className="text-indigo-400">📵</span> Avoid phone 30 mins before bed</li>
            <li className="flex items-start gap-2"><span className="text-indigo-400">⏰</span> Fix your sleep & wake timing</li>
            <li className="flex items-start gap-2"><span className="text-indigo-400">🌙</span> Keep bedroom dark and cool</li>
          </ul>
        </section>
      </div>

      {/* ─── Mental Health Self-Care ─────────────────── */}
      <section className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 border border-purple-100">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Brain size={20} className="text-purple-500" />
          Mental Health Self-Care
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { icon: Wind, label: "Deep breathing exercises", desc: "5 minutes, anytime" },
            { icon: Heart, label: "Talk to a trusted person", desc: "Family, friend, or counselor" },
            { icon: Music, label: "Listen to calming music", desc: "10 mins of relaxation" },
            { icon: Sun, label: "Spend time outdoors", desc: "Sunlight + fresh air" },
            { icon: Eye, label: "Write feelings in a notebook", desc: "Express, don't suppress" },
            { icon: Coffee, label: "Limit caffeine & social media", desc: "Reduce stress triggers" },
          ].map((tip, i) => (
            <div key={i} className="bg-white/80 backdrop-blur rounded-xl p-4 flex items-start gap-3 border border-purple-100/50">
              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                <tip.icon size={16} className="text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{tip.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-700 text-xs">
            <strong>Important:</strong> If you experience persistent sadness, anxiety, or thoughts of self-harm, 
            please seek professional help. Visit your nearest health center or call a helpline.
          </p>
        </div>
      </section>

      {/* ─── Preventive Self-Care ────────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Shield size={20} className="text-primary" />
          Preventive Care — Stay Healthy
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PREVENTIVE_TIPS.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-lg shadow-black/[0.03] border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon size={18} className="text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-sm">{item.title}</h3>
              </div>
              <ul className="space-y-1.5">
                {item.tips.map((tip, j) => (
                  <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">•</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Disclaimer ─────────────────────────────── */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-800 text-sm font-semibold">Disclaimer</p>
          <p className="text-amber-700 text-xs mt-1 leading-relaxed">
            These self-care suggestions are for general wellness only. They do NOT replace professional medical advice. 
            No medication dosages are provided. Always consult a qualified doctor for diagnosis and treatment. 
            If symptoms are severe, visit a hospital immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
