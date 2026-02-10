
import { Routes, Route, Navigate } from 'react-router-dom'
// import LoginNew from './Pages/LoginNew'
import Login from './Pages/Login'
import Register from './Pages/Register'
import CitizenDashboard from "./Pages/CitizenDashboard";
import ProtectedRoute from "./Components/ProtectedRoute";
import CreateComplaint from "./Pages/CreateComplaint";
import TrackComplaint from "./Pages/TrackComplaint";
import Profile from "./Pages/Profile";
import OfficerDashboard from "./Pages/OfficerDashboard";
import OfficerComplaintDetail from "./Pages/OfficerComplaintDetail";
import OfficerProfile from "./Pages/OfficerProfile";
import AdminDashboard from "./Pages/AdminDashboard";




const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/citizen" element={<ProtectedRoute role="Citizen"><CitizenDashboard /></ProtectedRoute>} />
      <Route path="/create" element={<ProtectedRoute role="Citizen"><CreateComplaint /></ProtectedRoute>} />
      <Route path="/track" element={<ProtectedRoute role="Citizen"><TrackComplaint /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute role="Citizen"><Profile /></ProtectedRoute>} />
      <Route path="/officer" element={<ProtectedRoute role="Officer"><OfficerDashboard /> </ProtectedRoute>} />
      <Route path="/officer/profile" element={<ProtectedRoute role="Officer"><OfficerProfile /></ProtectedRoute>} />
      <Route path="/officer/:id"element={<ProtectedRoute role="Officer"><OfficerComplaintDetail /></ProtectedRoute>}/>
      <Route path="/admin" element={ <ProtectedRoute role="Admin"><AdminDashboard /></ProtectedRoute>}/>


      {/* Redirect old route to new route */}
      <Route path="/CitizenDashboard" element={<Navigate to="/citizen" replace />} />

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/" replace />} />

      {/* <Route path="/" element={<LoginNew />} /> */}
    </Routes>
  )
}

export default App





