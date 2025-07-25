
export interface Profile {
  id: string;
  name: string;
  email: string;
  company?: string;
  roles: string[];
  status: 'active' | 'inactive';
  avatar?: string;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  orderName: string;
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
  onboardingFormLink: string;
  nextActionDate: string;
  responsible: string;
  instructions: string;
  price: number;
  revisions?: {
    id: string;
    requestedAt: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
  }[];
}

export interface OnboardingStep {
  id: string;
  orderId: string;
  step: 'call_scheduled' | 'contract_signed' | 'payment_made' | 'form_completed';
  completed: boolean;
  completedAt?: string;
  link?: string;
}

export interface ProductTemplate {
  id: string;
  name: string;
  format: 'podcast' | 'scripted' | 'micro-interview';
  basePrice: number;
  stripeCheckoutUrl: string;
  description: string;
  quantity: number;
}

export interface CustomOption {
  id: string;
  name: string;
  description: string;
  stripeCheckoutUrl: string;
}

// Mock Users (Lead role removed)
export const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Marie Dubois',
    email: 'marie@client-example.com',
    company: 'Innovation Corp',
    roles: ['client'],
    status: 'active',
    avatar: '👩‍💼'
  },
  {
    id: '2',
    name: 'Jean Martin',
    email: 'jean@client-direct.com',
    company: 'TechSolutions',
    roles: ['client'],
    status: 'active',
    avatar: '👨‍💼'
  },
  {
    id: '3',
    name: 'Sophie Bernard',
    email: 'sophie@agency-partner.com',
    company: 'Digital Agency',
    roles: ['client'],
    status: 'active',
    avatar: '👩‍💻'
  },
  {
    id: '4',
    name: 'Pierre Durand',
    email: 'pierre@closer.com',
    company: 'illustre!',
    roles: ['closer'],
    status: 'active',
    avatar: '👨‍💻'
  },
  {
    id: '5',
    name: 'Laura Petit',
    email: 'laura@collaborator.com',
    company: 'illustre!',
    roles: ['collaborator'],
    status: 'active',
    avatar: '👩‍🎨'
  },
  {
    id: '6',
    name: 'Thomas Admin',
    email: 'thomas@admin.com',
    company: 'illustre!',
    roles: ['admin'],
    status: 'active',
    avatar: '👨‍💼'
  },
  {
    id: '7',
    name: 'Emma Multi-Role',
    email: 'emma@multi.com',
    company: 'illustre!',
    roles: ['closer', 'collaborator'],
    status: 'active',
    avatar: '👩‍🔬'
  },
  {
    id: '8',
    name: 'Alexandre Client',
    email: 'alex@startup.com',
    company: 'StartupTech',
    roles: ['client'],
    status: 'active',
    avatar: '👨‍💻'
  }
];

// Product Templates with pre-filled Stripe URLs
export const productTemplates: ProductTemplate[] = [
  {
    id: 'template-podcast-3',
    name: '3 Vidéos Podcast',
    format: 'podcast',
    basePrice: 900,
    quantity: 3,
    stripeCheckoutUrl: 'https://checkout.stripe.com/pay/cs_test_podcast_3_videos',
    description: '3 vidéos podcast professionnelles avec montage complet'
  },
  {
    id: 'template-podcast-6',
    name: '6 Vidéos Podcast',
    format: 'podcast',
    basePrice: 1700,
    quantity: 6,
    stripeCheckoutUrl: 'https://checkout.stripe.com/pay/cs_test_podcast_6_videos',
    description: '6 vidéos podcast avec package complet'
  },
  {
    id: 'template-podcast-10',
    name: '10 Vidéos Podcast',
    format: 'podcast',
    basePrice: 2300,
    quantity: 10,
    stripeCheckoutUrl: 'https://checkout.stripe.com/pay/cs_test_podcast_10_videos',
    description: '10 vidéos podcast - package premium'
  },
  {
    id: 'template-scripted-3',
    name: '3 Vidéos Scriptées',
    format: 'scripted',
    basePrice: 900,
    quantity: 3,
    stripeCheckoutUrl: 'https://checkout.stripe.com/pay/cs_test_scripted_3_videos',
    description: '3 vidéos scriptées avec scénarios sur mesure'
  },
  {
    id: 'template-scripted-6',
    name: '6 Vidéos Scriptées',
    format: 'scripted',
    basePrice: 1700,
    quantity: 6,
    stripeCheckoutUrl: 'https://checkout.stripe.com/pay/cs_test_scripted_6_videos',
    description: '6 vidéos scriptées complètes'
  },
  {
    id: 'template-scripted-10',
    name: '10 Vidéos Scriptées',
    format: 'scripted',
    basePrice: 2300,
    quantity: 10,
    stripeCheckoutUrl: 'https://checkout.stripe.com/pay/cs_test_scripted_10_videos',
    description: '10 vidéos scriptées - solution complète'
  },
  {
    id: 'template-micro-3',
    name: '3 Micro-trottoirs',
    format: 'micro-interview',
    basePrice: 900,  
    quantity: 3,
    stripeCheckoutUrl: 'https://checkout.stripe.com/pay/cs_test_micro_3_videos',
    description: '3 micro-trottoirs dynamiques'
  },
  {
    id: 'template-micro-6',
    name: '6 Micro-trottoirs',
    format: 'micro-interview',
    basePrice: 1700,
    quantity: 6,
    stripeCheckoutUrl: 'https://checkout.stripe.com/pay/cs_test_micro_6_videos',
    description: '6 micro-trottoirs avec montage créatif'
  },
  {
    id: 'template-micro-10',
    name: '10 Micro-trottoirs',
    format: 'micro-interview',
    basePrice: 2300,
    quantity: 10,
    stripeCheckoutUrl: 'https://checkout.stripe.com/pay/cs_test_micro_10_videos',
    description: '10 micro-trottoirs - package optimal'
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
    status: 'completed',
    createdAt: '2024-01-25',
    isSubcontracted: false
  },
  {
    id: 'ord-004',
    clientId: '8',
    clientName: 'Alexandre Client',
    status: 'onboarding',
    createdAt: '2024-02-01',
    isSubcontracted: false
  },
  {
    id: 'ord-005',
    clientId: '2',
    clientName: 'Jean Martin',
    status: 'onboarding',
    createdAt: '2024-02-05',
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
    onboardingFormLink: 'https://fillout.com/t/podcast-innovation-form',
    nextActionDate: '2024-02-01',
    responsible: 'Laura Petit',
    instructions: 'Interview de 30min sur les innovations technologiques. Ton décontracté, musique moderne.',
    price: 800,
    revisions: [
      {
        id: 'rev-001',
        requestedAt: '2024-01-25',
        description: 'Ajuster le volume de la musique de fond',
        status: 'completed'
      }
    ]
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
    onboardingFormLink: 'https://fillout.com/t/scripted-presentation-form',
    nextActionDate: '2024-01-28',
    responsible: 'Laura Petit',
    instructions: 'Vidéo corporate de 2-3min. Style professionnel, sous-titres FR et EN.',
    price: 1200,
    revisions: []
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
    onboardingFormLink: 'https://fillout.com/t/micro-trottoir-form',
    nextActionDate: '2024-02-05',
    responsible: 'Emma Multi-Role',
    instructions: 'Interviews courtes (1-2min) avec 5-6 clients. Montage dynamique avec transitions.',
    price: 600,
    revisions: [
      {
        id: 'rev-002',
        requestedAt: '2024-02-03',
        description: 'Revoir le montage pour accélérer les transitions',
        status: 'pending'
      }
    ]
  }
];

