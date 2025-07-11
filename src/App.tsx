
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useRoleSelection } from "@/hooks/useRoleSelection";
import { RoleSelector } from "@/components/auth/RoleSelector";
import { AuthError } from "@/components/auth/AuthError";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ClientInterface from "./pages/ClientInterface";
import CloserInterface from "./pages/CloserInterface";
import CollaboratorInterface from "./pages/CollaboratorInterface";
import AdminInterface from "./pages/AdminInterface";
import NotFound from "./pages/NotFound";
import { UserProfile } from "@/types/auth";

const queryClient = new QueryClient();

const ProtectedRoutes = () => {
  const { user, profile, userRoles, loading, error, retry } = useAuth();
  const availableRoles = userRoles.map(r => r.role);
  const { selectedRole, needsRoleSelection, selectRole, switchRole } = useRoleSelection(availableRoles);

  // Affichage d'erreur avec interface dédiée
  if (error) {
    return (
      <AuthError
        error={error}
        onRetry={retry}
        debugInfo={{
          hasUser: !!user,
          hasProfile: !!profile,
          rolesCount: userRoles.length
        }}
      />
    );
  }

  // Affichage de chargement amélioré avec diagnostic
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center space-y-4 max-w-md">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <div className="text-gray-600 text-xl font-medium">Chargement...</div>
          <div className="text-sm text-gray-500">
            <p className="mb-3">Vérification de l'authentification</p>
            <div className="bg-white p-4 rounded-lg shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span>Session utilisateur:</span>
                <span>{user ? '✅ Connecté' : '⏳ En cours...'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Profil utilisateur:</span>
                <span>{profile ? '✅ Chargé' : '⏳ En cours...'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Rôles utilisateur:</span>
                <span>{userRoles.length > 0 ? `✅ ${userRoles.length} rôle(s)` : '⏳ En cours...'}</span>
              </div>
            </div>
            <p className="text-xs mt-3 text-gray-400">
              Si le chargement prend trop de temps, une erreur sera affichée automatiquement.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // Show role selector if user has multiple roles and hasn't selected one
  if (needsRoleSelection) {
    return (
      <RoleSelector
        availableRoles={availableRoles}
        onRoleSelect={selectRole}
      />
    );
  }

  const handleLogout = async () => {
    try {
      const { signOut } = useAuth();
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Create user object for components with all required properties
  const userProfile: UserProfile = {
    id: user.id,
    name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || profile?.email || user.email || 'Utilisateur',
    email: profile?.email || user.email || '',
    roles: userRoles.map(r => r.role),
    status: 'active' as const
  };

  return (
    <Routes>
      <Route path="/client" element={
        <ClientInterface 
          user={userProfile} 
          onLogout={handleLogout}
          availableRoles={availableRoles}
          currentRole={selectedRole || 'client'}
          onRoleChange={switchRole}
        />
      } />
      <Route path="/closer" element={
        <CloserInterface 
          user={userProfile} 
          onLogout={handleLogout}
          availableRoles={availableRoles}
          currentRole={selectedRole || 'closer'}
          onRoleChange={switchRole}
        />
      } />
      <Route path="/collaborator" element={
        <CollaboratorInterface 
          user={userProfile} 
          onLogout={handleLogout}
          availableRoles={availableRoles}
          currentRole={selectedRole || 'collaborator'}
          onRoleChange={switchRole}
        />
      } />
      <Route path="/admin" element={
        <AdminInterface 
          user={userProfile} 
          onLogout={handleLogout}
          availableRoles={availableRoles}
          currentRole={selectedRole || 'admin'}
          onRoleChange={switchRole}
        />
      } />
      <Route path="/dashboard" element={<Dashboard user={userProfile} onLogout={handleLogout} />} />
      <Route path="/" element={
        <Navigate to={selectedRole ? `/${selectedRole}` : '/client'} replace />
      } />
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
