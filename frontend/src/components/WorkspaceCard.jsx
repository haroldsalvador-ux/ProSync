import { useNavigate } from 'react-router-dom';
import { User, Calendar, ArrowRight, Layers } from 'lucide-react';

const DEPT_COLORS = {
  Engineering: 'bg-blue-500/20 text-blue-300 border-blue-500/20',
  Marketing:   'bg-emerald-500/20 text-emerald-300 border-emerald-500/20',
  Design:      'bg-purple-500/20 text-purple-300 border-purple-500/20',
  Product:     'bg-orange-500/20 text-orange-300 border-orange-500/20',
  Sales:       'bg-teal-500/20 text-teal-300 border-teal-500/20',
  HR:          'bg-pink-500/20 text-pink-300 border-pink-500/20',
  Finance:     'bg-yellow-500/20 text-yellow-300 border-yellow-500/20',
  Operations:  'bg-red-500/20 text-red-300 border-red-500/20',
};

export default function WorkspaceCard({ workspace }) {
  const navigate   = useNavigate();
  const badgeClass = DEPT_COLORS[workspace.department] ?? 'bg-white/10 text-white/50 border-white/10';
  const created    = workspace.createdAt
    ? new Date(workspace.createdAt).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : '—';

  return (
    <div
      onClick={() => navigate(`/board?workspace=${workspace.id}&name=${encodeURIComponent(workspace.name)}`)}
      className="glass-card-hover rounded-2xl p-5 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-burgundy/20 border border-burgundy/20 flex items-center justify-center">
          <Layers size={16} className="text-burgundy-light" />
        </div>
        <ArrowRight
          size={15}
          className="text-white/20 group-hover:text-burgundy-light group-hover:translate-x-0.5 transition-all duration-200"
        />
      </div>

      <h3 className="text-white font-semibold text-base mb-1">{workspace.name}</h3>

      {workspace.description && (
        <p className="text-white/40 text-sm mb-3 line-clamp-2 leading-relaxed">
          {workspace.description}
        </p>
      )}

      {workspace.department && (
        <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border mb-3 ${badgeClass}`}>
          {workspace.department}
        </span>
      )}

      <div className="flex items-center gap-4 text-xs text-white/30 pt-3 border-t border-white/10">
        {workspace.owner && (
          <span className="flex items-center gap-1.5">
            <User size={11} /> {workspace.owner}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Calendar size={11} /> {created}
        </span>
      </div>
    </div>
  );
}
