
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

interface CollaboratorFiltersProps {
  /** Current status filter value */
  statusFilter: string;
  /** Callback function when filter changes */
  onStatusFilterChange: (value: string) => void;
  /** Total count of filtered products */
  totalProductsCount: number;
  /** Total count of filtered orders */
  totalOrdersCount: number;
}

/**
 * Filter controls component for the Collaborator interface
 * 
 * Features:
 * - Status filter dropdown with all available statuses
 * - Display count of filtered products and orders
 * - Clear visual indication of active filters
 * 
 * @param statusFilter - Currently selected status filter
 * @param onStatusFilterChange - Handler for status filter changes
 * @param totalProductsCount - Number of products matching current filters
 * @param totalOrdersCount - Number of orders matching current filters
 */
export const CollaboratorFilters = ({ 
  statusFilter, 
  onStatusFilterChange, 
  totalProductsCount, 
  totalOrdersCount 
}: CollaboratorFiltersProps) => {
  const statusOptions = [
    { value: "all", label: "Tous les statuts" },
    { value: "pending", label: "En attente" },
    { value: "files_requested", label: "Fichiers demandés" },
    { value: "in_production", label: "En production" },
    { value: "delivered", label: "Livrés" },
    { value: "revision_requested", label: "Révision demandée" }
  ];

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-gray-600">
            {totalProductsCount} produit(s) affiché(s) dans {totalOrdersCount} commande(s)
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
