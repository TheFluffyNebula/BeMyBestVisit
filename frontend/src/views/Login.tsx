import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()

  const [isRegister, setIsRegister] = useState(false)
  const [role, setRole] = useState<'provider' | 'patient'>('patient')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Already logged in — redirect to correct dashboard
  if (user) {
    return <Navigate to={user.role === 'provider' ? '/provider' : '/patient'} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = isRegister ? '/api/auth/register' : '/api/auth/login'
      const body = isRegister ? { email, password, name, role } : { email, password }

      const res = await fetch(`http://localhost:8000${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.detail || 'Authentication failed')
        return
      }

      login({ email, name: data.name, role: data.role, token: data.access_token })
      navigate(data.role === 'provider' ? '/provider' : '/patient', { replace: true })
    } catch {
      setError('Network error — is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '15vh' }}>
      <h1>BeMyBestVisit</h1>
      <div style={{ maxWidth: '360px', margin: '2rem auto', textAlign: 'left' }}>
        <h2>{isRegister ? 'Create Account' : 'Sign In'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          {isRegister && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem' }}>Role</label>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <label>
                  <input
                    type="radio"
                    value="patient"
                    checked={role === 'patient'}
                    onChange={() => setRole('patient')}
                  />{' '}
                  Patient
                </label>
                <label>
                  <input
                    type="radio"
                    value="provider"
                    checked={role === 'provider'}
                    onChange={() => setRole('provider')}
                  />{' '}
                  Provider
                </label>
              </div>
            </div>
          )}

          {isRegister && (
            <input
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Register' : 'Sign In'}
          </button>

          {!isRegister && (
            <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
              Demo — provider@demo.com / patient@demo.com (password: password)
            </p>
          )}

          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError('') }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', color: '#555' }}
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </form>
      </div>
    </div>
  )
}
