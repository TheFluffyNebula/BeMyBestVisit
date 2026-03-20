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

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Patient Dashboard</h1>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.9rem', color: '#555' }}>{user?.name}</span>
          <br />
          <button onClick={handleLogout} style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Log out
          </button>
        </div>
      </div>

      {/* Pending requests button */}
      <button
        onClick={() => navigate('/patient/requests')}
        style={{ marginBottom: '1.5rem' }}
      >
        📋 View Pending Requests
      </button>

      {/* Visit history */}
      <h2>Your Visit History</h2>
      {visits.length === 0 && <p>No visits yet.</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
            <th style={{ padding: '0.75rem' }}>Date</th>
            <th style={{ padding: '0.75rem' }}>Care Provider</th>
          </tr>
        </thead>
        <tbody>
          {visits.map(visit => (
            <tr
              key={visit.id}
              onClick={() => navigate(`/patient/visit/${visit.id}`)}
              style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>
                {new Date(visit.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </td>
              <td style={{ fontWeight: 'bold' }}>{visit.institution}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
