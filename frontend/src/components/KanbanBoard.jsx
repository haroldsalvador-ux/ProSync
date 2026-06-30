import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, AlertCircle, Search } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { getTasks, updateTaskStatus, deleteTask } from '../api/tasks';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import TaskDetailModal, { labelColor } from './TaskDetailModal';

const COLUMNS = [
  { id: 'pending',     label: 'Por Hacer',  accent: '#94a3b8' },
  { id: 'in_progress', label: 'En Proceso', accent: '#22d3ee' },
  { id: 'done',        label: 'Completado', accent: '#10b981' },
];

export default function KanbanBoard({ workspaceId }) {
  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showModal, setShowModal] = useState(false);
  const [movingId, setMovingId]   = useState(null);
  const [search, setSearch]       = useState('');
  const [detailTask, setDetailTask] = useState(null);
  const [activeLabel, setActiveLabel] = useState(null);

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
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    try {
      await updateTaskStatus(id, newStatus);
    } catch {
      load();
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

  const handleCreated = (task) => setTasks(prev => [...prev, task]);

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;
    handleStatusChange(draggableId, destination.droppableId);
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

  const q = search.toLowerCase().trim();
  const taskLabels = (t) => (t.labels || '').split(',').map(s => s.trim()).filter(Boolean);
  const allLabels = [...new Set(tasks.flatMap(taskLabels))];

  const filtered = tasks.filter(t => {
    const matchesSearch = !q ||
      t.title.toLowerCase().includes(q) ||
      (t.assignee && t.assignee.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      taskLabels(t).some(l => l.toLowerCase().includes(q));
    const matchesLabel = !activeLabel || taskLabels(t).includes(activeLabel);
    return matchesSearch && matchesLabel;
  });

  const done  = tasks.filter(t => t.status === 'done').length;
  const total = tasks.length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Búsqueda */}
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar tareas..."
            className="input-glass pl-8 text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Progreso */}
          {total > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-white/40">
              <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span>{pct}% completado</span>
            </div>
          )}

          <button
            onClick={load}
            className="btn-ghost p-2"
            title="Recargar"
          >
            <RefreshCw size={14} className="text-white/40" />
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={15} /> Nueva Tarea
          </button>
        </div>
      </div>

      {/* Filtro por etiquetas */}
      {allLabels.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-5">
          {allLabels.map(l => (
            <button
              key={l}
              onClick={() => setActiveLabel(activeLabel === l ? null : l)}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                activeLabel === l
                  ? `${labelColor(l)} ring-1 ring-white/30`
                  : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
              }`}
            >
              {l}
            </button>
          ))}
          {activeLabel && (
            <button onClick={() => setActiveLabel(null)} className="text-[11px] text-white/30 hover:text-white/60 underline ml-1">
              limpiar filtro
            </button>
          )}
        </div>
      )}

      {/* Progreso móvil */}
      {total > 0 && (
        <div className="flex sm:hidden items-center gap-2 text-xs text-white/40 mb-4">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="shrink-0">{pct}% completado</span>
        </div>
      )}

      {/* Tablero Kanban */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map(col => {
            const colTasks = filtered.filter(t => t.status === col.id);
            return (
              <div key={col.id} className="flex flex-col gap-3">
                {/* Header de columna */}
                <div
                  className="glass-card rounded-xl px-4 py-3 flex items-center justify-between"
                  style={{ borderLeft: `3px solid ${col.accent}` }}
                >
                  <span className="text-white/80 font-semibold text-sm">{col.label}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white/60 bg-white/10">
                    {colTasks.length}
                  </span>
                </div>

                {/* Zona droppable */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-2.5 min-h-[120px] rounded-xl transition-colors duration-200 ${
                        snapshot.isDraggingOver ? 'bg-white/5 p-2' : ''
                      }`}
                    >
                      {colTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.85 : 1,
                              }}
                            >
                              <TaskCard
                                task={task}
                                loading={movingId === task.id}
                                onStatusChange={handleStatusChange}
                                onDelete={handleDelete}
                                onOpenDetail={setDetailTask}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {colTasks.length === 0 && (
                        <div className="glass-card rounded-xl px-4 py-6 text-center border-dashed">
                          <p className="text-white/20 text-xs">
                            {snapshot.isDraggingOver ? 'Suelta aquí' : 'Sin tareas'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {showModal && (
        <CreateTaskModal
          workspaceId={workspaceId}
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}

      {detailTask && (
        <TaskDetailModal task={detailTask} onClose={() => setDetailTask(null)} />
      )}
    </>
  );
}
