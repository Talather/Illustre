
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RoleSwitcher } from "@/components/ui/RoleSwitcher";

interface ClientHeaderProps {
  /** User profile information */
  user: {
    id: string;
    name: string;
  };
  /** Whether this is a subcontracted client */
  isSubcontracted: boolean;
  /** Custom branding configuration for subcontracted clients */
  customBranding?: {
    logo: string;
    primaryColor: string;
  };
  /** Final client name for subcontracted orders */
  finalClientName?: string;
  /** Callback when user logs out */
  onLogout: () => void;
  /** Available roles for role switching */
  availableRoles?: string[];
  /** Current selected role */
  currentRole?: string;
  /** Callback to change role */
  onRoleChange?: (role: string) => void;
}

/**
 * ClientHeader - Header component for the client interface
 * 
 * Features:
 * - Navigation back to dashboard
 * - Branding display (custom or default)
 * - User badge with subcontract indicator
 * - Role switcher for multi-role users
 * - Logout functionality
 */
export const ClientHeader = ({
  user,
  isSubcontracted,
  customBranding,
  finalClientName,
  onLogout,
  availableRoles = [],
  currentRole = 'client',
  onRoleChange
}: ClientHeaderProps) => {
  const navigate = useNavigate();
  const brandColor = customBranding?.primaryColor || 'hsl(var(--primary))';

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            
            {isSubcontracted && customBranding ? (
              <div className="flex items-center gap-2">
                <div className="text-2xl">{customBranding.logo}</div>
                <div className="text-xl font-bold" style={{ color: brandColor }}>
                  {finalClientName}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="text-2xl font-avigea text-gradient-turquoise">
                  illustre!
                </div>
                <div className="hidden sm:block text-gray-300">|</div>
                <div className="hidden sm:block text-gray-600">
                  Espace Client
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {availableRoles.length > 1 && onRoleChange && (
              <RoleSwitcher
                currentRole={currentRole}
                availableRoles={availableRoles}
                onRoleChange={onRoleChange}
              />
            )}
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              Client {isSubcontracted && "(Sous-traitance)"}
            </Badge>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
