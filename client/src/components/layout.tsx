import { ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Layout({ children }: { children: ReactNode }) {
  const style = {
    "--sidebar-width": "260px",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={style}>
      <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/30 selection:text-primary-foreground">
        <AppSidebar />
        
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
          {/* Subtle background glow effects */}
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <header className="h-20 px-8 flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-black/5 hover:text-foreground p-2 rounded-lg transition-colors" />
              
              <div className="relative hidden md:block w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search patients, symptoms, reports..." 
                  className="pl-10 bg-white border-none shadow-sm rounded-xl h-11 focus-visible:ring-primary focus-visible:ring-offset-2"
                />
              </div>
            </div>

            <div className="flex items-center gap-5">
              <button className="relative p-2.5 bg-white rounded-xl shadow-sm text-foreground/70 hover:text-foreground hover:shadow-md transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-white" />
              </button>
              
              <div className="flex items-center gap-3 pl-4 border-l border-border/50 cursor-pointer group">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Dr. Sarah Jenkins</p>
                  <p className="text-xs text-muted-foreground">General Practitioner</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-sm overflow-hidden border-2 border-white">
                  {/* AI Generated avatar representation placeholder */}
                  <User className="w-5 h-5 text-gray-500" />
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 sm:px-8 pb-8 z-10 scroll-smooth">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
