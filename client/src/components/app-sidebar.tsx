import { Activity, BarChart2, Clock, Home, Settings, Stethoscope, Siren, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
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

const allNavItems = [
  { title: "Dashboard", url: "/", icon: Home, adminOnly: true, userOnly: false },
  { title: "Symptom Check", url: "/", icon: Stethoscope, adminOnly: false, userOnly: true },
  { title: "Health Reports", url: "/reports", icon: BarChart2, adminOnly: false, userOnly: true },
  { title: "Critical Alerts", url: "/critical-alerts", icon: Siren, adminOnly: true, userOnly: false },
  { title: "History", url: "/history", icon: Clock, adminOnly: false, userOnly: true },
  { title: "Settings", url: "/settings", icon: Settings, adminOnly: false, userOnly: true },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const navItems = allNavItems.filter(item => {
    if (isAdmin) return item.adminOnly;
    return item.userOnly;
  });

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="pt-6">
        <div className="px-6 pb-6 flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(199,243,107,0.3)] shrink-0">
            <Activity className="w-6 h-6 text-sidebar" />
          </div>
          <span className="text-xl font-bold font-display text-sidebar-foreground tracking-tight group-data-[collapsible=icon]:hidden">
            RuralCare
          </span>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs font-semibold tracking-wider uppercase mb-2 group-data-[collapsible=icon]:hidden">
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

      <SidebarFooter className="p-4 pt-2 space-y-3">
        <div className="bg-primary/10 rounded-xl p-3.5 border border-primary/20 relative overflow-hidden group hover:border-primary/40 transition-colors group-data-[collapsible=icon]:hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
          <h4 className="font-display font-semibold text-primary text-sm mb-0.5">AI Health Assistant</h4>
          <p className="text-xs text-sidebar-foreground/80 mb-3 leading-relaxed relative z-10">
            Get instant guidance on your symptoms.
          </p>
          <Link href="/symptom-check">
            <button className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors active:scale-[0.98] shadow-lg shadow-primary/20 relative z-10">
              New Check
            </button>
          </Link>
        </div>

        {user && (
          <div className="flex items-center gap-3 px-2 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-primary text-sm font-bold shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">@{user.username}</p>
            </div>
            <button
              onClick={logout}
              className="text-sidebar-foreground/40 hover:text-destructive transition-colors p-1 rounded-lg hover:bg-sidebar-accent group-data-[collapsible=icon]:hidden"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
