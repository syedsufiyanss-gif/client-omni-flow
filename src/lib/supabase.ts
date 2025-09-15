import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.warn('Missing Supabase environment variables. Supabase features are disabled until configured.')
}

const supabaseFallback = new Proxy(
  {},
  {
    get() {
      throw new Error('Supabase is not configured. Connect Supabase to enable this feature.')
    },
  },
) as any

export const supabase: any = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseAnonKey!) : supabaseFallback

// Database types
export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          slug: string
          domain: string | null
          logo_url: string | null
          address: string | null
          phone: string | null
          email: string | null
          tax_number: string | null
          currency: string
          timezone: string
          settings: any
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          domain?: string | null
          logo_url?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          tax_number?: string | null
          currency?: string
          timezone?: string
          settings?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          domain?: string | null
          logo_url?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          tax_number?: string | null
          currency?: string
          timezone?: string
          settings?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
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
        Insert: {
          id: string
          company_id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'admin' | 'manager' | 'sales' | 'finance' | 'support' | 'user'
          permissions?: any
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'admin' | 'manager' | 'sales' | 'finance' | 'support' | 'user'
          permissions?: any
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          company_id: string
          assigned_to: string | null
          first_name: string
          last_name: string | null
          email: string | null
          phone: string | null
          company_name: string | null
          title: string | null
          source: string | null
          status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'lost'
          score: number
          value: number | null
          notes: string | null
          tags: string[] | null
          custom_fields: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          assigned_to?: string | null
          first_name: string
          last_name?: string | null
          email?: string | null
          phone?: string | null
          company_name?: string | null
          title?: string | null
          source?: string | null
          status?: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'lost'
          score?: number
          value?: number | null
          notes?: string | null
          tags?: string[] | null
          custom_fields?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          assigned_to?: string | null
          first_name?: string
          last_name?: string | null
          email?: string | null
          phone?: string | null
          company_name?: string | null
          title?: string | null
          source?: string | null
          status?: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'lost'
          score?: number
          value?: number | null
          notes?: string | null
          tags?: string[] | null
          custom_fields?: any
          created_at?: string
          updated_at?: string
        }
      }
      // Add more table types as needed...
    }
  }
}