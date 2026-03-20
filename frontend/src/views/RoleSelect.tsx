import { useNavigate } from 'react-router-dom'

export default function RoleSelect() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--patient-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-body)',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '420px', padding: '2rem' }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.75rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--patient-accent)',
          marginBottom: '1rem',
          fontWeight: 500,
        }}>
          Health Portal
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '3rem',
          fontWeight: 300,
          color: 'var(--patient-text)',
          lineHeight: 1.15,
          marginBottom: '0.5rem',
        }}>
          BeMyBest<em style={{ fontStyle: 'italic' }}>Visit</em>
        </h1>
        <p style={{
          color: 'var(--patient-text-muted)',
          fontSize: '0.95rem',
          marginBottom: '3rem',
          lineHeight: 1.6,
        }}>
          Your health records, unified and in your hands.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('/login?role=patient')}
            style={{
              background: 'var(--patient-accent)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '0.9rem 2rem',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              cursor: 'pointer',
              letterSpacing: '0.02em',
              transition: 'background var(--transition)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--patient-accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--patient-accent)')}
          >
            I'm a Patient
          </button>
          <button
            onClick={() => navigate('/login?role=provider')}
            style={{
              background: 'var(--patient-text)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '0.9rem 2rem',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              cursor: 'pointer',
              letterSpacing: '0.02em',
              transition: 'background var(--transition)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#333')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--patient-text)')}
          >
            I'm a Provider
          </button>
        </div>
      </div>
    </div>
  )
}