import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PATIENT_EMAIL = 'patient@demo.com'

export default function ProviderView() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [notes, setNotes] = useState('')
  const [audio, setAudio] = useState<File | null>(null)
  const [submitStatus, setSubmitStatus] = useState('')

  const [requestStatus, setRequestStatus] = useState('')
  const [patientData, setPatientData] = useState<any>(null)

  const authHeader = { Authorization: `Bearer ${user?.token}` }

  const handleSubmitVisit = async () => {
    setSubmitStatus('Submitting...')
    const formData = new FormData()
    formData.append('notes', notes)
    formData.append('patient_email', PATIENT_EMAIL)
    formData.append('provider', user?.name ?? '')
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
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1.5rem' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingBottom: '1.25rem',
        borderBottom: '2px solid #eee',
        marginBottom: '2rem',
      }}>
        <div>
          <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Provider Dashboard</p>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>{user?.institution ?? user?.name}</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1rem' }}>{user?.name}</p>
          {user?.job_title && (
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.85rem', color: '#666' }}>{user.job_title}</p>
          )}
          <button onClick={handleLogout} style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
            Log out
          </button>
        </div>
      </div>

      {/* Flow 1 */}
      <h2 style={{ marginTop: 0 }}>Request Patient Data</h2>
      <button onClick={handleRequestData}>Request Data</button>
      {requestStatus && <p>{requestStatus}</p>}
      {patientData && (
        <div style={{ border: '1px solid green', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem' }}>
          <p style={{ margin: '0 0 0.4rem' }}><strong>Name:</strong> {patientData.name}</p>
          <p style={{ margin: '0 0 0.4rem' }}><strong>DOB:</strong> {patientData.dob}</p>
          <p style={{ margin: '0 0 0.4rem' }}><strong>Conditions:</strong> {patientData.conditions.join(', ')}</p>
          <p style={{ margin: '0 0 0.4rem' }}><strong>Medications:</strong> {patientData.medications.join(', ')}</p>
          <p style={{ margin: 0 }}><strong>Allergies:</strong> {patientData.allergies.join(', ')}</p>
        </div>
      )}

      <hr style={{ margin: '2rem 0' }} />

      {/* Flow 2 */}
      <h2 style={{ marginTop: 0 }}>Submit Visit Notes</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <textarea
          rows={5}
          placeholder="Enter doctor notes..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          style={{ resize: 'vertical' }}
        />
        <input
          type="file"
          accept="audio/*"
          onChange={e => setAudio(e.target.files?.[0] ?? null)}
        />
        <button onClick={handleSubmitVisit} disabled={!notes}>
          Submit Visit
        </button>
        {submitStatus && <p style={{ margin: 0 }}>{submitStatus}</p>}
      </div>
    </div>
  )
}
