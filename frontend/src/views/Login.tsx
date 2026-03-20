import { useState, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, login } = useAuth()
  const pendingRedirect = useRef<string | null>(null)

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
    const dest = pendingRedirect.current ?? (user.role === 'provider' ? '/provider' : '/patient')
    return <Navigate to={dest} replace />
  }

  const isProvider = role === 'provider'

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
      if (!res.ok) { setError(data.detail || 'Authentication failed'); return }
      pendingRedirect.current = isRegister && data.role === 'patient'
        ? '/patient/my-data'
        : data.role === 'provider' ? '/provider' : '/patient'
      login({ email, name: data.name, role: data.role, token: data.access_token, job_title: data.job_title, institution: data.institution })
    } catch {
      setError('Network error — is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  // Theme switches based on role
  const bg = isProvider ? 'var(--provider-bg)' : 'var(--patient-bg)'
  const surface = isProvider ? 'var(--provider-surface)' : 'var(--patient-surface)'
  const border = isProvider ? 'var(--provider-border)' : 'var(--patient-border)'
  const text = isProvider ? 'var(--provider-text)' : 'var(--patient-text)'
  const textMuted = isProvider ? 'var(--provider-text-muted)' : 'var(--patient-text-muted)'
  const accent = isProvider ? 'var(--provider-accent)' : 'var(--patient-accent)'
  const accentHover = isProvider ? 'var(--provider-accent-hover)' : 'var(--patient-accent-hover)'

  const inputStyle: React.CSSProperties = {
    background: isProvider ? 'var(--provider-surface-2)' : 'var(--patient-surface)',
    border: `1px solid ${border}`,
    borderRadius: 'var(--radius-sm)',
    padding: '0.7rem 1rem',
    color: text,
    fontSize: '0.875rem',
    fontFamily: 'var(--font-body)',
    width: '100%',
    outline: 'none',
  }

  const demoAccounts = [
    { email: 'hailey@unchealth.com', label: 'Dr. Hailey', sub: 'UNC Health · Pediatrician', role: 'provider' },
    { email: 'sans@dukehealth.com', label: 'Dr. Sans', sub: 'Duke Health · Physical Therapist', role: 'provider' },
    { email: 'sanders@sanderstherapy.com', label: 'Sanders Meander', sub: 'Private Therapy · LMHC', role: 'provider' },
    { email: 'bob@bobtheprivatedentist.com', label: 'Dr. Bob', sub: 'Private Dentist', role: 'provider' },
    { email: 'patient@demo.com', label: 'Jason Yin', sub: 'Patient', role: 'patient' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: bg,
      display: 'flex',
      fontFamily: 'var(--font-body)',
      transition: 'background 0.3s ease',
    }}>
      {/* Left panel — branding */}
      <div style={{
        width: '40%',
        padding: '4rem 3rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: `1px solid ${border}`,
      }}>
        <div>
          <p style={{
            fontSize: '0.7rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: accent,
            marginBottom: '0.75rem',
            fontWeight: 500,
          }}>
            Health Portal
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            fontWeight: 300,
            color: text,
            lineHeight: 1.15,
            marginBottom: '1rem',
          }}>
            BeMyBest<em style={{ fontStyle: 'italic' }}>Visit</em>
          </h1>
          <p style={{ color: textMuted, fontSize: '0.875rem', lineHeight: 1.7 }}>
            Your health records, unified and in your hands.
          </p>
        </div>

        {/* Role toggle */}
        {!isRegister && (
          <div>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: accent, marginBottom: '0.75rem', fontWeight: 500 }}>
              Signing in as
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['patient', 'provider'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  style={{
                    flex: 1,
                    background: role === r ? accent : 'none',
                    border: `1px solid ${role === r ? accent : border}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.4rem 1rem',
                    color: role === r ? 'white' : textMuted,
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-body)',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1,
        padding: '4rem 3rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        maxWidth: '480px',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.5rem',
          fontWeight: 300,
          color: text,
          marginBottom: '0.25rem',
        }}>
          {isRegister ? 'Create account' : 'Welcome back'}
        </h2>
        <p style={{ color: textMuted, fontSize: '0.85rem', marginBottom: '2rem' }}>
          {isRegister ? 'Fill in your details to get started.' : 'Sign in to continue.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {isRegister && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
              {(['patient', 'provider'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  style={{
                    flex: 1,
                    background: role === r ? accent : 'none',
                    border: `1px solid ${role === r ? accent : border}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem',
                    color: role === r ? 'white' : textMuted,
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-body)',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          {isRegister && (
            <input
              placeholder={role === 'provider' ? 'Full name with title (e.g. Dr. Smith)' : 'Full name'}
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={inputStyle}
            />
          )}

          {isRegister && role === 'provider' && (
            <>
              <input placeholder="Job title (e.g. Pediatrician)" value={jobTitle} onChange={e => setJobTitle(e.target.value)} style={inputStyle} />
              <input placeholder="Institution (e.g. UNC Health)" value={institution} onChange={e => setInstitution(e.target.value)} style={inputStyle} />
            </>
          )}

          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />

          {error && (
            <p style={{ color: isProvider ? 'var(--provider-danger)' : 'var(--patient-danger)', fontSize: '0.8rem', margin: 0 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? border : accent,
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '0.8rem',
              color: 'white',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.25rem',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = accentHover }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = accent }}
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError('') }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted, fontSize: '0.8rem', fontFamily: 'var(--font-body)', textAlign: 'left', padding: 0 }}
          >
            {isRegister ? 'Already have an account? Sign in →' : "Don't have an account? Register →"}
          </button>
        </form>

        {/* Demo accounts */}
        {!isRegister && (
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: `1px solid ${border}` }}>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: textMuted, marginBottom: '0.75rem', fontWeight: 500 }}>
              Demo accounts — password: password
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {demoAccounts.map(account => (
                <div
                  key={account.email}
                  onClick={() => { setEmail(account.email); setPassword('password'); setRole(account.role as 'provider' | 'patient') }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    border: `1px solid transparent`,
                    transition: 'border-color 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.background = surface }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'none' }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: '0.825rem', color: text, fontWeight: 500, margin: 0 }}>{account.label}</p>
                    <p style={{ fontSize: '0.75rem', color: textMuted, margin: 0 }}>{account.sub}</p>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: accent, fontFamily: 'monospace' }}>
                    {account.email.split('@')[0]}
                  </span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.75rem', color: textMuted, marginTop: '0.5rem' }}>
              Click a row to autofill
            </p>
          </div>
        )}
      </div>
    </div>
  )
}