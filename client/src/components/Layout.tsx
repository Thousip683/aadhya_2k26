import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { motion } from "framer-motion";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden bg-white rounded-tl-[40px] rounded-bl-[40px] shadow-2xl my-2 mr-2">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-7xl mx-auto h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
