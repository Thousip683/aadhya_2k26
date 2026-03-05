import { useState } from "react";
import { AlertTriangle, MapPin, Clock, Siren, ShieldAlert, Loader2, RefreshCw, Ambulance, CheckCircle2, Navigation } from "lucide-react";
import { useCriticalChecks } from "@/hooks/use-admin";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [dispatching, setDispatching] = useState<number | null>(null);
  const [dispatched, setDispatched] = useState<Set<number>>(new Set());

  const criticalCount = checks?.filter((c: any) => c.riskLevel === "Critical").length || 0;
  const highCount = checks?.filter((c: any) => c.riskLevel === "High").length || 0;
  const totalAlerts = checks?.length || 0;

  const handleDispatchAmbulance = async (checkId: number) => {
    const email = prompt("Enter ambulance unit email address:");
    if (!email) return;
    setDispatching(checkId);
    try {
      const res = await fetch("/api/admin/dispatch-ambulance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ checkId, ambulanceEmail: email }),
      });
      const data = await res.json();
      if (res.ok && data.sent) {
        setDispatched(prev => new Set(prev).add(checkId));
        toast({ title: "Ambulance Dispatched", description: `Dispatch email sent to ${email}` });
      } else {
        toast({ title: "Dispatch Failed", description: data.message || "Could not send email", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Network error while dispatching", variant: "destructive" });
    } finally {
      setDispatching(null);
    }
  };

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

                {/* Patient Location */}
                <div className="bg-secondary rounded-xl p-3 mb-4 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Patient Location</p>
                    {check.locationLabel ? (
                      <p className="text-sm text-foreground leading-relaxed">{check.locationLabel}</p>
                    ) : check.latitude && check.longitude ? (
                      <p className="text-sm text-foreground font-mono">{check.latitude.toFixed(5)}, {check.longitude.toFixed(5)}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Location not available</p>
                    )}
                    {check.latitude && check.longitude && (
                      <a
                        href={`https://www.google.com/maps?q=${check.latitude},${check.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary font-semibold mt-1.5 hover:underline"
                      >
                        <Navigation size={12} /> Open in Maps
                      </a>
                    )}
                  </div>
                </div>

                {/* Dispatch Ambulance Button */}
                <div className="flex gap-3">
                  {dispatched.has(check.id) ? (
                    <div className="bg-green-50 text-green-700 px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 border border-green-200">
                      <CheckCircle2 size={16} /> Ambulance Dispatched
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDispatchAmbulance(check.id)}
                      disabled={dispatching === check.id}
                      className="bg-destructive text-white hover:bg-destructive/90 px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-destructive/20"
                    >
                      {dispatching === check.id ? (
                        <><Loader2 size={16} className="animate-spin" /> Sending...</>
                      ) : (
                        <><Ambulance size={16} /> Send Ambulance</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
