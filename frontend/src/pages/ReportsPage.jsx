import { useState, useEffect } from 'react';
import { RefreshCw, Users, Layers, CheckSquare, Activity } from 'lucide-react';
import { getAllTasks } from '../api/tasks';
import { getWorkspaces } from '../api/workspaces';

const ACTION_LABELS = {
  TASK_CREATED:        'Tarea creada',
  TASK_STATUS_CHANGED: 'Estado actualizado',
  TASK_DELETED:        'Tarea eliminada',
  USER_REGISTERED:     'Usuario registrado',
  USER_LOGIN:          'Inicio de sesión',
};

export default function ReportsPage() {
  const [metrics, setMetrics]     = useState(null);
  const [tasks, setTasks]         = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/api/admin/metrics/').then(r => r.ok ? r.json() : null).catch(() => null),
      getAllTasks().catch(() => []),
      getWorkspaces().catch(() => []),
    ]).then(([m, t, w]) => {
      setMetrics(m);
      setTasks(t);
      setWorkspaces(w);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32 text-white/40">
      <RefreshCw size={20} className="animate-spin mr-3" /> Cargando reportes...
    </div>
  );

  const pending    = tasks.filter(t => t.status === 'pending').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const done       = tasks.filter(t => t.status === 'done').length;
  const total      = tasks.length;
  const pct = (n) => total > 0 ? Math.round((n / total) * 100) : 0;

  // Tareas por workspace
  const wsTaskMap = {};
  workspaces.forEach(w => { wsTaskMap[w.id] = { name: w.name, count: 0 }; });
  tasks.forEach(t => { if (wsTaskMap[t.workspaceId]) wsTaskMap[t.workspaceId].count++; });
  const wsStats = Object.values(wsTaskMap).sort((a, b) => b.count - a.count);

  const maxWsCount = Math.max(...wsStats.map(w => w.count), 1);

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Reportes</h1>
        <p className="text-white/40 text-sm">Métricas globales del proyecto</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Workspaces', value: workspaces.length,            icon: Layers,      color: 'text-purple-400' },
          { label: 'Usuarios',   value: metrics?.users ?? '—',        icon: Users,       color: 'text-blue-400'   },
          { label: 'Tareas',     value: total,                        icon: CheckSquare, color: 'text-amber-400'  },
          { label: 'Completadas',value: done,                         icon: Activity,    color: 'text-emerald-400'},
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card rounded-2xl p-5">
            <div className={`${color} mb-3`}><Icon size={20} /></div>
            <p className="text-3xl font-bold text-white mb-0.5">{value}</p>
            <p className="text-white/40 text-xs">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Distribución de tareas */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-white font-semibold text-sm mb-5">Distribución por Estado</h2>
          <div className="space-y-4">
            {[
              { label: 'Por Hacer',  value: pending,    pct: pct(pending),    color: 'bg-gray-500' },
              { label: 'En Proceso', value: inProgress, pct: pct(inProgress), color: 'bg-blue-500' },
              { label: 'Completado', value: done,        pct: pct(done),       color: 'bg-emerald-500' },
            ].map(({ label, value, pct: p, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-white/70">{label}</span>
                  <span className="text-white/40">{value} ({p}%)</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all duration-700`}
                    style={{ width: `${p}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          {total === 0 && <p className="text-white/20 text-xs text-center mt-4">Sin tareas registradas</p>}
        </div>

        {/* Tareas por workspace */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-white font-semibold text-sm mb-5">Tareas por Workspace</h2>
          {wsStats.length === 0 ? (
            <p className="text-white/20 text-xs text-center mt-4">Sin datos</p>
          ) : (
            <div className="space-y-3">
              {wsStats.slice(0, 6).map(({ name, count }) => (
                <div key={name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-white/70 truncate max-w-[160px]">{name}</span>
                    <span className="text-white/40 ml-2">{count}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-burgundy rounded-full transition-all duration-700"
                      style={{ width: `${Math.round((count / maxWsCount) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actividad reciente (Django) */}
      {metrics?.recent_actions && metrics.recent_actions.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-white font-semibold text-sm mb-4">Actividad Reciente</h2>
          <div className="space-y-2">
            {metrics.recent_actions.slice(0, 10).map((log, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <div className="w-1.5 h-1.5 rounded-full bg-burgundy-light flex-shrink-0" />
                <span className="text-white/60 text-xs font-medium">
                  {ACTION_LABELS[log.action] ?? log.action}
                </span>
                <span className="text-white/30 text-xs flex-1 truncate">{log.user_email}</span>
                <span className="text-white/20 text-[10px] flex-shrink-0">
                  {log.created_at ? new Date(log.created_at).toLocaleDateString('es-ES') : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!metrics && (
        <div className="glass-card rounded-2xl p-5 text-center text-white/30 text-sm">
          El panel de auditoría requiere Django activo en :8000
        </div>
      )}
    </div>
  );
}
