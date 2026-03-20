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
  const [loading, setLoading] = useState(false)
  const authHeader = { Authorization: `Bearer ${user?.token}` }

  const handleSubmitVisit = async () => {
    setLoading(true)
    setSubmitStatus('')
    const formData = new FormData()
    formData.append('notes', notes)
    formData.append('patient_email', patientEmail)
    if (audio) formData.append('audio', audio)
    const res = await fetch('http://localhost:8000/api/visits/summarize', { method: 'POST', headers: authHeader, body: formData })
    const data = await res.json()
    setSubmitStatus(data.summary)
    setNotes(''); setAudio(null); setPatientEmail('')
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--provider-surface-2)',
    border: '1px solid var(--provider-border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.7rem 1rem',
    color: 'var(--provider-text)',
    fontSize: '0.875rem',
    fontFamily: 'var(--font-body)',
    width: '100%',
    outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--provider-bg)', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--provider-border)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 300, color: 'var(--provider-text)' }}>
          BeMyBestVisit
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--provider-text-muted)' }}>{user?.name}</span>
          <button
            onClick={() => { logout(); navigate('/login', { replace: true }) }}
            style={{ background: 'none', border: '1px solid var(--provider-border)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.9rem', fontSize: '0.8rem', color: 'var(--provider-text-muted)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
          >
            Log out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '3rem 2rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--provider-accent)', marginBottom: '0.4rem', fontWeight: 500 }}>
          Provider Dashboard
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'var(--provider-text)', marginBottom: '2.5rem' }}>
          {user?.name}
        </h1>

        {/* Flow 1 */}
        <div style={{ background: 'var(--provider-surface)', border: '1px solid var(--provider-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--provider-text-muted)', marginBottom: '0.75rem', fontWeight: 500 }}>
            Patient Data
          </p>
          <button
            onClick={() => navigate('/provider/request')}
            style={{ background: 'var(--provider-accent-light)', border: '1px solid var(--provider-accent)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1.2rem', fontSize: '0.85rem', color: 'var(--provider-accent)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500 }}
          >
            📋 Request Patient Data
          </button>
        </div>

        {/* Flow 2 */}
        <div style={{ background: 'var(--provider-surface)', border: '1px solid var(--provider-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--provider-text-muted)', marginBottom: '1.25rem', fontWeight: 500 }}>
            Submit Visit Notes
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              type="email"
              placeholder="Patient email address"
              value={patientEmail}
              onChange={e => setPatientEmail(e.target.value)}
              style={inputStyle}
            />
            <textarea
              rows={5}
              placeholder="Enter doctor notes..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
            />
            <label style={{ fontSize: '0.8rem', color: 'var(--provider-text-muted)', cursor: 'pointer' }}>
              <input
                type="file"
                accept="audio/*"
                onChange={e => setAudio(e.target.files?.[0] ?? null)}
                style={{ display: 'none' }}
              />
              <span style={{ border: '1px dashed var(--provider-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', display: 'inline-block' }}>
                {audio ? `🎙 ${audio.name}` : '+ Attach audio recording'}
              </span>
            </label>
            <button
              onClick={handleSubmitVisit}
              disabled={!notes || loading}
              style={{
                background: loading || !notes ? 'var(--provider-border)' : 'var(--provider-accent)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem',
                color: 'white',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                cursor: notes && !loading ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? 'Processing...' : 'Submit Visit'}
            </button>
            {submitStatus && (
              <div style={{ background: 'var(--provider-success-light)', border: '1px solid var(--provider-success)', borderRadius: 'var(--radius-sm)', padding: '1rem', fontSize: '0.85rem', color: 'var(--provider-text)', lineHeight: 1.6 }}>
                ✓ Visit submitted
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}