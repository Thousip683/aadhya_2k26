import { useMemo } from "react";
import { Link } from "wouter";
import { useStats, useSymptomChecks } from "@/hooks/use-symptom-checks";
import { useAuth } from "@/hooks/use-auth";
import {
  Stethoscope,
  FileText,
  Sparkles,
  Mic,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Loader2,
} from "lucide-react";

// ── Helpers ─────────────────────────────────────────

function ProgressBar({ value = 0 }: { value: number }) {
  return (
    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
      <div
        className="h-full rounded-full bg-primary transition-all duration-700"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function MiniBarRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground font-medium">{label}</span>
        <span className="text-foreground font-semibold">{value}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    Low: "bg-primary/15 text-primary-foreground",
    Medium: "bg-amber-100 text-amber-800",
    High: "bg-orange-100 text-orange-800",
    Critical: "bg-destructive/15 text-destructive",
  };
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold " +
        (map[level] || "bg-muted text-muted-foreground")
      }
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {level}
    </span>
  );
}

function timeAgo(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

// ── Main Dashboard ──────────────────────────────────

export default function UserDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: checks, isLoading: checksLoading } = useSymptomChecks();

  // computed data
  const latestCheck = checks?.[0];
  const recentChecks = checks?.slice(0, 5) ?? [];
  const totalChecks = checks?.length ?? 0;

  // Symptom frequency for trends (from actual data)
  const symptomFrequency = useMemo(() => {
    if (!checks || checks.length === 0) return [];
    const freq: Record<string, number> = {};
    checks.forEach((c: any) => {
      const symptoms = Array.isArray(c.symptoms) ? c.symptoms : [];
      symptoms.forEach((s: string) => {
        freq[s] = (freq[s] || 0) + 1;
      });
      // Also count from conditions
      const conditions = Array.isArray(c.possibleConditions) ? c.possibleConditions : [];
      conditions.forEach((cond: string) => {
        const key = cond.split(" ")[0]; // first word
        freq[key] = (freq[key] || 0) + 1;
      });
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([label, count]) => ({
        label,
        value: Math.min(100, Math.round((count / totalChecks) * 100)),
      }));
  }, [checks, totalChecks]);

  const lastRiskLevel = latestCheck?.riskLevel || "N/A";
  const lastRiskScore = latestCheck?.riskScore ?? 0;

  if (statsLoading || checksLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto">
      {/* ── Hero Card ──────────────────────────────── */}
      <div className="relative bg-white rounded-3xl shadow-lg shadow-black/[0.03] border border-border/50 overflow-hidden">
        {/* Background decorative blobs */}
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-56 h-56 bg-primary/5 blur-3xl rounded-full pointer-events-none" />

        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 text-primary-foreground px-3 py-1 text-xs font-semibold">
                <Sparkles size={14} />
                AI triage assistant
              </div>

              <h1 className="mt-4 text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-foreground leading-[1.1]">
                Welcome back,
                <br />
                <span className="text-primary">{user?.name || "User"}</span>
              </h1>

              <p className="mt-4 text-muted-foreground text-[15px] max-w-xl">
                AI-powered early symptom analysis and intelligent triage for
                safer healthcare decisions.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/symptom-check"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground font-semibold px-5 py-3 hover:opacity-90 transition"
                >
                  Start Symptom Check
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/reports"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-border text-foreground font-semibold px-5 py-3 hover:bg-muted/50 transition"
                >
                  View Health Reports
                </Link>
              </div>
            </div>

            {/* Right — Robot Mascot + Stats overlay */}
            <div className="relative hidden lg:flex items-center justify-center min-h-[340px]">
              {/* Robot mascot image */}
              <img
                src="/robo.png"
                alt="AI Health Robot"
                className="w-64 h-auto drop-shadow-xl relative z-10"
                style={{ filter: "drop-shadow(0 8px 24px rgba(132,204,22,0.2))" }}
              />

              {/* Floating stat cards overlaying the mascot */}
              {/* Top-right: Risk Score card */}
              <div className="absolute top-2 right-0 z-20 bg-white/95 backdrop-blur rounded-2xl p-3 shadow-lg border border-border/50 w-[130px]">
                <div className="text-[10px] text-muted-foreground font-medium">Risk Score</div>
                <div className="mt-0.5 text-xl font-display font-extrabold text-foreground">
                  {lastRiskScore}
                </div>
                <div className="mt-1.5">
                  <ProgressBar value={lastRiskScore} />
                </div>
              </div>

              {/* Bottom-left: Total Checks card */}
              <div className="absolute bottom-6 left-0 z-20 bg-white/95 backdrop-blur rounded-2xl p-3 shadow-lg border border-border/50 w-[130px]">
                <div className="text-[10px] text-muted-foreground font-medium">Total Checks</div>
                <div className="mt-0.5 text-xl font-display font-extrabold text-foreground">
                  {totalChecks}
                </div>
                <div className="mt-1.5 flex gap-1">
                  {[...Array(Math.min(5, totalChecks || 1))].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded bg-primary"
                      style={{ height: `${10 + Math.random() * 14}px` }}
                    />
                  ))}
                  {totalChecks === 0 && (
                    <div className="w-1.5 h-3 rounded bg-muted" />
                  )}
                </div>
              </div>

              {/* Top-left: AI Ready badge */}
              <div className="absolute top-8 left-2 z-20 bg-[#1a1a2e]/90 backdrop-blur rounded-xl px-3 py-2 shadow-lg flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground grid place-items-center shrink-0">
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-white leading-tight">AI Ready</div>
                  <div className="text-[9px] text-white/60">Triage active</div>
                </div>
              </div>

              {/* Bottom-right: Latest Risk badge */}
              {latestCheck && (
                <div className="absolute bottom-10 right-2 z-20">
                  <RiskBadge level={latestCheck.riskLevel} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────── */}
      <div>
        <h2 className="text-xl font-display font-extrabold text-foreground">
          Health Quick Actions
        </h2>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Symptom Check */}
          <div className="bg-white rounded-3xl p-6 shadow-lg shadow-black/[0.03] border border-border/50">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-2xl bg-primary/15 text-primary-foreground grid place-items-center">
                <Stethoscope size={20} />
              </div>
              <Link
                href="/symptom-check"
                className="w-10 h-10 rounded-2xl bg-muted border border-border grid place-items-center hover:bg-muted/80 transition"
              >
                <Plus size={18} className="text-foreground" />
              </Link>
            </div>
            <div className="mt-4 text-[16px] font-display font-extrabold text-foreground">
              Start Symptom Check
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Quickly analyse your symptoms using AI.
            </div>
            <Link
              href="/symptom-check"
              className="mt-5 w-full rounded-2xl bg-primary text-primary-foreground font-semibold py-3 hover:opacity-90 transition flex items-center justify-center"
            >
              New Check
            </Link>
          </div>

          {/* AI Assistant */}
          <div className="bg-white rounded-3xl p-6 shadow-lg shadow-black/[0.03] border border-border/50">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-2xl bg-primary/15 text-primary-foreground grid place-items-center">
                <Sparkles size={20} />
              </div>
              <div className="w-10 h-10 rounded-2xl bg-muted border border-border grid place-items-center">
                <Mic size={18} className="text-foreground" />
              </div>
            </div>
            <div className="mt-4 text-[16px] font-display font-extrabold text-foreground">
              AI Health Assistant
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Ask questions and get guidance with follow-up prompts.
            </div>
            <Link
              href="/symptom-check"
              className="mt-5 w-full rounded-2xl bg-primary/10 border border-primary/20 text-foreground font-semibold py-3 hover:bg-primary/15 transition flex items-center justify-center"
            >
              Ask AI <span className="ml-1">›</span>
            </Link>
          </div>

          {/* Health Reports */}
          <div className="bg-white rounded-3xl p-6 shadow-lg shadow-black/[0.03] border border-border/50">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-2xl bg-primary/15 text-primary-foreground grid place-items-center">
                <FileText size={20} />
              </div>
              <Link
                href="/reports"
                className="w-10 h-10 rounded-2xl bg-muted border border-border grid place-items-center hover:bg-muted/80 transition"
              >
                <ArrowRight size={18} className="text-foreground" />
              </Link>
            </div>
            <div className="mt-4 text-[16px] font-display font-extrabold text-foreground">
              Health Reports
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              View your risk results, summaries and guidance history.
            </div>
            <Link
              href="/reports"
              className="mt-5 w-full rounded-2xl bg-primary text-primary-foreground font-semibold py-3 hover:opacity-90 transition flex items-center justify-center"
            >
              View Reports <span className="ml-1">›</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Overview + AI Insights ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left — Health Overview */}
        <div className="space-y-4">
          <h2 className="text-xl font-display font-extrabold text-foreground">
            Health Overview
          </h2>

          <div className="bg-white rounded-3xl p-6 shadow-lg shadow-black/[0.03] border border-border/50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2
                    size={16}
                    className={
                      lastRiskScore >= 70
                        ? "text-destructive"
                        : lastRiskScore >= 40
                        ? "text-amber-500"
                        : "text-primary"
                    }
                  />
                  Last Risk Score
                </div>
                <div className="mt-2 text-3xl font-display font-extrabold text-foreground">
                  {lastRiskLevel}
                </div>
                <div className="mt-4">
                  <ProgressBar value={lastRiskScore} />
                </div>
              </div>
              <div
                className={`w-14 h-14 rounded-2xl grid place-items-center ${
                  lastRiskScore >= 70
                    ? "bg-destructive/15 text-destructive"
                    : lastRiskScore >= 40
                    ? "bg-amber-100 text-amber-600"
                    : "bg-primary/15 text-primary-foreground"
                }`}
              >
                {lastRiskScore >= 70 ? (
                  <AlertTriangle size={28} />
                ) : (
                  <CheckCircle2 size={28} />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-6 shadow-lg shadow-black/[0.03] border border-border/50">
              <div className="text-sm text-muted-foreground">Checks Today</div>
              <div className="mt-1 flex items-end gap-2">
                <div className="text-3xl font-display font-extrabold text-foreground">
                  {stats?.checksToday ?? 0}
                </div>
                <div className="text-sm text-muted-foreground pb-1">today</div>
              </div>
              <Link
                href="/history"
                className="mt-4 w-full rounded-2xl bg-primary text-primary-foreground font-semibold py-3 hover:opacity-90 transition flex items-center justify-center"
              >
                View History
              </Link>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg shadow-black/[0.03] border border-border/50">
              <div className="text-sm text-muted-foreground">Avg Risk Score</div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-lg font-display font-extrabold text-foreground">
                  {stats?.avgRiskScore ?? 0} / 100
                </div>
                <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      (stats?.avgRiskScore ?? 0) >= 50
                        ? "bg-amber-400"
                        : "bg-primary"
                    }`}
                  />
                  Overall
                </span>
              </div>
              <Link
                href="/reports"
                className="mt-4 w-full rounded-2xl bg-white border border-border text-foreground font-semibold py-3 hover:bg-muted/50 transition flex items-center justify-center"
              >
                View Reports
              </Link>
            </div>
          </div>
        </div>

        {/* Right — AI Health Insights */}
        <div>
          <div className="dark-card rounded-3xl p-6 h-full relative overflow-hidden">
            <div className="absolute -right-16 -top-20 w-56 h-56 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -left-24 -bottom-24 w-60 h-60 rounded-full bg-white/10 blur-3xl" />

            <div className="relative">
              <div className="flex items-center gap-2 text-lg font-display font-extrabold text-white">
                <span className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 grid place-items-center">
                  <Sparkles size={18} />
                </span>
                AI Health Insights
              </div>

              <div className="mt-4 text-sm text-white/80">
                {totalChecks > 0
                  ? "Based on your recent symptom checks:"
                  : "Start your first symptom check to see insights here."}
              </div>

              {totalChecks > 0 && (
                <ul className="mt-4 space-y-2.5 text-sm text-white/85">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    You've completed <strong>{totalChecks}</strong> symptom{" "}
                    {totalChecks === 1 ? "check" : "checks"} in total
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    Average risk score:{" "}
                    <strong>{stats?.avgRiskScore ?? 0}/100</strong>
                  </li>
                  {(stats?.highRiskCases ?? 0) > 0 && (
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                      <strong>{stats?.highRiskCases}</strong> high risk{" "}
                      {stats?.highRiskCases === 1 ? "case" : "cases"} detected — please follow up
                    </li>
                  )}
                  {(stats?.highRiskCases ?? 0) === 0 && (
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      No high risk cases — keep monitoring regularly
                    </li>
                  )}
                </ul>
              )}

              <div className="mt-6 flex items-center gap-3">
                <Link
                  href="/self-care"
                  className="rounded-2xl bg-white/10 border border-white/10 px-4 py-2.5 font-semibold text-white hover:bg-white/15 transition text-sm"
                >
                  Self-Care Tips <span className="ml-1">›</span>
                </Link>

                <div className="ml-auto rounded-2xl bg-white/5 border border-white/10 p-3">
                  <div className="flex gap-1 items-end">
                    {recentChecks.slice(0, 6).map((c: any, i: number) => (
                      <div
                        key={i}
                        className={`w-2 rounded ${
                          c.riskScore >= 70
                            ? "bg-destructive"
                            : c.riskScore >= 40
                            ? "bg-amber-400"
                            : "bg-primary"
                        }`}
                        style={{
                          height: `${Math.max(12, (c.riskScore / 100) * 36)}px`,
                        }}
                      />
                    ))}
                    {recentChecks.length === 0 &&
                      [7, 4, 9, 5, 8, 6].map((h, i) => (
                        <div
                          key={i}
                          className="w-2 rounded bg-white/20"
                          style={{ height: `${h * 4}px` }}
                        />
                      ))}
                  </div>
                  <div className="mt-2 text-[11px] text-white/60">
                    Recent trend
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Trends + Recent Checks ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Symptom Trends */}
        <div className="bg-white rounded-3xl p-6 shadow-lg shadow-black/[0.03] border border-border/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-extrabold text-foreground">
              Top Symptoms &amp; Conditions
            </h2>
            <span className="inline-flex items-center rounded-full bg-primary/15 text-primary-foreground px-2.5 py-1 text-xs font-semibold">
              all time
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {symptomFrequency.length > 0 ? (
              symptomFrequency.map((item) => (
                <MiniBarRow
                  key={item.label}
                  label={item.label}
                  value={item.value}
                />
              ))
            ) : (
              <div className="text-sm text-muted-foreground py-8 text-center">
                No symptom data yet. Complete your first check!
              </div>
            )}
          </div>
        </div>

        {/* Recent Checks */}
        <div className="bg-white rounded-3xl p-6 shadow-lg shadow-black/[0.03] border border-border/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-extrabold text-foreground">
              Recent Symptom Checks
            </h2>
            <Link
              href="/history"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition"
            >
              View Full History <span className="ml-1">›</span>
            </Link>
          </div>

          {recentChecks.length > 0 ? (
            <div className="mt-5 overflow-hidden rounded-2xl border border-border/50">
              <div className="grid grid-cols-[100px_1fr_90px] bg-muted px-4 py-3 text-xs font-semibold text-muted-foreground">
                <div>When</div>
                <div>Symptoms</div>
                <div className="text-right">Risk</div>
              </div>

              {recentChecks.map((row: any) => {
                const symptoms = Array.isArray(row.symptoms) ? row.symptoms : [];
                const displaySymptoms =
                  symptoms.length > 0
                    ? symptoms.join(", ")
                    : row.description?.slice(0, 40) || "—";
                return (
                  <Link
                    key={row.id}
                    href={`/result/${row.id}`}
                    className="grid grid-cols-[100px_1fr_90px] items-center px-4 py-3 text-sm border-t border-border/50 hover:bg-muted/30 transition cursor-pointer"
                  >
                    <div className="text-muted-foreground text-xs">
                      {timeAgo(row.createdAt)}
                    </div>
                    <div className="text-foreground font-medium truncate pr-2">
                      {displaySymptoms}
                    </div>
                    <div className="text-right">
                      <RiskBadge level={row.riskLevel} />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 text-sm text-muted-foreground py-8 text-center">
              No checks yet. Start your first symptom check!
            </div>
          )}
        </div>
      </div>

      {/* ── Emergency Help Banner ─────────────────── */}
      <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white border border-destructive/20 grid place-items-center text-destructive shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="text-base font-display font-extrabold text-foreground">
              Emergency Help
            </div>
            <div className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Seek medical help immediately if you experience severe symptoms
              like chest pain, difficulty breathing, or loss of consciousness.
            </div>
          </div>
        </div>

        <div className="sm:ml-auto shrink-0">
          <a
            href="tel:108"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground font-semibold px-5 py-3 hover:opacity-90 transition"
          >
            <HeartPulse size={18} />
            Call Emergency (108)
          </a>
        </div>
      </div>
    </div>
  );
}
