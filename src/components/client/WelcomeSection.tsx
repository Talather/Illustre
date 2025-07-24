
interface WelcomeSectionProps {
  /** User name for welcome message */
  userName: string;
  /** Whether this is a subcontracted client */
  isSubcontracted: boolean;
  /** Final client name for subcontracted orders */
  finalClientName?: string;
}

/**
 * WelcomeSection - Welcome message component
 * 
 * Features:
 * - Personalized welcome message
 * - Different messaging for subcontracted clients
 * - Project description
 */
export const WelcomeSection = ({
  userName,
  isSubcontracted,
  finalClientName
}: WelcomeSectionProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {isSubcontracted 
          ? `Bienvenue ${finalClientName} !` 
          : `Bienvenue ${userName} !`
        } 🎬
      </h1>
      <p className="text-gray-600">
        Suivez l'avancement de vos projets audiovisuels et accédez à vos livrables.
      </p>
    </div>
  );
};
