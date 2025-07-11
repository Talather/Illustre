
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, AlertCircle } from 'lucide-react';

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
          <CardTitle className="text-center text-red-600 flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Erreur de connexion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-gray-600 bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </div>
          
          <Button onClick={onRetry} className="w-full" size="lg">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>

          {debugInfo && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-3 flex items-center gap-2">
                  🔍 Informations de diagnostic :
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Utilisateur connecté:</span>
                    <span className={debugInfo.hasUser ? 'text-green-600' : 'text-red-600'}>
                      {debugInfo.hasUser ? '✅ Oui' : '❌ Non'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Profil chargé:</span>
                    <span className={debugInfo.hasProfile ? 'text-green-600' : 'text-red-600'}>
                      {debugInfo.hasProfile ? '✅ Oui' : '❌ Non'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Rôles assignés:</span>
                    <span className={debugInfo.rolesCount > 0 ? 'text-green-600' : 'text-red-600'}>
                      {debugInfo.rolesCount > 0 ? `✅ ${debugInfo.rolesCount}` : '❌ Aucun'}
                    </span>
                  </div>
                </div>
                
                {/* Messages d'aide contextuels */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-medium text-blue-800 mb-2">💡 Que faire :</p>
                  {!debugInfo.hasUser && (
                    <p className="text-xs text-blue-700 mb-2">
                      • Vous devez vous connecter pour accéder à l'application
                    </p>
                  )}
                  {debugInfo.hasUser && !debugInfo.hasProfile && (
                    <p className="text-xs text-blue-700 mb-2">
                      • Votre profil n'a pas été trouvé - contactez l'administrateur
                    </p>
                  )}
                  {debugInfo.hasUser && debugInfo.hasProfile && debugInfo.rolesCount === 0 && (
                    <p className="text-xs text-blue-700 mb-2">
                      • Aucun rôle n'est assigné à votre compte - contactez l'administrateur
                    </p>
                  )}
                  <p className="text-xs text-blue-700">
                    • Cliquez sur "Réessayer" pour relancer la vérification
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
