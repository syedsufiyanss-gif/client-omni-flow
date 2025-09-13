import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { User, Session } from '@supabase/supabase-js'

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

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, metadata?: any) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<any>
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}