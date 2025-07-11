
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useTestAccounts } from "@/hooks/useTestAccounts";
import LoginPage from "./pages/LoginPage";
import ClientInterface from "./pages/ClientInterface";
import CloserInterface from "./pages/CloserInterface";
import CollaboratorInterface from "./pages/CollaboratorInterface";
import AdminInterface from "./pages/AdminInterface";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { 
    currentUser, 
    loading, 
    loginAsTestUser, 
    logout, 
    getTestAccounts, 
    getDefaultRoute 
  } = useTestAccounts();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-gray-600 text-xl font-medium">Chargement...</div>
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
                <Route 
                  path="/login" 
                  element={
                    <LoginPage 
                      onLogin={loginAsTestUser} 
                      testAccounts={getTestAccounts()} 
                    />
                  } 
                />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            ) : (
              <>
                <Route 
                  path="/client" 
                  element={
                    <ClientInterface 
                      user={currentUser} 
                      onLogout={logout} 
                    />
                  } 
                />
                <Route 
                  path="/closer" 
                  element={
                    <CloserInterface 
                      user={currentUser} 
                      onLogout={logout} 
                    />
                  } 
                />
                <Route 
                  path="/collaborator" 
                  element={
                    <CollaboratorInterface 
                      user={currentUser} 
                      onLogout={logout} 
                    />
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <AdminInterface 
                      user={currentUser} 
                      onLogout={logout} 
                    />
                  } 
                />
                <Route 
                  path="/" 
                  element={
                    <Navigate to={getDefaultRoute(currentUser)} replace />
                  } 
                />
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
