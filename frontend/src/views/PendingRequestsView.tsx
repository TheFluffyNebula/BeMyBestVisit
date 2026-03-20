import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface DataRequest {
  id: string; provider_name: string; institution: string
  form_statuses: { [key: string]: string }; overall_status: string; created_at: string
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
    const res = await fetch('http://localhost:8000/api/requests/pending', { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setRequests(data)
  }

  useEffect(() => {
    fetchRequests()
    const interval = setInterval(fetchRequests, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleRespond = async (requestId: string, formId: string, approved: boolean) => {
    if (formId === 'dh9' && approved) { navigate(`/patient/dh9/${requestId}`); return }
    await fetch(`http://localhost:8000/api/requests/${requestId}/respond?form_id=${formId}&approved=${approved}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    fetchRequests()
  }

  const statusColor = (s: string) => s === 'approved' ? 'var(--patient-success)' : s === 'denied' ? 'var(--patient-danger)' : 'var(--patient-warning)'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--patient-bg)', fontFamily: 'var(--font-body)' }}>
      <div style={{ background: 'var(--patient-surface)', borderBottom: '1px solid var(--patient-border)', padding: '1rem 2rem' }}>
        <button onClick={() => navigate('/patient')} style={{ background: 'none', border: 'none', color: 'var(--patient-accent)', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>
          ← Back
        </button>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '3rem 2rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--patient-accent)', marginBottom: '0.4rem', fontWeight: 500 }}>
          Your Requests
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'var(--patient-text)', marginBottom: '2rem' }}>
          Pending Approvals
        </h1>

        {requests.length === 0 && (
          <p style={{ color: 'var(--patient-text-muted)', fontSize: '0.9rem' }}>No pending requests at this time.</p>
        )}

        {requests.map(req => (
          <div key={req.id} style={{ background: 'var(--patient-surface)', border: '1px solid var(--patient-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1rem' }}>
            <p style={{ fontWeight: 500, color: 'var(--patient-text)', marginBottom: '0.2rem' }}>{req.provider_name}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--patient-text-muted)', marginBottom: '1.25rem' }}>{req.institution} · {req.created_at}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.entries(req.form_statuses).map(([formId, status]) => (
                <div key={formId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--patient-bg)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--patient-text)' }}>{FORM_LABELS[formId] || formId}</span>
                  {status === 'pending' ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleRespond(req.id, formId, true)}
                        style={{ background: 'var(--patient-accent)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.85rem', color: 'white', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                      >
                        {formId === 'dh9' ? 'Fill Out' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleRespond(req.id, formId, false)}
                        style={{ background: 'none', border: '1px solid var(--patient-danger)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.85rem', color: 'var(--patient-danger)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                      >
                        Deny
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: statusColor(status) }}>{status.toUpperCase()}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}