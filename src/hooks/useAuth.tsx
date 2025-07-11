
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserRole = Database['public']['Tables']['user_roles']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  userRoles: UserRole[];
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: string, organizationId?: string) => boolean;
  retry: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Timeout pour éviter les chargements infinis
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('⏰ Auth loading timeout - forcing completion');
        setLoading(false);
        setError('Timeout lors du chargement de l\'authentification');
      }
    }, 10000); // 10 secondes max

    return () => clearTimeout(timeout);
  }, [loading]);

  const fetchUserData = async (userId: string) => {
    try {
      console.log('🔍 Fetching user data for:', userId);
      
      // Fetch profile avec fallback robust
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ Profile fetch error:', profileError);
        throw new Error(`Erreur profil: ${profileError.message}`);
      }

      console.log('👤 Profile data:', profileData);
      setProfile(profileData);

      // Fetch user roles avec fallback robust
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      if (rolesError) {
        console.error('❌ Roles fetch error:', rolesError);
        // Pour l'instant, continuer avec un tableau vide mais signaler l'erreur
        console.warn('⚠️ Using empty roles array due to fetch error');
        setUserRoles([]);
      } else {
        console.log('🎭 User roles:', rolesData);
        setUserRoles(rolesData || []);
      }

      // Vérifier si l'utilisateur a au moins un rôle ou un profil
      if (!profileData && (!rolesData || rolesData.length === 0)) {
        console.warn('⚠️ User has no profile and no roles');
        setError('Votre compte n\'a pas encore été configuré. Contactez l\'administrateur.');
        return;
      }

    } catch (error: any) {
      console.error('❌ Error fetching user data:', error);
      setError(error.message || 'Erreur lors du chargement des données utilisateur');
    }
  };

  const retry = () => {
    console.log('🔄 Retrying auth initialization');
    setError(null);
    setLoading(true);
    
    if (session?.user) {
      fetchUserData(session.user.id).finally(() => {
        setLoading(false);
      });
    } else {
      // Refetch session
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.error('❌ Session retry error:', error);
          setError('Erreur de session');
        } else if (session?.user) {
          fetchUserData(session.user.id).finally(() => {
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      });
    }
  };

  useEffect(() => {
    console.log('🚀 Initializing auth...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ Session fetch error:', error);
        setError('Erreur de session');
        setLoading(false);
        return;
      }

      console.log('📱 Initial session:', session?.user?.email || 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id).finally(() => {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email || 'No user');
        
        setSession(session);
        setUser(session?.user ?? null);
        setError(null);
        
        if (session?.user) {
          setLoading(true);
          await fetchUserData(session.user.id);
          setLoading(false);
        } else {
          setProfile(null);
          setUserRoles([]);
          setLoading(false);
        }
      }
    );

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    setError(null);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const hasRole = (role: string, organizationId?: string) => {
    if (!userRoles.length) return false;
    
    return userRoles.some(userRole => {
      const roleMatches = userRole.role === role;
      if (organizationId) {
        return roleMatches && userRole.organization_id === organizationId;
      }
      return roleMatches;
    });
  };

  const value = {
    user,
    profile,
    userRoles,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    hasRole,
    retry,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
