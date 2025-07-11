
import { Card, CardContent } from "@/components/ui/card";
import { Video } from "lucide-react";

interface EmptyStateProps {
  /** Current status filter value */
  statusFilter: string;
}

/**
 * Empty state component displayed when no products are found
 * 
 * Features:
 * - Contextual message based on current filter state
 * - Visual icon to indicate empty state
 * - Helpful guidance for users
 * 
 * @param statusFilter - Current status filter to customize the message
 */
export const EmptyState = ({ statusFilter }: EmptyStateProps) => {
  const message = statusFilter === 'all' 
    ? "Vous n'avez pas de projets assignés pour le moment."
    : "Aucun projet ne correspond aux filtres sélectionnés.";

  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="font-medium text-gray-900 mb-2">Aucun projet trouvé</h3>
        <p className="text-gray-600">{message}</p>
      </CardContent>
    </Card>
  );
};
