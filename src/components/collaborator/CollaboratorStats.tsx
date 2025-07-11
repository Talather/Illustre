
import { Card, CardContent } from "@/components/ui/card";
import { Clock, AlertCircle, CheckCircle, Video } from "lucide-react";

interface CollaboratorStatsProps {
  /** Array of products assigned to the collaborator */
  assignedProducts: Array<{ status: string }>;
}

/**
 * Statistics dashboard component for the Collaborator interface
 * 
 * Displays key metrics:
 * - Products in production (in_production status)
 * - Products awaiting files (files_requested status)
 * - Delivered products (delivered status)
 * - Total assigned products count
 * 
 * @param assignedProducts - Array of products with status information
 */
export const CollaboratorStats = ({ assignedProducts }: CollaboratorStatsProps) => {
  const inProductionCount = assignedProducts.filter(p => p.status === 'in_production').length;
  const awaitingFilesCount = assignedProducts.filter(p => p.status === 'files_requested').length;
  const deliveredCount = assignedProducts.filter(p => p.status === 'delivered').length;
  const totalCount = assignedProducts.length;

  const statsData = [
    {
      icon: Clock,
      count: inProductionCount,
      label: "En cours",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      icon: AlertCircle,
      count: awaitingFilesCount,
      label: "En attente",
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600"
    },
    {
      icon: CheckCircle,
      count: deliveredCount,
      label: "Livrés",
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      icon: Video,
      count: totalCount,
      label: "Total assigné",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {statsData.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div>
                <div className="text-2xl font-bold">{stat.count}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
