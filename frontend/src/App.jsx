import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import WorkspacesPage from './pages/WorkspacesPage';
import BoardPage from './pages/BoardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('prosync-auth') === 'true'
  );
  const location = useLocation();

  const handleAuthChange = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('prosync-auth');
    localStorage.removeItem('prosync-user');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated && !['/login', '/register'].includes(location.pathname)) {
    return <Navigate to="/login" replace />;
  }

  if (isAuthenticated && ['/login', '/register'].includes(location.pathname)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {isAuthenticated && <Sidebar onLogout={handleLogout} />}
      <main className={isAuthenticated ? 'flex-1 overflow-y-auto bg-gray-50' : 'flex-1'}>
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <WorkspacesPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/board"
            element={isAuthenticated ? <BoardPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/login"
            element={<LoginPage onLogin={handleAuthChange} />}
          />
          <Route
            path="/register"
            element={<RegisterPage onRegister={handleAuthChange} />}
          />
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />}
          />
        </Routes>
      </main>
    </div>
  );
}
