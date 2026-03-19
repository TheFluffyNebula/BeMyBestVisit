import { useState } from 'react'

export default function ProviderView() {
  const [notes, setNotes] = useState('')
  const [audio, setAudio] = useState<File | null>(null)
  const [submitStatus, setSubmitStatus] = useState('')

  // Flow 1 state
  const [requestId, setRequestId] = useState<string | null>(null)
  const [requestStatus, setRequestStatus] = useState('')
  const [patientData, setPatientData] = useState<any>(null)

  const handleSubmitVisit = async () => {
    setSubmitStatus('Submitting...')
    const formData = new FormData()
    formData.append('notes', notes)
    if (audio) formData.append('audio', audio)

    const res = await fetch('http://localhost:8000/api/visits/summarize', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    setSubmitStatus('Visit submitted! Summary: ' + data.summary)
    setNotes('')
    setAudio(null)
  }

  const handleRequestData = async () => {
    setRequestStatus('Waiting for patient consent...')
    setPatientData(null)

    const res = await fetch('http://localhost:8000/api/data-request', { method: 'POST' })
    const data = await res.json()
    const id = data.request_id
    setRequestId(id)

    // Poll every 2 seconds
    const interval = setInterval(async () => {
      const pollRes = await fetch(`http://localhost:8000/api/data-request/${id}`)
      const pollData = await pollRes.json()

      if (pollData.status === 'approved') {
        setRequestStatus('Access granted!')
        setPatientData(pollData.data)
        clearInterval(interval)
      } else if (pollData.status === 'denied') {
        setRequestStatus('Patient denied access.')
        clearInterval(interval)
      }
    }, 2000)
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h1>Provider Dashboard</h1>

      {/* Flow 1 */}
      <h2>Request Patient Data</h2>
      <button onClick={handleRequestData}>Request Data</button>
      {requestStatus && <p>{requestStatus}</p>}
      {patientData && (
        <div style={{ border: '1px solid green', padding: '1rem', borderRadius: '8px' }}>
          <p><strong>Name:</strong> {patientData.name}</p>
          <p><strong>DOB:</strong> {patientData.dob}</p>
          <p><strong>Conditions:</strong> {patientData.conditions.join(', ')}</p>
          <p><strong>Medications:</strong> {patientData.medications.join(', ')}</p>
          <p><strong>Allergies:</strong> {patientData.allergies.join(', ')}</p>
        </div>
      )}

      <hr style={{ margin: '2rem 0' }} />

      {/* Flow 2 */}
      <h2>Submit Visit Notes</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <textarea
          rows={5}
          placeholder="Enter doctor notes..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
        <input
          type="file"
          accept="audio/*"
          onChange={e => setAudio(e.target.files?.[0] ?? null)}
        />
        <button onClick={handleSubmitVisit} disabled={!notes}>
          Submit Visit
        </button>
        {submitStatus && <p>{submitStatus}</p>}
      </div>
    </div>
  )
}