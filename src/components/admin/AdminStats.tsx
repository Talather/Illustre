
import { Card, CardContent } from "@/components/ui/card";
import { Users, ShoppingCart, Package, BarChart3 } from "lucide-react";

interface AdminStatsProps {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  activeOrders: number;
}

/**
 * AdminStats - Statistics overview cards for admin dashboard
 * 
 * Features:
 * - Four key metrics displayed in cards
 * - Icon-based visual indicators
 * - Responsive grid layout
 * - Color-coded icons for different metrics
 * - Clean and accessible design
 */
export const AdminStats = ({ 
  totalUsers, 
  totalOrders, 
  totalProducts, 
  activeOrders 
}: AdminStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <div className="text-sm text-gray-600">Utilisateurs</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <div className="text-sm text-gray-600">Commandes</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <div className="text-sm text-gray-600">Produits</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{activeOrders}</div>
              <div className="text-sm text-gray-600">Projets actifs</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
