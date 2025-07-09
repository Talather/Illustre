
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockAuth, mockProfiles, Profile } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, LogIn, Users } from "lucide-react";

interface LoginPageProps {
  onLogin: (user: Profile) => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const success = mockAuth.login(email);
    if (success) {
      const user = mockAuth.getCurrentUser();
      if (user) {
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${user.name} !`,
        });
        onLogin(user);
      }
    } else {
      toast({
        title: "Erreur de connexion",
        description: "Email non reconnu. Utilisez un des comptes de test ci-dessous.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const handleQuickLogin = (user: Profile) => {
    mockAuth.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    toast({
      title: "Connexion rapide",
      description: `Connecté en tant que ${user.name}`,
    });
    onLogin(user);
  };

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
    <div className="min-h-screen bg-gradient-turquoise flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8">
        {/* Login Form */}
        <Card className="w-full max-w-md mx-auto shadow-2xl">
          <CardHeader className="text-center">
            <div className="text-4xl font-avigea text-gradient-turquoise mb-4">
              illustre!
            </div>
            <CardTitle className="text-2xl font-poppins">Connexion</CardTitle>
            <CardDescription>
              Accédez à votre espace de production audiovisuelle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre.email@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-turquoise hover:opacity-90 transition-opacity"
                disabled={loading}
              >
                {loading ? (
                  "Connexion..."
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Se connecter
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Mock Accounts */}
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Comptes de test
            </CardTitle>
            <CardDescription>
              Cliquez sur un profil pour vous connecter rapidement et tester l'interface correspondante
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockProfiles.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleQuickLogin(user)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{user.avatar}</div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap">
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
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 Guide des rôles</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <div><strong>Lead :</strong> Processus d'onboarding uniquement</div>
                <div><strong>Client :</strong> Dashboard projet + fichiers + livrables</div>
                <div><strong>Closer :</strong> Création comptes, commandes, produits</div>
                <div><strong>Collaborateur :</strong> Production et suivi projets</div>
                <div><strong>Admin :</strong> Accès complet à toutes les interfaces</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
