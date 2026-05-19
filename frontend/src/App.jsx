import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import WorkspacesPage from './pages/WorkspacesPage';
import BoardPage from './pages/BoardPage';

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Routes>
          <Route path="/" element={<WorkspacesPage />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="*" element={<WorkspacesPage />} />
        </Routes>
      </main>
    </div>
  );
}
