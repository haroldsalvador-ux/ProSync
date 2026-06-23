import { useState, useEffect } from 'react';
import {
  RefreshCw, Layers, CheckSquare, Activity,
  TrendingUp, Clock, AlertTriangle,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { getAllTasks } from '../api/tasks';
import { getWorkspaces } from '../api/workspaces';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 text-xs border border-white/10 bg-[#1a1025]/90 backdrop-blur-md">
      <p className="text-white/50 mb-1.5">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="mb-0.5">
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // lunes = 0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function ReportsPage() {
  const [tasks, setTasks]           = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedWs, setSelectedWs] = useState('all');

  useEffect(() => {
    Promise.all([getAllTasks().catch(() => []), getWorkspaces().catch(() => [])])
      .then(([t, w]) => { setTasks(t); setWorkspaces(w); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32 text-white/40">
      <RefreshCw size={20} className="animate-spin mr-3" /> Cargando reportes...
    </div>
  );

  const pending    = tasks.filter(t => t.status === 'pending').length;
  const teamTasks = selectedWs === 'all' ? tasks : tasks.filter(t => t.workspaceId === selectedWs);
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const done       = tasks.filter(t => t.status === 'done').length;
  const total      = tasks.length;
  const pct = n => total > 0 ? Math.round((n / total) * 100) : 0;

  // ── Tareas en riesgo (vencidas, no completadas) ──
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const atRisk = teamTasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.status !== 'done').length;

  // ── Tiempo medio de completado (días) ──
  const doneTasks = teamTasks.filter(t => t.status === 'done' && t.createdAt && t.updatedAt);
  const avgDays = doneTasks.length > 0
    ? (doneTasks.reduce((sum, t) => sum + (new Date(t.updatedAt) - new Date(t.createdAt)), 0)
        / doneTasks.length / 86400000).toFixed(1)
    : 0;

  // ── Velocidad semanal (últimas 6 semanas) ──
  const weeks = [];
  for (let i = 5; i >= 0; i--) {
    const ws = startOfWeek(new Date());
    ws.setDate(ws.getDate() - i * 7);
    weeks.push(ws);
  }
  const weeklyVelocity = weeks.map(ws => {
    const we = new Date(ws); we.setDate(we.getDate() + 7);
    const creadas     = teamTasks.filter(t => t.createdAt && new Date(t.createdAt) >= ws && new Date(t.createdAt) < we).length;
    const completadas = teamTasks.filter(t => t.status === 'done' && t.updatedAt && new Date(t.updatedAt) >= ws && new Date(t.updatedAt) < we).length;
    return { label: ws.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }), creadas, completadas };
  });

  // ── Velocidad por miembro (de tus workspaces) ──
  const memberMap = {};
  teamTasks.forEach(t => {
    const m = t.assignee || 'Sin asignar';
    if (!memberMap[m]) memberMap[m] = { member: m, completadas: 0, en_progreso: 0, pendientes: 0 };
    if (t.status === 'done') memberMap[m].completadas++;
    else if (t.status === 'in_progress') memberMap[m].en_progreso++;
    else memberMap[m].pendientes++;
  });
  const memberVelocity = Object.values(memberMap)
    .sort((a, b) => b.completadas - a.completadas)
    .slice(0, 8);

  // ── Tareas por workspace ──
  const wsTaskMap = {};
  workspaces.forEach(w => { wsTaskMap[w.id] = { name: w.name, count: 0 }; });
  tasks.forEach(t => { if (wsTaskMap[t.workspaceId]) wsTaskMap[t.workspaceId].count++; });
  const wsStats    = Object.values(wsTaskMap).sort((a, b) => b.count - a.count);
  const maxWsCount = Math.max(...wsStats.map(w => w.count), 1);

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Reportes</h1>
        <p className="text-white/40 text-sm">Tus workspaces y tareas</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Workspaces',  value: workspaces.length, icon: Layers,      color: 'text-purple-400'  },
          { label: 'Tareas',      value: total,              icon: CheckSquare, color: 'text-amber-400'   },
          { label: 'Completadas', value: done,                icon: Activity,    color: 'text-emerald-400' },
          { label: 'En Riesgo',   value: atRisk,              icon: AlertTriangle, color: 'text-red-400'   },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card rounded-2xl p-5">
            <div className={`${color} mb-3`}><Icon size={20} /></div>
            <p className="text-3xl font-bold text-white mb-0.5">{value}</p>
            <p className="text-white/40 text-xs">{label}</p>
          </div>
        ))}
      </div>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Velocidad de tu Equipo</h2>
          <select
            value={selectedWs}
            onChange={e => setSelectedWs(e.target.value)}
            className="input-glass appearance-none text-xs w-auto px-3 py-1.5"
          >
            <option value="all">Todos mis workspaces</option>
            {workspaces.map(ws => (
              <option key={ws.id} value={ws.id}>{ws.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { label: 'Tasa de Completado',    value: `${pct(done)}%`, icon: TrendingUp, color: 'text-emerald-400' },
            { label: 'Tiempo Medio por Tarea', value: `${avgDays}d`,   icon: Clock,      color: 'text-amber-400'   },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass-card rounded-2xl p-5">
              <div className={`${color} mb-3`}><Icon size={20} /></div>
              <p className="text-3xl font-bold text-white mb-0.5">{value}</p>
              <p className="text-white/40 text-xs">{label}</p>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-6 mb-6">
          <h3 className="text-white font-semibold text-sm mb-6">Velocidad Semanal — Creadas vs Completadas</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyVelocity} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gCreadas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="gCompletadas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', paddingTop: 12 }} />
              <Area type="monotone" dataKey="creadas"     name="Creadas"     stroke="#8b5cf6" strokeWidth={2} fill="url(#gCreadas)"     />
              <Area type="monotone" dataKey="completadas" name="Completadas" stroke="#10b981" strokeWidth={2} fill="url(#gCompletadas)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {memberVelocity.length > 0 && (
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-white font-semibold text-sm mb-6">Velocidad por Miembro</h3>
            <ResponsiveContainer width="100%" height={Math.max(memberVelocity.length * 50, 160)}>
              <BarChart layout="vertical" data={memberVelocity} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="member" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', paddingTop: 12 }} />
                <Bar dataKey="completadas" name="Completadas" stackId="a" fill="#10b981" />
                <Bar dataKey="en_progreso" name="En Progreso" stackId="a" fill="#3b82f6" />
                <Bar dataKey="pendientes"  name="Pendientes"  stackId="a" fill="#6b7280" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-white font-semibold text-sm mb-5">Distribución por Estado</h2>
          <div className="space-y-4">
            {[
              { label: 'Por Hacer',  value: pending,    p: pct(pending),    color: 'bg-gray-500'    },
              { label: 'En Proceso', value: inProgress, p: pct(inProgress), color: 'bg-blue-500'    },
              { label: 'Completado', value: done,        p: pct(done),       color: 'bg-emerald-500' },
            ].map(({ label, value, p, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-white/70">{label}</span>
                  <span className="text-white/40">{value} ({p}%)</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${p}%` }} />
                </div>
              </div>
            ))}
          </div>
          {total === 0 && <p className="text-white/20 text-xs text-center mt-4">Sin tareas registradas</p>}
        </div>

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
                    <div className="h-full bg-burgundy rounded-full transition-all duration-700"
                         style={{ width: `${Math.round((count / maxWsCount) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}