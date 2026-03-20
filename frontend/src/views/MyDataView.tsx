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

  if (!loaded) return <div style={{ maxWidth: '700px', margin: '3rem auto', padding: '0 1.5rem' }}>Loading...</div>

  return (
    <div style={{ maxWidth: '760px', margin: '2rem auto', padding: '0 1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
        <button
          onClick={() => navigate('/patient')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: 0 }}
        >
          ←
        </button>
        <h1 style={{ margin: 0 }}>My Health Data</h1>
      </div>
      <p style={{ color: '#888', marginBottom: '2.5rem' }}>
        This is the information the application stores on you. Click Edit on any section to update it.
      </p>

      {/* Groups */}
      {SECTION_GROUPS.map(group => (
        <div key={group.id} style={{ marginBottom: '2.5rem' }}>
          {/* Group header */}
          <div style={{ borderBottom: '2px solid #333', marginBottom: '1.25rem', paddingBottom: '0.4rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>{group.title}</h2>
            <p style={{ margin: '0.2rem 0 0', color: '#888', fontSize: '0.85rem' }}>{group.subtitle}</p>
          </div>

          {/* Sections within group */}
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
      ))}
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

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '10px',
      marginBottom: '1rem',
      overflow: 'hidden',
    }}>
      {/* Section header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1.25rem',
        background: '#fafafa',
        borderBottom: '1px solid #e0e0e0',
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '0.95rem' }}>{section.title}</h3>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#999' }}>{section.description}</p>
        </div>
        {!isEditing && (
          <button onClick={onEdit} style={{ fontSize: '0.85rem', flexShrink: 0, marginLeft: '1rem' }}>
            {noData ? '+ Add' : 'Edit'}
          </button>
        )}
      </div>

      <div style={{ padding: '1rem 1.25rem' }}>
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {section.fields.map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#555', marginBottom: '0.3rem' }}>
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={draft[field.key] ?? ''}
                    onChange={e => onDraftChange({ ...draft, [field.key]: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={draft[field.key] ?? ''}
                    onChange={e => onDraftChange({ ...draft, [field.key]: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box' }}
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
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                )}
              </div>
            ))}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button onClick={onSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={onCancel} style={{ background: 'none', border: '1px solid #ccc' }}>
                Cancel
              </button>
            </div>
          </div>
        ) : noData ? (
          <p style={{ margin: 0, color: '#bbb', fontStyle: 'italic', fontSize: '0.9rem' }}>
            No information added yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {section.fields.map(field => {
              const value = data[field.key]
              if (!value) return null
              return (
                <div key={field.key}>
                  <span style={{ fontSize: '0.8rem', color: '#999', display: 'block' }}>{field.label}</span>
                  <span style={{ whiteSpace: 'pre-wrap' }}>{value}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
