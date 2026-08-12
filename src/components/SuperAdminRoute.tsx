import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function SuperAdminRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-500">Loading...</div>
  }

  if (!user) return <Navigate to="/login" replace />
  if (profile?.role !== 'superadmin') return <Navigate to="/" replace />

  return <>{children}</>
}