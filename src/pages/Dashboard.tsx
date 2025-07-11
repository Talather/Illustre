
import { UserProfile } from "@/types/auth";

interface DashboardProps {
  user: UserProfile;
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Bienvenue, {user.name}</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Vue d'ensemble</h2>
          <p className="text-gray-600">
            Votre tableau de bord sera bientôt disponible avec toutes les métriques importantes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
