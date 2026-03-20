import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function DH9FormView() {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const token = user?.token

  const [answers, setAnswers] = useState({
    mood_rating: '',
    sleep_quality: '',
    anxiety_level: '',
    support_system: '',
    primary_concern: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (field: string, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    // Save DH9 form data
    await fetch('http://localhost:8000/api/forms/dh9', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(answers)
    })

    // Approve the DH9 form on the request
    await fetch(`http://localhost:8000/api/requests/${requestId}/respond?form_id=dh9&approved=true`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })

    setSubmitted(true)
    setTimeout(() => navigate('/patient/requests'), 1500)
  }

  const isComplete = Object.values(answers).every(v => v.trim() !== '')

  if (submitted) {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
        <h2>✅ Form submitted!</h2>
        <p>Redirecting back...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
        ← Back
      </button>
      <h1>DH9 Mental Health Intake Form</h1>
      <p style={{ color: '#666' }}>Please answer the following questions honestly. Your responses will be shared with your provider.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
        <div>
          <label><strong>1. How would you rate your overall mood this week? (1-10)</strong></label>
          <input
            type="number" min="1" max="10"
            value={answers.mood_rating}
            onChange={e => handleChange('mood_rating', e.target.value)}
            style={{ display: 'block', marginTop: '0.5rem', width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div>
          <label><strong>2. How has your sleep quality been recently?</strong></label>
          <select
            value={answers.sleep_quality}
            onChange={e => handleChange('sleep_quality', e.target.value)}
            style={{ display: 'block', marginTop: '0.5rem', width: '100%', padding: '0.5rem' }}
          >
            <option value="">Select...</option>
            <option value="Very poor">Very poor</option>
            <option value="Poor">Poor</option>
            <option value="Fair">Fair</option>
            <option value="Good">Good</option>
            <option value="Very good">Very good</option>
          </select>
        </div>

        <div>
          <label><strong>3. How would you rate your anxiety level this week? (1-10)</strong></label>
          <input
            type="number" min="1" max="10"
            value={answers.anxiety_level}
            onChange={e => handleChange('anxiety_level', e.target.value)}
            style={{ display: 'block', marginTop: '0.5rem', width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div>
          <label><strong>4. Do you have a support system you can rely on?</strong></label>
          <select
            value={answers.support_system}
            onChange={e => handleChange('support_system', e.target.value)}
            style={{ display: 'block', marginTop: '0.5rem', width: '100%', padding: '0.5rem' }}
          >
            <option value="">Select...</option>
            <option value="Yes, strong support system">Yes, strong support system</option>
            <option value="Somewhat">Somewhat</option>
            <option value="Limited support">Limited support</option>
            <option value="No support system">No support system</option>
          </select>
        </div>

        <div>
          <label><strong>5. What is your primary concern for this visit?</strong></label>
          <textarea
            rows={3}
            value={answers.primary_concern}
            onChange={e => handleChange('primary_concern', e.target.value)}
            placeholder="Describe your main concern..."
            style={{ display: 'block', marginTop: '0.5rem', width: '100%', padding: '0.5rem' }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isComplete}
          style={{ padding: '0.75rem', fontSize: '1rem' }}
        >
          Submit Form
        </button>
      </div>
    </div>
  )
}
