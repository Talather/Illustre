
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLE_OPTIONS } from '@/types/auth';

const ROLE_STORAGE_KEY = 'preferred_role';

export const useRoleSelection = (userRoles: string[]) => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (userRoles.length === 0) return;

    if (userRoles.length === 1) {
      // Single role - auto-select
      setSelectedRole(userRoles[0]);
      return;
    }

    // Multiple roles - check for saved preference
    const savedRole = localStorage.getItem(ROLE_STORAGE_KEY);
    if (savedRole && userRoles.includes(savedRole)) {
      setSelectedRole(savedRole);
    }
  }, [userRoles]);

  const selectRole = (role: string, remember: boolean = false) => {
    setSelectedRole(role);
    
    if (remember) {
      localStorage.setItem(ROLE_STORAGE_KEY, role);
    } else {
      localStorage.removeItem(ROLE_STORAGE_KEY);
    }

    // Navigate to the appropriate route
    const roleOption = ROLE_OPTIONS[role];
    if (roleOption) {
      navigate(roleOption.route, { replace: true });
    }
  };

  const switchRole = (role: string) => {
    if (userRoles.includes(role)) {
      selectRole(role, true); // Remember when switching manually
    }
  };

  const clearRolePreference = () => {
    localStorage.removeItem(ROLE_STORAGE_KEY);
    setSelectedRole(null);
  };

  const needsRoleSelection = userRoles.length > 1 && !selectedRole;

  return {
    selectedRole,
    needsRoleSelection,
    selectRole,
    switchRole,
    clearRolePreference,
  };
};
