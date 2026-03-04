import { useState, useEffect, useRef } from "react";
import { Activity, User, Lock, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// Google Sign-In type
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (el: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

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
  const [googleClientId, setGoogleClientId] = useState("");
  const googleBtnRef = useRef<HTMLDivElement>(null);

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

    // Load the Google Identity Services script
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
    <div className="min-h-screen flex items-center justify-center bg-[hsl(223,17%,8%)] relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Back to Landing button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/40 hover:text-white/80 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      )}

      <div className="w-full max-w-md mx-4 relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Activity className="w-7 h-7 text-[hsl(223,17%,8%)]" />
            </div>
            <span className="text-3xl font-bold font-display text-white tracking-tight">
              RuralCare
            </span>
          </div>
          <p className="text-white/50 text-sm">
            AI-powered health assistant for rural communities
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          {/* Tab Toggle */}
          <div className="flex bg-secondary rounded-xl p-1 mb-8">
            <button
              onClick={() => { setIsRegister(false); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                !isRegister
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                isRegister
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-border bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-border bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-border bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-3 text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#b8e855] hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Please wait...
                </>
              ) : (
                <>
                  {isRegister ? "Create Account" : "Sign In"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Google Sign-In divider + button */}
          {googleClientId && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div ref={googleBtnRef} className="w-full flex justify-center" />
            </>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={switchMode}
              className="text-primary font-semibold hover:underline"
            >
              {isRegister ? "Sign In" : "Register"}
            </button>
          </p>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Your health data stays private and secure
        </p>
      </div>
    </div>
  );
}
