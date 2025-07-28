
import { useState, useEffect } from 'react';
import { profileService, userRoleService } from '@/services/supabaseService';
import type { Profile } from '@/services/supabaseService';

// Interface pour les comptes de test avec les rôles
interface TestAccount extends Profile {
  roles: string[];
}

// Comptes de test basés sur les données mockées
const TEST_ACCOUNTS: TestAccount[] = [
  {
    id: 'client-1',
    name: 'Marie Dubois',
    email: 'marie.dubois@email.com',
    company: 'Dubois Conseil',
    status: 'active',
    roles: ['client'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'closer-1',
    name: 'Jean Martin',
    email: 'jean.martin@email.com',
    company: 'Martin Sales',
    status: 'active',
    roles: ['closer'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'collaborator-1',
    name: 'Sophie Leroy',
    email: 'sophie.leroy@email.com',
    company: 'Leroy Productions',
    status: 'active',
    roles: ['collaborator'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'admin-1',
    name: 'Pierre Durand',
    email: 'pierre.durand@email.com',
    company: 'Admin Corp',
    status: 'active',
    roles: ['admin'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'multi-role-1',
    name: 'Alice Bernard',
    email: 'alice.bernard@email.com',
    company: 'Bernard & Associates',
    status: 'active',
    roles: ['client', 'closer'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useTestAccounts = () => {
  const [currentUser, setCurrentUser] = useState<TestAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un délai de chargement
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const loginAsTestUser = async (testAccount: TestAccount) => {
    setCurrentUser(testAccount);
    console.log('Logged in as test user:', testAccount.name);
  };

  const logout = () => {
    setCurrentUser(null);
    console.log('Logged out');
  };

  const getTestAccounts = () => TEST_ACCOUNTS;

  const getCurrentUser = () => currentUser;

  // Auto-redirect based on user roles
  const getDefaultRoute = (user: TestAccount) => {
    if (user.roles.includes('admin')) return '/admin';
    if (user.roles.includes('closer')) return '/closer';
    if (user.roles.includes('collaborator')) return '/collaborator';
    if (user.roles.includes('client')) return '/client';
    return '/client'; // Default fallback
  };

  return {
    currentUser,
    loading,
    loginAsTestUser,
    logout,
    getTestAccounts,
    getCurrentUser,
    getDefaultRoute
  };
};
