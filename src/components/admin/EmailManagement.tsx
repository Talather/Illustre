
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Mail, Send } from "lucide-react";

interface EmailManagementProps {
  onSendTestEmail: (type: string, recipient: string) => void;
}

/**
 * EmailManagement - Component for managing email automations in admin interface
 * 
 * Features:
 * - Email input field for each automation type
 * - Predefined email templates with descriptions
 * - Visual email type indicators with icons
 * - Form validation for email addresses
 * - Success feedback after sending emails
 * - Responsive card layout for different email types
 * - Clear categorization of email automations
 */
export const EmailManagement = ({ onSendTestEmail }: EmailManagementProps) => {
  const [emailInputs, setEmailInputs] = useState<Record<string, string>>({
    onboarding: '',
    files: '',
    deliverable: '',
    revision: ''
  });

  const emailTypes = [
    {
      key: 'onboarding',
      title: 'Email d\'onboarding',
      description: 'Liens et instructions initiales pour le client',
      defaultRecipient: 'client'
    },
    {
      key: 'files',
      title: 'Demande de fichiers',
      description: 'Lien Dropbox et instructions pour le dépôt',
      defaultRecipient: 'client'
    },
    {
      key: 'deliverable',
      title: 'Livrable disponible',
      description: 'Lien Frame.io et visualisation du projet',
      defaultRecipient: 'client'
    },
    {
      key: 'revision',
      title: 'Demande de révision',
      description: 'Notification au collaborateur pour modifications',
      defaultRecipient: 'collaborator'
    }
  ];

  const handleEmailChange = (type: string, email: string) => {
    setEmailInputs(prev => ({ ...prev, [type]: email }));
  };

  const handleSendEmail = (type: string) => {
    const email = emailInputs[type];
    
    if (!email || !email.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une adresse email",
        variant: "destructive"
      });
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une adresse email valide",
        variant: "destructive"
      });
      return;
    }

    onSendTestEmail(type, email);
    
    // Clear the input after sending
    setEmailInputs(prev => ({ ...prev, [type]: '' }));
    
    toast({
      title: "Email envoyé",
      description: `Email "${emailTypes.find(e => e.key === type)?.title}" envoyé à ${email}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des emails automatisés</CardTitle>
        <CardDescription>
          Déclenchez manuellement des emails de test en spécifiant le destinataire
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {emailTypes.map((emailType) => (
            <Card key={emailType.key} className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{emailType.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{emailType.description}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`email-${emailType.key}`}>
                          Adresse email du destinataire
                        </Label>
                        <Input
                          id={`email-${emailType.key}`}
                          type="email"
                          placeholder={`exemple@${emailType.defaultRecipient}.com`}
                          value={emailInputs[emailType.key]}
                          onChange={(e) => handleEmailChange(emailType.key, e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <Button 
                        onClick={() => handleSendEmail(emailType.key)}
                        className="w-full bg-gradient-turquoise hover:opacity-90"
                        disabled={!emailInputs[emailType.key]?.trim()}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer l'email
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
