import { useEffect, useState } from 'react'

interface Visit {
  id: string
  notes: string
  summary: string
}

interface DataRequest {
  request_id: string
  status: string
}

export default function PatientView() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [pendingRequests, setPendingRequests] = useState<DataRequest[]>([])

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
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
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
      {visits.map(visit => (
        <div key={visit.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
          <h3>Visit Summary</h3>
          <p>{visit.summary}</p>
          <details>
            <summary>Original Notes</summary>
            <p>{visit.notes}</p>
          </details>
        </div>
      ))}
    </div>
  )
}