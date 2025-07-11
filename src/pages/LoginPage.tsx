
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

interface TestAccount {
  id: string;
  name: string;
  email: string;
  company: string;
  roles: string[];
}

interface LoginPageProps {
  onLogin: (user: TestAccount) => void;
  testAccounts: TestAccount[];
}

const LoginPage = ({ onLogin, testAccounts }: LoginPageProps) => {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      client: "bg-blue-100 text-blue-800",
      closer: "bg-green-100 text-green-800",
      collaborator: "bg-purple-100 text-purple-800",
      admin: "bg-red-100 text-red-800"
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const handleLogin = (account: TestAccount) => {
    setSelectedAccount(account.id);
    setTimeout(() => {
      onLogin(account);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Interface de Gestion Vidéo
          </h1>
          <p className="text-gray-600">
            Choisissez un compte de test pour accéder à l'interface
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Comptes de Test</CardTitle>
            <CardDescription className="text-center">
              Sélectionnez un profil pour explorer les différentes interfaces
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {testAccounts.map((account) => (
                <div
                  key={account.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedAccount === account.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleLogin(account)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {account.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {account.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          {account.company}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {account.roles.map((role) => (
                        <Badge 
                          key={role}
                          variant="outline"
                          className={getRoleBadgeColor(role)}
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {selectedAccount === account.id && (
                    <div className="mt-3 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-sm text-blue-600">
                        Connexion...
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Mode développement - Comptes de test uniquement
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
