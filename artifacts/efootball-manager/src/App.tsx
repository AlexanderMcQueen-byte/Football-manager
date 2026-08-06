import { useEffect, type ReactNode } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider, useAuth } from "@/contexts/auth";
import { Layout } from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import Players from "@/pages/players";
import CreateTournament from "@/pages/create-tournament";
import TournamentDetail from "@/pages/tournament";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Pricing from "@/pages/pricing";
import AdminUsers from "@/pages/admin-users";
import AdminInquiries from "@/pages/admin-inquiries";
import Contact from "@/pages/contact";
import NotFound from "@/pages/not-found";
import MarketplacePage from "@/pages/marketplace";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    }
  }
});

function AdminOnly({ children }: { children: ReactNode }) {
  const { isAdmin, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAdmin) navigate("/");
  }, [isLoading, isAdmin, navigate]);

  if (isLoading) {
    return <div className="min-h-[40vh]" />;
  }

  return isAdmin ? <>{children}</> : null;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/pricing" component={Pricing} />
            <Route path="/players" component={Players} />
            <Route path="/tournaments/new" component={CreateTournament} />
            <Route path="/tournaments/:id" component={TournamentDetail} />
            <Route path="/admin/users">
              <AdminOnly>
                <AdminUsers />
              </AdminOnly>
            </Route>
            <Route path="/admin/inquiries">
              <AdminOnly>
                <AdminInquiries />
              </AdminOnly>
            </Route>
            <Route path="/contact" component={Contact} />
            <Route path="/marketplace/:rest*" component={MarketplacePage} />
            <Route path="/marketplace" component={MarketplacePage} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
