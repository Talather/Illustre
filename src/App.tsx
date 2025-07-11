
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import LoginPage from "./pages/LoginPage";
import ClientInterface from "./pages/ClientInterface";
import CloserInterface from "./pages/CloserInterface";
import CollaboratorInterface from "./pages/CollaboratorInterface";
import AdminInterface from "./pages/AdminInterface";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, userRoles, loading } = useAuth();

  // Auto-redirect based on user roles
  const getDefaultRoute = () => {
    if (userRoles.includes('admin')) return '/admin';
    if (userRoles.includes('closer')) return '/closer';
    if (userRoles.includes('collaborator')) return '/collaborator';
    if (userRoles.includes('client')) return '/client';
    return '/client'; // Default fallback
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-xl font-poppins">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          <Route path="/client" element={<ClientInterface />} />
          <Route path="/closer" element={<CloserInterface />} />
          <Route path="/collaborator" element={<CollaboratorInterface />} />
          <Route path="/admin" element={<AdminInterface />} />
          <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
          <Route path="*" element={<NotFound />} />
        </>
      )}
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
