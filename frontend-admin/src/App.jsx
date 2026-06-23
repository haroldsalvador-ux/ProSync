import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardHome from './pages/DashboardHome';
import ReportsPage from './pages/ReportsPage';
import LogsPage from './pages/LogsPage';
import UsersPage from './pages/UsersPage';
import WorkspacesAdminPage from './pages/WorkspacesAdminPage';

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
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/reports"   element={<ReportsPage />} />
            <Route path="/logs"      element={<LogsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/workspaces" element={<WorkspacesAdminPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}