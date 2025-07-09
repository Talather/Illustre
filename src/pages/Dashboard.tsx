
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Profile, hasRole } from "@/lib/mockData";
import { 
  User, 
  Users, 
  Settings, 
  FileText, 
  Video, 
  LogOut,
  ArrowRight,
  Briefcase,
  Target,
  Users2
} from "lucide-react";

interface DashboardProps {
  user: Profile;
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const navigate = useNavigate();

  const availableInterfaces = [
    {
      key: 'lead',
      title: 'Interface Lead',
      description: 'Processus d\'onboarding et première connexion',
      icon: Target,
      color: 'bg-yellow-500',
      available: hasRole(user, 'lead'),
      path: '/lead'
    },
    {
      key: 'client',
      title: 'Interface Client',
      description: 'Suivi de projets, fichiers et livrables',
      icon: User,
      color: 'bg-blue-500',
      available: hasRole(user, 'client'),
      path: '/client'
    },
    {
      key: 'closer',
      title: 'Interface Closer',
      description: 'Création de comptes, commandes et produits',
      icon: Briefcase,
      color: 'bg-green-500',
      available: hasRole(user, 'closer'),
      path: '/closer'
    },
    {
      key: 'collaborator',
      title: 'Interface Collaborateur',
      description: 'Production, suivi et gestion des projets',
      icon: Video,
      color: 'bg-purple-500',
      available: hasRole(user, 'collaborator'),
      path: '/collaborator'
    },
    {
      key: 'admin',
      title: 'Interface Admin',
      description: 'Gestion complète et administration',
      icon: Settings,
      color: 'bg-red-500',
      available: hasRole(user, 'admin'),
      path: '/admin'
    }
  ];

  // Auto-redirect if user has only one role
  useEffect(() => {
    const available = availableInterfaces.filter(i => i.available);
    if (available.length === 1) {
      setTimeout(() => {
        navigate(available[0].path);
      }, 1500);
    }
  }, [navigate]);

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      lead: "bg-yellow-100 text-yellow-800",
      client: "bg-blue-100 text-blue-800",
      closer: "bg-green-100 text-green-800",
      collaborator: "bg-purple-100 text-purple-800",
      admin: "bg-red-100 text-red-800"
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      lead: "Lead",
      client: "Client", 
      closer: "Closer",
      collaborator: "Collaborateur",
      admin: "Admin"
    };
    return labels[role] || role;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-avigea text-gradient-turquoise">
                illustre!
              </div>
              <div className="hidden sm:block text-gray-300">|</div>
              <div className="hidden sm:block text-gray-600">
                Dashboard principal
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="text-2xl">{user.avatar}</div>
                <div className="hidden sm:block">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue, {user.name} ! 👋
          </h1>
          <p className="text-gray-600 mb-4">
            Choisissez l'interface à utiliser selon votre rôle dans le projet.
          </p>
          
          <div className="flex gap-2 flex-wrap">
            {user.roles.map((role) => (
              <Badge 
                key={role}
                variant="outline"
                className={getRoleBadgeColor(role)}
              >
                {getRoleLabel(role)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Interfaces Available */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableInterfaces.map((interface_item) => {
            const Icon = interface_item.icon;
            return (
              <Card 
                key={interface_item.key}
                className={`transition-all duration-200 ${
                  interface_item.available 
                    ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer border-2 hover:border-primary/50' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => interface_item.available && navigate(interface_item.path)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${interface_item.color} text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{interface_item.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription>
                    {interface_item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {interface_item.available ? (
                    <Button className="w-full" variant="outline">
                      Accéder à l'interface
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-2">
                      Non disponible pour votre rôle
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm text-gray-600">Projets actifs</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">48</div>
                  <div className="text-sm text-gray-600">Collaborateurs</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Video className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">127</div>
                  <div className="text-sm text-gray-600">Livrables créés</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
