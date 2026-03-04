import { useStats } from "@/hooks/use-symptom-checks";
import { Activity, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";

const mockTrendData = [
  { day: 'Mon', score: 20, cases: 4 },
  { day: 'Tue', score: 35, cases: 7 },
  { day: 'Wed', score: 25, cases: 5 },
  { day: 'Thu', score: 45, cases: 10 },
  { day: 'Fri', score: 30, cases: 6 },
  { day: 'Sat', score: 60, cases: 15 },
  { day: 'Sun', score: 40, cases: 8 },
];

export default function Dashboard() {
  const { data: stats, isLoading } = useStats();

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-3xl font-display font-extrabold text-foreground">Health Overview</h1>
        <p className="text-muted-foreground mt-1">AI-powered early health risk detection</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Symptom Checks Today" 
          value={isLoading ? "-" : (stats?.checksToday || 124).toString()} 
          subtitle="+12% from yesterday"
          icon={Activity}
          trend="up"
        />
        <StatCard 
          title="Average Risk Score" 
          value={isLoading ? "-" : `${stats?.avgRiskScore || 42}/100`} 
          subtitle="Stable community health"
          icon={TrendingUp}
          trend="neutral"
        />
        <StatCard 
          title="High Risk Cases" 
          value={isLoading ? "-" : (stats?.highRiskCases || 3).toString()} 
          subtitle="Needs immediate attention"
          icon={AlertTriangle}
          trend="down"
          alert
        />
        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-black/[0.03] border border-border/50 hover-lift flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Community Trend</h3>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Users size={20} />
            </div>
          </div>
          <div className="h-[60px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrendData}>
                <defs>
                  <linearGradient id="colorScoreSm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorScoreSm)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 dark-card rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          {/* Subtle gradient wash in background */}
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
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111318', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Chart / Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-black/[0.03] border border-border/50 flex flex-col">
          <h2 className="text-lg font-display font-bold text-foreground mb-1">Top Conditions</h2>
          <p className="text-muted-foreground text-sm mb-6">Recent diagnoses breakdown</p>
          
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Viral Fever', count: 45 },
                { name: 'Migraine', count: 30 },
                { name: 'Fatigue', count: 25 },
                { name: 'Resp. Infect', count: 18 },
              ]} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={85} tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
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
