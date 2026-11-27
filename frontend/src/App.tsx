import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import AuthSplitLayout from './pages/AuthSplitLayout';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ScratchpadPage from './pages/ScratchpadPage';
import ArchivePage from './pages/ArchivePage';
import InsightsPage from './pages/InsightsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<AuthSplitLayout />}>
            <Route path="/login" element={null} />
            <Route path="/signup" element={null} />
          </Route>
          <Route path="/register" element={<Navigate to="/signup" replace />} />
          <Route path="/scratchpad" element={<ScratchpadPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
