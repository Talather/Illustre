
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Video,
  ExternalLink,
  Folder,
  ChevronDown,
  MessageSquare,
  Send
} from "lucide-react";

interface Product {
  id: string;
  title: string;
  format: string;
  status: string;
  deliverableLink: string;
  preparationLink: string;
  nextActionDate?: string;
  responsible: string;
  instructions: string;
  product_type: string;
  product_name: string;
  revisions?: Array<{
    id: string;
    requestedAt: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
  }>;
}

interface ProductCardProps {
  /** Product data */
  product: Product;
  /** Callback when user accesses a file link */
  onFileAccess: (link: string, type: string) => void;
  /** Callback when user submits a revision request */
  onRevisionRequest: (productId: string, description: string) => void;
}

/**
 * ProductCard - Individual product display within order accordion
 * 
 * Features:
 * - Product status and information display
 * - Conditional "See deliverables" button (only if status is 'delivered')
 * - "Preproduction" button (renamed from preparation documents)
 * - Revision request form below deliverables
 * - Collapsible revision history
 * - Removed next action date display as requested
 */
export const ProductCard = ({
  product,
  onFileAccess,
  onRevisionRequest
}: ProductCardProps) => {
  const [revisionText, setRevisionText] = useState("");
  const [showRevisionForm, setShowRevisionForm] = useState(false);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-gray-100 text-gray-800',
      'files_requested': 'bg-orange-100 text-orange-800',
      'in_production': 'bg-blue-100 text-blue-800',
      'delivered': 'bg-green-100 text-green-800',
      'revision_requested': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'En attente',
      'files_requested': 'Fichiers demandés',
      'in_production': 'En production',
      'delivered': 'Livré',
      'revision_requested': 'Révision demandée'
    };
    return labels[status] || status;
  };

  const handleRevisionSubmit = () => {
    if (revisionText.trim()) {
      onRevisionRequest(product.id, revisionText.trim());
      setRevisionText("");
      setShowRevisionForm(false);
    }
  };

  const isDelivered = product.status === 'delivered' || product.status === 'revision_requested';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{product.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <Video className="w-4 h-4" />
              Format: {product.format || product.product_type} • Responsable: {product.responsible}
            </div>
          </div>
          <Badge className={getStatusColor(product.status)}>
            {getStatusLabel(product.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Instructions */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2 text-sm">Instructions du projet</h4>
            <p className="text-sm text-gray-600">{product.product_name}</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* See Deliverables - only show if delivered */}
            {isDelivered && (
              <Button 
                variant="outline" 
                onClick={() => onFileAccess(product.deliverableLink, "aux livrables")}
                className="flex items-center gap-2"
              >
                <Video className="w-4 h-4" />
                Voir les livrables
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
            
            {/* Preproduction (renamed from preparation) */}
            {/* <Button 
              variant="outline"
              onClick={() => onFileAccess(product.preparationLink, "à la préproduction")}
              className="flex items-center gap-2"
            >
              <Folder className="w-4 h-4" />
              Préproduction
              <ExternalLink className="w-4 h-4" />
            </Button> */}
          </div>

          {/* Revision Request Section - only show if delivered */}
          {isDelivered && (
            <div className="pt-4 border-t space-y-3">
              {!showRevisionForm ? (
                <Button 
                  variant="outline"
                  onClick={() => setShowRevisionForm(true)}
                  className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Demander une révision
                </Button>
              ) : (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Décrivez les modifications souhaitées..."
                    value={revisionText}
                    onChange={(e) => setRevisionText(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleRevisionSubmit}
                      disabled={!revisionText.trim()}
                      size="sm"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Envoyer la demande
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowRevisionForm(false);
                        setRevisionText("");
                      }}
                      size="sm"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Revision History */}
          {product.revisions && product.revisions.length > 0 && (
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <span className="text-sm text-gray-600">
                    Historique des révisions ({product.revisions.length})
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="space-y-2">
                  {product.revisions.map((revision) => (
                    <div key={revision.id} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs text-gray-500">
                          {new Date(revision.requestedAt).toLocaleDateString('fr-FR')}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {revision.status === 'pending' ? 'En attente' : 
                           revision.status === 'in_progress' ? 'En cours' : 'Terminé'}
                        </Badge>
                      </div>
                      <p className="text-gray-700">{revision.description}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
