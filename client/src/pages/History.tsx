import { useState, useMemo } from "react";
import { useSymptomChecks, useDeleteSymptomCheck } from "@/hooks/use-symptom-checks";
import { format, subDays, isAfter } from "date-fns";
import { Link } from "wouter";
import {
  ArrowRight,
  Activity,
  Clock,
  Trash2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Filter,
  Calendar,
  Shield,
  Heart,
  Zap,
  AlertTriangle,
  ChevronDown,
  Search,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ─── Types ──────────────────────────────────────────
type RiskFilter = "all" | "low" | "medium" | "high" | "critical";
type TimeFilter = "all" | "7d" | "30d" | "90d";

// ─── Colors ─────────────────────────────────────────
const RISK_COLORS: Record<string, string> = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};

const PIE_COLORS = ["#22c55e", "#f59e0b", "#f97316", "#ef4444"];

export default function History() {
  const { data: checks, isLoading } = useSymptomChecks();
  const deleteCheck = useDeleteSymptomCheck();
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // ─── Computed Data ──────────────────────────────────
  const sortedChecks = useMemo(() => {
    if (!checks) return [];
    return [...checks].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [checks]);

  const filteredChecks = useMemo(() => {
    let result = sortedChecks;

    // Time filter
    if (timeFilter !== "all") {
      const days = timeFilter === "7d" ? 7 : timeFilter === "30d" ? 30 : 90;
      const cutoff = subDays(new Date(), days);
      result = result.filter((c) => isAfter(new Date(c.createdAt), cutoff));
    }

    // Risk filter
    if (riskFilter !== "all") {
      result = result.filter(
        (c) => c.riskLevel.toLowerCase() === riskFilter
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.symptoms.some((s: string) => s.toLowerCase().includes(q)) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          (c.possibleConditions &&
            c.possibleConditions.some((pc: string) => pc.toLowerCase().includes(q)))
      );
    }

    return result;
  }, [sortedChecks, riskFilter, timeFilter, searchQuery]);

  // ─── Chart Data ─────────────────────────────────────
  const riskTrendData = useMemo(() => {
    if (!sortedChecks.length) return [];
    // Show last 10 checks in chronological order
    const recent = [...sortedChecks].reverse().slice(-10);
    return recent.map((c, i) => ({
      name: format(new Date(c.createdAt), "MMM d"),
      score: c.riskScore,
      index: i,
    }));
  }, [sortedChecks]);

  const riskDistribution = useMemo(() => {
    if (!sortedChecks.length) return [];
    const counts: Record<string, number> = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    sortedChecks.forEach((c) => {
      const level = c.riskLevel.charAt(0).toUpperCase() + c.riskLevel.slice(1).toLowerCase();
      if (counts[level] !== undefined) counts[level]++;
      else counts["Medium"]++;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [sortedChecks]);

  const symptomFrequency = useMemo(() => {
    if (!sortedChecks.length) return [];
    const freq: Record<string, number> = {};
    sortedChecks.forEach((c) => {
      c.symptoms.forEach((s: string) => {
        const key = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
        freq[key] = (freq[key] || 0) + 1;
      });
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  }, [sortedChecks]);

  // ─── Stats ──────────────────────────────────────────
  const stats = useMemo(() => {
    if (!sortedChecks.length) return { total: 0, avgRisk: 0, trend: 0, highCount: 0 };
    const total = sortedChecks.length;
    const avgRisk = Math.round(sortedChecks.reduce((s, c) => s + c.riskScore, 0) / total);
    const highCount = sortedChecks.filter(
      (c) => c.riskLevel.toLowerCase() === "high" || c.riskLevel.toLowerCase() === "critical"
    ).length;

    // Trend: compare avg of last 3 vs previous 3
    let trend = 0;
    if (total >= 6) {
      const recent3 = sortedChecks.slice(0, 3).reduce((s, c) => s + c.riskScore, 0) / 3;
      const prev3 = sortedChecks.slice(3, 6).reduce((s, c) => s + c.riskScore, 0) / 3;
      trend = Math.round(recent3 - prev3);
    }
    return { total, avgRisk, trend, highCount };
  }, [sortedChecks]);

  if (isLoading) {
    return (
      <div className="space-y-8 pb-10">
        <header>
          <h1 className="text-3xl font-display font-extrabold text-foreground">Assessment History</h1>
          <p className="text-muted-foreground mt-1">Past symptom checks and risk evaluations</p>
        </header>
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const hasData = sortedChecks.length > 0;

  return (
    <div className="space-y-6 pb-10">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-foreground">Assessment History</h1>
          <p className="text-muted-foreground mt-1">
            Track your health journey with detailed analytics
          </p>
        </div>
        {hasData && (
          <Link href="/symptom-check">
            <button className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2">
              <Activity size={16} />
              New Check
            </button>
          </Link>
        )}
      </header>

      {!hasData ? (
        /* ── Empty State ──────────────────────────────── */
        <div className="bg-white rounded-3xl shadow-lg shadow-black/[0.03] border border-border/50 p-16 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-6">
            <Activity className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground">No assessments yet</h3>
          <p className="text-muted-foreground mt-2 mb-8 max-w-md mx-auto">
            Start your first symptom check to see your health analytics, risk trends, and personalized insights here.
          </p>
          <Link href="/symptom-check">
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Start First Check
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* ── Summary Stats Cards ──────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <StatCard
              icon={Activity}
              label="Total Checks"
              value={stats.total.toString()}
              color="bg-blue-500"
              lightBg="bg-blue-50"
            />
            <StatCard
              icon={Heart}
              label="Avg Risk Score"
              value={`${stats.avgRisk}/100`}
              color={stats.avgRisk > 50 ? "bg-orange-500" : "bg-emerald-500"}
              lightBg={stats.avgRisk > 50 ? "bg-orange-50" : "bg-emerald-50"}
              suffix={
                stats.trend !== 0 ? (
                  <span
                    className={`text-xs font-semibold flex items-center gap-0.5 ${
                      stats.trend > 0 ? "text-red-500" : "text-emerald-500"
                    }`}
                  >
                    {stats.trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(stats.trend)}pts
                  </span>
                ) : null
              }
            />
            <StatCard
              icon={AlertTriangle}
              label="High Risk Cases"
              value={stats.highCount.toString()}
              color="bg-red-500"
              lightBg="bg-red-50"
              alert={stats.highCount > 0}
            />
            <StatCard
              icon={Shield}
              label="Health Score"
              value={`${Math.max(0, 100 - stats.avgRisk)}%`}
              color="bg-violet-500"
              lightBg="bg-violet-50"
            />
          </div>

          {/* ── Charts Section ───────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Risk Score Trend — spans 2 columns */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 md:p-6 shadow-lg shadow-black/[0.03] border border-border/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
              <div className="flex items-center justify-between mb-5 relative z-10">
                <div>
                  <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                    <TrendingUp size={20} className="text-primary" />
                    Risk Score Trend
                  </h3>
                  <p className="text-muted-foreground text-sm mt-0.5">Last {riskTrendData.length} assessments</p>
                </div>
              </div>
              <div className="h-[220px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={riskTrendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const score = payload[0].value as number;
                        return (
                          <div className="bg-white/95 backdrop-blur border border-border/50 rounded-xl px-4 py-3 shadow-xl">
                            <p className="text-sm font-bold text-foreground">{label}</p>
                            <p className="text-sm mt-1">
                              Risk Score:{" "}
                              <span
                                className={`font-bold ${
                                  score > 75
                                    ? "text-red-500"
                                    : score > 50
                                    ? "text-orange-500"
                                    : score > 25
                                    ? "text-amber-500"
                                    : "text-emerald-500"
                                }`}
                              >
                                {score}/100
                              </span>
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2.5}
                      fill="url(#riskGradient)"
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4, stroke: "white" }}
                      activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2, fill: "white" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Distribution Pie */}
            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-lg shadow-black/[0.03] border border-border/50">
              <h3 className="font-bold text-foreground text-lg flex items-center gap-2 mb-4">
                <BarChart3 size={20} className="text-primary" />
                Risk Distribution
              </h3>
              {riskDistribution.length > 0 ? (
                <>
                  <div className="h-[170px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={riskDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={4}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {riskDistribution.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={PIE_COLORS[["Low", "Medium", "High", "Critical"].indexOf(entry.name)] || PIE_COLORS[1]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            return (
                              <div className="bg-white/95 backdrop-blur border border-border/50 rounded-xl px-3 py-2 shadow-xl text-sm">
                                <span className="font-bold">{payload[0].name}:</span> {String(payload[0].value)} checks
                              </div>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 justify-center">
                    {riskDistribution.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              PIE_COLORS[["Low", "Medium", "High", "Critical"].indexOf(entry.name)] || PIE_COLORS[1],
                          }}
                        />
                        <span className="text-muted-foreground font-medium">
                          {entry.name} ({entry.value})
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-10">Not enough data</p>
              )}
            </div>
          </div>

          {/* ── Symptom Frequency Bar Chart ──────────── */}
          {symptomFrequency.length > 0 && (
            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-lg shadow-black/[0.03] border border-border/50 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
              <h3 className="font-bold text-foreground text-lg flex items-center gap-2 mb-5 relative z-10">
                <Zap size={20} className="text-amber-500" />
                Most Reported Symptoms
              </h3>
              <div className="h-[220px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={symptomFrequency} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="bg-white/95 backdrop-blur border border-border/50 rounded-xl px-4 py-3 shadow-xl text-sm">
                            <span className="font-bold">{String(payload[0].payload.name)}</span>
                            <span className="text-muted-foreground ml-2">{String(payload[0].value)} times</span>
                          </div>
                        );
                      }}
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── Filters & Search ─────────────────────── */}
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-lg shadow-black/[0.03] border border-border/50">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 w-full md:max-w-xs">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search symptoms, conditions..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-border/50 bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filter Toggles */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                    showFilters
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-secondary/50 text-muted-foreground border-border/50 hover:bg-secondary"
                  }`}
                >
                  <Filter size={14} />
                  Filters
                  <ChevronDown size={14} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </button>

                {riskFilter !== "all" && (
                  <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center gap-1">
                    {riskFilter.charAt(0).toUpperCase() + riskFilter.slice(1)}
                    <button onClick={() => setRiskFilter("all")} className="hover:text-primary/70">
                      ×
                    </button>
                  </span>
                )}
                {timeFilter !== "all" && (
                  <span className="px-2.5 py-1 rounded-lg bg-violet-100 text-violet-700 text-xs font-bold flex items-center gap-1">
                    Last {timeFilter}
                    <button onClick={() => setTimeFilter("all")} className="hover:text-violet-500">
                      ×
                    </button>
                  </span>
                )}
              </div>

              <span className="text-sm text-muted-foreground ml-auto hidden md:block">
                {filteredChecks.length} of {sortedChecks.length} results
              </span>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-border/50 flex flex-col sm:flex-row gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Risk Level
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {(["all", "low", "medium", "high", "critical"] as RiskFilter[]).map((level) => (
                      <button
                        key={level}
                        onClick={() => setRiskFilter(level)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          riskFilter === level
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {level === "all" ? "All" : level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Time Period
                  </label>
                  <div className="flex gap-1.5">
                    {([
                      { value: "all", label: "All Time" },
                      { value: "7d", label: "7 Days" },
                      { value: "30d", label: "30 Days" },
                      { value: "90d", label: "90 Days" },
                    ] as { value: TimeFilter; label: string }[]).map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setTimeFilter(t.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          timeFilter === t.value
                            ? "bg-violet-600 text-white shadow-md"
                            : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Assessment Timeline ──────────────────── */}
          <div className="space-y-3">
            <h3 className="font-bold text-foreground text-lg px-1">
              Assessment Timeline
              <span className="text-muted-foreground font-normal text-sm ml-2">
                ({filteredChecks.length} {filteredChecks.length === 1 ? "result" : "results"})
              </span>
            </h3>

            {filteredChecks.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg shadow-black/[0.03] border border-border/50 p-12 text-center">
                <Search className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground font-medium">No results match your filters</p>
                <button
                  onClick={() => {
                    setRiskFilter("all");
                    setTimeFilter("all");
                    setSearchQuery("");
                  }}
                  className="text-primary text-sm font-bold mt-2 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredChecks.map((check, idx) => (
                  <HistoryCard
                    key={check.id}
                    check={check}
                    index={idx}
                    onDelete={() => {
                      if (confirm("Delete this symptom check?")) {
                        deleteCheck.mutate(check.id);
                      }
                    }}
                    isDeleting={deleteCheck.isPending}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Components ─────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  lightBg,
  suffix,
  alert,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  lightBg: string;
  suffix?: React.ReactNode;
  alert?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-4 md:p-5 shadow-lg shadow-black/[0.03] border border-border/50 hover:-translate-y-0.5 transition-all duration-200 ${
        alert ? "ring-2 ring-red-200" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${lightBg} flex items-center justify-center`}>
          <Icon size={18} className={color.replace("bg-", "text-")} />
        </div>
        {suffix}
      </div>
      <p className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground font-medium mt-0.5">{label}</p>
    </div>
  );
}

function HistoryCard({
  check,
  index,
  onDelete,
  isDeleting,
}: {
  check: any;
  index: number;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const riskLevel = check.riskLevel.toLowerCase();
  const riskColor = RISK_COLORS[riskLevel] || RISK_COLORS.medium;
  const isHighRisk = riskLevel === "high" || riskLevel === "critical";

  // Risk score visual bar percentage
  const scorePercent = Math.min(100, Math.max(0, check.riskScore));

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg shadow-black/[0.03] border border-border/50 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group ${
        isHighRisk ? "ring-1 ring-red-200/50" : ""
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-stretch">
        {/* Color accent bar */}
        <div className="w-1.5 shrink-0" style={{ backgroundColor: riskColor }} />

        <div className="flex-1 p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Left: Info */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Risk Score Circle */}
              <div className="relative w-12 h-12 shrink-0">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--border))" strokeWidth="3" opacity="0.3" />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke={riskColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${(scorePercent / 100) * 125.6} 125.6`}
                  />
                </svg>
                <span
                  className="absolute inset-0 flex items-center justify-center text-xs font-extrabold"
                  style={{ color: riskColor }}
                >
                  {check.riskScore}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-foreground text-base truncate max-w-[280px]">
                    {check.symptoms.length > 0
                      ? check.symptoms
                          .slice(0, 3)
                          .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
                          .join(", ") + (check.symptoms.length > 3 ? ` +${check.symptoms.length - 3}` : "")
                      : check.description
                      ? check.description.split(/[.,!?]/)[0].slice(0, 60) +
                        (check.description.length > 60 ? "…" : "")
                      : "Symptom Check"}
                  </h3>
                  <RiskBadge level={check.riskLevel} />
                </div>

                {/* Conditions */}
                {check.possibleConditions && check.possibleConditions.length > 0 && (
                  <p className="text-muted-foreground text-xs mb-1.5 truncate max-w-[400px]">
                    {check.possibleConditions.slice(0, 2).join(" • ")}
                  </p>
                )}

                <p className="text-muted-foreground text-xs flex items-center gap-1.5">
                  <Calendar size={12} />
                  {format(new Date(check.createdAt), "MMM d, yyyy")}
                  <span className="opacity-50">•</span>
                  <Clock size={12} />
                  {format(new Date(check.createdAt), "h:mm a")}
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Mini risk bar */}
              <div className="hidden md:flex flex-col items-end gap-1 mr-2">
                <div className="w-24 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${scorePercent}%`, backgroundColor: riskColor }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{scorePercent}/100 risk</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                disabled={isDeleting}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-all"
                title="Delete check"
              >
                <Trash2 size={15} />
              </button>

              <Link href={`/result/${check.id}`}>
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                  Details <ArrowRight size={14} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const l = level.toLowerCase();
  const colors =
    l === "critical"
      ? "bg-red-100 text-red-700 border-red-200"
      : l === "high"
      ? "bg-orange-100 text-orange-700 border-orange-200"
      : l === "medium" || l === "moderate"
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-emerald-100 text-emerald-700 border-emerald-200";

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${colors}`}>
      {level}
    </span>
  );
}
