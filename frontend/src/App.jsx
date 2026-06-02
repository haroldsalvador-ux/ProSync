import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardHome from './pages/DashboardHome';
import WorkspacesPage from './pages/WorkspacesPage';
import BoardPage from './pages/BoardPage';
import TasksPage from './pages/TasksPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-blaugrana">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard"   element={<DashboardHome />} />
            <Route path="/workspaces"  element={<WorkspacesPage />} />
            <Route path="/board"       element={<BoardPage />} />
            <Route path="/tasks"       element={<TasksPage />} />
            <Route path="/reports"     element={<ReportsPage />} />
            <Route path="/settings"    element={<SettingsPage />} />
            <Route path="*"            element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
