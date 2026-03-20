import { Routes, Route } from 'react-router-dom'
import RoleSelect from './views/RoleSelect'
import ProviderView from './views/ProviderView'
import PatientView from './views/PatientView'
import VisitDetail from './views/VisitDetail'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelect />} />
      <Route path="/provider" element={<ProviderView />} />
      <Route path="/patient" element={<PatientView />} />
      <Route path="/patient/visit/:id" element={<VisitDetail />} />
    </Routes>
  )
}
