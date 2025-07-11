
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ClientInterface from "./pages/ClientInterface";
import CloserInterface from "./pages/CloserInterface";
import CollaboratorInterface from "./pages/CollaboratorInterface";
import AdminInterface from "./pages/AdminInterface";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoutes = () => {
  const { user, profile, userRoles, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-gray-600 text-xl font-medium">Chargement...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthPage />;
  }

  // Auto-redirect based on user roles
  const getDefaultRoute = () => {
    const roles = userRoles.map(r => r.role);
    if (roles.includes('admin')) return '/admin';
    if (roles.includes('closer')) return '/closer';
    if (roles.includes('collaborator')) return '/collaborator';
    if (roles.includes('client')) return '/client';
    return '/client'; // Default fallback
  };

  const handleLogout = () => {
    // This will be handled by the auth context
  };

  return (
    <Routes>
      <Route path="/client" element={<ClientInterface user={{ id: user.id, name: `${profile.first_name} ${profile.last_name}` }} onLogout={handleLogout} />} />
      <Route path="/closer" element={<CloserInterface user={{ id: user.id, name: `${profile.first_name} ${profile.last_name}` }} onLogout={handleLogout} />} />
      <Route path="/collaborator" element={<CollaboratorInterface user={{ id: user.id, name: `${profile.first_name} ${profile.last_name}` }} onLogout={handleLogout} />} />
      <Route path="/admin" element={<AdminInterface user={{ id: user.id, name: `${profile.first_name} ${profile.last_name}` }} onLogout={handleLogout} />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ProtectedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
