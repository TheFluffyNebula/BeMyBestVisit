import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SECTION_GROUPS } from '../data/healthProfile'
import type { Section } from '../data/healthProfile'

function isEmpty(obj: Record<string, string>) {
  return Object.values(obj).every(v => !v)
}

export default function MyDataView() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const authHeader = { Authorization: `Bearer ${user?.token}` }

  const [profile, setProfile] = useState<Record<string, Record<string, string>>>({})
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('http://localhost:8000/api/patient/profile', { headers: authHeader })
      .then(res => res.json())
      .then(data => { setProfile(data); setLoaded(true) })
  }, [])

  const startEdit = (sectionId: string) => {
    setDraft({ ...(profile[sectionId] ?? {}) })
    setEditingSection(sectionId)
  }

  const cancelEdit = () => {
    setEditingSection(null)
    setDraft({})
  }

  const saveSection = async (sectionId: string) => {
    setSaving(true)
    const updated = { ...profile, [sectionId]: draft }
    await fetch('http://localhost:8000/api/patient/profile', {
      method: 'PUT',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    setProfile(updated)
    setEditingSection(null)
    setDraft({})
    setSaving(false)
  }

  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--patient-bg)', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--patient-text-muted)' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--patient-bg)', fontFamily: 'var(--font-body)' }}>

      {/* Header */}
      <div style={{
        background: 'var(--patient-surface)',
        borderBottom: '1px solid var(--patient-border)',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <button
          onClick={() => navigate('/patient')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--patient-text-muted)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          ← Dashboard
        </button>
        <span style={{ color: 'var(--patient-border)' }}>|</span>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.1rem',
          fontWeight: 300,
          color: 'var(--patient-text)',
        }}>
          My Health Data
        </span>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--patient-accent)',
            marginBottom: '0.4rem',
            fontWeight: 500,
          }}>
            Health Profile
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            fontWeight: 300,
            color: 'var(--patient-text)',
            marginBottom: '0.5rem',
          }}>
            {user?.name}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--patient-text-muted)', lineHeight: 1.6 }}>
            This information is stored securely and used to pre-fill your medical forms. Click Edit on any section to update it.
          </p>
        </div>

        {/* Groups */}
        {SECTION_GROUPS.map(group => (
          <div key={group.id} style={{ marginBottom: '2.5rem' }}>

            {/* Group header */}
            <div style={{ marginBottom: '1rem', paddingBottom: '0.6rem', borderBottom: '1px solid var(--patient-border)' }}>
              <p style={{
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--patient-text-muted)',
                fontWeight: 500,
                marginBottom: '0.2rem',
              }}>
                {group.title}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--patient-text-muted)' }}>{group.subtitle}</p>
            </div>

            {/* Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0 2.5rem' }}>
              {group.sections.map(section => (
                <SectionCard
                  key={section.id}
                  section={section}
                  data={profile[section.id] ?? {}}
                  isEditing={editingSection === section.id}
                  draft={draft}
                  saving={saving}
                  onEdit={() => startEdit(section.id)}
                  onSave={() => saveSection(section.id)}
                  onCancel={cancelEdit}
                  onDraftChange={setDraft}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Section card ───────────────────────────────────────────────────────────────

interface SectionCardProps {
  section: Section
  data: Record<string, string>
  isEditing: boolean
  draft: Record<string, string>
  saving: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onDraftChange: (d: Record<string, string>) => void
}

function SectionCard({ section, data, isEditing, draft, saving, onEdit, onSave, onCancel, onDraftChange }: SectionCardProps) {
  const noData = isEmpty(data)

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--patient-bg)',
    border: '1px solid var(--patient-border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.55rem 0.8rem',
    fontSize: '0.875rem',
    color: 'var(--patient-text)',
    fontFamily: 'var(--font-body)',
    outline: 'none',
  }

  return (
    <div style={{
      background: 'var(--patient-surface)',
      border: '1px solid var(--patient-border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
    }}>
      {/* Section header */}
      <div style={{
        position: 'relative',
        padding: '0.75rem 1.25rem',
        borderBottom: isEditing || !noData ? '1px solid var(--patient-border)' : 'none',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--patient-text)', marginBottom: '0.15rem' }}>
          {section.title}
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--patient-text-muted)' }}>{section.description}</p>
        {!isEditing && (
          <button
            onClick={onEdit}
            style={{
              position: 'absolute',
              right: '1.25rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: '1px solid var(--patient-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.3rem 0.8rem',
              fontSize: '0.75rem',
              color: noData ? 'var(--patient-accent)' : 'var(--patient-text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            {noData ? '+ Add' : 'Edit'}
          </button>
        )}
      </div>

      {/* Body */}
      {(isEditing || !noData) && (
        <div style={{ padding: '1rem 1.25rem' }}>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {section.fields.map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--patient-text-muted)', marginBottom: '0.3rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={draft[field.key] ?? ''}
                      onChange={e => onDraftChange({ ...draft, [field.key]: e.target.value })}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={draft[field.key] ?? ''}
                      onChange={e => onDraftChange({ ...draft, [field.key]: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="">Select...</option>
                      {field.options!.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type ?? 'text'}
                      value={draft[field.key] ?? ''}
                      onChange={e => onDraftChange({ ...draft, [field.key]: e.target.value })}
                      style={inputStyle}
                    />
                  )}
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.25rem' }}>
                <button
                  onClick={onSave}
                  disabled={saving}
                  style={{
                    background: saving ? 'var(--patient-border)' : 'var(--patient-accent)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem 1.2rem',
                    fontSize: '0.8rem',
                    color: 'white',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 500,
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={onCancel}
                  style={{
                    background: 'none',
                    border: '1px solid var(--patient-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem 1.2rem',
                    fontSize: '0.8rem',
                    color: 'var(--patient-text-muted)',
                    fontFamily: 'var(--font-body)',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {section.fields.map(field => {
                const value = data[field.key]
                if (!value) return null
                return (
                  <div key={field.key}>
                    <p style={{ fontSize: '0.72rem', color: 'var(--patient-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginBottom: '0.2rem' }}>
                      {field.label}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--patient-text)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {value}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
