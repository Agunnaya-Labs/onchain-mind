import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import DashboardPage from "@/pages/dashboard";
import ProjectsPage from "@/pages/projects";
import ProjectDetailPage from "@/pages/project-detail";
import NpcsPage from "@/pages/npcs";
import NpcDetailPage from "@/pages/npc-detail";
import ApiKeysPage from "@/pages/api-keys";
import BillingPage from "@/pages/billing";
import AnalyticsPage from "@/pages/analytics";
import IndexerPage from "@/pages/indexer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/projects/:id">{(params) => <ProjectDetailPage id={params.id} />}</Route>
      <Route path="/npcs" component={NpcsPage} />
      <Route path="/npcs/:id">{(params) => <NpcDetailPage id={params.id} />}</Route>
      <Route path="/api-keys" component={ApiKeysPage} />
      <Route path="/billing" component={BillingPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/indexer" component={IndexerPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <div className="dark">
            <Router />
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
