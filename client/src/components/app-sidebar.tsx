import { Activity, BarChart2, Clock, Home, Settings, Stethoscope } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Symptom Check", url: "/symptom-check", icon: Stethoscope },
  { title: "Health Reports", url: "/reports", icon: BarChart2 },
  { title: "Community Insights", url: "/insights", icon: Activity },
  { title: "History", url: "/history", icon: Clock },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar className="border-r-0">
      <SidebarContent className="pt-6">
        <div className="px-6 pb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(199,243,107,0.3)]">
            <Activity className="w-6 h-6 text-sidebar" />
          </div>
          <span className="text-xl font-bold font-display text-sidebar-foreground tracking-tight">
            RuralCare
          </span>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs font-semibold tracking-wider uppercase mb-2">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`
                        h-12 px-4 rounded-xl transition-all duration-200
                        ${isActive 
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" 
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"}
                      `}
                    >
                      <Link href={item.url} className="flex items-center gap-3 w-full">
                        <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6">
        <div className="bg-primary/10 rounded-2xl p-5 border border-primary/20 relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <h4 className="font-display font-bold text-primary mb-1">AI Health Assistant</h4>
          <p className="text-sm text-sidebar-foreground/80 mb-4 leading-relaxed relative z-10">
            Get instant guidance on your symptoms.
          </p>
          <Link href="/symptom-check">
            <button className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors active:scale-[0.98] shadow-lg shadow-primary/20 relative z-10">
              New Check
            </button>
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
