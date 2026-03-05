import { useAdminStats } from "@/hooks/use-admin";
import { Activity, Users, AlertTriangle, TrendingUp, Loader2, ShieldAlert, BarChart3 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";

const mockTrendData = [
  { label: 'Mon', score: 20, cases: 4 },
  { label: 'Tue', score: 35, cases: 7 },
  { label: 'Wed', score: 25, cases: 5 },
  { label: 'Thu', score: 45, cases: 10 },
  { label: 'Fri', score: 30, cases: 6 },
  { label: 'Sat', score: 60, cases: 15 },
  { label: 'Sun', score: 40, cases: 8 },
];

export default function Dashboard() {
  const { data: stats, isLoading, isError } = useAdminStats();

  const conditionData = stats?.topConditions || [];
  const formattedTrend = mockTrendData;

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-3xl font-display font-extrabold text-foreground">Health Overview of your community</h1>
        <p className="text-muted-foreground mt-1">Track the real-time health data and insights for your community</p>
      </header>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading admin dashboard…</span>
        </div>
      )}

      {isError && (
        <div className="bg-destructive/10 text-destructive rounded-2xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold">Failed to load admin stats. Please try refreshing.</p>
        </div>
      )}

      {!isLoading && !isError && stats && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard 
              title="Total Users" 
              value={stats.totalUsers?.toString() || "0"} 
              subtitle={`${stats.checksToday || 0} checks today`}
              icon={Users}
              trend="neutral"
            />
            <StatCard 
              title="Total Symptom Checks" 
              value={stats.totalChecks?.toString() || "0"} 
              subtitle={`Avg risk: ${stats.avgRiskScore || 0}/100`}
              icon={Activity}
              trend="up"
            />
            <StatCard 
              title="High Risk Cases" 
              value={stats.highRiskCases?.toString() || "0"} 
              subtitle="Cases needing attention"
              icon={AlertTriangle}
              trend="down"
              alert={stats.highRiskCases > 0}
            />
            <StatCard 
              title="Critical Cases" 
              value={stats.criticalCases?.toString() || "0"} 
              subtitle="Immediate intervention"
              icon={ShieldAlert}
              trend="down"
              alert={stats.criticalCases > 0}
            />
          </div>

          {/* Risk Distribution Cards */}
          {stats.riskDistribution && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <RiskBadge label="Low Risk" count={stats.riskDistribution.low} color="bg-green-500" />
              <RiskBadge label="Medium Risk" count={stats.riskDistribution.medium} color="bg-yellow-500" />
              <RiskBadge label="High Risk" count={stats.riskDistribution.high} color="bg-orange-500" />
              <RiskBadge label="Critical" count={stats.riskDistribution.critical} color="bg-red-500" />
            </div>
          )}

          {/* Main Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 dark-card rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="flex justify-between items-end mb-8 relative z-10">
                <div>
                  <h2 className="text-xl font-display font-bold">Health Risk Trends</h2>
                  <p className="text-gray-400 text-sm mt-1">7-day community risk analysis</p>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(199,243,107,0.5)]"></span>
                    <span className="text-gray-300">Avg Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-white/20"></span>
                    <span className="text-gray-300">Cases</span>
                  </div>
                </div>
              </div>

              <div className="h-[300px] w-full relative z-10">
                {formattedTrend.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <BarChart3 className="w-6 h-6 mr-2" />
                    No trend data yet — checks will appear here
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formattedTrend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111318', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="score" name="Avg Risk Score" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#colorScore)" />
                      <Area type="monotone" dataKey="cases" name="Cases" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} fill="none" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Top Conditions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg shadow-black/[0.03] border border-border/50 flex flex-col">
              <h2 className="text-lg font-display font-bold text-foreground mb-1">Top Conditions</h2>
              <p className="text-muted-foreground text-sm mb-6">Real diagnoses breakdown</p>
              
              <div className="flex-1 min-h-[200px]">
                {conditionData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    No conditions recorded yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={conditionData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 500 }} />
                      <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, trend, alert }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg shadow-black/[0.03] border border-border/50 hover-lift relative overflow-hidden group">
      {alert && <div className="absolute top-0 right-0 w-24 h-24 bg-destructive/10 rounded-full -translate-y-12 translate-x-12 blur-xl" />}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
          ${alert ? 'bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-white' : 'bg-secondary text-foreground group-hover:bg-primary/20 group-hover:text-primary'}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="relative z-10">
        <h2 className="text-3xl font-display font-extrabold text-foreground tracking-tight mb-1">{value}</h2>
        <p className={`text-xs font-medium ${trend === 'down' && alert ? 'text-destructive' : trend === 'up' ? 'text-green-600' : 'text-muted-foreground'}`}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function RiskBadge({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-border/50 flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <div>
        <div className="text-lg font-bold text-foreground">{count}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
