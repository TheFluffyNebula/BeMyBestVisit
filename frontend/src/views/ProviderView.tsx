import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProviderView() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [notes, setNotes] = useState('')
  const [audio, setAudio] = useState<File | null>(null)
  const [submitStatus, setSubmitStatus] = useState('')

  // Flow 1 state
  const [requestStatus, setRequestStatus] = useState('')
  const [patientData, setPatientData] = useState<any>(null)

  const authHeader = { Authorization: `Bearer ${user?.token}` }

  const handleSubmitVisit = async () => {
    setSubmitStatus('Submitting...')
    const formData = new FormData()
    formData.append('notes', notes)
    if (audio) formData.append('audio', audio)

    const res = await fetch('http://localhost:8000/api/visits/summarize', {
      method: 'POST',
      headers: authHeader,
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

    const res = await fetch('http://localhost:8000/api/data-request', {
      method: 'POST',
      headers: authHeader,
    })
    const data = await res.json()
    const id = data.request_id

    // Poll every 2 seconds
    const interval = setInterval(async () => {
      const pollRes = await fetch(`http://localhost:8000/api/data-request/${id}`, {
        headers: authHeader,
      })
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

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Provider Dashboard</h1>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.9rem', color: '#555' }}>{user?.name}</span>
          <br />
          <button onClick={handleLogout} style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Log out
          </button>
        </div>
      </div>

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
