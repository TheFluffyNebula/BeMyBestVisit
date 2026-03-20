import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './views/Login'
import ProviderView from './views/ProviderView'
import PatientView from './views/PatientView'
import VisitDetail from './views/VisitDetail'
import RequestDataView from './views/RequestDataView'
import PendingRequestsView from './views/PendingRequestsView'
import DH9FormView from './views/DH9FormView'

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
          path="/provider/request" 
          element={
            <ProtectedRoute role="provider">
              <RequestDataView />
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
        <Route 
          path="/patient/requests" 
            element={
              <ProtectedRoute role="patient">
                <PendingRequestsView />
              </ProtectedRoute>
            } 
          />
        <Route 
          path="/patient/dh9/:requestId" 
            element={
              <ProtectedRoute role="patient">
                <DH9FormView />
              </ProtectedRoute>
            } 
          />
      </Routes>
    </AuthProvider>
  )
}
