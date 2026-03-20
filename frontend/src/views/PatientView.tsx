import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface Visit {
  id: string
  date: string
  institution: string
  doctor_name: string
  job_title: string
  notes: string
  transcript: string
  summary: string
}

export default function PatientView() {
  const { user, logout } = useAuth()
  const [visits, setVisits] = useState<Visit[]>([])
  const navigate = useNavigate()
  const authHeader = { Authorization: `Bearer ${user?.token}` }

  useEffect(() => {
    fetch('http://localhost:8000/api/visits', { headers: authHeader })
      .then(res => res.json())
      .then(data => setVisits(data))
  }, [])

  const handleLogout = () => { logout(); navigate('/login', { replace: true }) }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--patient-bg)', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div style={{
        background: 'var(--patient-surface)',
        borderBottom: '1px solid var(--patient-border)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.25rem',
          fontWeight: 300,
          color: 'var(--patient-text)',
        }}>
          BeMyBestVisit
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--patient-text-muted)' }}>{user?.name}</span>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: '1px solid var(--patient-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.4rem 0.9rem',
              fontSize: '0.8rem',
              color: 'var(--patient-text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            Log out
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--patient-accent)', marginBottom: '0.4rem', fontWeight: 500 }}>
              Welcome back
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'var(--patient-text)' }}>
              {user?.name}
            </h1>
          </div>
          <button
            onClick={() => navigate('/patient/requests')}
            style={{
              background: 'var(--patient-accent-light)',
              border: '1px solid var(--patient-accent)',
              borderRadius: 'var(--radius-md)',
              padding: '0.6rem 1.2rem',
              fontSize: '0.85rem',
              color: 'var(--patient-accent)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
            }}
          >
            📋 Pending Requests
          </button>
        </div>

        <h2 style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--patient-text-muted)', marginBottom: '1rem', fontWeight: 500 }}>
          Visit History
        </h2>

        {visits.length === 0 && (
          <p style={{ color: 'var(--patient-text-muted)', fontSize: '0.9rem' }}>No visits yet.</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {visits.map(visit => (
            <div
              key={visit.id}
              onClick={() => navigate(`/patient/visit/${visit.id}`)}
              style={{
                background: 'var(--patient-surface)',
                border: '1px solid var(--patient-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'border-color var(--transition)',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--patient-accent)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--patient-border)')}
            >
              <div>
                <p style={{ fontWeight: 500, color: 'var(--patient-text)', marginBottom: '0.2rem' }}>{visit.institution}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--patient-text-muted)' }}>{visit.doctor_name} · {visit.job_title}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--patient-text-muted)' }}>
                  {new Date(visit.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--patient-accent)', marginTop: '0.2rem' }}>View →</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}