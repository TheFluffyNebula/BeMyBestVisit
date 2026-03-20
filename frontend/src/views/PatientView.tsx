import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Visit {
  id: string
  date: string
  provider: string
  notes: string
  transcript: string
  summary: string
}

interface DataRequest {
  request_id: string
  status: string
}

export default function PatientView() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [pendingRequests, setPendingRequests] = useState<DataRequest[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    fetch('http://localhost:8000/api/visits')
      .then(res => res.json())
      .then(data => setVisits(data))
  }, [])

  // Poll for pending consent requests
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://localhost:8000/api/data-request/pending/all')
        .then(res => res.json())
        .then(data => setPendingRequests(data))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleRespond = async (requestId: string, approved: boolean) => {
    await fetch(`http://localhost:8000/api/data-request/${requestId}/respond?approved=${approved}`, {
      method: 'POST',
    })
    setPendingRequests(prev => prev.filter(r => r.request_id !== requestId))
  }

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <h1>Patient Dashboard</h1>

      {/* Consent prompts */}
      {pendingRequests.map(req => (
        <div key={req.request_id} style={{ border: '2px solid orange', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <p><strong>Your provider is requesting access to your medical data.</strong></p>
          <p>Do you consent to sharing your information?</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => handleRespond(req.request_id, true)}>✅ Approve</button>
            <button onClick={() => handleRespond(req.request_id, false)}>❌ Deny</button>
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
              <td style={{ fontWeight: 'bold' }}>{visit.provider}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
