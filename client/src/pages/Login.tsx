import { useState, useEffect, useRef } from "react";
import {
  Activity,
  User,
  Lock,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Heart,
  Shield,
  Sparkles,
  Eye,
  EyeOff,
  Mail,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// Google Sign-In type — window.google is declared as `any` in LanguageTranslator

interface LoginProps {
  initialMode?: "login" | "register";
  onBack?: () => void;
}

export default function Login({ initialMode = "login", onBack }: LoginProps) {
  const { login, register, googleLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(initialMode === "register");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleClientId, setGoogleClientId] = useState("");
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Google Client ID from server
  useEffect(() => {
    fetch("/api/auth/google-client-id")
      .then((res) => res.json())
      .then((data) => {
        if (data.clientId) setGoogleClientId(data.clientId);
      })
      .catch(() => {});
  }, []);

  // Load and render Google Sign-In button
  useEffect(() => {
    if (!googleClientId || !googleBtnRef.current) return;

    const handleGoogleResponse = async (response: any) => {
      setError("");
      setLoading(true);
      try {
        await googleLogin(response.credential);
      } catch (err: any) {
        setError(err.message || "Google login failed");
      } finally {
        setLoading(false);
      }
    };

    const existingScript = document.getElementById("google-gsi-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-gsi-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => initGoogle(handleGoogleResponse);
      document.head.appendChild(script);
    } else {
      initGoogle(handleGoogleResponse);
    }

    function initGoogle(callback: (response: any) => void) {
      if (!window.google || !googleBtnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback,
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        width: googleBtnRef.current.offsetWidth,
        text: "continue_with",
        shape: "pill",
      });
    }
  }, [googleClientId, googleLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, username, password);
      } else {
        await login(username, password);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    setError("");
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#0a0f1c] via-[#0d1425] to-[#0a1628] relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] right-[-8%] w-[700px] h-[700px] bg-primary/8 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-12%] w-[600px] h-[600px] bg-emerald-500/6 rounded-full blur-[130px] animate-pulse [animation-delay:2s]" />
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse [animation-delay:4s]" />
        {/* Floating particles */}
        <div className="absolute top-[20%] right-[25%] w-2 h-2 bg-primary/30 rounded-full animate-bounce [animation-delay:0.5s]" />
        <div className="absolute top-[60%] right-[15%] w-1.5 h-1.5 bg-emerald-400/25 rounded-full animate-bounce [animation-delay:1.5s]" />
        <div className="absolute top-[35%] left-[20%] w-1 h-1 bg-cyan-400/20 rounded-full animate-bounce [animation-delay:2.5s]" />
        <div className="absolute bottom-[30%] right-[35%] w-2.5 h-2.5 bg-primary/20 rounded-full animate-bounce [animation-delay:3s]" />
      </div>

      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 z-30 flex items-center gap-2 text-white/40 hover:text-white transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all">
            <ArrowLeft size={16} />
          </div>
          <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Back</span>
        </button>
      )}

      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center p-12">
        <div className={`relative z-10 max-w-lg transition-all duration-1000 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
          {/* Floating feature cards */}
          <div className="absolute -top-8 -right-4 bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-3 animate-float">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Health Monitoring</p>
              <p className="text-white/40 text-xs">AI-powered insights</p>
            </div>
          </div>

          <div className="absolute -bottom-4 -left-4 bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-3 animate-float [animation-delay:2s]">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Secure & Private</p>
              <p className="text-white/40 text-xs">Your data is protected</p>
            </div>
          </div>

          <div className="absolute top-[45%] -right-16 bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-3 animate-float [animation-delay:4s]">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Smart Analysis</p>
              <p className="text-white/40 text-xs">Gemini AI powered</p>
            </div>
          </div>

          {/* Main branding */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-2xl shadow-primary/30 ring-4 ring-primary/10">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <span className="text-4xl font-extrabold text-white tracking-tight">
                RuralCare
              </span>
            </div>
            <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
              Your Health,
              <br />
              <span className="bg-gradient-to-r from-primary via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Our Priority
              </span>
            </h1>
            <p className="text-lg text-white/50 leading-relaxed max-w-md">
              AI-powered health assistant designed for rural communities.
              Get instant symptom checks, health insights, and nearby hospital info — all in one place.
            </p>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-6 text-white/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium">HIPAA Aware</span>
            </div>
            <div className="w-px h-5 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium">Encrypted</span>
            </div>
            <div className="w-px h-5 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium">AI Powered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className={`w-full max-w-[440px] transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          {/* Mobile logo (shown only on smaller screens) */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-lg shadow-primary/25">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                RuralCare
              </span>
            </div>
            <p className="text-white/40 text-sm">
              AI-powered health assistant for rural communities
            </p>
          </div>

          {/* Glass card */}
          <div className="bg-white/[0.07] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 sm:p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-1.5">
                {isRegister ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-white/40 text-sm">
                {isRegister
                  ? "Start your health journey today"
                  : "Sign in to continue your health journey"}
              </p>
            </div>

            {/* Tab Toggle */}
            <div className="flex bg-white/[0.06] border border-white/[0.06] rounded-2xl p-1.5 mb-8">
              <button
                onClick={() => { setIsRegister(false); setError(""); }}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  !isRegister
                    ? "bg-gradient-to-r from-primary to-emerald-500 text-white shadow-lg shadow-primary/25"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsRegister(true); setError(""); }}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  isRegister
                    ? "bg-gradient-to-r from-primary to-emerald-500 text-white shadow-lg shadow-primary/25"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                Register
              </button>
            </div>

            {/* Google Sign-In (shown first for quick access) */}
            {googleClientId && (
              <>
                <div ref={googleBtnRef} className="w-full flex justify-center mb-6" />
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <span className="text-xs text-white/30 font-medium uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/25 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-primary/10 transition-all text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block">
                  Username
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/25 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-primary/10 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/25 group-focus-within:text-primary transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-primary/10 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 animate-shake">
                  <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs">!</span>
                  </div>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 relative overflow-hidden group"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Please wait...</span>
                  </>
                ) : (
                  <>
                    <span>{isRegister ? "Create Account" : "Sign In"}</span>
                    <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-white/30 mt-7">
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={switchMode}
                className="text-primary font-semibold hover:text-emerald-400 transition-colors"
              >
                {isRegister ? "Sign In" : "Register"}
              </button>
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <Shield className="w-3.5 h-3.5 text-white/20" />
            <p className="text-white/20 text-xs">
              Your health data stays private and secure
            </p>
          </div>
        </div>
      </div>

      {/* Custom animations style */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
