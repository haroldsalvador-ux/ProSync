import { useState, useEffect } from 'react';
import { Plus, Layers, RefreshCw } from 'lucide-react';
import { getWorkspaces } from '../api/workspaces';
import { useAuth } from '../context/AuthContext';
import WorkspaceCard from '../components/WorkspaceCard';
import CreateWorkspaceModal from '../components/CreateWorkspaceModal';

export default function WorkspacesPage() {
  const { user }                      = useAuth();
  const [workspaces, setWorkspaces]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [showModal, setShowModal]     = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getWorkspaces();
      setWorkspaces(data);
    } catch {
      setError('No se pudo conectar con el servidor. Verifica que Spring Boot esté activo en :8081.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-white/40 text-sm mb-1">Bienvenido, {user?.fullName ?? 'Usuario'}</p>
          <h1 className="text-2xl font-bold text-white">Espacios de Trabajo</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> Nuevo Espacio
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24 text-white/40">
          <RefreshCw size={22} className="animate-spin mr-3" />
          Cargando espacios...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="glass-card rounded-2xl p-6 text-center">
          <p className="text-red-400 text-sm mb-3">{error}</p>
          <button onClick={load} className="btn-ghost text-sm px-4 py-2">Reintentar</button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && workspaces.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mb-4">
            <Layers size={28} className="text-white/20" />
          </div>
          <h3 className="text-white/60 font-medium mb-1">Sin espacios de trabajo</h3>
          <p className="text-white/30 text-sm mb-5">Crea tu primer workspace para empezar</p>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={14} /> Crear Espacio
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && workspaces.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map(ws => (
            <WorkspaceCard key={ws.id} workspace={ws} />
          ))}
        </div>
      )}

      {showModal && (
        <CreateWorkspaceModal
          onClose={() => setShowModal(false)}
          onCreated={(ws) => setWorkspaces(prev => [ws, ...prev])}
        />
      )}
    </div>
  );
}
