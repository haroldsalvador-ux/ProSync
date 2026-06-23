import { useState, useEffect } from 'react';
import { RefreshCw, FileClock, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAuditLogs } from '../api/admin';

export default function LogsPage() {
  const [data, setData]       = useState(null);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    setLoading(true);
    getAuditLogs(page)
      .then(setData)
      .catch(() => setError('No se pudieron cargar los logs'))
      .finally(() => setLoading(false));
  }, [page]);

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8 flex items-center gap-3">
        <FileClock size={20} className="text-burgundy-light" />
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Logs de Auditoría</h1>
          <p className="text-white/40 text-sm">Historial de acciones del sistema</p>
        </div>
      </div>

      {error && (
        <div className="glass-card rounded-2xl p-5 text-center text-red-400 text-sm mb-6">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-32 text-white/40">
          <RefreshCw size={20} className="animate-spin mr-3" /> Cargando logs...
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-xs">
                <th className="text-left px-5 py-3 font-medium">Fecha</th>
                <th className="text-left px-5 py-3 font-medium">Usuario</th>
                <th className="text-left px-5 py-3 font-medium">Acción</th>
                <th className="text-left px-5 py-3 font-medium">Entidad</th>
              </tr>
            </thead>
            <tbody>
              {data?.results?.length > 0 ? (
                data.results.map(log => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 text-white/50 text-xs whitespace-nowrap">{formatDate(log.created_at)}</td>
                    <td className="px-5 py-3 text-white/70 text-xs">{log.user_email}</td>
                    <td className="px-5 py-3 text-white/80 text-xs font-medium">{log.action}</td>
                    <td className="px-5 py-3 text-white/40 text-xs">{log.entity_type}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-white/30 text-xs py-10">Sin registros</td>
                </tr>
              )}
            </tbody>
          </table>

          {data && (data.next || data.previous) && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/10">
              <button
                disabled={!data.previous}
                onClick={() => setPage(p => p - 1)}
                className="flex items-center gap-1 text-xs text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} /> Anterior
              </button>
              <span className="text-white/30 text-xs">Página {page} · {data.count} registros</span>
              <button
                disabled={!data.next}
                onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-1 text-xs text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}