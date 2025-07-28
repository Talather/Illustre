
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, ArrowLeft, User, Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "./../../assets/logo.png";
import { cn } from "@/lib/utils";

interface ClientHeaderProps {
  /** User profile information */
  user: {
    id: string;
    name: string;
  };
  /** Final client name for subcontracted orders */
  finalClientName?: string;
  /** Callback when user logs out */
  onLogout: () => void;
  /** Current active tab */
  activeTab?: 'dashboard' | 'profile';
}

/**
 * ClientHeader - Header component for the client interface
 * 
 * Features:
 * - Navigation back to dashboard
 * - Branding display (custom or default)
 * - User badge with subcontract indicator
 * - Logout functionality
 */
export const ClientHeader = ({
  user,
  finalClientName,
  onLogout,
  activeTab = 'dashboard'
}: ClientHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const isProfileActive = currentPath.includes('/profile');
  const isDashboardActive = !isProfileActive;

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <img src={logo} className="w-36" alt="Logo"/>
              <div className="hidden sm:block text-gray-300">|</div>
              <div className="hidden sm:block text-gray-600">
                Espace Client
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center space-x-2 mr-4">
              <Button 
                variant="ghost"
                onClick={() => navigate('/client')}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md",
                  isDashboardActive ? 
                    "bg-blue-50 text-blue-700 hover:bg-blue-100" : 
                    "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Home className="w-4 h-4" />
                Tableau de bord
              </Button>
              <Button 
                variant="ghost"
                onClick={() => navigate('/client/profile')}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md",
                  isProfileActive ? 
                    "bg-blue-50 text-blue-700 hover:bg-blue-100" : 
                    "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <User className="w-4 h-4" />
                Profil
              </Button>
            </nav>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              Client 
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

