import { AlertTriangle, Phone, MapPin, Clock, Navigation, Building2, Siren, ShieldAlert, ChevronRight } from "lucide-react";

const mockAlerts = [
  {
    id: 1,
    title: "Possible Heart Attack",
    description: "Patient reported severe chest pain, shortness of breath, and left arm numbness. Immediate cardiac evaluation needed.",
    riskScore: 95,
    riskLevel: "Critical",
    symptoms: ["Chest Pain", "Shortness of Breath", "Left Arm Numbness"],
    time: "2 minutes ago",
    patientId: "P-1042",
  },
  {
    id: 2,
    title: "Stroke Symptoms Detected",
    description: "Sudden facial drooping, speech difficulty, and severe headache. Time-critical intervention required.",
    riskScore: 91,
    riskLevel: "Critical",
    symptoms: ["Facial Drooping", "Speech Difficulty", "Severe Headache"],
    time: "8 minutes ago",
    patientId: "P-1038",
  },
  {
    id: 3,
    title: "Severe Allergic Reaction",
    description: "Throat swelling, difficulty breathing, and hives after food intake. Possible anaphylaxis.",
    riskScore: 88,
    riskLevel: "Critical",
    symptoms: ["Throat Swelling", "Difficulty Breathing", "Hives"],
    time: "15 minutes ago",
    patientId: "P-1035",
  },
  {
    id: 4,
    title: "Respiratory Distress",
    description: "Extremely low oxygen saturation, rapid breathing, and cyanosis observed. Emergency oxygen support needed.",
    riskScore: 85,
    riskLevel: "High",
    symptoms: ["Low SpO2", "Rapid Breathing", "Cyanosis"],
    time: "22 minutes ago",
    patientId: "P-1031",
  },
];

const nearbyHospitals = [
  {
    id: 1,
    name: "Government General Hospital",
    type: "Government",
    distance: "2.5 km",
    eta: "8 min",
    address: "Main Road, Town Center",
    phone: "108",
    beds: 12,
    emergency: true,
  },
  {
    id: 2,
    name: "St. Mary's Medical Center",
    type: "Private",
    distance: "4.1 km",
    eta: "12 min",
    address: "NH-44, Bypass Road",
    phone: "+91 9876543210",
    beds: 8,
    emergency: true,
  },
  {
    id: 3,
    name: "Primary Health Centre",
    type: "Government",
    distance: "1.2 km",
    eta: "4 min",
    address: "Village Main Street",
    phone: "104",
    beds: 3,
    emergency: false,
  },
  {
    id: 4,
    name: "District Hospital",
    type: "Government",
    distance: "8.7 km",
    eta: "22 min",
    address: "District HQ, Civil Lines",
    phone: "108",
    beds: 25,
    emergency: true,
  },
  {
    id: 5,
    name: "Lifecare Clinic & Hospital",
    type: "Private",
    distance: "5.3 km",
    eta: "15 min",
    address: "Market Road, Near Bus Stand",
    phone: "+91 9123456789",
    beds: 6,
    emergency: true,
  },
];

export default function CriticalAlerts() {
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
              {mockAlerts.length} Active Critical Alerts
            </h2>
            <p className="text-white/80 text-lg max-w-xl leading-relaxed">
              AI has detected critical symptoms requiring immediate medical intervention. Review and take action.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button className="bg-white text-destructive hover:bg-gray-50 px-6 py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 transition-all hover:scale-105 shadow-xl">
              <Phone size={20} /> Call 108
            </button>
            <button className="bg-black/20 hover:bg-black/30 text-white border border-white/30 px-6 py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 transition-all">
              <ShieldAlert size={20} /> Alert All Staff
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Alert Cards */}
        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Active Alerts
          </h2>

          {mockAlerts.map((alert) => (
            <div 
              key={alert.id} 
              className="bg-white rounded-2xl p-6 shadow-lg shadow-black/[0.03] border border-border/50 hover:shadow-xl transition-all group relative overflow-hidden"
            >
              {alert.riskLevel === "Critical" && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-destructive rounded-l-2xl" />
              )}
              {alert.riskLevel === "High" && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 rounded-l-2xl" />
              )}

              <div className="ml-2">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${alert.riskLevel === "Critical" ? "bg-destructive/10" : "bg-amber-100"}`}>
                      <AlertTriangle className={`w-5 h-5 ${alert.riskLevel === "Critical" ? "text-destructive" : "text-amber-600"}`} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-foreground text-lg">{alert.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          alert.riskLevel === "Critical" 
                            ? "bg-destructive/10 text-destructive" 
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {alert.riskLevel} — Score {alert.riskScore}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {alert.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{alert.patientId}</span>
                </div>

                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{alert.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {alert.symptoms.map((s) => (
                    <span key={s} className="bg-secondary text-foreground/80 text-xs font-medium px-3 py-1.5 rounded-lg">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button className="bg-destructive text-white hover:bg-destructive/90 px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all">
                    <Phone size={14} /> Emergency Call
                  </button>
                  <button className="bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all">
                    <MapPin size={14} /> Find Hospital
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Nearby Hospitals Sidebar */}
        <div className="space-y-4">
          <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Nearby Hospitals
          </h2>

          {/* Map Placeholder */}
          <div className="bg-sidebar rounded-2xl p-6 shadow-lg border border-border/50 relative overflow-hidden min-h-[180px] flex flex-col items-center justify-center">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-6 w-20 h-20 border-2 border-white/30 rounded-full" />
              <div className="absolute top-12 right-8 w-32 h-32 border-2 border-white/20 rounded-full" />
              <div className="absolute bottom-4 left-1/3 w-16 h-16 border-2 border-white/20 rounded-full" />
            </div>
            <MapPin className="w-10 h-10 text-primary mb-2" />
            <p className="text-sidebar-foreground/70 text-sm font-medium">Map Integration Coming Soon</p>
            <p className="text-sidebar-foreground/50 text-xs mt-1">Google Maps API will be added here</p>
          </div>

          {/* Hospital Cards */}
          {nearbyHospitals.map((hospital) => (
            <div 
              key={hospital.id} 
              className="bg-white rounded-2xl p-5 shadow-lg shadow-black/[0.03] border border-border/50 hover:shadow-xl transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-bold text-foreground text-sm">{hospital.name}</h3>
                    {hospital.emergency && (
                      <span className="bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        ER
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{hospital.address}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
              </div>

              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <Navigation className="w-3.5 h-3.5 text-primary" />
                  <span className="font-semibold text-foreground">{hospital.distance}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">ETA {hospital.eta}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{hospital.beds} beds</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  hospital.type === "Government" 
                    ? "bg-blue-50 text-blue-600" 
                    : "bg-purple-50 text-purple-600"
                }`}>
                  {hospital.type}
                </span>
                <a 
                  href={`tel:${hospital.phone}`}
                  className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                >
                  <Phone className="w-3 h-3" /> {hospital.phone}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
