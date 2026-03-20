import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface Visit {
  id: string; date: string; institution: string; doctor_name: string
  job_title: string; notes: string; transcript: string; summary: string
}

function renderSummary(summary: string) {
  return summary.split('\n').map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g)
    return (
      <p key={i} style={{ margin: '0.3rem 0', lineHeight: 1.7, fontSize: '0.9rem' }}>
        {parts.map((part, j) => j % 2 === 1
          ? <strong key={j} style={{ color: 'var(--patient-text)', fontWeight: 500 }}>{part}</strong>
          : <span key={j} style={{ color: 'var(--patient-text-muted)' }}>{part}</span>
        )}
      </p>
    )
  })
}

export default function VisitDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [visit, setVisit] = useState<Visit | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [open, setOpen] = useState<string | null>(null)

  useEffect(() => {
    fetch('http://localhost:8000/api/visits', { headers: { Authorization: `Bearer ${user?.token}` } })
      .then(res => res.json())
      .then((visits: Visit[]) => {
        const found = visits.find(v => v.id === id)
        if (found) setVisit(found)
        else setNotFound(true)
      })
  }, [id])

  if (notFound) return <div style={{ padding: '2rem', fontFamily: 'var(--font-body)' }}><p>Visit not found.</p><button onClick={() => navigate('/patient')}>← Back</button></div>
  if (!visit) return <div style={{ padding: '2rem', fontFamily: 'var(--font-body)', color: 'var(--patient-text-muted)' }}>Loading...</div>

  return (
    <div style={{ minHeight: '100vh', background: 'var(--patient-bg)', fontFamily: 'var(--font-body)' }}>
      <div style={{ background: 'var(--patient-surface)', borderBottom: '1px solid var(--patient-border)', padding: '1rem 2rem' }}>
        <button
          onClick={() => navigate('/patient')}
          style={{ background: 'none', border: 'none', color: 'var(--patient-accent)', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}
        >
          ← Back to visits
        </button>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 2rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--patient-accent)', marginBottom: '0.5rem', fontWeight: 500 }}>
          Visit Summary
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'var(--patient-text)', marginBottom: '0.25rem' }}>
          {visit.institution}
        </h1>
        <p style={{ color: 'var(--patient-text-muted)', fontSize: '0.85rem', marginBottom: '2.5rem' }}>
          {visit.doctor_name}, {visit.job_title} · {new Date(visit.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div style={{ background: 'var(--patient-surface)', border: '1px solid var(--patient-border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', marginBottom: '1rem' }}>
          {renderSummary(visit.summary)}
        </div>

        {[{ key: 'transcript', label: 'Audio Transcript', value: visit.transcript }, { key: 'notes', label: 'Doctor Notes', value: visit.notes }].map(({ key, label, value }) => (
          <div
            key={key}
            style={{ background: 'var(--patient-surface)', border: '1px solid var(--patient-border)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem', overflow: 'hidden' }}
          >
            <button
              onClick={() => setOpen(open === key ? null : key)}
              style={{ width: '100%', background: 'none', border: 'none', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 500, color: 'var(--patient-text)' }}
            >
              {label}
              <span style={{ color: 'var(--patient-text-muted)' }}>{open === key ? '−' : '+'}</span>
            </button>
            {open === key && (
              <p style={{ padding: '0 1.5rem 1rem', fontSize: '0.85rem', color: 'var(--patient-text-muted)', lineHeight: 1.7 }}>
                {value || 'Not available.'}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}