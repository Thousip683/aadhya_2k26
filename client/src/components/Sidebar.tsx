import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Stethoscope, 
  FileText, 
  Users, 
  History, 
  Settings,
  Activity,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/symptom-check", label: "Symptom Check", icon: Stethoscope },
  { href: "/reports", label: "Health Reports", icon: FileText },
  { href: "/insights", label: "Community Insights", icon: Users },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-[240px] h-screen bg-[#111318] text-white flex flex-col hidden md:flex shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_20px_rgba(199,243,107,0.3)]">
          <Activity size={24} strokeWidth={2.5} />
        </div>
        <h1 className="font-display text-xl font-bold tracking-wide">
          Rural<span className="text-primary">Care</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className="block">
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                  isActive 
                    ? "bg-[#1E2127] text-primary" 
                    : "text-gray-400 hover:bg-[#1E2127]/50 hover:text-white"
                )}
              >
                <item.icon 
                  size={20} 
                  className={cn("transition-colors", isActive ? "text-primary" : "text-gray-500 group-hover:text-white")} 
                />
                <span className="font-medium text-sm">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-nav"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 relative overflow-hidden group hover:bg-primary/20 transition-colors cursor-pointer">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-colors" />
          <div className="relative z-10">
            <h3 className="text-primary font-display font-bold text-sm">AI Health Assistant</h3>
            <p className="text-gray-400 text-xs mt-1 leading-relaxed">
              Get instant, 24/7 answers to your medical queries.
            </p>
            <div className="mt-3 flex items-center text-primary text-xs font-semibold gap-1">
              <span>Try now</span>
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
