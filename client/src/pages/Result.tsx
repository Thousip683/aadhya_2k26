import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useSymptomCheck } from "@/hooks/use-symptom-checks";
import { AlertTriangle, Phone, MapPin, ChevronLeft, Info, FileText, Navigation, Clock, Star, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "wouter";

// ─── Nearby Hospitals Types ──────────────────────
type Hospital = {
  name: string;
  vicinity: string;
  distance: string;
  rating?: number;
  open_now?: boolean;
  place_id: string;
  lat: number;
  lng: number;
};

// ─── Haversine distance (km) ─────────────────────
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Nearby Hospitals Component ──────────────────
function NearbyHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLat, setUserLat] = useState(0);
  const [userLng, setUserLng] = useState(0);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLat(latitude);
        setUserLng(longitude);

        try {
          const res = await fetch(
            `/api/nearby-hospitals?lat=${latitude}&lng=${longitude}`,
            { credentials: "include" }
          );
          if (!res.ok) throw new Error("Failed to fetch hospitals");
          const data = await res.json();
          setHospitals(data.hospitals || []);
        } catch {
          setError("Could not load nearby hospitals");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Location access denied. Enable location to see nearby hospitals.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  if (loading) {
    return (
      <div className="mt-6 bg-black/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 text-white/80">
          <Loader2 size={20} className="animate-spin" />
          <span className="font-medium">Locating nearby hospitals...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 bg-black/10 rounded-2xl p-5">
        <p className="text-white/70 text-sm flex items-center gap-2">
          <MapPin size={16} /> {error}
        </p>
      </div>
    );
  }

  if (hospitals.length === 0) {
    return (
      <div className="mt-6 bg-black/10 rounded-2xl p-5">
        <p className="text-white/70 text-sm flex items-center gap-2">
          <MapPin size={16} /> No hospitals found nearby. Try calling emergency services.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-white font-bold text-lg flex items-center gap-2">
        <Navigation size={18} /> Nearest Hospitals
      </h3>
      
      {/* Map embed — OpenStreetMap (free, no API key) */}
      <div className="rounded-xl overflow-hidden border-2 border-white/20 shadow-xl">
        <iframe
          title="Nearby Hospitals"
          width="100%"
          height="200"
          style={{ border: 0 }}
          loading="lazy"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${userLng - 0.06},${userLat - 0.04},${userLng + 0.06},${userLat + 0.04}&layer=mapnik&marker=${userLat},${userLng}`}
        />
      </div>

      {/* Hospital cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {hospitals.slice(0, 6).map((h, i) => (
          <a
            key={h.place_id || i}
            href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl p-4 transition-all group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-bold text-white text-sm leading-tight">{h.name}</h4>
              <ExternalLink size={14} className="text-white/40 group-hover:text-white/80 shrink-0 mt-0.5" />
            </div>
            <p className="text-white/60 text-xs mb-2 line-clamp-1">{h.vicinity}</p>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-white/80 font-semibold">
                <MapPin size={12} /> {h.distance}
              </span>
              {h.rating && (
                <span className="flex items-center gap-1 text-amber-300">
                  <Star size={12} /> {h.rating}
                </span>
              )}
              {h.open_now !== undefined && (
                <span className={`font-semibold ${h.open_now ? "text-green-300" : "text-red-300"}`}>
                  {h.open_now ? "Open" : "Closed"}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

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
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
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
              <a
                href="tel:112"
                className="bg-white text-destructive hover:bg-gray-50 px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-xl shrink-0"
              >
                <Phone size={24} /> Call Emergency
              </a>
            </div>
            <NearbyHospitals />
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
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Explanation</h3>
                <ul className="space-y-2.5">
                  {check.explanation
                    .split(/[\n•\-]/)
                    .map((s: string) => s.trim())
                    .filter(Boolean)
                    .map((point: string, i: number) => (
                      <li key={i} className="flex items-start gap-2.5 text-muted-foreground leading-relaxed">
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
