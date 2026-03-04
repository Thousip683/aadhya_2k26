import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Components
import { Layout } from "@/components/Layout";

// Pages
import Dashboard from "@/pages/Dashboard";
import SymptomCheck from "@/pages/SymptomCheck";
import Result from "@/pages/Result";
import Reports from "@/pages/Reports";
import History from "@/pages/History";
import CriticalAlerts from "@/pages/CriticalAlerts";
import Login from "@/pages/Login";
import Landing from "@/pages/Landing";
import SettingsPage from "@/pages/Settings";

// Auth
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Activity } from "lucide-react";

function AdminRouter() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard}/>
        <Route path="/critical-alerts" component={CriticalAlerts}/>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function UserRouter() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={SymptomCheck}/>
        <Route path="/symptom-check" component={SymptomCheck}/>
        <Route path="/result/:id" component={Result}/>
        <Route path="/reports" component={Reports}/>
        <Route path="/history" component={History}/>
        <Route path="/insights" component={Reports}/>
        <Route path="/settings" component={SettingsPage}/>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function AppContent() {
  const { user, loading, isAdmin } = useAuth();
  const [showAuth, setShowAuth] = useState<false | "login" | "register">(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(223,17%,8%)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Activity className="w-8 h-8 text-[hsl(223,17%,8%)] animate-pulse" />
          </div>
          <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    if (showAuth === "login") {
      return <Login initialMode="login" onBack={() => setShowAuth(false)} />;
    }
    if (showAuth === "register") {
      return <Login initialMode="register" onBack={() => setShowAuth(false)} />;
    }
    return (
      <Landing
        onLogin={() => setShowAuth("login")}
        onSignup={() => setShowAuth("register")}
      />
    );
  }

  return isAdmin ? <AdminRouter /> : <UserRouter />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
