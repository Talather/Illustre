
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Clock, 
  Upload, 
  Send, 
  ExternalLink, 
  Edit, 
  MessageSquare 
} from "lucide-react";

interface Revision {
  id: string;
  description: string;
  requestedAt: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface Product {
  id: string;
  title: string;
  format: string;
  price: number;
  status: string;
  nextActionDate: string;
  onboardingFormLink: string;
  deliverableLink: string;
  revisions?: Revision[];
}

interface ProductCardProps {
  /** Product data to display */
  product: Product;
  /** Current Frame.io link being edited for this product */
  editingFrameLink: string;
  /** Callback when Frame.io link input changes */
  onFrameLinkChange: (value: string) => void;
  /** Callback to handle file request action */
  onRequestFiles: (productId: string) => void;
  /** Callback to handle deliverable deposit action */
  onDepositDeliverable: (productId: string) => void;
  /** Callback to update Frame.io link */
  onUpdateFrameLink: (productId: string) => void;
  /** Callback to view onboarding form */
  onViewOnboardingForm: (formLink: string) => void;
}

/**
 * Individual product card component for the Collaborator interface
 * 
 * Features:
 * - Product information display (title, format, price, status)
 * - Urgency indicator based on next action date
 * - Onboarding form access
 * - Frame.io link management
 * - Revision requests display
 * - Contextual action buttons based on product status
 * 
 * This component handles the display and interaction for a single product
 * within the collaborator's workflow.
 */
export const ProductCard = ({
  product,
  editingFrameLink,
  onFrameLinkChange,
  onRequestFiles,
  onDepositDeliverable,
  onUpdateFrameLink,
  onViewOnboardingForm
}: ProductCardProps) => {
  /**
   * Get appropriate icon for different product formats
   */
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'podcast': return '🎙️';
      case 'scripted': return '🎬';
      case 'micro-interview': return '🎤';
      default: return '📹';
    }
  };

  /**
   * Get status-specific styling classes
   */
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

  /**
   * Get localized status labels
   */
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

  /**
   * Calculate urgency level based on next action date
   */
  const getUrgencyLevel = (date: string) => {
    const nextAction = new Date(date);
    const now = new Date();
    const diffDays = Math.ceil((nextAction.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { level: 'overdue', color: 'text-red-600', label: 'En retard' };
    if (diffDays <= 1) return { level: 'urgent', color: 'text-orange-600', label: 'Urgent' };
    if (diffDays <= 3) return { level: 'soon', color: 'text-yellow-600', label: 'Bientôt' };
    return { level: 'normal', color: 'text-green-600', label: 'Normal' };
  };

  const urgency = getUrgencyLevel(product.nextActionDate);

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Product Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl">{getFormatIcon(product.format)}</div>
              <div>
                <h4 className="font-semibold text-lg">{product.title}</h4>
                <p className="text-gray-600 text-sm">
                  Format: {product.format} • Prix: {product.price}€
                </p>
              </div>
            </div>

            {/* Onboarding Form Section */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h5 className="font-medium mb-2 text-blue-900">Formulaire d'onboarding</h5>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewOnboardingForm(product.onboardingFormLink)}
                className="text-blue-700 hover:text-blue-900"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Voir le formulaire Fillout
              </Button>
            </div>

            {/* Next Action Date */}
            <div className="flex items-center gap-4 text-sm mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Prochaine action:</span>
                <span className={`font-medium ${urgency.color}`}>
                  {new Date(product.nextActionDate).toLocaleDateString('fr-FR')}
                </span>
                <Badge variant="outline" className={urgency.color}>
                  {urgency.label}
                </Badge>
              </div>
            </div>

            {/* Frame.io Link Editor */}
            <div className="mb-4 p-3 border rounded-lg">
              <h5 className="font-medium mb-2">Lien Frame.io</h5>
              <div className="flex gap-2">
                <Input
                  placeholder="Nouveau lien de partage Frame.io"
                  value={editingFrameLink}
                  onChange={(e) => onFrameLinkChange(e.target.value)}
                />
                <Button
                  variant="outline"
                  onClick={() => onUpdateFrameLink(product.id)}
                  disabled={!editingFrameLink}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Actuel: {product.deliverableLink}
              </p>
            </div>

            {/* Revision Requests Section */}
            {product.revisions && product.revisions.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h5 className="font-medium mb-2 text-yellow-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Demandes de révision
                </h5>
                <div className="space-y-2">
                  {product.revisions.map((revision) => (
                    <div key={revision.id} className="bg-white p-2 rounded border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">
                          {new Date(revision.requestedAt).toLocaleDateString('fr-FR')}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={
                            revision.status === 'completed' ? 'text-green-700 border-green-300' :
                            revision.status === 'in_progress' ? 'text-blue-700 border-blue-300' :
                            'text-orange-700 border-orange-300'
                          }
                        >
                          {revision.status === 'completed' ? 'Terminé' :
                           revision.status === 'in_progress' ? 'En cours' : 'En attente'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">{revision.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="flex flex-col items-end gap-3">
            <Badge className={getStatusColor(product.status)}>
              {getStatusLabel(product.status)}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-4 border-t flex gap-3">
          {product.status === 'pending' && (
            <Button
              onClick={() => onRequestFiles(product.id)}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Demander les fichiers
            </Button>
          )}
          
          {product.status === 'in_production' && (
            <Button
              onClick={() => onDepositDeliverable(product.id)}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Déposer le livrable
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
