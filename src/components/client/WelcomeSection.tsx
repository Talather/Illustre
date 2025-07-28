
interface WelcomeSectionProps {
  userName: string;
}

export const WelcomeSection = ({
  userName,
}: WelcomeSectionProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Bienvenue {userName} !🎬
      </h1>
      <p className="text-gray-600">
        Suivez l'avancement de vos projets audiovisuels et accédez à vos livrables.
      </p>
    </div>
  );
};
