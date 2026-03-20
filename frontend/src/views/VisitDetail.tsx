import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

function renderSummary(summary: string) {
  // Convert **text** to bold and \n to line breaks
  return summary.split('\n').map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g)
    return (
      <p key={i} style={{ margin: '0.25rem 0' }}>
        {parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
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

  useEffect(() => {
    fetch('http://localhost:8000/api/visits', {
      headers: { Authorization: `Bearer ${user?.token}` },
    })
      .then(res => res.json())
      .then((visits: Visit[]) => {
        const found = visits.find(v => v.id === id)
        if (found) setVisit(found)
        else setNotFound(true)
      })
  }, [id])

  if (notFound) return (
    <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <p>Visit not found.</p>
      <button onClick={() => navigate('/patient')}>← Back</button>
    </div>
  )

  if (!visit) return (
    <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <p>Loading...</p>
    </div>
  )

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <button onClick={() => navigate('/patient')} style={{ marginBottom: '1rem' }}>
        ← Back to visits
      </button>

      <h1>Visit Detail</h1>
      <p style={{ fontWeight: 'bold' }}>{visit.institution}</p>
      <p style={{ color: '#666' }}>{visit.doctor_name}, {visit.job_title}</p>
      <p style={{ color: '#888' }}>
        {new Date(visit.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </p>

      <h2>Summary</h2>
      <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
        {renderSummary(visit.summary)}
      </div>

      <details style={{ marginBottom: '1rem' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Audio Transcript</summary>
        <p style={{ marginTop: '0.5rem', color: '#555' }}>{visit.transcript || 'No transcript available.'}</p>
      </details>

      <details>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Doctor Notes</summary>
        <p style={{ marginTop: '0.5rem', color: '#555' }}>{visit.notes || 'No notes available.'}</p>
      </details>
    </div>
  )
}
