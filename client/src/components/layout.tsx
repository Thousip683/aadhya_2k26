import { ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

function MainContent({ children }: { children: ReactNode }) {
  const { open } = useSidebar();

  return (
    <div className={`flex flex-col flex-1 min-w-0 overflow-hidden relative bg-background transition-[border-radius] duration-300 ${open ? "rounded-tl-[40px] rounded-bl-[40px]" : ""}`}>
      {/* Subtle background glow effects */}
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <SidebarTrigger className="absolute top-4 right-4 z-20 hover:bg-black/5 hover:text-foreground p-2 rounded-lg transition-colors" />

          <main className="flex-1 overflow-y-auto px-4 sm:px-8 pt-14 pb-8 z-10 scroll-smooth">
            {children}
          </main>
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const style = {
    "--sidebar-width": "260px",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={style}>
      <div className="flex h-screen w-full bg-sidebar overflow-hidden selection:bg-primary/30 selection:text-primary-foreground">
        <AppSidebar />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  );
}
