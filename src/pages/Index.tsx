
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to login/dashboard based on auth status
    navigate('/dashboard');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-turquoise">
      <div className="text-center text-white">
        <div className="text-4xl font-avigea mb-4">illustre!</div>
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  );
};

export default Index;
