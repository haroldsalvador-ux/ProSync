import { useState, useEffect } from 'react';
import { RefreshCw, Users, ShieldOff, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAppUsers, toggleBlockUser } from '../api/admin';

export default function UsersPage() {
  const [data, setData]       = useState(null);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [busyId, setBusyId]   = useState(null);

  const load = () => {
    setLoading(true);
    getAppUsers(page)
      .then(setData)
      .catch(() => setError('No se pudieron cargar los usuarios'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const handleToggle = async (userId) => {
    setBusyId(userId);
    try {
      await toggleBlockUser(userId);
      load();
    } catch {
      setError('No se pudo actualizar el usuario');
    } finally {
      setBusyId(null);
    }
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString('es-PE', { dateStyle: 'medium' });

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8 flex items-center gap-3">
        <Users size={20} className="text-burgundy-light" />
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Usuarios</h1>
          <p className="text-white/40 text-sm">Gestión de cuentas registradas en la plataforma</p>
        </div>
      </div>

      {error && (
        <div className="glass-card rounded-2xl p-5 text-center text-red-400 text-sm mb-6">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-32 text-white/40">
          <RefreshCw size={20} className="animate-spin mr-3" /> Cargando usuarios...
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-xs">
                <th className="text-left px-5 py-3 font-medium">Nombre</th>
                <th className="text-left px-5 py-3 font-medium">Correo</th>
                <th className="text-left px-5 py-3 font-medium">Registrado</th>
                <th className="text-left px-5 py-3 font-medium">Estado</th>
                <th className="text-right px-5 py-3 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {data?.results?.length > 0 ? (
                data.results.map(u => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 text-white/80 text-xs font-medium">{u.full_name}</td>
                    <td className="px-5 py-3 text-white/60 text-xs">{u.email}</td>
                    <td className="px-5 py-3 text-white/40 text-xs">{formatDate(u.created_at)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        u.is_blocked ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'
                      }`}>
                        {u.is_blocked ? 'Bloqueado' : 'Activo'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleToggle(u.id)}
                        disabled={busyId === u.id}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                          u.is_blocked
                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        }`}
                      >
                        {u.is_blocked ? <ShieldCheck size={13} /> : <ShieldOff size={13} />}
                        {u.is_blocked ? 'Desbloquear' : 'Bloquear'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-white/30 text-xs py-10">Sin usuarios registrados</td>
                </tr>
              )}
            </tbody>
          </table>

          {data && (data.next || data.previous) && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/10">
              <button disabled={!data.previous} onClick={() => setPage(p => p - 1)}
                className="flex items-center gap-1 text-xs text-white/50 hover:text-white disabled:opacity-30 transition-colors">
                <ChevronLeft size={14} /> Anterior
              </button>
              <span className="text-white/30 text-xs">Página {page} · {data.count} usuarios</span>
              <button disabled={!data.next} onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-1 text-xs text-white/50 hover:text-white disabled:opacity-30 transition-colors">
                Siguiente <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}