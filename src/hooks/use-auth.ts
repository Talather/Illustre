import { useState, useEffect, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from './../integrations/supabase/client.js'
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

interface UseAuthReturn {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signUp: (data: CreateUserData) => Promise<{ success: boolean; error?: string }>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>
  resetPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>
}
import { createClient } from '@supabase/supabase-js';


export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(false)
  

  // Fetch user profile data
  const fetchProfile = async (userId: string ): Promise<UserProfile | null> => {
    try {
      console.log("IN FETCH" , userId);
      
     
      
      // const { data: { session } } = await supabase.auth.getSession();
      // console.log("Initial session:", session);
      // console.log("Access token:", session?.access_token);
      const { data, error } = await (supabase as any)
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      console.log(data);
      console.log(error);
      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      // Add compatibility fields
      const profile: UserProfile = {
        ...data,
        name: data.full_name, // Map full_name to name for compatibility
        status: 'active' as const // Default status for compatibility
      }
      setLoading(false);

      
      return profile
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    // console.log(session);

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null)
          console.log("INITIAL SESSION", initialSession);
          console.log("USER", initialSession?.user);
          
          if (initialSession?.user) {

            const userProfile = await fetchProfile(initialSession.user.id)
            setProfile(userProfile)
          }
          
          setLoading(false)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Defer to next tick
      setTimeout(async () => {
        console.log("Deferred auth event", event, session);
        setSession(session);
        setUser(session?.user ?? null);
  
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setProfile(profile);
        } else {
          setProfile(null);
        setLoading(false);

        }
  
      }, 0);
    });
  
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  // useEffect(() => {
  //   supabase.auth.getSession().then(({ data }) => {
  //     console.log(data);
  //     if (data.session) {
  //       console.log("Hydrated session (manual):", data.session);
  //       setSession(data.session);
  //       setUser(data.session.user);
  //       fetchProfile(data.session.user.id, data.session.access_token).then(setProfile);
  //       setLoading(false);
  //     } else {
  //       console.log("No session yet");
  //     }
  //   });
  
 
  // }, []);

  // Sign up function (client-side registration)
  const signUp = async (data: CreateUserData): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name
          }
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

 
  // Sign in function
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Clear current session first if exists
      window.localStorage.clear();

      // Clear local state
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Sign in with new credentials
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
    
      if (error) {
        return { success: false, error: error.message }
      }
     

      return { success: true }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Sign out function
  const signOut = async (): Promise<void> => {
    window.localStorage.clear();
    await supabase.auth.signOut();
    // Navigation will be handled by the auth state change
  }

  // Update profile function
  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    try {
      const { error } = await (supabase as any)
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        return { success: false, error: error.message }
      }

      // Refresh profile data
      const updatedProfile = await fetchProfile(user.id)
      setProfile(updatedProfile)
      console.log("PROFILE UPDATED", updatedProfile);

      return { success: true }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Reset password method using edge function
  const resetPassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Get current session token for authentication
      const { data: { session } } = await supabase.auth.getSession()
      // console.log(session?.access_token);
      if (!session?.access_token) {
        return { success: false, error: 'No valid session found' }
      }
      // Call the deployed edge function
     
     console.log(user.email);
      const { data, error } = await supabase.functions.invoke('resetPassword', {
        body: {
          email: user.email,
          new_password: newPassword,
        }
      });
      console.log(error);
      console.log(data);
      // const response = await fetch('https://kklvthnshgqhmdhuuhzr.supabase.co/functions/v1/resetPassword', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${session.access_token}`
      //   },
      //   body: JSON.stringify({
      //     email: user.email,
      //     new_password: newPassword,
      //     userId: user.id
      //   })
      // })
      // console.log(response);
      // const result = await response.data 
      // console.log(result);

      // if (!response.ok) {
      //   return { success: false, error: result.error || 'Failed to reset password' }
      // }

      if (data.user) {

       
        // Refresh profile data to get updated tempPass status
        const updatedProfile = await fetchProfile(user.id)
        setProfile(updatedProfile);
        console.log("PROFILE UPDATED", updatedProfile);
        
        return { success: true }
      } else {
        return { success: false, error: error || 'Failed to reset password' }
      }
    } catch (error) {
      console.error('Error calling reset password function:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  return {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword
  }
}
