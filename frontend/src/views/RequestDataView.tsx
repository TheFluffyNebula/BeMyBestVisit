import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface DataRequest {
  id: string; provider_name: string; institution: string
  form_statuses: { [key: string]: string }; overall_status: string; created_at: string
}

export default function RequestDataView() {
  const [request, setRequest] = useState<DataRequest | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()
  const token = user?.token

  const handleRequestData = async () => {
    setLoading(true)
    const res = await fetch('http://localhost:8000/api/requests', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setRequest(data)
    setLoading(false)
  }

  useEffect(() => {
    if (!request || request.overall_status !== 'pending') return
    const interval = setInterval(async () => {
      const res = await fetch(`http://localhost:8000/api/requests/${request.id}/status`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setRequest(data)
    }, 2000)
    return () => clearInterval(interval)
  }, [request])

  const statusColor = (status: string) => {
    if (status === 'approved') return 'var(--provider-success)'
    if (status === 'denied') return 'var(--provider-danger)'
    return 'var(--provider-warning)'
  }

  const statusBg = (status: string) => {
    if (status === 'approved') return 'var(--provider-success-light)'
    if (status === 'denied') return 'var(--provider-danger-light)'
    return 'var(--provider-warning-light)'
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--provider-bg)', fontFamily: 'var(--font-body)' }}>
      <div style={{ borderBottom: '1px solid var(--provider-border)', padding: '1rem 2rem' }}>
        <button
          onClick={() => navigate('/provider')}
          style={{ background: 'none', border: 'none', color: 'var(--provider-accent)', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}
        >
          ← Back
        </button>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 2rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--provider-accent)', marginBottom: '0.4rem', fontWeight: 500 }}>
          Patient Data Access
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'var(--provider-text)', marginBottom: '2rem' }}>
          Request Records
        </h1>

        {!request && (
          <button
            onClick={handleRequestData}
            disabled={loading}
            style={{ background: 'var(--provider-accent)', border: 'none', borderRadius: 'var(--radius-md)', padding: '0.85rem 2rem', color: 'white', fontSize: '0.9rem', fontFamily: 'var(--font-body)', fontWeight: 500, cursor: 'pointer' }}
          >
            {loading ? 'Sending...' : 'Request Patient Data'}
          </button>
        )}

        {request && (
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--provider-text-muted)', marginBottom: '1.5rem' }}>
              Requested {request.created_at}
            </p>

            <div style={{ background: statusBg(request.overall_status), border: `1px solid ${statusColor(request.overall_status)}`, borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: statusColor(request.overall_status), marginBottom: '0.4rem', fontWeight: 500 }}>
                Overall Status
              </p>
              <p style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 300, color: statusColor(request.overall_status) }}>
                {request.overall_status?.toUpperCase() ?? 'PENDING'}
              </p>
            </div>

            <div style={{ background: 'var(--provider-surface)', border: '1px solid var(--provider-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              {Object.entries(request.form_statuses).map(([formId, status], i, arr) => (
                <div key={formId} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.875rem 1.25rem',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--provider-border)' : 'none',
                }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--provider-text)', textTransform: 'capitalize' }}>
                    {formId.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: statusColor(status) }}>
                    {status?.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>

            {request.overall_status === 'approved' && (
              <button
                onClick={() => navigate('/provider')}
                style={{ marginTop: '1.5rem', background: 'var(--provider-accent)', border: 'none', borderRadius: 'var(--radius-md)', padding: '0.85rem 2rem', color: 'white', fontSize: '0.875rem', fontFamily: 'var(--font-body)', fontWeight: 500, cursor: 'pointer' }}
              >
                Proceed to Visit Notes →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}