import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface FormStatus {
  [form_id: string]: string // pending | approved | denied
}

interface DataRequest {
  id: string
  provider_name: string
  institution: string
  form_statuses: FormStatus
  overall_status: string
  created_at: string
}

export default function RequestDataView() {
  const [request, setRequest] = useState<DataRequest | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { user } = useAuth()
  const token = user?.token

  const handleRequestData = async () => {
    setLoading(true)
    const res = await fetch('http://localhost:8000/api/requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setRequest(data)
    setLoading(false)
  }

  // Poll for status updates
  useEffect(() => {
    if (!request || request.overall_status !== 'pending') return
    const interval = setInterval(async () => {
      const res = await fetch(`http://localhost:8000/api/requests/${request.id}/status`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setRequest(data)
    }, 2000)
    return () => clearInterval(interval)
  }, [request])

  const statusColor = (status: string) => {
    if (status === 'approved') return 'green'
    if (status === 'denied') return 'red'
    return 'orange'
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h1>Request Patient Data</h1>

      {!request && (
        <button onClick={handleRequestData} disabled={loading}>
          {loading ? 'Sending request...' : 'Request Patient Data'}
        </button>
      )}

      {request && (
        <div>
          <p>Request sent on {request.created_at}</p>

          <div style={{
            border: `2px solid ${statusColor(request.overall_status)}`,
            borderRadius: '8px',
            padding: '1rem',
            marginTop: '1rem'
          }}>
            <h2 style={{ color: statusColor(request.overall_status) }}>
              Overall Status: {request.overall_status.toUpperCase()}
            </h2>

            <h3>Form Breakdown</h3>
            {Object.entries(request.form_statuses).map(([formId, status]) => (
              <div key={formId} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem 0',
                borderBottom: '1px solid #eee'
              }}>
                <span style={{ textTransform: 'capitalize' }}>
                  {formId.replace('_', ' ')}
                </span>
                <span style={{ color: statusColor(status), fontWeight: 'bold' }}>
                  {status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          {request.overall_status === 'approved' && (
            <button
              onClick={() => navigate('/provider')}
              style={{ marginTop: '1rem' }}
            >
              Proceed to Visit Notes →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
