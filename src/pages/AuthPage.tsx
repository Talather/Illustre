
import { LoginForm } from '@/components/auth/LoginForm';

const AuthPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">illustre!</h1>
          <p className="text-gray-600">Plateforme de gestion audiovisuelle</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default AuthPage;
