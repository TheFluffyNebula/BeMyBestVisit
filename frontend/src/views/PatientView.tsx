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

interface DataRequest {
  request_id: string
  status: string
  provider_name?: string
}

export default function PatientView() {
  const { user, logout } = useAuth()
  const [visits, setVisits] = useState<Visit[]>([])
  const [pendingRequests, setPendingRequests] = useState<DataRequest[]>([])
  const navigate = useNavigate()

  const authHeader = { Authorization: `Bearer ${user?.token}` }

  useEffect(() => {
    fetch('http://localhost:8000/api/visits', { headers: authHeader })
      .then(res => res.json())
      .then(data => setVisits(data))
  }, [])

  // Poll for pending consent requests
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://localhost:8000/api/data-request/pending/all', { headers: authHeader })
        .then(res => res.json())
        .then(data => setPendingRequests(data))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleRespond = async (requestId: string, approved: boolean) => {
    await fetch(`http://localhost:8000/api/data-request/${requestId}/respond?approved=${approved}`, {
      method: 'POST',
      headers: authHeader,
    })
    setPendingRequests(prev => prev.filter(r => r.request_id !== requestId))
  }

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

      {/* Consent prompts */}
      {pendingRequests.map(req => (
        <div key={req.request_id} style={{ border: '2px solid orange', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <p><strong>{req.provider_name ?? 'Your provider'} is requesting access to your medical data.</strong></p>
          <p>Do you consent to sharing your information?</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => handleRespond(req.request_id, true)}>Approve</button>
            <button onClick={() => handleRespond(req.request_id, false)}>Deny</button>
          </div>
        </div>
      ))}

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
