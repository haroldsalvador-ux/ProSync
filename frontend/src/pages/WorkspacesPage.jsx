import { useState, useEffect } from 'react';
import { Plus, Layers, RefreshCw, Search } from 'lucide-react';
import { getWorkspaces } from '../api/workspaces';
import { useAuth } from '../context/AuthContext';
import WorkspaceCard from '../components/WorkspaceCard';
import CreateWorkspaceModal from '../components/CreateWorkspaceModal';

const DEPARTMENTS = ['Engineering','Marketing','Design','Product','Sales','HR','Finance','Operations'];

export default function WorkspacesPage() {
  const { user }                      = useAuth();
  const [workspaces, setWorkspaces]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [search, setSearch]           = useState('');
  const [filterDept, setFilterDept]   = useState('');

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

  const filtered = workspaces.filter(ws => {
    if (filterDept && ws.department !== filterDept) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!ws.name.toLowerCase().includes(q) &&
          !(ws.description?.toLowerCase().includes(q)) &&
          !(ws.owner?.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-white/40 text-sm mb-1">Bienvenido, {user?.fullName ?? 'Usuario'}</p>
          <h1 className="text-2xl font-bold text-white">Espacios de Trabajo</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> Nuevo Espacio
        </button>
      </div>

      {/* Búsqueda y filtros */}
      {!loading && !error && workspaces.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar workspace..."
              className="input-glass pl-8 text-sm w-full"
            />
          </div>
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="input-glass text-sm w-48"
          >
            <option value="">Todos los departamentos</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {(search || filterDept) && (
            <button
              onClick={() => { setSearch(''); setFilterDept(''); }}
              className="btn-ghost text-xs px-3"
            >
              Limpiar
            </button>
          )}
          <span className="text-white/30 text-xs self-center">
            {filtered.length} de {workspaces.length}
          </span>
        </div>
      )}

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

      {/* Empty filter */}
      {!loading && !error && workspaces.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search size={28} className="text-white/20 mb-3" />
          <p className="text-white/40 text-sm">No hay workspaces con esos filtros.</p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(ws => (
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
