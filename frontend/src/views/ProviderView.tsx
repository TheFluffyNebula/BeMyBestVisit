import { useState } from 'react'

export default function ProviderView() {
  const [notes, setNotes] = useState('')
  const [audio, setAudio] = useState<File | null>(null)
  const [status, setStatus] = useState('')

  const handleSubmit = async () => {
    setStatus('Submitting...')
    const formData = new FormData()
    formData.append('notes', notes)
    if (audio) formData.append('audio', audio)

    const res = await fetch('http://localhost:8000/api/visits/summarize', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    console.log(data)
    setStatus('Visit submitted! Summary: ' + data.summary)
    setNotes('')
    setAudio(null)
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h1>Provider Dashboard</h1>
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
        <button onClick={handleSubmit} disabled={!notes}>
          Submit Visit
        </button>
        {status && <p>{status}</p>}
      </div>
    </div>
  )
}
