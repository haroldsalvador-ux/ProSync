import { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { getVelocity } from '../api/admin';

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

export default function ReportsPage() {
  const [velocity, setVelocity] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    getVelocity()
      .then(setVelocity)
      .catch(() => setError('No se pudo cargar el dashboard de velocidad'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32 text-white/40">
      <RefreshCw size={20} className="animate-spin mr-3" /> Cargando reportes...
    </div>
  );

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Reportes</h1>
        <p className="text-white/40 text-sm">Velocidad global del equipo</p>
      </div>

      {error && (
        <div className="glass-card rounded-2xl p-5 text-center text-red-400 text-sm mb-6">{error}</div>
      )}

      {velocity && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Tasa de Completado',     value: `${velocity.completion_rate}%`,     icon: TrendingUp,    color: 'text-emerald-400' },
              { label: 'Tiempo Medio por Tarea',  value: `${velocity.avg_completion_days}d`, icon: Clock,         color: 'text-amber-400'   },
              { label: 'Tareas en Riesgo',        value: velocity.tasks_at_risk,              icon: AlertTriangle, color: 'text-red-400'     },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="glass-card rounded-2xl p-5">
                <div className={`${color} mb-3`}><Icon size={20} /></div>
                <p className="text-3xl font-bold text-white mb-0.5">{value}</p>
                <p className="text-white/40 text-xs">{label}</p>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6">
            <h3 className="text-white font-semibold text-sm mb-6">
              Velocidad Semanal — Creadas vs Completadas
            </h3>
            {velocity.weekly_velocity.length === 0 ? (
              <p className="text-white/20 text-xs text-center py-10">Sin datos de las últimas 6 semanas</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={velocity.weekly_velocity} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
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
            )}
          </div>

          {velocity.member_velocity.length > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-white font-semibold text-sm mb-6">Velocidad por Miembro</h3>
              <ResponsiveContainer width="100%" height={Math.max(velocity.member_velocity.length * 50, 160)}>
                <BarChart layout="vertical" data={velocity.member_velocity} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
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
        </>
      )}
    </div>
  );
}