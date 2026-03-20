import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface FormStatus {
  [form_id: string]: string
}

interface DataRequest {
  id: string
  provider_name: string
  institution: string
  form_statuses: FormStatus
  overall_status: string
  created_at: string
}

const FORM_LABELS: { [key: string]: string } = {
  intake: 'Intake Form',
  telehealth: 'Telehealth Consent Form',
  pediatric: 'Pediatric Form',
  dh9: 'DH9 Mental Health Intake Form',
}

export default function PendingRequestsView() {
  const [requests, setRequests] = useState<DataRequest[]>([])
  const navigate = useNavigate()
  const { user } = useAuth()
  const token = user?.token

  const fetchRequests = async () => {
    const res = await fetch('http://localhost:8000/api/requests/pending', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    console.log('pending requests:', data)
    setRequests(data)
  }

  useEffect(() => {
    fetchRequests()
    const interval = setInterval(fetchRequests, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleRespond = async (requestId: string, formId: string, approved: boolean) => {
    if (formId === 'dh9' && approved) {
      // Redirect to DH9 form instead of approving directly
      navigate(`/patient/dh9/${requestId}`)
      return
    }

    await fetch(`http://localhost:8000/api/requests/${requestId}/respond?form_id=${formId}&approved=${approved}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchRequests()
  }

  const statusColor = (status: string) => {
    if (status === 'approved') return 'green'
    if (status === 'denied') return 'red'
    return 'orange'
  }

  if (requests.length === 0) {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <h1>Pending Requests</h1>
        <p>No pending requests at this time.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h1>Pending Requests</h1>

      {requests.map(req => (
        <div key={req.id} style={{
          border: '2px solid orange',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <h2>{req.provider_name}</h2>
          <p style={{ color: '#666' }}>{req.institution} — requested on {req.created_at}</p>

          <h3>Forms Requested</h3>
          {Object.entries(req.form_statuses).map(([formId, status]) => (
            <div key={formId} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 0',
              borderBottom: '1px solid #eee'
            }}>
              <span>{FORM_LABELS[formId] || formId}</span>

              {status === 'pending' ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleRespond(req.id, formId, true)}
                    style={{ background: 'green', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    {formId === 'dh9' ? '📝 Fill Out' : '✅ Approve'}
                  </button>
                  <button
                    onClick={() => handleRespond(req.id, formId, false)}
                    style={{ background: 'red', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    ❌ Deny
                  </button>
                </div>
              ) : (
                <span style={{ color: statusColor(status), fontWeight: 'bold' }}>
                  {status.toUpperCase()}
                </span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
