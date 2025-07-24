
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Profile } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";
// import { UserRegistration } from "@/components/auth/UserRegistration";
import { Edit, Save, X, UserPlus } from "lucide-react";

interface UserManagementProps {
  users: Profile[];
  onUpdateUser: (userId: string, updates: Partial<Profile>) => void;
  onUpdateUserRoles: (userId: string, newRoles: string[]) => void;
  onCreateUser?: () => void;
}

/**
 * UserManagement - Component for managing users in admin interface
 * 
 * Features:
 * - Edit user name and email directly
 * - Modify user roles with checkbox interface
 * - Visual role badges with color coding
 * - User status indicators (active/inactive)
 * - Modal dialogs for detailed editing
 * - Form validation and error handling
 * - Responsive design for mobile devices
 */
export const UserManagement = ({ 
  users, 
  onUpdateUser, 
  onUpdateUserRoles,
  onCreateUser 
}: UserManagementProps) => {
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [showCreateUser, setShowCreateUser] = useState(false);

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      client: "bg-blue-100 text-blue-800",
      closer: "bg-green-100 text-green-800",
      collaborator: "bg-purple-100 text-purple-800",
      admin: "bg-red-100 text-red-800"
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const handleEditStart = (user: Profile) => {
    setEditingUser(user.id);
    setEditForm({ name: user.name, email: user.email });
  };

  const handleEditSave = (userId: string) => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom et l'email sont requis",
        variant: "destructive"
      });
      return;
    }

    onUpdateUser(userId, editForm);
    setEditingUser(null);
    toast({
      title: "Utilisateur mis à jour",
      description: "Les informations ont été modifiées avec succès"
    });
  };

  const handleEditCancel = () => {
    setEditingUser(null);
    setEditForm({ name: '', email: '' });
  };

  const handleRoleChange = (userId: string, role: string, checked: boolean) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newRoles = checked 
      ? [...user.roles, role]
      : user.roles.filter(r => r !== role);
    
    onUpdateUserRoles(userId, newRoles);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestion des utilisateurs</CardTitle>
            <CardDescription>
              Modifiez les informations personnelles et les rôles des utilisateurs
            </CardDescription>
          </div>
          <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Créer un utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
                <DialogDescription>
                  Créez un nouveau compte utilisateur avec le rôle client
                </DialogDescription>
              </DialogHeader>
              {/* <UserRegistration 
                mode="admin-create"
                onSuccess={() => {
                  setShowCreateUser(false);
                  onCreateUser?.();
                }}
                onCancel={() => setShowCreateUser(false)}
              /> */}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4 flex-1">
                <div className="text-2xl">{user.avatar}</div>
                <div className="flex-1">
                  {editingUser === user.id ? (
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor={`name-${user.id}`}>Nom</Label>
                        <Input
                          id={`name-${user.id}`}
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`email-${user.id}`}>Email</Label>
                        <Input
                          id={`email-${user.id}`}
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {user.roles.map((role) => (
                          <Badge 
                            key={role}
                            variant="outline"
                            className={getRoleBadgeColor(role)}
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={
                  user.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }>
                  {user.status === 'active' ? 'Actif' : 'Inactif'}
                </Badge>

                {editingUser === user.id ? (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleEditSave(user.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleEditCancel}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditStart(user)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Rôles
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Modifier les rôles - {user.name}</DialogTitle>
                      <DialogDescription>
                        Sélectionnez les rôles pour cet utilisateur
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Rôles disponibles</label>
                        <div className="mt-2 space-y-2">
                          {['client', 'closer', 'collaborator', 'admin'].map((role) => (
                            <label key={role} className="flex items-center gap-2">
                              <input 
                                type="checkbox" 
                                checked={user.roles.includes(role)}
                                onChange={(e) => handleRoleChange(user.id, role, e.target.checked)}
                              />
                              <span className="capitalize">{role}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
