import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, AlertCircle, Calendar, User, Flag, ExternalLink } from 'lucide-react';
import { getAllTasks } from '../api/tasks';
import { getWorkspaces } from '../api/workspaces';

const STATUS_LABEL = { pending: 'Por Hacer', in_progress: 'En Proceso', done: 'Completado' };
const STATUS_COLOR = {
  pending:     'bg-slate-400/20 text-slate-300 border-slate-400/30',
  in_progress: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  done:        'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};
const PRIORITY_COLOR = {
  low:    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  high:   'bg-red-500/20 text-red-300 border-red-500/30',
};
const PRIORITY_LABEL = { low: 'Baja', medium: 'Media', high: 'Alta' };

function formatDate(d) {
  if (!d) return null;
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

export default function TasksPage() {
  const navigate  = useNavigate();
  const [tasks, setTasks]           = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [filterWs, setFilterWs]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [search, setSearch]         = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [t, w] = await Promise.all([getAllTasks(), getWorkspaces()]);
      setTasks(t);
      setWorkspaces(w);
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const wsMap = Object.fromEntries(workspaces.map(w => [w.id, w.name]));

  const filtered = tasks.filter(t => {
    if (filterWs     && t.workspaceId !== filterWs) return false;
    if (filterStatus && t.status      !== filterStatus) return false;
    if (filterPriority && t.priority  !== filterPriority) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!t.title.toLowerCase().includes(q) &&
          !(t.assignee?.toLowerCase().includes(q)) &&
          !(t.description?.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  if (loading) return (
    <div className="flex items-center justify-center py-32 text-white/40">
      <RefreshCw size={20} className="animate-spin mr-3" /> Cargando tareas...
    </div>
  );

  if (error) return (
    <div className="p-8">
      <div className="glass-card rounded-2xl p-6 text-center">
        <AlertCircle size={24} className="text-red-400 mx-auto mb-3" />
        <p className="text-red-400 text-sm mb-3">{error}</p>
        <button onClick={load} className="btn-ghost text-sm px-4 py-2">Reintentar</button>
      </div>
    </div>
  );

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Todas las Tareas</h1>
        <p className="text-white/40 text-sm">{filtered.length} tarea{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Filtros */}
      <div className="glass-card rounded-2xl p-4 mb-6 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por título, responsable..."
          className="input-glass text-sm flex-1 min-w-[180px]"
        />
        <select value={filterWs} onChange={e => setFilterWs(e.target.value)} className="input-glass text-sm w-48">
          <option value="">Todos los workspaces</option>
          {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-glass text-sm w-40">
          <option value="">Todos los estados</option>
          <option value="pending">Por Hacer</option>
          <option value="in_progress">En Proceso</option>
          <option value="done">Completado</option>
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="input-glass text-sm w-36">
          <option value="">Todas las prioridades</option>
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
        </select>
        {(filterWs || filterStatus || filterPriority || search) && (
          <button
            onClick={() => { setFilterWs(''); setFilterStatus(''); setFilterPriority(''); setSearch(''); }}
            className="btn-ghost text-xs px-3"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <AlertCircle size={32} className="text-white/20 mb-3" />
          <p className="text-white/40 text-sm">No se encontraron tareas con esos filtros.</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Encabezado tabla */}
          <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-white/10 text-white/30 text-xs font-semibold uppercase tracking-wide">
            <div className="col-span-4">Tarea</div>
            <div className="col-span-2">Workspace</div>
            <div className="col-span-2">Estado</div>
            <div className="col-span-1">Prioridad</div>
            <div className="col-span-2">Responsable</div>
            <div className="col-span-1">Vence</div>
          </div>

          {/* Filas */}
          {filtered.map((task, i) => (
            <div
              key={task.id}
              className={`grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-white/5 transition-colors ${
                i < filtered.length - 1 ? 'border-b border-white/5' : ''
              }`}
            >
              {/* Título */}
              <div className="col-span-4 min-w-0">
                <p className="text-white/85 text-sm font-medium truncate">{task.title}</p>
                {task.description && (
                  <p className="text-white/30 text-xs truncate mt-0.5">{task.description}</p>
                )}
              </div>

              {/* Workspace */}
              <div className="col-span-2 min-w-0">
                <button
                  onClick={() => navigate(`/board?workspace=${task.workspaceId}&name=${encodeURIComponent(wsMap[task.workspaceId] ?? '')}`)}
                  className="flex items-center gap-1 text-xs text-white/40 hover:text-burgundy-light transition-colors truncate"
                >
                  <span className="truncate">{wsMap[task.workspaceId] ?? '—'}</span>
                  <ExternalLink size={10} className="flex-shrink-0" />
                </button>
              </div>

              {/* Estado */}
              <div className="col-span-2">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLOR[task.status] ?? ''}`}>
                  {STATUS_LABEL[task.status] ?? task.status}
                </span>
              </div>

              {/* Prioridad */}
              <div className="col-span-1">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_COLOR[task.priority] ?? ''}`}>
                  {PRIORITY_LABEL[task.priority] ?? task.priority}
                </span>
              </div>

              {/* Responsable */}
              <div className="col-span-2 flex items-center gap-1.5 min-w-0">
                {task.assignee ? (
                  <>
                    <User size={11} className="text-white/30 flex-shrink-0" />
                    <span className="text-white/50 text-xs truncate">{task.assignee}</span>
                  </>
                ) : <span className="text-white/20 text-xs">—</span>}
              </div>

              {/* Fecha límite */}
              <div className="col-span-1 flex items-center gap-1">
                {task.dueDate ? (
                  <>
                    <Calendar size={10} className="text-white/30" />
                    <span className="text-white/40 text-[10px]">{formatDate(task.dueDate)}</span>
                  </>
                ) : <span className="text-white/20 text-xs">—</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
