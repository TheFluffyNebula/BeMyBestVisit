import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SECTION_GROUPS } from '../data/healthProfile'
import { FORM_SECTIONS, FORM_LABELS } from '../data/formSections'
import type { Section } from '../data/healthProfile'

function isEmpty(obj: Record<string, string>) {
  return Object.values(obj).every(v => !v)
}

export default function DataPreviewView() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const authHeader = { Authorization: `Bearer ${user?.token}` }

  const formType = searchParams.get('form') ?? ''
  const highlightedSections = new Set(FORM_SECTIONS[formType] ?? [])
  const formLabel = FORM_LABELS[formType] ?? 'This form'

  const [profile, setProfile] = useState<Record<string, Record<string, string>>>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('http://localhost:8000/api/patient/profile', { headers: authHeader })
      .then(res => res.json())
      .then(data => { setProfile(data); setLoaded(true) })
  }, [])

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
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--patient-text-muted)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            padding: 0,
          }}
        >
          ← Back
        </button>
        <span style={{ color: 'var(--patient-border)' }}>|</span>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.1rem',
          fontWeight: 300,
          color: 'var(--patient-text)',
        }}>
          Data Preview
        </span>
      </div>

      {/* Banner */}
      <div style={{
        background: 'var(--patient-accent-light)',
        borderBottom: '1px solid var(--patient-accent)',
        padding: '0.85rem 2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <span style={{ fontSize: '1rem' }}>&#9432;</span>
        <p style={{ fontSize: '0.875rem', color: 'var(--patient-accent)', margin: 0 }}>
          The <strong>{formLabel}</strong> uses data from the highlighted sections below.
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        {SECTION_GROUPS.map(group => {
          const groupHasHighlight = group.sections.some(s => highlightedSections.has(s.id))
          return (
            <div key={group.id} style={{ marginBottom: '2.5rem' }}>

              {/* Group header */}
              <div style={{ marginBottom: '1rem', paddingBottom: '0.6rem', borderBottom: '1px solid var(--patient-border)' }}>
                <p style={{
                  fontSize: '0.75rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: groupHasHighlight ? 'var(--patient-accent)' : 'var(--patient-text-muted)',
                  fontWeight: 500,
                  marginBottom: '0.2rem',
                }}>
                  {group.title}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--patient-text-muted)' }}>{group.subtitle}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0 2.5rem' }}>
                {group.sections.map(section => (
                  <PreviewCard
                    key={section.id}
                    section={section}
                    data={profile[section.id] ?? {}}
                    highlighted={highlightedSections.has(section.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Preview card ───────────────────────────────────────────────────────────────

interface PreviewCardProps {
  section: Section
  data: Record<string, string>
  highlighted: boolean
}

function PreviewCard({ section, data, highlighted }: PreviewCardProps) {
  const noData = isEmpty(data)

  return (
    <div style={{
      background: highlighted ? 'var(--patient-surface)' : 'var(--patient-bg)',
      border: highlighted
        ? '2px solid var(--patient-accent)'
        : '1px solid var(--patient-border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      opacity: highlighted ? 1 : 0.45,
      transition: 'opacity 0.2s',
    }}>
      {/* Section header */}
      <div style={{
        position: 'relative',
        padding: '0.75rem 1.25rem',
        borderBottom: !noData || (noData && highlighted) ? '1px solid var(--patient-border)' : 'none',
        background: highlighted ? 'var(--patient-accent-light)' : 'transparent',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--patient-text)', marginBottom: '0.15rem' }}>
          {section.title}
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--patient-text-muted)' }}>{section.description}</p>
        {highlighted && (
          <span style={{
            position: 'absolute',
            right: '1.25rem',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '0.7rem',
            fontWeight: 500,
            color: 'var(--patient-accent)',
            background: 'var(--patient-accent-light)',
            border: '1px solid var(--patient-accent)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.2rem 0.6rem',
          }}>
            Used
          </span>
        )}
      </div>

      {/* Body */}
      {!noData && (
        <div style={{ padding: '1rem 1.25rem' }}>
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
        </div>
      )}

      {noData && highlighted && (
        <div style={{ padding: '0.75rem 1.25rem' }}>
          <p style={{ margin: 0, color: 'var(--patient-warning)', fontStyle: 'italic', fontSize: '0.85rem' }}>
            No data filled in yet - this section will be empty on the form.
          </p>
        </div>
      )}
    </div>
  )
}