// Mock Onboarding Steps (corrected order)
export const mockOnboardingSteps: OnboardingStep[] = [
  // Order 1 - Complete
  { id: 'step-001', orderId: '4f6c8ee0-6f01-428b-895f-503483607ce3', step: 'call_scheduled', completed: false, link: 'https://illustre.fillout.com/rendez-vous?email=xxxxx&name=xxxxx&order=xxxxx', completedAt: '2024-01-16' },
  { id: 'step-002', orderId: '4f6c8ee0-6f01-428b-895f-503483607ce3', step: 'contract_signed', completed: false, completedAt: '2024-01-17' },
  { id: 'step-003', orderId: '4f6c8ee0-6f01-428b-895f-503483607ce3', step: 'payment_made', completed: false, link: 'https://illustre.com', completedAt: '2024-01-18' },
  { id: 'step-004', orderId: '4f6c8ee0-6f01-428b-895f-503483607ce3', step: 'form_completed', completed: false, link: 'https://illustre.fillout.com/formulaire-donboarding?email=xxxxx&name=xxxxx&order=xxxxx', completedAt: '2024-01-19' },
  
  // Order 2 - Partial
  { id: 'step-005', orderId: 'ord-002', step: 'call_scheduled', completed: true, completedAt: '2024-01-21' },
  { id: 'step-006', orderId: 'ord-002', step: 'contract_signed', completed: false },
  { id: 'step-007', orderId: 'ord-002', step: 'payment_made', completed: false },
  { id: 'step-008', orderId: 'ord-002', step: 'form_completed', completed: false },
  
  // Order 3 - Complete
  { id: 'step-009', orderId: 'ord-003', step: 'call_scheduled', completed: true, completedAt: '2024-01-26' },
  { id: 'step-010', orderId: 'ord-003', step: 'contract_signed', completed: true, completedAt: '2024-01-27' },
  { id: 'step-011', orderId: 'ord-003', step: 'payment_made', completed: true, completedAt: '2024-01-28' },
  { id: 'step-012', orderId: 'ord-003', step: 'form_completed', completed: true, completedAt: '2024-01-29' },

  // Order 4 - Just started
  { id: 'step-013', orderId: 'ord-004', step: 'call_scheduled', completed: false },
  { id: 'step-014', orderId: 'ord-004', step: 'contract_signed', completed: false },
  { id: 'step-015', orderId: 'ord-004', step: 'payment_made', completed: false },
  { id: 'step-016', orderId: 'ord-004', step: 'form_completed', completed: false },

  // Order 5 - New order
  { id: 'step-017', orderId: 'ord-005', step: 'call_scheduled', completed: false },
  { id: 'step-018', orderId: 'ord-005', step: 'contract_signed', completed: false },
  { id: 'step-019', orderId: 'ord-005', step: 'payment_made', completed: false },
  { id: 'step-020', orderId: 'ord-005', step: 'form_completed', completed: false }
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
