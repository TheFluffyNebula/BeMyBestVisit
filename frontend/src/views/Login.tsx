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
  const [jobTitle, setJobTitle] = useState('')
  const [institution, setInstitution] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    return <Navigate to={user.role === 'provider' ? '/provider' : '/patient'} replace />
  }

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = isRegister ? '/api/auth/register' : '/api/auth/login'
      const body = isRegister
        ? { email, password, name, role, job_title: jobTitle || null, institution: institution || null }
        : { email, password }

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

      login({
        email,
        name: data.name,
        role: data.role,
        token: data.access_token,
        job_title: data.job_title,
        institution: data.institution,
      })
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
                  <input type="radio" value="patient" checked={role === 'patient'} onChange={() => setRole('patient')} />{' '}
                  Patient
                </label>
                <label>
                  <input type="radio" value="provider" checked={role === 'provider'} onChange={() => setRole('provider')} />{' '}
                  Provider
                </label>
              </div>
            </div>
          )}

          {isRegister && (
            <input
              placeholder={role === 'provider' ? 'Full name with title (e.g. Dr. Smith)' : 'Full Name'}
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          )}

          {isRegister && role === 'provider' && (
            <>
              <input
                placeholder="Job title (e.g. Pediatrician, Cardiologist)"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
              />
              <input
                placeholder="Institution (e.g. UNC Health)"
                value={institution}
                onChange={e => setInstitution(e.target.value)}
              />
            </>
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
            <div style={{ fontSize: '0.8rem', color: '#666', borderTop: '1px solid #eee', paddingTop: '0.75rem' }}>
              <p style={{ margin: '0 0 0.4rem', fontWeight: 'bold' }}>Demo accounts (password: password)</p>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    { email: 'hailey@unchealth.com', label: 'Dr. Hailey — UNC Health' },
                    { email: 'sans@dukehealth.com', label: 'Dr. Sans — Duke Health' },
                    { email: 'sanders@sanderstherapy.com', label: 'Sanders Meander — Private Therapy' },
                    { email: 'bob@bobtheprivatedentist.com', label: 'Dr. Bob — Private Dentist' },
                    { email: 'patient@demo.com', label: 'Jason Yin — Patient' },
                  ].map(({ email, label }) => (
                    <tr key={email} style={{ cursor: 'pointer' }} onClick={() => setEmail(email)}>
                      <td style={{ padding: '0.2rem 0.4rem', color: '#444' }}>{label}</td>
                      <td style={{ padding: '0.2rem 0.4rem', color: '#999', fontFamily: 'monospace' }}>{email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ margin: '0.4rem 0 0', color: '#aaa' }}>Click a row to fill in the email</p>
            </div>
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
