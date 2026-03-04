import { AlertTriangle, Phone, MapPin, Clock, Building2, Siren, ShieldAlert, Loader2, RefreshCw, ExternalLink } from "lucide-react";
import { useCriticalChecks } from "@/hooks/use-admin";
import { useQueryClient } from "@tanstack/react-query";

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function CriticalAlerts() {
  const { data: checks, isLoading, isError, refetch, isFetching } = useCriticalChecks(30);
  const queryClient = useQueryClient();

  const criticalCount = checks?.filter((c: any) => c.riskLevel === "Critical").length || 0;
  const highCount = checks?.filter((c: any) => c.riskLevel === "High").length || 0;
  const totalAlerts = checks?.length || 0;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <header>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-destructive/10 rounded-xl">
            <Siren className="w-6 h-6 text-destructive" />
          </div>
          <h1 className="text-3xl font-display font-extrabold text-foreground">Critical Alerts</h1>
        </div>
        <p className="text-muted-foreground mt-1 ml-14">Emergency cases requiring immediate attention</p>
      </header>

      {/* Emergency Banner */}
      <div className="emergency-gradient text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-black/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/20 p-2.5 rounded-full animate-pulse">
                <AlertTriangle size={28} />
              </div>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                Live Monitoring
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight mb-2">
              {isLoading ? "Loading…" : `${totalAlerts} Active Alert${totalAlerts !== 1 ? 's' : ''}`}
            </h2>
            <p className="text-white/80 text-lg max-w-xl leading-relaxed">
              {criticalCount > 0
                ? `${criticalCount} critical and ${highCount} high-risk cases detected from real patient data.`
                : totalAlerts > 0
                  ? `${highCount} high-risk cases detected. No critical severity alerts at this time.`
                  : "No high-risk or critical alerts at this time. All patients are within safe parameters."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button className="bg-white text-destructive hover:bg-gray-50 px-6 py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 transition-all hover:scale-105 shadow-xl">
              <Phone size={20} /> Call 108
            </button>
            <button 
              onClick={() => refetch()}
              disabled={isFetching}
              className="bg-black/20 hover:bg-black/30 text-white border border-white/30 px-6 py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
            >
              <RefreshCw size={20} className={isFetching ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading critical alerts…</span>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="bg-destructive/10 text-destructive rounded-2xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold">Failed to load alerts. Please try refreshing.</p>
          <button onClick={() => refetch()} className="mt-3 px-4 py-2 bg-destructive text-white rounded-xl font-semibold text-sm">
            Retry
          </button>
        </div>
      )}

      {/* Alert Cards */}
      {!isLoading && !isError && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Active Alerts ({totalAlerts})
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="bg-destructive/10 text-destructive px-2.5 py-1 rounded-full font-semibold text-xs">{criticalCount} Critical</span>
              <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-semibold text-xs">{highCount} High</span>
            </div>
          </div>

          {totalAlerts === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
              <ShieldAlert className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-green-800">All Clear</h3>
              <p className="text-green-600 mt-1">No high-risk or critical symptom checks found in the database.</p>
            </div>
          )}

          {checks?.map((check: any) => (
            <div 
              key={check.id} 
              className="bg-white rounded-2xl p-6 shadow-lg shadow-black/[0.03] border border-border/50 hover:shadow-xl transition-all group relative overflow-hidden"
            >
              {check.riskLevel === "Critical" && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-destructive rounded-l-2xl" />
              )}
              {check.riskLevel === "High" && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 rounded-l-2xl" />
              )}

              <div className="ml-2">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${check.riskLevel === "Critical" ? "bg-destructive/10" : "bg-amber-100"}`}>
                      <AlertTriangle className={`w-5 h-5 ${check.riskLevel === "Critical" ? "text-destructive" : "text-amber-600"}`} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-foreground text-lg">
                        {check.possibleConditions?.length > 0 
                          ? check.possibleConditions[0] 
                          : "High Risk Assessment"}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          check.riskLevel === "Critical" 
                            ? "bg-destructive/10 text-destructive" 
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {check.riskLevel} — Score {check.riskScore}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {timeAgo(check.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground font-mono">#{check.id}</span>
                    <div className="text-xs text-muted-foreground mt-0.5">{check.userName}</div>
                  </div>
                </div>

                {check.explanation && (
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-2">{check.explanation}</p>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {check.symptoms?.map((s: string) => (
                    <span key={s} className="bg-secondary text-foreground/80 text-xs font-medium px-3 py-1.5 rounded-lg">
                      {s}
                    </span>
                  ))}
                </div>

                {check.possibleConditions?.length > 1 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="text-xs text-muted-foreground mr-1">Also possible:</span>
                    {check.possibleConditions.slice(1).map((c: string) => (
                      <span key={c} className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">{c}</span>
                    ))}
                  </div>
                )}

                {check.recommendedAction && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                    <p className="text-sm text-amber-800 font-medium">
                      <span className="font-bold">Recommended:</span> {check.recommendedAction}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <a href="tel:108" className="bg-destructive text-white hover:bg-destructive/90 px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all">
                    <Phone size={14} /> Emergency Call
                  </a>
                  <a 
                    href={`https://www.google.com/maps/search/hospitals+near+me`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all"
                  >
                    <MapPin size={14} /> Find Hospital <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
