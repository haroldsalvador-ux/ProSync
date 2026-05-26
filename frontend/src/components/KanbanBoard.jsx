import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { getTasks, updateTaskStatus, deleteTask } from '../api/tasks';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';

const COLUMNS = [
  { id: 'pending',     label: 'Por Hacer',   accent: '#6b7280', count: 0 },
  { id: 'in_progress', label: 'En Proceso',  accent: '#004170', count: 0 },
  { id: 'done',        label: 'Completado',  accent: '#10b981', count: 0 },
];

export default function KanbanBoard({ workspaceId }) {
  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showModal, setShowModal] = useState(false);
  const [movingId, setMovingId]   = useState(null);

  const load = useCallback(async () => {
    if (!workspaceId) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const data = await getTasks(workspaceId);
      setTasks(data);
    } catch {
      setError('No se pudo conectar con el servidor. Verifica que Spring Boot esté activo en :8081.');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id, newStatus) => {
    setMovingId(id);
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    try {
      await updateTaskStatus(id, newStatus);
    } catch {
      load(); // Revert on error
    } finally {
      setMovingId(null);
    }
  };

  const handleDelete = async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await deleteTask(id);
    } catch {
      load();
    }
  };

  const handleCreated = (task) => {
    setTasks(prev => [...prev, task]);
  };

  if (!workspaceId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle size={36} className="text-white/20 mb-3" />
        <p className="text-white/40 text-sm">Selecciona un workspace para ver sus tareas.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <RefreshCw size={20} className="animate-spin mr-3" />
        Cargando tareas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center">
        <AlertCircle size={24} className="text-red-400 mx-auto mb-3" />
        <p className="text-red-400 text-sm mb-3">{error}</p>
        <button onClick={load} className="btn-ghost text-sm px-4 py-2">Reintentar</button>
      </div>
    );
  }

  return (
    <>
      {/* Acciones del board */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={15} /> Nueva Tarea
        </button>
      </div>

      {/* Columnas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="flex flex-col gap-3">
              {/* Header de columna */}
              <div
                className="glass-card rounded-xl px-4 py-3 flex items-center justify-between"
                style={{ borderLeft: `3px solid ${col.accent}` }}
              >
                <span className="text-white/80 font-semibold text-sm">{col.label}</span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full text-white/60 bg-white/10"
                >
                  {colTasks.length}
                </span>
              </div>

              {/* Tarjetas */}
              <div className="space-y-2.5 min-h-[120px]">
                {colTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    loading={movingId === task.id}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div className="glass-card rounded-xl px-4 py-6 text-center border-dashed">
                    <p className="text-white/20 text-xs">Sin tareas</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <CreateTaskModal
          workspaceId={workspaceId}
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  );
}
