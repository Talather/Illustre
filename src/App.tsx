
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { mockAuth, Profile } from "@/lib/mockData";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import LeadInterface from "./pages/LeadInterface";
import ClientInterface from "./pages/ClientInterface";
import CloserInterface from "./pages/CloserInterface";
import CollaboratorInterface from "./pages/CollaboratorInterface";
import AdminInterface from "./pages/AdminInterface";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = mockAuth.getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  const handleLogin = (user: Profile) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    mockAuth.logout();
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-turquoise">
        <div className="text-white text-xl font-poppins">Chargement...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {!currentUser ? (
              <>
                <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            ) : (
              <>
                <Route path="/dashboard" element={<Dashboard user={currentUser} onLogout={handleLogout} />} />
                <Route path="/lead" element={<LeadInterface user={currentUser} onLogout={handleLogout} />} />
                <Route path="/client" element={<ClientInterface user={currentUser} onLogout={handleLogout} />} />
                <Route path="/closer" element={<CloserInterface user={currentUser} onLogout={handleLogout} />} />
                <Route path="/collaborator" element={<CollaboratorInterface user={currentUser} onLogout={handleLogout} />} />
                <Route path="/admin" element={<AdminInterface user={currentUser} onLogout={handleLogout} />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<NotFound />} />
              </>
            )}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
