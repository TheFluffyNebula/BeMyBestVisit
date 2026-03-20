import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface Props {
  role: 'provider' | 'patient'
  children: React.ReactNode
}

export default function ProtectedRoute({ role, children }: Props) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== role) {
    return <Navigate to={user.role === 'provider' ? '/provider' : '/patient'} replace />
  }

  return <>{children}</>
}
