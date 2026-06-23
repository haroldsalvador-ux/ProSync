import { useState, useEffect } from 'react';
import { RefreshCw, Layers, Users } from 'lucide-react';
import { getAdminWorkspaces } from '../api/admin';

const DEPT_COLOR = {
  Engineering: 'bg-blue-500/15 text-blue-400',
  Marketing:   'bg-pink-500/15 text-pink-400',
  Design:      'bg-purple-500/15 text-purple-400',
  Product:     'bg-amber-500/15 text-amber-400',
  Sales:       'bg-emerald-500/15 text-emerald-400',
  HR:          'bg-cyan-500/15 text-cyan-400',
  Finance:     'bg-lime-500/15 text-lime-400',
  Operations:  'bg-orange-500/15 text-orange-400',
};

export default function WorkspacesAdminPage() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    getAdminWorkspaces()
      .then(setWorkspaces)
      .catch(() => setError('No se pudieron cargar los workspaces'))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso) => new Date(iso).toLocaleDateString('es-PE', { dateStyle: 'medium' });

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8 flex items-center gap-3">
        <Layers size={20} className="text-burgundy-light" />
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Workspaces</h1>
          <p className="text-white/40 text-sm">Proyectos activos en toda la plataforma</p>
        </div>
      </div>

      {error && (
        <div className="glass-card rounded-2xl p-5 text-center text-red-400 text-sm mb-6">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-32 text-white/40">
          <RefreshCw size={20} className="animate-spin mr-3" /> Cargando workspaces...
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.length === 0 ? (
            <p className="text-white/30 text-sm col-span-full text-center py-10">Sin workspaces registrados</p>
          ) : (
            workspaces.map(ws => (
              <div key={ws.id} className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold text-sm truncate">{ws.name}</h3>
                  {ws.department && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${DEPT_COLOR[ws.department] ?? 'bg-white/10 text-white/50'}`}>
                      {ws.department}
                    </span>
                  )}
                </div>
                {ws.description && (
                  <p className="text-white/40 text-xs mb-4 line-clamp-2">{ws.description}</p>
                )}
                <div className="flex items-center justify-between text-xs border-t border-white/10 pt-3">
                  <div>
                    <p className="text-white/30 text-[10px] mb-0.5">Manager</p>
                    <p className="text-white/70 truncate max-w-[140px]">{ws.owner ?? '—'}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/50">
                    <Users size={13} />
                    <span>{ws.member_count}</span>
                  </div>
                </div>
                <p className="text-white/20 text-[10px] mt-3">Creado: {formatDate(ws.created_at)}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}