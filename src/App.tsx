import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useRoleSelection } from "@/hooks/useRoleSelection";
import { RoleSelector } from "@/components/auth/RoleSelector";
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

  // Affichage d'erreur avec possibilité de retry
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="text-center space-y-4">
          <div className="text-red-600 text-xl font-medium">Erreur de chargement</div>
          <div className="text-gray-600">{error}</div>
          <button 
            onClick={retry}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
          <div className="text-sm text-gray-500 mt-4">
            <p>Informations de débogage :</p>
            <p>User: {user ? '✅' : '❌'}</p>
            <p>Profile: {profile ? '✅' : '❌'}</p>
            <p>Roles: {userRoles.length > 0 ? `✅ (${userRoles.length})` : '❌'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Affichage de chargement amélioré
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <div className="text-gray-600 text-xl font-medium">Chargement...</div>
          <div className="text-sm text-gray-500">
            <p>Vérification de l'authentification</p>
            <div className="mt-2 space-y-1">
              <p>Session: {user ? '✅' : '⏳'}</p>
              <p>Profil: {profile ? '✅' : '⏳'}</p>
              <p>Rôles: {userRoles.length > 0 ? `✅ (${userRoles.length})` : '⏳'}</p>
            </div>
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
