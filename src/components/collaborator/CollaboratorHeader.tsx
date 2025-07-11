
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut } from "lucide-react";

interface CollaboratorHeaderProps {
  /** Function to handle user logout */
  onLogout: () => void;
}

/**
 * Header component for the Collaborator interface
 * 
 * Features:
 * - Displays brand logo and interface title
 * - Shows collaborator role badge
 * - Provides logout functionality
 * 
 * @param onLogout - Callback function triggered when user clicks logout
 */
export const CollaboratorHeader = ({ onLogout }: CollaboratorHeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-avigea text-gradient-turquoise">
              illustre!
            </div>
            <div className="hidden sm:block text-gray-300">|</div>
            <div className="hidden sm:block text-gray-600">
              Espace Collaborateur
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-purple-100 text-purple-800">
              Collaborateur
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
