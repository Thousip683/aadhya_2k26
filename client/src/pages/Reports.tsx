import { useState, useMemo } from "react";
import { useSymptomChecks } from "@/hooks/use-symptom-checks";
import { format } from "date-fns";
import {
  BarChart2,
  TrendingUp,
  Activity,
  AlertTriangle,
  Download,
  FileText,
  Brain,
  Lightbulb,
  Heart,
  Droplets,
  Calculator,
  Pill,
  Plus,
  X,
  BookOpen,
  ShieldCheck,
  Thermometer,
  Zap,
  Bug,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

// ─── Types ──────────────────────────────────────────
type MedEntry = { name: string; dose: string; time: string };

// ─── Educational Content ────────────────────────────
const FIRST_AID_GUIDES = [
  {
    title: "Heatstroke & Dehydration",
    icon: Thermometer,
    color: "text-orange-500",
    bg: "bg-orange-50",
    border: "border-orange-200",
    tips: [
      "Move the person to a cool, shaded area immediately",
      "Apply cool water to skin or use wet cloths",
      "Give small sips of cool water if conscious",
      "Call emergency services if temperature exceeds 104°F",
    ],
  },
  {
    title: "Snake & Insect Bites",
    icon: Bug,
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    tips: [
      "Keep the person calm and still to slow venom spread",
      "Remove jewelry near the bite before swelling starts",
      "Do NOT cut the wound, suck venom, or apply ice",
      "Get to a hospital with antivenom as fast as possible",
    ],
  },
  {
    title: "Wound & Bleeding Care",
    icon: Droplets,
    color: "text-rose-500",
    bg: "bg-rose-50",
    border: "border-rose-200",
    tips: [
      "Apply firm pressure with a clean cloth for 10-15 min",
      "Elevate the injured area above heart level if possible",
      "Clean the wound with clean water once bleeding stops",
      "Seek medical help if wound is deep or won't stop bleeding",
    ],
  },
  {
    title: "Fever Management",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    tips: [
      "Rest and drink plenty of fluids (water, ORS, soups)",
      "Paracetamol or ibuprofen can help reduce fever",
      "Use a damp cloth on the forehead for comfort",
      "See a doctor if fever exceeds 103°F or lasts >3 days",
    ],
  },
];

const PREVENTIVE_TIPS = [
  "Wash hands with soap before meals and after using the toilet",
  "Drink only boiled or filtered water",
  "Use mosquito nets and repellents to prevent malaria & dengue",
  "Keep vaccination records up to date for children and adults",
  "Store food in covered containers to prevent contamination",
  "Visit a health center for regular checkups at least once a year",
];

export default function Reports() {
  const { data: checks, isLoading } = useSymptomChecks();
  const [bmiWeight, setBmiWeight] = useState("");
  const [bmiHeight, setBmiHeight] = useState("");
  const [bmiResult, setBmiResult] = useState<{ value: number; label: string; color: string } | null>(null);
  const [meds, setMeds] = useState<MedEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("health_meds") || "[]");
    } catch {
      return [];
    }
  });
  const [newMed, setNewMed] = useState({ name: "", dose: "", time: "08:00" });
  const [showMedForm, setShowMedForm] = useState(false);

  // ─── Computed data ────────────────────────────────
  const {
    totalChecks,
    avgRisk,
    highRiskCount,
    lowRiskCount,
    riskTrendData,
    symptomFreqData,
    insights,
  } = useMemo(() => {
    if (!checks || checks.length === 0) {
      return {
        totalChecks: 0,
        avgRisk: 0,
        highRiskCount: 0,
        lowRiskCount: 0,
        riskTrendData: [],
        symptomFreqData: [],
        insights: [],
      };
    }

    const sorted = [...checks].sort(
      (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const total = sorted.length;
    const avg = Math.round(sorted.reduce((s: number, c: any) => s + c.riskScore, 0) / total);
    const high = sorted.filter((c: any) => c.riskLevel === "High" || c.riskLevel === "Critical").length;
    const low = sorted.filter((c: any) => c.riskLevel === "Low").length;

    // Risk trend over time
    const trend = sorted.map((c: any) => ({
      date: format(new Date(c.createdAt), "MMM d"),
      score: c.riskScore,
    }));

    // Symptom frequency
    const freq: Record<string, number> = {};
    sorted.forEach((c: any) => {
      (c.symptoms as string[]).forEach((s) => {
        freq[s] = (freq[s] || 0) + 1;
      });
    });
    const symptomData = Object.entries(freq)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Insights
    const insightsList: string[] = [];
    if (total >= 2) {
      // Most common symptom
      const topSymptom = symptomData[0];
      if (topSymptom && topSymptom.count >= 2) {
        insightsList.push(
          `You've reported "${topSymptom.name}" ${topSymptom.count} times — consider discussing this pattern with a doctor.`
        );
      }
      // Risk trend
      const recentAvg = sorted.slice(-3).reduce((s: number, c: any) => s + c.riskScore, 0) / Math.min(3, sorted.length);
      const olderAvg = sorted.slice(0, Math.max(1, sorted.length - 3)).reduce((s: number, c: any) => s + c.riskScore, 0) / Math.max(1, sorted.length - 3);
      if (recentAvg > olderAvg + 10) {
        insightsList.push("Your recent risk scores are trending higher — pay close attention to new symptoms.");
      } else if (recentAvg < olderAvg - 10) {
        insightsList.push("Good news — your recent risk scores have been decreasing. Keep it up!");
      }
      // High risk warning
      if (high > 0) {
        insightsList.push(
          `${high} of your ${total} checks were flagged as High/Critical risk. If symptoms persist, visit a healthcare center.`
        );
      }
    }
    if (insightsList.length === 0) {
      insightsList.push("Complete more symptom checks to unlock personalized health insights.");
    }

    return {
      totalChecks: total,
      avgRisk: avg,
      highRiskCount: high,
      lowRiskCount: low,
      riskTrendData: trend,
      symptomFreqData: symptomData,
      insights: insightsList,
    };
  }, [checks]);

  // ─── Export Handlers ──────────────────────────────
  const exportCSV = () => {
    if (!checks || checks.length === 0) return;
    const header = "Date,Symptoms,Risk Score,Risk Level,Possible Conditions,Recommended Action\n";
    const rows = checks
      .map((c: any) =>
        `"${format(new Date(c.createdAt), "yyyy-MM-dd HH:mm")}","${(c.symptoms as string[]).join("; ")}",${c.riskScore},"${c.riskLevel}","${(c.possibleConditions as string[]).join("; ")}","${c.recommendedAction}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `health-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (!checks || checks.length === 0) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const rows = checks
      .map(
        (c: any) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${format(new Date(c.createdAt), "MMM d, yyyy")}</td>
          <td style="padding:8px;border-bottom:1px solid #eee">${(c.symptoms as string[]).join(", ")}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;font-weight:bold;color:${c.riskScore >= 70 ? "#ef4444" : c.riskScore >= 40 ? "#f59e0b" : "#22c55e"}">${c.riskScore}</td>
          <td style="padding:8px;border-bottom:1px solid #eee">${c.riskLevel}</td>
          <td style="padding:8px;border-bottom:1px solid #eee">${(c.possibleConditions as string[]).join(", ")}</td>
        </tr>`
      )
      .join("");
    printWindow.document.write(`
      <html><head><title>Health Report</title></head>
      <body style="font-family:system-ui,sans-serif;padding:40px;color:#222">
        <h1 style="margin-bottom:4px">RuralCare — Health Report</h1>
        <p style="color:#666;margin-bottom:24px">Generated on ${format(new Date(), "MMMM d, yyyy")}</p>
        <div style="display:flex;gap:24px;margin-bottom:32px">
          <div style="background:#f9f9f9;padding:16px 24px;border-radius:12px;text-align:center">
            <div style="font-size:28px;font-weight:800">${totalChecks}</div>
            <div style="font-size:12px;color:#888">Total Checks</div>
          </div>
          <div style="background:#f9f9f9;padding:16px 24px;border-radius:12px;text-align:center">
            <div style="font-size:28px;font-weight:800">${avgRisk}</div>
            <div style="font-size:12px;color:#888">Avg Risk Score</div>
          </div>
          <div style="background:#f9f9f9;padding:16px 24px;border-radius:12px;text-align:center">
            <div style="font-size:28px;font-weight:800;color:#ef4444">${highRiskCount}</div>
            <div style="font-size:12px;color:#888">High Risk</div>
          </div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead><tr style="background:#f3f3f3">
            <th style="padding:10px;text-align:left">Date</th>
            <th style="padding:10px;text-align:left">Symptoms</th>
            <th style="padding:10px;text-align:center">Score</th>
            <th style="padding:10px;text-align:left">Level</th>
            <th style="padding:10px;text-align:left">Conditions</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // ─── BMI Calculator ───────────────────────────────
  const calcBMI = () => {
    const w = parseFloat(bmiWeight);
    const h = parseFloat(bmiHeight) / 100; // cm to m
    if (!w || !h || h <= 0) return;
    const bmi = +(w / (h * h)).toFixed(1);
    let label = "Normal";
    let color = "text-green-600";
    if (bmi < 18.5) { label = "Underweight"; color = "text-amber-600"; }
    else if (bmi < 25) { label = "Normal"; color = "text-green-600"; }
    else if (bmi < 30) { label = "Overweight"; color = "text-orange-600"; }
    else { label = "Obese"; color = "text-red-600"; }
    setBmiResult({ value: bmi, label, color });
  };

  // ─── Medication Log ───────────────────────────────
  const addMed = () => {
    if (!newMed.name.trim()) return;
    const updated = [...meds, { ...newMed, name: newMed.name.trim(), dose: newMed.dose.trim() }];
    setMeds(updated);
    localStorage.setItem("health_meds", JSON.stringify(updated));
    setNewMed({ name: "", dose: "", time: "08:00" });
    setShowMedForm(false);
  };

  const removeMed = (idx: number) => {
    const updated = meds.filter((_, i) => i !== idx);
    setMeds(updated);
    localStorage.setItem("health_meds", JSON.stringify(updated));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <BarChart2 size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-display font-extrabold text-foreground">Health Reports</h1>
            <p className="text-muted-foreground mt-1">Your personal health insights and analytics</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            disabled={!checks || checks.length === 0}
            className="px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 bg-secondary text-foreground hover:bg-secondary/80 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={16} /> CSV
          </button>
          <button
            onClick={exportPDF}
            disabled={!checks || checks.length === 0}
            className="px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 bg-primary text-primary-foreground hover:bg-[#b8e855] shadow-md shadow-primary/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileText size={16} /> PDF Report
          </button>
        </div>
      </header>

      {/* ─── Stat Cards ──────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Checks", value: totalChecks, icon: Activity, color: "text-primary", bg: "bg-primary/10" },
          { label: "Avg Risk Score", value: avgRisk, icon: TrendingUp, color: avgRisk >= 50 ? "text-amber-500" : "text-green-500", bg: avgRisk >= 50 ? "bg-amber-50" : "bg-green-50" },
          { label: "High Risk", value: highRiskCount, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
          { label: "Low Risk", value: lowRiskCount, icon: ShieldCheck, color: "text-green-600", bg: "bg-green-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-lg shadow-black/[0.03] border border-border/50">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-2xl font-display font-black text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ─── Charts Row ──────────────────────────────── */}
      {riskTrendData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Score Trend */}
          <div className="bg-white rounded-3xl p-6 shadow-lg shadow-black/[0.03] border border-border/50">
            <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" /> Risk Score Trend
            </h2>
            <p className="text-xs text-muted-foreground mb-4">Your risk scores over time</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={riskTrendData}>
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(82, 85%, 67%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(82, 85%, 67%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" fontSize={11} tick={{ fill: "#999" }} />
                  <YAxis domain={[0, 100]} fontSize={11} tick={{ fill: "#999" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #eee", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    labelStyle={{ fontWeight: 700 }}
                  />
                  <Area type="monotone" dataKey="score" stroke="hsl(82, 85%, 55%)" strokeWidth={2.5} fill="url(#riskGrad)" dot={{ r: 4, fill: "hsl(82, 85%, 55%)" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Symptom Frequency */}
          <div className="bg-white rounded-3xl p-6 shadow-lg shadow-black/[0.03] border border-border/50">
            <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
              <BarChart2 size={20} className="text-primary" /> Symptom Frequency
            </h2>
            <p className="text-xs text-muted-foreground mb-4">Most reported symptoms</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={symptomFreqData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" fontSize={11} tick={{ fill: "#999" }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" fontSize={11} tick={{ fill: "#555" }} width={100} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #eee", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                  />
                  <Bar dataKey="count" fill="hsl(82, 85%, 55%)" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ─── Health Insights ─────────────────────────── */}
      <section className="bg-white rounded-3xl p-6 shadow-lg shadow-black/[0.03] border border-border/50">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Brain size={20} className="text-primary" /> Personalized Insights
        </h2>
        <div className="space-y-3">
          {insights.map((text, i) => (
            <div key={i} className="flex items-start gap-3 bg-primary/5 border border-primary/15 rounded-xl p-4">
              <Lightbulb size={18} className="text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-foreground font-medium leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── BMI Calculator + Medication Log ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BMI Calculator */}
        <section className="bg-white rounded-3xl p-6 shadow-lg shadow-black/[0.03] border border-border/50">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Calculator size={20} className="text-primary" /> BMI Calculator
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Weight (kg)</label>
                <input
                  type="number"
                  value={bmiWeight}
                  onChange={(e) => setBmiWeight(e.target.value)}
                  placeholder="65"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-border bg-secondary/30 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Height (cm)</label>
                <input
                  type="number"
                  value={bmiHeight}
                  onChange={(e) => setBmiHeight(e.target.value)}
                  placeholder="170"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-border bg-secondary/30 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>
            <button
              onClick={calcBMI}
              disabled={!bmiWeight || !bmiHeight}
              className="w-full py-2.5 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:bg-[#b8e855] shadow-md shadow-primary/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Calculate BMI
            </button>
            {bmiResult && (
              <div className="bg-secondary/50 rounded-xl p-4 text-center">
                <p className={`text-3xl font-display font-black ${bmiResult.color}`}>{bmiResult.value}</p>
                <p className={`text-sm font-bold mt-1 ${bmiResult.color}`}>{bmiResult.label}</p>
                <div className="mt-3 h-2 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-500 rounded-full relative">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-foreground rounded-full shadow"
                    style={{ left: `${Math.min(Math.max(((bmiResult.value - 15) / 25) * 100, 0), 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Underweight</span><span>Normal</span><span>Overweight</span><span>Obese</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Medication Reminder Log */}
        <section className="bg-white rounded-3xl p-6 shadow-lg shadow-black/[0.03] border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Pill size={20} className="text-primary" /> Medication Log
            </h2>
            <button
              onClick={() => setShowMedForm(!showMedForm)}
              className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              {showMedForm ? <X size={16} /> : <Plus size={16} />}
            </button>
          </div>

          {showMedForm && (
            <div className="bg-secondary/30 rounded-xl p-4 mb-4 space-y-3">
              <input
                type="text"
                value={newMed.name}
                onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                placeholder="Medication name"
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary transition-all"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newMed.dose}
                  onChange={(e) => setNewMed({ ...newMed, dose: e.target.value })}
                  placeholder="Dosage (e.g. 500mg)"
                  className="px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary transition-all"
                />
                <input
                  type="time"
                  value={newMed.time}
                  onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <button
                onClick={addMed}
                disabled={!newMed.name.trim()}
                className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-[#b8e855] transition-all disabled:opacity-40"
              >
                Add Medication
              </button>
            </div>
          )}

          {meds.length === 0 ? (
            <div className="text-center py-8">
              <Pill className="mx-auto h-10 w-10 text-muted-foreground/20 mb-2" />
              <p className="text-sm text-muted-foreground">No medications added yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {meds.map((med, i) => (
                <div key={i} className="flex items-center justify-between bg-secondary/40 rounded-xl px-4 py-3 group">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{med.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {med.dose && `${med.dose} · `}{med.time}
                    </p>
                  </div>
                  <button
                    onClick={() => removeMed(i)}
                    className="text-muted-foreground/30 hover:text-destructive transition-colors p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ─── Educational Content ─────────────────────── */}
      <section>
        <h2 className="text-xl font-display font-bold text-foreground mb-5 flex items-center gap-2">
          <BookOpen size={22} className="text-primary" /> First Aid & Health Guides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FIRST_AID_GUIDES.map((guide) => (
            <div key={guide.title} className={`${guide.bg} rounded-2xl p-5 border ${guide.border}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm`}>
                  <guide.icon size={20} className={guide.color} />
                </div>
                <h3 className="font-bold text-foreground">{guide.title}</h3>
              </div>
              <ul className="space-y-2.5">
                {guide.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80 leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current shrink-0 opacity-40" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Preventive Care Tips ────────────────────── */}
      <section className="bg-white rounded-3xl p-6 shadow-lg shadow-black/[0.03] border border-border/50">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Heart size={20} className="text-primary" /> Preventive Care Reminders
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PREVENTIVE_TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-3.5">
              <ShieldCheck size={16} className="text-green-600 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-green-900 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
