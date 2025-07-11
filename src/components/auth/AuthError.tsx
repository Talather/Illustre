
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthErrorProps {
  error: string;
  onRetry: () => void;
  debugInfo?: {
    hasUser: boolean;
    hasProfile: boolean;
    rolesCount: number;
  };
}

export const AuthError = ({ error, onRetry, debugInfo }: AuthErrorProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-red-600">
            Erreur de connexion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-gray-600">
            {error}
          </div>
          
          <Button onClick={onRetry} className="w-full">
            Réessayer
          </Button>

          {debugInfo && (
            <div className="mt-6 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">Diagnostic :</p>
                <div className="space-y-1">
                  <p>Utilisateur: {debugInfo.hasUser ? '✅' : '❌'}</p>
                  <p>Profil: {debugInfo.hasProfile ? '✅' : '❌'}</p>
                  <p>Rôles: {debugInfo.rolesCount > 0 ? `✅ (${debugInfo.rolesCount})` : '❌'}</p>
                </div>
                {!debugInfo.hasUser && (
                  <p className="text-xs mt-2 text-orange-600">
                    Vous devez vous connecter pour accéder à l'application.
                  </p>
                )}
                {debugInfo.hasUser && !debugInfo.hasProfile && (
                  <p className="text-xs mt-2 text-orange-600">
                    Votre profil n'a pas été trouvé. Contactez l'administrateur.
                  </p>
                )}
                {debugInfo.hasUser && debugInfo.hasProfile && debugInfo.rolesCount === 0 && (
                  <p className="text-xs mt-2 text-orange-600">
                    Aucun rôle n'est assigné à votre compte. Contactez l'administrateur.
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
