
export interface Profile {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: 'active' | 'inactive';
  avatar?: string;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  status: 'onboarding' | 'in_progress' | 'completed';
  createdAt: string;
  isSubcontracted: boolean;
  finalClientName?: string;
  finalClientEmail?: string;
  customBranding?: {
    logo: string;
    primaryColor: string;
    secondaryColor: string;
  };
}

export interface OrderProduct {
  id: string;
  orderId: string;
  title: string;
  format: 'podcast' | 'scripted' | 'micro-interview';
  status: 'pending' | 'files_requested' | 'in_production' | 'delivered' | 'revision_requested';
  deliverableLink: string;
  fileDepositLink: string;
  preparationLink: string;
  nextActionDate: string;
  responsible: string;
  instructions: string;
  price: number;
}

export interface OnboardingStep {
  id: string;
  orderId: string;
  step: 'contract_signed' | 'form_completed' | 'payment_made' | 'call_scheduled';
  completed: boolean;
  completedAt?: string;
}

// Mock Users
export const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Marie Dubois',
    email: 'marie@lead-example.com',
    roles: ['lead'],
    status: 'active',
    avatar: '👩‍💼'
  },
  {
    id: '2',
    name: 'Jean Martin',
    email: 'jean@client-direct.com',
    roles: ['client'],
    status: 'active',
    avatar: '👨‍💼'
  },
  {
    id: '3',
    name: 'Sophie Bernard',
    email: 'sophie@agency-partner.com',
    roles: ['client'],
    status: 'active',
    avatar: '👩‍💻'
  },
  {
    id: '4',
    name: 'Pierre Durand',
    email: 'pierre@closer.com',
    roles: ['closer'],
    status: 'active',
    avatar: '👨‍💻'
  },
  {
    id: '5',
    name: 'Laura Petit',
    email: 'laura@collaborator.com',
    roles: ['collaborator'],
    status: 'active',
    avatar: '👩‍🎨'
  },
  {
    id: '6',
    name: 'Thomas Admin',
    email: 'thomas@admin.com',
    roles: ['admin'],
    status: 'active',
    avatar: '👨‍💼'
  },
  {
    id: '7',
    name: 'Emma Multi-Role',
    email: 'emma@multi.com',
    roles: ['closer', 'collaborator'],
    status: 'active',
    avatar: '👩‍🔬'
  }
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: 'ord-001',
    clientId: '2',
    clientName: 'Jean Martin',
    status: 'in_progress',
    createdAt: '2024-01-15',
    isSubcontracted: false
  },
  {
    id: 'ord-002',
    clientId: '3',
    clientName: 'Sophie Bernard',
    status: 'onboarding',
    createdAt: '2024-01-20',
    isSubcontracted: true,
    finalClientName: 'TechCorp Solutions',
    finalClientEmail: 'contact@techcorp.com',
    customBranding: {
      logo: '🏢',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF'
    }
  },
  {
    id: 'ord-003',
    clientId: '1',
    clientName: 'Marie Dubois',
    status: 'onboarding',
    createdAt: '2024-01-25',
    isSubcontracted: false
  }
];

// Mock Order Products
export const mockOrderProducts: OrderProduct[] = [
  {
    id: 'prod-001',
    orderId: 'ord-001',
    title: 'Podcast - Innovation Tech',
    format: 'podcast',
    status: 'in_production',
    deliverableLink: 'https://frame.io/project/podcast-innovation-tech',
    fileDepositLink: 'https://dropbox.com/deposit/podcast-files',
    preparationLink: 'https://notion.so/podcast-preparation',
    nextActionDate: '2024-02-01',
    responsible: 'Laura Petit',
    instructions: 'Interview de 30min sur les innovations technologiques. Ton décontracté, musique moderne.',
    price: 800
  },
  {
    id: 'prod-002',
    orderId: 'ord-001',
    title: 'Vidéo scriptée - Présentation entreprise',
    format: 'scripted',
    status: 'delivered',
    deliverableLink: 'https://frame.io/project/scripted-presentation',
    fileDepositLink: 'https://dropbox.com/deposit/scripted-files',
    preparationLink: 'https://notion.so/scripted-preparation',
    nextActionDate: '2024-01-28',
    responsible: 'Laura Petit',
    instructions: 'Vidéo corporate de 2-3min. Style professionnel, sous-titres FR et EN.',
    price: 1200
  },
  {
    id: 'prod-003',
    orderId: 'ord-002',
    title: 'Micro-trottoir - Satisfaction client',
    format: 'micro-interview',
    status: 'files_requested',
    deliverableLink: 'https://frame.io/project/micro-trottoir',
    fileDepositLink: 'https://dropbox.com/deposit/micro-files',
    preparationLink: 'https://notion.so/micro-preparation',
    nextActionDate: '2024-02-05',
    responsible: 'Emma Multi-Role',
    instructions: 'Interviews courtes (1-2min) avec 5-6 clients. Montage dynamique avec transitions.',
    price: 600
  }
];

// Mock Onboarding Steps
export const mockOnboardingSteps: OnboardingStep[] = [
  // Order 1 - Complete
  { id: 'step-001', orderId: 'ord-001', step: 'contract_signed', completed: true, completedAt: '2024-01-16' },
  { id: 'step-002', orderId: 'ord-001', step: 'form_completed', completed: true, completedAt: '2024-01-17' },
  { id: 'step-003', orderId: 'ord-001', step: 'payment_made', completed: true, completedAt: '2024-01-18' },
  { id: 'step-004', orderId: 'ord-001', step: 'call_scheduled', completed: true, completedAt: '2024-01-19' },
  
  // Order 2 - Partial
  { id: 'step-005', orderId: 'ord-002', step: 'contract_signed', completed: false },
  { id: 'step-006', orderId: 'ord-002', step: 'form_completed', completed: true, completedAt: '2024-01-21' },
  { id: 'step-007', orderId: 'ord-002', step: 'payment_made', completed: false },
  { id: 'step-008', orderId: 'ord-002', step: 'call_scheduled', completed: false },
  
  // Order 3 - Just started
  { id: 'step-009', orderId: 'ord-003', step: 'contract_signed', completed: false },
  { id: 'step-010', orderId: 'ord-003', step: 'form_completed', completed: false },
  { id: 'step-011', orderId: 'ord-003', step: 'payment_made', completed: false },
  { id: 'step-012', orderId: 'ord-003', step: 'call_scheduled', completed: false }
];

// Auth simulation
export const mockAuth = {
  currentUser: null as Profile | null,
  login: (email: string) => {
    const user = mockProfiles.find(p => p.email === email);
    if (user) {
      mockAuth.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  },
  logout: () => {
    mockAuth.currentUser = null;
    localStorage.removeItem('currentUser');
  },
  getCurrentUser: () => {
    if (mockAuth.currentUser) return mockAuth.currentUser;
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      mockAuth.currentUser = JSON.parse(stored);
      return mockAuth.currentUser;
    }
    return null;
  }
};

// Helper functions
export const getOrdersByClientId = (clientId: string) => {
  return mockOrders.filter(order => order.clientId === clientId);
};

export const getProductsByOrderId = (orderId: string) => {
  return mockOrderProducts.filter(product => product.orderId === orderId);
};

export const getOnboardingStepsByOrderId = (orderId: string) => {
  return mockOnboardingSteps.filter(step => step.orderId === orderId);
};

export const getUsersByRole = (role: string) => {
  return mockProfiles.filter(profile => profile.roles.includes(role));
};

export const hasRole = (user: Profile | null, role: string) => {
  return user?.roles.includes(role) || false;
};
