import { useState, useEffect } from 'react';
import { Plus, Layers, RefreshCw } from 'lucide-react';
import { getWorkspaces } from '../api/workspaces';
import WorkspaceCard from '../components/WorkspaceCard';
import CreateWorkspaceModal from '../components/CreateWorkspaceModal';

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [showModal, setShowModal]   = useState(false);

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
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy">Espacios de Trabajo</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona tus workspaces y equipos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-burgundy text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-burgundy-dark transition-colors shadow-sm"
        >
          <Plus size={16} />
          Nuevo Espacio
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <RefreshCw size={24} className="animate-spin mr-3" />
          Cargando espacios...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 text-sm mb-3">{error}</p>
          <button onClick={load} className="text-sm text-red-700 underline hover:no-underline">
            Reintentar
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && workspaces.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Layers size={48} className="text-gray-200 mb-4" />
          <h3 className="text-gray-400 font-medium mb-1">Sin espacios de trabajo</h3>
          <p className="text-gray-300 text-sm mb-4">Crea tu primer workspace para empezar</p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-burgundy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-burgundy-dark transition-colors"
          >
            <Plus size={14} />
            Crear Espacio
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && workspaces.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
