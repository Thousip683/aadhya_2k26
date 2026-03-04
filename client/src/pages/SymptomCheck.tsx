import { useState } from "react";
import { useLocation } from "wouter";
import { Mic, Loader2, Stethoscope, Check, AlertCircle } from "lucide-react";
import { useCreateSymptomCheck } from "@/hooks/use-symptom-checks";

const COMMON_SYMPTOMS = [
  "Fever", "Headache", "Vomiting", "Chest Pain", 
  "Breathing Difficulty", "Cough", "Fatigue", 
  "Nausea", "Dizziness", "Muscle Ache"
];

export default function SymptomCheck() {
  const [, setLocation] = useLocation();
  const createCheck = useCreateSymptomCheck();
  
  const [description, setDescription] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0 && !description.trim()) return;
    
    try {
      const result = await createCheck.mutateAsync({
        symptoms: selectedSymptoms,
        description: description.trim() || undefined
      });
      setLocation(`/result/${result.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <header className="flex items-center gap-4 border-b border-border/50 pb-6">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
          <Stethoscope size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-display font-extrabold text-foreground">New Symptom Check</h1>
          <p className="text-muted-foreground mt-1">Select symptoms or describe how you're feeling</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {/* Quick Select */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Check size={20} className="text-primary" />
              Common Symptoms
            </h2>
            <div className="flex flex-wrap gap-3">
              {COMMON_SYMPTOMS.map(sym => {
                const isSelected = selectedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    onClick={() => toggleSymptom(sym)}
                    className={`
                      px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                      ${isSelected 
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105 border border-primary' 
                        : 'bg-white text-muted-foreground border border-border hover:border-primary/50 hover:text-foreground'}
                    `}
                  >
                    {sym}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Description Input */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-4">Detailed Description</h2>
            <div className="relative group">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g., I've been feeling a sharp pain in my chest for the past 2 hours and have shortness of breath..."
                className="w-full h-40 bg-white border-2 border-border rounded-2xl p-5 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm group-hover:border-primary/30"
              />
              
              <button 
                onClick={() => setIsRecording(!isRecording)}
                className={`absolute bottom-5 right-5 w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-md
                  ${isRecording 
                    ? 'bg-destructive text-white animate-pulse' 
                    : 'bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground'}`}
              >
                <Mic size={20} />
              </button>
            </div>
          </section>
        </div>

        {/* Sidebar Info & Action */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-black/[0.03] border border-border/50">
            <h3 className="font-display font-bold text-xl mb-2">Analysis Ready</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Our AI will evaluate the symptoms provided against thousands of medical data points to estimate risk and possible conditions.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3 text-amber-800">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed font-medium">
                This tool provides an AI estimate, not a medical diagnosis. In an emergency, call emergency services immediately.
              </p>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={createCheck.isPending || (selectedSymptoms.length === 0 && !description.trim())}
              className={`
                w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2
                transition-all duration-300
                ${(selectedSymptoms.length > 0 || description.trim()) && !createCheck.isPending
                  ? 'bg-primary text-primary-foreground hover:bg-[#b8e855] hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5' 
                  : 'bg-muted text-muted-foreground cursor-not-allowed'}
              `}
            >
              {createCheck.isPending ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Analyzing...
                </>
              ) : (
                "Analyze Symptoms"
              )}
            </button>
            
            {createCheck.isError && (
              <p className="text-destructive text-sm font-medium mt-3 text-center">
                Failed to process. Please try again.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
