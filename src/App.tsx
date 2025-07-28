import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuthContext, ProtectedRoute } from "@/contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import ClientInterface from "./pages/ClientInterface";
import CloserInterface from "./pages/CloserInterface";
import CollaboratorInterface from "./pages/CollaboratorInterface";
import AdminInterface from "./pages/AdminInterface";
import NotFound from "./pages/NotFound";
import { PasswordReset } from "@/components/auth/PasswordReset";
import { useEffect } from "react";

const queryClient = new QueryClient();

/**
 * Inner App component that has access to AuthContext
 */
const AppRoutes = () => {
  const navigate = useNavigate();
  const { 
    user, 
    profile, 
    loading, 
    needsPasswordReset,
    getDefaultRoute,
    signOut 
  } = useAuthContext();

  console.log(needsPasswordReset, user,profile);
  console.log(getDefaultRoute());


  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };
  useEffect(()=>{
    if(user){
      navigate(getDefaultRoute());
    }
  },[user ,profile]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // If user is not authenticated, show login
  if (!user || !profile || loading) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    );
  }

  // If client needs password reset, force password reset
  if (needsPasswordReset) {
    return (
      <div className="min-h-screen">
        <Routes>
          <Route path="/reset" element={<PasswordReset onSuccess={() => navigate(getDefaultRoute())} />} />
          <Route path="*" element={<Navigate to="/reset" replace />} />
        </Routes>
      </div>
    );
  }

  // User is authenticated and password is set, show main app
  return (
    <Routes>
      {/* <Route path="/login" element={<LoginPage />} /> */}
      <Route path="/client" element={<ProtectedRoute requiredRoles={['client']}><ClientInterface user={profile} onLogout={handleLogout} /></ProtectedRoute>} />
      <Route path="/client/profile" element={<ProtectedRoute requiredRoles={['client']}><ClientInterface user={profile} onLogout={handleLogout}/></ProtectedRoute>} />
      <Route 
        path="/closer" 
        element={<ProtectedRoute requiredRoles={['closer']}><CloserInterface user={profile} onLogout={handleLogout} /></ProtectedRoute>} 
      />
      <Route 
        path="/collaborator" 
        element={<ProtectedRoute requiredRoles={['collaborator']}><CollaboratorInterface user={profile} onLogout={handleLogout} /></ProtectedRoute>} 
      />
      <Route 
        path="/admin" 
        element={<ProtectedRoute requiredRoles={['admin']}><AdminInterface user={profile} onLogout={handleLogout} /></ProtectedRoute>} 
      />
      <Route 
        path="/" 
        element={<Navigate to={getDefaultRoute()} replace />} 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

/**
 * Main App component with providers
 */
const App = () => {

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
