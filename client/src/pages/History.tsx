import { useSymptomChecks } from "@/hooks/use-symptom-checks";
import { format } from "date-fns";
import { Link } from "wouter";
import { ArrowRight, Activity, Clock } from "lucide-react";

export default function History() {
  const { data: checks, isLoading } = useSymptomChecks();

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-3xl font-display font-extrabold text-foreground">Assessment History</h1>
        <p className="text-muted-foreground mt-1">Past symptom checks and risk evaluations</p>
      </header>

      <div className="bg-white rounded-3xl shadow-lg shadow-black/[0.03] border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : checks && checks.length > 0 ? (
          <div className="divide-y divide-border/50">
            {checks.map((check) => (
              <div key={check.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Activity size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-foreground text-lg">
                        {check.symptoms.slice(0, 3).join(", ")}
                        {check.symptoms.length > 3 ? ` +${check.symptoms.length - 3}` : ""}
                      </h3>
                      <RiskBadge level={check.riskLevel} />
                    </div>
                    <p className="text-muted-foreground text-sm flex items-center gap-2">
                      <Clock size={14} />
                      {format(new Date(check.createdAt), "MMM d, yyyy • h:mm a")}
                    </p>
                  </div>
                </div>
                <Link href={`/result/${check.id}`}>
                  <button className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:underline">
                    View Details <ArrowRight size={16} />
                  </button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center">
            <Activity className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold text-foreground">No checks yet</h3>
            <p className="text-muted-foreground mt-1 mb-6">You haven't performed any symptom checks.</p>
            <Link href="/symptom-check">
              <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                Start New Check
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const isHigh = level.toLowerCase() === "high" || level.toLowerCase() === "critical";
  const isMed = level.toLowerCase() === "medium" || level.toLowerCase() === "moderate";
  
  const colors = isHigh 
    ? "bg-destructive/10 text-destructive border-destructive/20" 
    : isMed 
      ? "bg-amber-100 text-amber-800 border-amber-200" 
      : "bg-primary/10 text-primary border-primary/20";
      
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${colors}`}>
      {level}
    </span>
  );
}
