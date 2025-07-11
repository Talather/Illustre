
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: 'active' | 'inactive';
}

export interface RoleOption {
  role: string;
  label: string;
  description: string;
  icon: string;
  route: string;
}

export const ROLE_OPTIONS: Record<string, RoleOption> = {
  admin: {
    role: 'admin',
    label: 'Administrateur',
    description: 'Gestion complète de la plateforme',
    icon: '🛠️',
    route: '/admin'
  },
  closer: {
    role: 'closer',
    label: 'Closer',
    description: 'Gestion des ventes et négociations',
    icon: '🎯',
    route: '/closer'
  },
  collaborator: {
    role: 'collaborator',
    label: 'Collaborateur',
    description: 'Production et collaboration',
    icon: '🤝',
    route: '/collaborator'
  },
  client: {
    role: 'client',
    label: 'Client',
    description: 'Accès aux commandes et projets',
    icon: '👤',
    route: '/client'
  }
};
