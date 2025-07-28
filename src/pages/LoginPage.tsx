import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";


const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, getDefaultRoute , needsPasswordReset } = useAuthContext();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const result = await signIn(email, password);
      
      if (result.success) {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté",
        });
        if(needsPasswordReset){
          navigate("/reset");
        }else{
          navigate(getDefaultRoute());
        }
      } else {
        toast({
          title: "Erreur de connexion",
          description: result.error || "Email ou mot de passe incorrect",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };



  return (
    <div className="min-h-screen bg-gradient-turquoise flex items-center justify-center p-4">
      <div className="w-full max-w-6xl ">
        {/* Login Form */}
        <Card className="w-full max-w-md mx-auto shadow-2xl">
          <CardHeader className="text-center">
            
            <div className="w-full flex justify-center items-center  text-gradient-turquoise mb-4">
              <img src={logo} className="w-48"/>
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

        {/* Information Panel */}
        {/* <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Authentification Supabase
            </CardTitle>
            <CardDescription>
              Connectez-vous avec vos identifiants Supabase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 Guide des rôles</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <div><strong>Client :</strong> Dashboard projet + fichiers + livrables</div>
                  <div><strong>Closer :</strong> Création comptes, commandes, produits</div>
                  <div><strong>Collaborateur :</strong> Production et suivi projets</div>
                  <div><strong>Admin :</strong> Accès complet à toutes les interfaces</div>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">🔐 Sécurité</h4>
                <div className="space-y-1 text-sm text-green-800">
                  <div>• Authentification sécurisée via Supabase</div>
                  <div>• Changement de mot de passe obligatoire pour les nouveaux clients</div>
                  <div>• Accès basé sur les rôles utilisateur</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
};

export default LoginPage;
