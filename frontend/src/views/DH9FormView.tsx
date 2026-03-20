import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function DH9FormView() {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const token = user?.token

  const [answers, setAnswers] = useState({ mood_rating: '', sleep_quality: '', anxiety_level: '', support_system: '', primary_concern: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (field: string, value: string) => setAnswers(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    await fetch('http://localhost:8000/api/forms/dh9', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(answers) })
    await fetch(`http://localhost:8000/api/requests/${requestId}/respond?form_id=dh9&approved=true`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    setSubmitted(true)
    setTimeout(() => navigate('/patient/requests'), 1500)
  }

  const isComplete = Object.values(answers).every(v => v.trim() !== '')

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.7rem 1rem', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--patient-border)', background: 'var(--patient-surface)',
    fontSize: '0.875rem', fontFamily: 'var(--font-body)', color: 'var(--patient-text)', outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.825rem', fontWeight: 500,
    color: 'var(--patient-text)', marginBottom: '0.4rem',
  }

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: 'var(--patient-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</p>
        <p style={{ color: 'var(--patient-accent)', fontWeight: 500 }}>Form submitted successfully</p>
        <p style={{ color: 'var(--patient-text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Redirecting...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--patient-bg)', fontFamily: 'var(--font-body)' }}>
      <div style={{ background: 'var(--patient-surface)', borderBottom: '1px solid var(--patient-border)', padding: '1rem 2rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--patient-accent)', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>← Back</button>
      </div>

      <div style={{ maxWidth: '580px', margin: '0 auto', padding: '3rem 2rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--patient-accent)', marginBottom: '0.4rem', fontWeight: 500 }}>Mental Health Intake</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, color: 'var(--patient-text)', marginBottom: '0.5rem' }}>DH9 Form</h1>
        <p style={{ color: 'var(--patient-text-muted)', fontSize: '0.875rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          Please answer honestly. Your responses will be shared with your provider.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}>1. Overall mood this week (1–10)</label>
            <input type="number" min="1" max="10" value={answers.mood_rating} onChange={e => handleChange('mood_rating', e.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>2. Sleep quality recently</label>
            <select value={answers.sleep_quality} onChange={e => handleChange('sleep_quality', e.target.value)} style={inputStyle}>
              <option value="">Select...</option>
              {['Very poor', 'Poor', 'Fair', 'Good', 'Very good'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>3. Anxiety level this week (1–10)</label>
            <input type="number" min="1" max="10" value={answers.anxiety_level} onChange={e => handleChange('anxiety_level', e.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>4. Support system available to you</label>
            <select value={answers.support_system} onChange={e => handleChange('support_system', e.target.value)} style={inputStyle}>
              <option value="">Select...</option>
              {['Yes, strong support system', 'Somewhat', 'Limited support', 'No support system'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>5. Primary concern for this visit</label>
            <textarea rows={3} value={answers.primary_concern} onChange={e => handleChange('primary_concern', e.target.value)} placeholder="Describe your main concern..." style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isComplete}
            style={{
              background: isComplete ? 'var(--patient-accent)' : 'var(--patient-border)',
              border: 'none', borderRadius: 'var(--radius-md)', padding: '0.85rem',
              color: 'white', fontSize: '0.875rem', fontFamily: 'var(--font-body)',
              fontWeight: 500, cursor: isComplete ? 'pointer' : 'not-allowed',
            }}
          >
            Submit Form
          </button>
        </div>
      </div>
    </div>
  )
}