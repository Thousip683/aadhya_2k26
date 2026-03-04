import { useRoute } from "wouter";
import { useSymptomCheck } from "@/hooks/use-symptom-checks";
import { AlertTriangle, Phone, MapPin, ChevronLeft, Info, FileText } from "lucide-react";
import { Link } from "wouter";

export default function Result() {
  const [, params] = useRoute("/result/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  
  const { data: check, isLoading, isError } = useSymptomCheck(id);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground font-medium animate-pulse">Generating risk profile...</p>
      </div>
    );
  }

  if (isError || !check) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-foreground">Result not found</h2>
        <Link href="/symptom-check" className="text-primary hover:underline mt-4 inline-block font-medium">
          Start a new check
        </Link>
      </div>
    );
  }

  const isEmergency = check.riskLevel.toLowerCase() === 'high' || check.riskLevel.toLowerCase() === 'critical';
  
  // Color determination based on score
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'hsl(var(--destructive))';
    if (score >= 40) return '#f59e0b'; // amber
    return 'hsl(var(--primary))';
  };

  const scoreColor = getScoreColor(check.riskScore);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <Link href="/symptom-check" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition-colors mb-2">
        <ChevronLeft size={16} /> Back to Entry
      </Link>

      {/* EMERGENCY BANNER */}
      {isEmergency && (
        <div className="bg-destructive text-white rounded-3xl p-8 md:p-10 shadow-2xl emergency-gradient relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-2 rounded-full animate-pulse">
                  <AlertTriangle size={32} />
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight">Immediate Action Required</h1>
              </div>
              <p className="text-lg md:text-xl text-white/90 font-medium max-w-2xl leading-relaxed">
                The symptoms reported indicate a potentially critical condition. Please seek immediate medical attention.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0">
              <button className="bg-white text-destructive hover:bg-gray-50 px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-xl">
                <Phone size={24} /> Call Emergency
              </button>
              <button className="bg-black/20 hover:bg-black/30 text-white border border-white/30 px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all">
                <MapPin size={24} /> Find Hospital
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="bg-white rounded-3xl p-8 shadow-lg shadow-black/[0.03] border border-border/50 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <h2 className="text-lg font-bold text-muted-foreground mb-8">Calculated Risk Score</h2>
          
          <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
            {/* SVG Circle */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <circle 
                cx="50" cy="50" r="40" fill="none" 
                stroke={scoreColor} 
                strokeWidth="8" 
                strokeLinecap="round"
                strokeDasharray={`${(check.riskScore / 100) * 251.2} 251.2`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="relative flex flex-col items-center">
              <span className="text-5xl font-display font-black text-foreground" style={{ color: scoreColor }}>{check.riskScore}</span>
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">/ 100</span>
            </div>
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm"
               style={{ backgroundColor: `${scoreColor}20`, color: scoreColor }}>
            Risk Level: {check.riskLevel.toUpperCase()}
          </div>
        </div>

        {/* Details & Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-lg shadow-black/[0.03] border border-border/50 h-full flex flex-col">
            <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
              <FileText className="text-primary" /> Analysis Results
            </h2>
            
            <div className="space-y-6 flex-1">
              <div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Possible Conditions</h3>
                <div className="flex flex-wrap gap-2">
                  {check.possibleConditions.map((condition, i) => (
                    <span key={i} className="bg-secondary text-foreground px-4 py-2 rounded-xl font-medium text-sm border border-border">
                      {condition}
                    </span>
                  ))}
                </div>
              </div>

              <div className="w-full h-px bg-border/50" />

              <div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Info size={16} /> Recommended Action
                </h3>
                <p className="text-lg font-medium text-foreground leading-relaxed bg-primary/5 border-l-4 border-primary p-4 rounded-r-xl">
                  {check.recommendedAction}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Explanation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {check.explanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
