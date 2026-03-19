import { useEffect, useState } from 'react'

interface Visit {
  id: string
  notes: string
  summary: string
}

export default function PatientView() {
  const [visits, setVisits] = useState<Visit[]>([])

  useEffect(() => {
    fetch('http://localhost:8000/api/visits')
      .then(res => res.json())
      .then(data => setVisits(data))
  }, [])

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h1>Patient Dashboard</h1>
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
