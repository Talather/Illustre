
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Profile } from "@/lib/mockData";

interface AdminHeaderProps {
  user: Profile;
  onLogout: () => void;
}

/**
 * AdminHeader - Header component for the admin interface
 * 
 * Features:
 * - Navigation back to dashboard
 * - Brand logo and admin section indicator
 * - Admin badge with user role indication
 * - Logout functionality
 * - Responsive design with mobile-friendly layout
 */
export const AdminHeader = ({ user, onLogout }: AdminHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div className="text-2xl font-avigea text-gradient-turquoise">
              illustre!
            </div>
            <div className="hidden sm:block text-gray-300">|</div>
            <div className="hidden sm:block text-gray-600">
              Administration
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-red-100 text-red-800">
              <Shield className="w-3 h-3 mr-1" />
              Admin
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
