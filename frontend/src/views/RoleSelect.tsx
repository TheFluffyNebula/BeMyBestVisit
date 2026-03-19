import { useNavigate } from 'react-router-dom'

export default function RoleSelect() {
  const navigate = useNavigate()

  return (
    <div style={{ textAlign: 'center', marginTop: '20vh' }}>
      <h1>Welcome to BeMyBestVisit</h1>
      <p>Select your role to continue</p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
        <button onClick={() => navigate('/provider')}>I'm a Provider</button>
        <button onClick={() => navigate('/patient')}>I'm a Patient</button>
      </div>
    </div>
  )
}
