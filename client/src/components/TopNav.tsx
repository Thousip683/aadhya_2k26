import { Search, Bell, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function TopNav() {
  return (
    <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu size={20} />
        </Button>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search patients, records, or symptoms..." 
            className="w-[320px] h-11 bg-white border border-border rounded-xl pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-border shadow-sm hover:border-primary/50 hover:text-primary transition-colors">
          <Bell size={20} />
          <span className="absolute top-3 right-3 w-2 h-2 bg-destructive rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-2 border-l border-border/50">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-foreground font-display">Dr. Sarah Jenkins</p>
            <p className="text-xs text-muted-foreground">Chief Medical Officer</p>
          </div>
          <Avatar className="h-11 w-11 border-2 border-white shadow-sm cursor-pointer hover:border-primary transition-colors">
            {/* abstract geometric avatar */}
            <AvatarImage src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop" />
            <AvatarFallback className="bg-primary/20 text-primary font-bold">SJ</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
