import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Mic, MicOff, Loader2, Stethoscope, Check, AlertCircle, ArrowRight, ArrowLeft, MessageSquare, Brain, CheckCircle2, Plus, X } from "lucide-react";
import { useCreateSymptomCheck } from "@/hooks/use-symptom-checks";

const COMMON_SYMPTOMS = [
  "Fever", "Headache", "Vomiting", "Chest Pain", 
  "Breathing Difficulty", "Cough", "Fatigue", 
  "Nausea", "Dizziness", "Muscle Ache"
];

type FollowUpQuestion = {
  question: string;
  options: string[];
};

type Step = "symptoms" | "questions" | "analyzing";

export default function SymptomCheck() {
  const [, setLocation] = useLocation();
  const createCheck = useCreateSymptomCheck();
  
  const [description, setDescription] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  // Image upload state
  const [images, setImages] = useState<{ file: File; preview: string; analysis?: string; analyzing?: boolean }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice recognition
  const recognitionRef = useRef<any>(null);

  // Guided questions state
  const [step, setStep] = useState<Step>("symptoms");
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  // ─── Image Upload & Analysis ─────────────────────
  const handleImageSelect = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const newImages = Array.from(files).slice(0, 3 - images.length); // Max 3 images
    
    for (const file of newImages) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("Image must be under 5MB");
        continue;
      }
      
      const preview = URL.createObjectURL(file);
      const imgEntry = { file, preview, analyzing: true, analysis: undefined as string | undefined };
      setImages(prev => [...prev, imgEntry]);
      
      // Convert to base64 and send to Gemini vision
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const res = await fetch("/api/analyze-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ image: base64 }),
          });
          const data = await res.json();
          setImages(prev => 
            prev.map(img => img.preview === preview 
              ? { ...img, analyzing: false, analysis: data.analysis } 
              : img
            )
          );
          // Append analysis to description
          if (data.analysis) {
            setDescription(prev => {
              const addition = `[Image Analysis: ${data.analysis}]`;
              return prev ? `${prev}\n\n${addition}` : addition;
            });
          }
        } catch {
          setImages(prev => 
            prev.map(img => img.preview === preview 
              ? { ...img, analyzing: false, analysis: "Could not analyze image" } 
              : img
            )
          );
        }
      };
      reader.readAsDataURL(file);
    }
  }, [images.length]);

  const removeImage = (preview: string) => {
    URL.revokeObjectURL(preview);
    setImages(prev => prev.filter(img => img.preview !== preview));
  };

  // ─── Voice Input (Web Speech API) ────────────────
  const toggleVoiceInput = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in your browser. Try Chrome or Edge.");
      return;
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interim += transcript;
        }
      }
      setDescription(prev => {
        // Remove previous interim text, append new
        const base = prev.replace(/\[listening\.\.\.\].*$/, "").trimEnd();
        const newText = (finalTranscript + interim).trim();
        return base ? `${base} ${newText}` : newText;
      });
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.start();
    setIsRecording(true);
  }, [isRecording]);

  const handleGetFollowUps = async () => {
    if (selectedSymptoms.length === 0 && !description.trim()) return;
    
    setLoadingQuestions(true);
    try {
      const res = await fetch("/api/follow-up-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          symptoms: selectedSymptoms, 
          description: description.trim() || undefined 
        }),
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setFollowUpQuestions(data.questions);
        setCurrentQuestionIdx(0);
        setAnswers({});
        setStep("questions");
      } else {
        // No questions, go straight to analysis
        handleAnalyze();
      }
    } catch (err) {
      console.error("Failed to get follow-up questions:", err);
      handleAnalyze();
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSelectAnswer = (questionIdx: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionIdx]: answer }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < followUpQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0 && !description.trim()) return;
    
    setStep("analyzing");
    
    // Build enhanced description with follow-up answers
    let enhancedDescription = description.trim();
    if (Object.keys(answers).length > 0) {
      const followUpSummary = followUpQuestions
        .map((q, i) => answers[i] ? `Q: ${q.question} → ${answers[i]}` : null)
        .filter(Boolean)
        .join(". ");
      enhancedDescription = enhancedDescription 
        ? `${enhancedDescription}. Follow-up: ${followUpSummary}`
        : `Follow-up responses: ${followUpSummary}`;
    }
    
    try {
      const result = await createCheck.mutateAsync({
        symptoms: selectedSymptoms,
        description: enhancedDescription || undefined
      });
      setLocation(`/result/${result.id}`);
    } catch (err) {
      console.error(err);
      setStep("questions");
    }
  };

  const allQuestionsAnswered = followUpQuestions.length > 0 && 
    followUpQuestions.every((_, i) => answers[i] !== undefined);
  
  const currentQuestion = followUpQuestions[currentQuestionIdx];
  const progress = followUpQuestions.length > 0 
    ? ((Object.keys(answers).length) / followUpQuestions.length) * 100 
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <header className="flex items-center gap-4 border-b border-border/50 pb-6">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
          <Stethoscope size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-display font-extrabold text-foreground">New Symptom Check</h1>
          <p className="text-muted-foreground mt-1">
            {step === "symptoms" && "Select symptoms or describe how you're feeling"}
            {step === "questions" && "Answer follow-up questions to improve accuracy"}
            {step === "analyzing" && "AI is analyzing your symptoms..."}
          </p>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="flex items-center gap-3 notranslate" translate="no">
        {[
          { key: "symptoms", label: "Symptoms", icon: Check },
          { key: "questions", label: "Follow-up", icon: MessageSquare },
          { key: "analyzing", label: "Analysis", icon: Brain },
        ].map((s, i) => {
          const isActive = step === s.key;
          const isDone = 
            (s.key === "symptoms" && (step === "questions" || step === "analyzing")) ||
            (s.key === "questions" && step === "analyzing");
          return (
            <div key={s.key} className="flex items-center gap-3">
              {i > 0 && (
                <div className={`h-[2px] w-8 sm:w-16 rounded-full transition-colors ${isDone || isActive ? "bg-primary" : "bg-border"}`} />
              )}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : isDone 
                    ? "bg-primary/10 text-primary" 
                    : "bg-secondary text-muted-foreground"
              }`}>
                {isDone ? <CheckCircle2 size={16} /> : <s.icon size={16} />}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* STEP 1: Symptoms Selection */}
      {step === "symptoms" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <section>
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Check size={20} className="text-primary" />
                Common Symptoms
              </h2>
              <div className="flex flex-wrap gap-3 notranslate" translate="no">
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

            <section>
              <h2 className="text-lg font-bold text-foreground mb-4">Detailed Description</h2>
              <div className="relative group notranslate" translate="no">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleGetFollowUps();
                    }
                  }}
                  placeholder="E.g., I've been feeling a sharp pain in my chest for the past 2 hours and have shortness of breath... "
                  className="w-full h-40 bg-white border-2 border-border rounded-2xl p-5 pr-[4.5rem] text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm group-hover:border-primary/30"
                />
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="hidden" 
                  onChange={(e) => handleImageSelect(e.target.files)} 
                />
                <div className="absolute bottom-5 right-5 flex flex-row gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach symptom image"
                    disabled={images.length >= 3}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-md
                      ${images.length >= 3
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : 'bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground'}`}
                  >
                    <Plus size={18} />
                  </button>
                  <button 
                    onClick={toggleVoiceInput}
                    title={isRecording ? "Stop recording" : "Voice input"}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-md
                      ${isRecording 
                        ? 'bg-destructive text-white animate-pulse' 
                        : 'bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground'}`}
                  >
                    {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                </div>
              </div>
              {isRecording && (
                <div className="mt-2 flex items-center gap-2 text-destructive text-sm font-medium animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-destructive" />
                  Listening... speak your symptoms
                </div>
              )}

              {/* Image previews (inline below textarea) */}
              {images.length > 0 && (
                <div className="mt-3 flex gap-3 flex-wrap">
                  {images.map((img) => (
                    <div key={img.preview} className="relative w-24 h-24 rounded-xl overflow-hidden border border-border shadow-sm group/img">
                      <img src={img.preview} alt="Symptom" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(img.preview)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                      {img.analyzing && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Loader2 size={16} className="text-white animate-spin" />
                        </div>
                      )}
                      {!img.analyzing && img.analysis && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-1">
                          <p className="text-[9px] text-white leading-tight line-clamp-2">{img.analysis}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {images.length < 3 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded-xl border-2 border-dashed border-border/70 flex items-center justify-center text-muted-foreground/50 hover:border-primary/40 hover:text-primary/50 transition-all"
                    >
                      <Plus size={20} />
                    </button>
                  )}
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg shadow-black/[0.03] border border-border/50">
              <h3 className="font-display font-bold text-xl mb-2 flex items-center gap-2">
                <MessageSquare size={20} className="text-primary" />
                Smart Analysis
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Our AI will first ask targeted follow-up questions to better understand your condition, then provide an accurate risk assessment.
              </p>
              
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex gap-3">
                <Brain size={20} className="shrink-0 mt-0.5 text-primary" />
                <p className="text-xs leading-relaxed font-medium text-foreground/80">
                  Follow-up questions help the AI narrow down possible conditions — just like a doctor would ask during a consultation.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3 text-amber-800">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed font-medium">
                  This tool provides an AI estimate, not a medical diagnosis. In an emergency, call emergency services immediately.
                </p>
              </div>

              <button
                onClick={handleGetFollowUps}
                disabled={loadingQuestions || (selectedSymptoms.length === 0 && !description.trim())}
                className={`
                  w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2
                  transition-all duration-300
                  ${(selectedSymptoms.length > 0 || description.trim()) && !loadingQuestions
                    ? 'bg-primary text-primary-foreground hover:bg-[#b8e855] hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5' 
                    : 'bg-muted text-muted-foreground cursor-not-allowed'}
                `}
              >
                {loadingQuestions ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Follow-up Questions */}
      {step === "questions" && followUpQuestions.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">
                Question {currentQuestionIdx + 1} of {followUpQuestions.length}
              </span>
              <span className="text-primary font-bold">{Math.round(progress)}% complete</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-3xl p-8 shadow-lg shadow-black/[0.03] border border-border/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageSquare size={20} className="text-primary" />
                </div>
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Follow-up Question
                </span>
              </div>

              <h2 className="text-xl font-display font-bold text-foreground mb-8 leading-relaxed">
                {currentQuestion.question}
              </h2>

              <div className="space-y-3 notranslate" translate="no">
                {currentQuestion.options.map((option) => {
                  const isSelected = answers[currentQuestionIdx] === option;
                  return (
                    <button
                      key={option}
                      onClick={() => handleSelectAnswer(currentQuestionIdx, option)}
                      className={`
                        w-full text-left px-5 py-4 rounded-2xl font-medium text-sm transition-all duration-200 flex items-center gap-3
                        ${isSelected 
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 border-2 border-primary' 
                          : 'bg-secondary/50 text-foreground border-2 border-transparent hover:border-primary/30 hover:bg-secondary'}
                      `}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        isSelected ? "border-primary-foreground bg-primary-foreground/20" : "border-muted-foreground/30"
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />}
                      </div>
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={currentQuestionIdx === 0 ? () => setStep("symptoms") : handlePrevQuestion}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-secondary text-foreground hover:bg-secondary/80 transition-all"
            >
              <ArrowLeft size={16} />
              {currentQuestionIdx === 0 ? "Back to Symptoms" : "Previous"}
            </button>

            {currentQuestionIdx < followUpQuestions.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                disabled={answers[currentQuestionIdx] === undefined}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${
                  answers[currentQuestionIdx] !== undefined
                    ? "bg-primary text-primary-foreground hover:bg-[#b8e855] shadow-md shadow-primary/20"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                Next
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleAnalyze}
                disabled={!allQuestionsAnswered || createCheck.isPending}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                  allQuestionsAnswered && !createCheck.isPending
                    ? "bg-primary text-primary-foreground hover:bg-[#b8e855] shadow-lg shadow-primary/25 hover:-translate-y-0.5"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                <Brain size={16} />
                Analyze Symptoms
              </button>
            )}
          </div>

          {/* Skip option */}
          <div className="text-center">
            <button
              onClick={handleAnalyze}
              className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors underline-offset-2 hover:underline"
            >
              Skip questions and analyze now
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Analyzing */}
      {step === "analyzing" && (
        <div className="flex flex-col items-center justify-center py-20 notranslate" translate="no">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <Brain className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
          </div>
          <h2 className="mt-6 text-xl font-display font-bold text-foreground">Analyzing Your Symptoms</h2>
          <p className="text-muted-foreground mt-2 text-center max-w-md">
            Our AI is evaluating your symptoms and follow-up responses to generate an accurate risk assessment...
          </p>
          {createCheck.isError && (
            <div className="mt-6 text-center">
              <p className="text-destructive font-medium mb-3">Analysis failed. Please try again.</p>
              <button
                onClick={() => setStep("questions")}
                className="px-5 py-2.5 rounded-xl bg-secondary text-foreground font-semibold text-sm hover:bg-secondary/80 transition-all"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
