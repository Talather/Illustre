import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { User, Session } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  email: string
  full_name: string
  name: string // Alias for full_name for compatibility
  roles: string[]
  status: 'active' | 'inactive' // Default status
  tempPass: boolean
  created_at: string
  updated_at: string
}

interface CreateUserData {
  email: string
  password: string
  full_name: string
  company_name?: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  needsPasswordReset: boolean
  signUp: (data: CreateUserData) => Promise<{ success: boolean; error?: string }>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>
  resetPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>
  hasRole: (role: string) => boolean
  isAdmin: boolean
  isClient: boolean
  isCloser: boolean
  isCollaborator: boolean
  getDefaultRoute: () => string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth()

  // Helper functions to check user roles
  const hasRole = (role: string): boolean => {
    return auth.profile?.roles?.includes(role) ?? false
  }

  const isAdmin = hasRole('admin')
  const isClient = hasRole('client')
  const isCloser = hasRole('closer')
  const isCollaborator = hasRole('collaborator')

  const needsPasswordReset = isClient && (auth.profile?.tempPass === true)

  // Get default route based on user role
  const getDefaultRoute = (): string => {
    if (isAdmin) return '/admin'
    if (isCloser) return '/closer'
    if (isCollaborator) return '/collaborator'
    if (isClient) return '/client'
    return '/'
  }

  const contextValue: AuthContextType = {
    ...auth,
    hasRole,
    isAdmin,
    isClient,
    isCloser,
    isCollaborator,
    needsPasswordReset,
    getDefaultRoute
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

// Protected Route Component
interface ProtectedRouteProps {
  children: ReactNode
  requiredRoles?: string[]
  fallback?: ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  fallback = <div>Access denied</div>
}) => {
  const { user, profile, loading } = useAuthContext()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user || !profile) {
    return <div>Please sign in to access this page</div>
  }

  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => 
      profile.roles?.includes(role)
    )
    
    if (!hasRequiredRole) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}
