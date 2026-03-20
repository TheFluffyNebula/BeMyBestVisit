import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './views/Login'
import ProviderView from './views/ProviderView'
import PatientView from './views/PatientView'
import VisitDetail from './views/VisitDetail'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/provider"
          element={
            <ProtectedRoute role="provider">
              <ProviderView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient"
          element={
            <ProtectedRoute role="patient">
              <PatientView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/visit/:id"
          element={
            <ProtectedRoute role="patient">
              <VisitDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}
