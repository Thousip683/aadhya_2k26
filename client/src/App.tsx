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

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard}/>
        <Route path="/symptom-check" component={SymptomCheck}/>
        <Route path="/result/:id" component={Result}/>
        <Route path="/reports" component={Reports}/>
        <Route path="/history" component={History}/>
        {/* Placeholder redirects for mock links in sidebar */}
        <Route path="/insights" component={Reports}/>
        <Route path="/settings" component={Reports}/>
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
