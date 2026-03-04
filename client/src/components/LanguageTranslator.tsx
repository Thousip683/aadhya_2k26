import { useState, useEffect, useRef } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "te", label: "తెలుగు (Telugu)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", label: "മലയാളം (Malayalam)" },
  { code: "mr", label: "मराठी (Marathi)" },
  { code: "bn", label: "বাংলা (Bengali)" },
  { code: "gu", label: "ગુજરાતી (Gujarati)" },
  { code: "pa", label: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "ur", label: "اردو (Urdu)" },
  { code: "es", label: "Español (Spanish)" },
  { code: "fr", label: "Français (French)" },
  { code: "ar", label: "العربية (Arabic)" },
];

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export function LanguageTranslator() {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load Google Translate script once
  useEffect(() => {
    if (document.getElementById("google-translate-script")) {
      setScriptLoaded(true);
      return;
    }

    // Hidden container for the Google Translate widget
    const container = document.createElement("div");
    container.id = "google_translate_element";
    container.style.display = "none";
    document.body.appendChild(container);

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          autoDisplay: false,
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element"
      );
      setScriptLoaded(true);
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    return () => {};
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const translateTo = (langCode: string) => {
    setCurrentLang(langCode);
    setOpen(false);

    if (langCode === "en") {
      // Reset to original
      const frame = document.querySelector<HTMLIFrameElement>(".goog-te-banner-frame");
      if (frame) {
        const innerDoc = frame.contentDocument || frame.contentWindow?.document;
        const restoreBtn = innerDoc?.querySelector<HTMLButtonElement>(".goog-close-link");
        restoreBtn?.click();
      }
      // Also try cookie method
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=." + window.location.hostname;
      window.location.reload();
      return;
    }

    // Set translation cookie and trigger
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${window.location.hostname}`;

    // Trigger the Google Translate select
    const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event("change"));
    } else {
      // If select not ready, reload with cookie set
      window.location.reload();
    }
  };

  const currentLabel = LANGUAGES.find(l => l.code === currentLang)?.label || "English";

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        title="Translate page"
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/80 hover:bg-white border border-border/50 shadow-sm hover:shadow transition-all text-sm font-medium text-foreground"
      >
        <Globe size={16} className="text-primary" />
        <span className="hidden sm:inline max-w-[80px] truncate text-xs">{currentLang === "en" ? "EN" : currentLabel.split(" ")[0]}</span>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-border/50 py-2 z-50 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3 py-2 border-b border-border/50 mb-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Translate Page</p>
          </div>
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => translateTo(lang.code)}
              className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between hover:bg-primary/5 transition-colors ${
                currentLang === lang.code ? "bg-primary/10 text-primary font-semibold" : "text-foreground"
              }`}
            >
              <span>{lang.label}</span>
              {currentLang === lang.code && <Check size={14} className="text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
