import { ReactNode } from 'react'
import { useAuthContext } from './AuthProvider'
import { LoginForm } from './LoginForm'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'admin' | 'manager' | 'sales' | 'finance' | 'support' | 'user'
  requiredPermission?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredPermission 
}: ProtectedRouteProps) {
  const { user, profile, loading, hasPermission } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return <LoginForm />
  }

  // Check role requirement
  if (requiredRole) {
    const roleHierarchy = {
      'user': 0,
      'support': 1,
      'sales': 2,
      'finance': 3,
      'manager': 4,
      'admin': 5
    }
    
    const userRoleLevel = roleHierarchy[profile.role] || 0
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0
    
    if (userRoleLevel < requiredRoleLevel) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      )
    }
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have the required permission to access this page.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}