
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ROLE_OPTIONS, RoleOption } from "@/types/auth";

interface RoleSelectorProps {
  availableRoles: string[];
  onRoleSelect: (role: string, remember: boolean) => void;
}

export const RoleSelector = ({ availableRoles, onRoleSelect }: RoleSelectorProps) => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [rememberChoice, setRememberChoice] = useState(false);

  const handleSubmit = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole, rememberChoice);
    }
  };

  const roleOptions = availableRoles
    .map(role => ROLE_OPTIONS[role])
    .filter(Boolean);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Sélectionnez votre rôle
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Vous avez accès à plusieurs interfaces. Choisissez celle que vous souhaitez utiliser.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {roleOptions.map((option: RoleOption) => (
              <Card
                key={option.role}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedRole === option.role
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedRole(option.role)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{option.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-lg">{option.label}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {option.role}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mt-1">
                        {option.description}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value={option.role}
                        checked={selectedRole === option.role}
                        onChange={() => setSelectedRole(option.role)}
                        className="w-4 h-4 text-blue-600"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberChoice}
              onCheckedChange={(checked) => setRememberChoice(checked as boolean)}
            />
            <label
              htmlFor="remember"
              className="text-sm text-gray-700 cursor-pointer"
            >
              Se souvenir de mon choix pour les prochaines connexions
            </label>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!selectedRole}
            className="w-full"
            size="lg"
          >
            Continuer avec le rôle {selectedRole && ROLE_OPTIONS[selectedRole]?.label}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
