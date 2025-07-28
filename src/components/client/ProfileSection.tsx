import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client.js";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Save, X } from "lucide-react";

interface ProfileSectionProps {
  user: {
    id: string;
    name?: string;
    full_name?: string;
    email?: string;
  };
}

export const ProfileSection = ({ user }: ProfileSectionProps) => {
  const { profile, updateProfile } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize form data with user profile info
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        email: profile.email || "",
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form data
      if (profile) {
        setFormData({
          full_name: profile.full_name || "",
          email: profile.email || "",
        });
      }
    }
    setIsEditing(!isEditing);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.email.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom et l'email sont requis",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Check if email has changed
      const emailChanged = profile && profile.email !== formData.email;
      
      if (emailChanged) {
        // Call the Edge Function to update the email
        try {
          const response = await fetch('https://kklvthnshgqhmdhuuhzr.supabase.co/functions/v1/update-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
            },
            body: JSON.stringify({
              current_email: profile.email,
              new_email: formData.email
            })
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Error updating email');
          }
          
          toast({
            title: "E-mail mis à jour",
            description: "Votre adresse e-mail a été mise à jour avec succès."
          });
        } catch (error: any) {
          console.error("Error calling update-email function:", error);
          toast({
            title: "Erreur",
            description: error.message || "Impossible de mettre à jour l'adresse e-mail. Veuillez réessayer.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
      }
      
      // Then update the profile in the auth context (which updates Supabase profile document)
      const result = await updateProfile({
        full_name: formData.full_name,
        email: formData.email,
      });

      if (result.success) {
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été mises à jour avec succès",
        });
        setIsEditing(false);
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Une erreur s'est produite lors de la mise à jour du profil",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour du profil",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profil</h2>
          <p className="text-gray-600">Gérez vos informations personnelles</p>
        </div>
      </div>

      <Card className="shadow-md bg-white">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Informations personnelles</span>
            <Button 
              variant={isEditing ? "destructive" : "outline"}
              size="sm"
              onClick={handleEditToggle}
              className="flex items-center gap-1"
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4" />
                  Annuler
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  Modifier
                </>
              )}
            </Button>
          </CardTitle>
          <CardDescription>
            Modifiez vos informations personnelles ci-dessous
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nom complet</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                disabled={!isEditing || isLoading}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing || isLoading}
                className="bg-white"
              />
            </div>
          </CardContent>
          {isEditing && (
            <CardFooter>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-gradient-turquoise hover:opacity-90 flex items-center gap-1"
              >
                <Save className="w-4 h-4" />
                {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </CardFooter>
          )}
        </form>
      </Card>
    </div>
  );
};

export default ProfileSection;