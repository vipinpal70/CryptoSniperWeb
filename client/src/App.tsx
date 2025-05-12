import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./lib/auth";

import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import OtpVerification from "@/pages/auth/OtpVerification";
import CompleteProfile from "@/pages/auth/CompleteProfile";
import Home from "@/pages/Home";
import Strategies from "@/pages/Strategies";
import Positions from "@/pages/Positions";
import History from "@/pages/History";
import NotFound from "@/pages/not-found";
import { useAuth } from "./lib/auth";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    // Redirect to login if not authenticated
    window.location.href = "/signin";
    return null;
  }
  
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/signin" component={SignIn} />
      <Route path="/signup" component={SignUp} />
      <Route path="/verify-otp" component={OtpVerification} />
      <Route path="/complete-profile" component={CompleteProfile} />
      
      <Route path="/" component={() => <ProtectedRoute component={Home} />} />
      <Route path="/strategies" component={() => <ProtectedRoute component={Strategies} />} />
      <Route path="/positions" component={() => <ProtectedRoute component={Positions} />} />
      <Route path="/history" component={() => <ProtectedRoute component={History} />} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
