import { useState, useEffect } from 'react';
import { Layers, Users, CheckSquare, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMetrics } from '../api/admin';

export default function DashboardHome() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [error, setError]     = useState('');

  useEffect(() => {
    getMetrics().then(setMetrics).catch(() => setError('No se pudieron cargar las métricas'));
  }, []);

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <p className="text-white/40 text-sm mb-1">Bienvenido,</p>
        <h1 className="text-2xl font-bold text-white">{user?.username ?? 'Admin'}</h1>
      </div>

      {error && (
        <div className="glass-card rounded-2xl p-5 text-center text-red-400 text-sm mb-6">{error}</div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Workspaces', value: metrics?.workspaces ?? '—', icon: Layers,      color: 'text-purple-400'  },
          { label: 'Usuarios',   value: metrics?.users ?? '—',      icon: Users,       color: 'text-blue-400'    },
          { label: 'Tareas',     value: metrics?.tasks ?? '—',      icon: CheckSquare, color: 'text-amber-400'   },
          { label: 'Acciones (24h)', value: metrics?.recent_actions ?? '—', icon: Activity, color: 'text-emerald-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card rounded-2xl p-5">
            <div className={`${color} mb-3`}><Icon size={20} /></div>
            <p className="text-3xl font-bold text-white mb-0.5">{value}</p>
            <p className="text-white/40 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {metrics?.top_actions?.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-white font-semibold text-sm mb-4">Actividad Reciente</h2>
          <div className="space-y-2">
            {metrics.top_actions.map((log, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <div className="w-1.5 h-1.5 rounded-full bg-burgundy-light flex-shrink-0" />
                <span className="text-white/60 text-xs font-medium flex-1">{log.action}</span>
                <span className="text-white/30 text-xs">{log.total} veces</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}