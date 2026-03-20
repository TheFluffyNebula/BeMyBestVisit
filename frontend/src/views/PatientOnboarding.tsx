import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SECTIONS, SECTION_GROUPS } from '../data/healthProfile'

export default function PatientOnboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const authHeader = { Authorization: `Bearer ${user?.token}` }

  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({})
  const [saving, setSaving] = useState(false)

  const currentSection = SECTIONS[stepIndex]
  const isLast = stepIndex === SECTIONS.length - 1
  const progress = Math.round(((stepIndex + 1) / SECTIONS.length) * 100)
  const currentGroup = SECTION_GROUPS.find(g => g.sections.some(s => s.id === currentSection.id))

  const setField = (sectionId: string, key: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [sectionId]: { ...(prev[sectionId] ?? {}), [key]: value },
    }))
  }

  const handleNext = () => {
    if (!isLast) {
      setStepIndex(prev => prev + 1)
      window.scrollTo(0, 0)
    } else {
      handleFinish()
    }
  }

  const handleBack = () => {
    setStepIndex(prev => prev - 1)
    window.scrollTo(0, 0)
  }

  const handleFinish = async () => {
    setSaving(true)
    // Build full profile with empty strings for any unanswered fields
    const profile: Record<string, Record<string, string>> = {}
    for (const section of SECTIONS) {
      profile[section.id] = {}
      for (const field of section.fields) {
        profile[section.id][field.key] = answers[section.id]?.[field.key] ?? ''
      }
    }
    await fetch('http://localhost:8000/api/patient/profile', {
      method: 'PUT',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
    setSaving(false)
    navigate('/patient', { replace: true })
  }

  const sectionAnswers = answers[currentSection.id] ?? {}

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1.5rem' }}>

      {/* Header */}
      <h1 style={{ marginBottom: '0.25rem' }}>Set up your health profile</h1>
      <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        This information helps pre-fill your medical forms automatically. You can skip any section and update it later from your dashboard.
      </p>

      {/* Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#888', marginBottom: '0.4rem' }}>
        <span>
          {currentGroup && <span style={{ color: '#aaa' }}>{currentGroup.title} · </span>}
          {currentSection.title}
        </span>
        <span>{stepIndex + 1} of {SECTIONS.length}</span>
      </div>
      <div style={{ height: '6px', background: '#eee', borderRadius: '3px', marginBottom: '2rem' }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: '#4a90e2',
          borderRadius: '3px',
          transition: 'width 0.3s',
        }} />
      </div>

      {/* Section */}
      <h2 style={{ marginBottom: '0.25rem' }}>{currentSection.title}</h2>
      <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{currentSection.description}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginBottom: '2rem' }}>
        {currentSection.fields.map(field => (
          <div key={field.key}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.35rem' }}>
              {field.label}
            </label>

            {field.type === 'textarea' ? (
              <textarea
                rows={3}
                value={sectionAnswers[field.key] ?? ''}
                onChange={e => setField(currentSection.id, field.key, e.target.value)}
                placeholder="Type your answer here..."
                style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
              />
            ) : field.type === 'select' ? (
              <select
                value={sectionAnswers[field.key] ?? ''}
                onChange={e => setField(currentSection.id, field.key, e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box' }}
              >
                <option value="">Select an option</option>
                {field.options!.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type ?? 'text'}
                value={sectionAnswers[field.key] ?? ''}
                onChange={e => setField(currentSection.id, field.key, e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {stepIndex > 0 && (
            <button
              onClick={handleBack}
              style={{ background: 'none', border: '1px solid #ccc', padding: '0.6rem 1.2rem' }}
            >
              ← Back
            </button>
          )}
          <button
            onClick={handleNext}
            style={{ padding: '0.6rem 1.5rem' }}
            disabled={saving}
          >
            {saving ? 'Saving...' : isLast ? 'Finish' : 'Next →'}
          </button>
        </div>

        {!isLast && (
          <button
            onClick={() => setStepIndex(prev => prev + 1)}
            style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}
          >
            Skip for now
          </button>
        )}

        {isLast && (
          <button
            onClick={() => navigate('/patient', { replace: true })}
            style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}
          >
            Skip & go to dashboard
          </button>
        )}
      </div>
    </div>
  )
}
