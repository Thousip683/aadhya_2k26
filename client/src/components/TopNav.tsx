import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopNav() {
  return (
    <header className="h-20 bg-transparent flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu size={20} />
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative w-11 h-11 flex items-center justify-center rounded-xl bg-gray-50 border border-border shadow-sm hover:border-primary/50 hover:text-primary transition-colors">
          <Bell size={20} />
          <span className="absolute top-3 right-3 w-2 h-2 bg-destructive rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
}
