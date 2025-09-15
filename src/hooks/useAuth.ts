import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface Profile {
  id: string
  company_id: string
  email: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  phone: string | null
  role: 'admin' | 'manager' | 'sales' | 'finance' | 'support' | 'user'
  permissions: any
  is_active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
  })

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Supabase not configured: mark as not loading so UI can render LoginForm or placeholder
      setAuthState(prev => ({ ...prev, loading: false }))
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({ ...prev, session, user: session?.user ?? null }))
      
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setAuthState(prev => ({ ...prev, loading: false }))
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setAuthState(prev => ({ ...prev, session, user: session?.user ?? null }))
      
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setAuthState(prev => ({ ...prev, profile: null, loading: false }))
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured) {
      setAuthState(prev => ({ ...prev, loading: false }))
      return
    }
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        setAuthState(prev => ({ ...prev, loading: false }))
        return
      }

      setAuthState(prev => ({ ...prev, profile, loading: false }))
    } catch (error) {
      console.error('Error fetching profile:', error)
      setAuthState(prev => ({ ...prev, loading: false }))
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      const error = new Error('Supabase is not configured')
      console.error('Error signing in:', error)
      return { data: null, error }
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error signing in:', error)
      return { data: null, error }
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    if (!isSupabaseConfigured) {
      const error = new Error('Supabase is not configured')
      console.error('Error signing up:', error)
      return { data: null, error }
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error signing up:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      console.error('Error signing out: Supabase is not configured')
      return
    }
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!authState.user) return { error: 'Not authenticated' }
    if (!isSupabaseConfigured) {
      const error = new Error('Supabase is not configured')
      console.error('Error updating profile:', error)
      return { data: null, error }
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', authState.user.id)
        .select()
        .single()

      if (error) throw error

      setAuthState(prev => ({ ...prev, profile: data }))
      return { data, error: null }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { data: null, error }
    }
  }

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAdmin: authState.profile?.role === 'admin',
    hasPermission: (permission: string) => {
      if (authState.profile?.role === 'admin') return true
      return authState.profile?.permissions?.includes?.(permission) || false
    },
  }
}