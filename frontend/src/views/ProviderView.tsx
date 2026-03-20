import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProviderView() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [notes, setNotes] = useState('')
  const [audio, setAudio] = useState<File | null>(null)
  const [patientEmail, setPatientEmail] = useState('')
  const [submitStatus, setSubmitStatus] = useState('')

  const authHeader = { Authorization: `Bearer ${user?.token}` }

  const handleSubmitVisit = async () => {
    setSubmitStatus('Submitting...')
    const formData = new FormData()
    formData.append('notes', notes)
    formData.append('patient_email', patientEmail)
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
    setPatientEmail('')
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
      <button
        onClick={() => navigate('/provider/request')}
        style={{ marginBottom: '2rem' }}
      >
        📋 Request Patient Data
      </button>

      <hr style={{ margin: '2rem 0' }} />

      {/* Flow 2 */}
      <h2>Submit Visit Notes</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="email"
          placeholder="Patient email address"
          value={patientEmail}
          onChange={e => setPatientEmail(e.target.value)}
        />
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
