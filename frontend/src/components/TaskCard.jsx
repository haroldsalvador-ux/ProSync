import { ChevronLeft, ChevronRight, Trash2, User } from 'lucide-react';

const STATUS_ORDER = ['pending', 'in_progress', 'done'];

const PRIORITY_BADGE = {
  low:    'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  high:   'bg-red-500/15 text-red-400 border-red-500/20',
};

const PRIORITY_LABEL = { low: 'Baja', medium: 'Media', high: 'Alta' };

export default function TaskCard({ task, onStatusChange, onDelete, loading }) {
  const idx  = STATUS_ORDER.indexOf(task.status);
  const canLeft  = idx > 0;
  const canRight = idx < STATUS_ORDER.length - 1;

  return (
    <div className={`glass-card rounded-xl p-4 group transition-all duration-300 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Priority + actions */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_BADGE[task.priority] ?? PRIORITY_BADGE.medium}`}>
          {PRIORITY_LABEL[task.priority] ?? task.priority}
        </span>
        <button
          onClick={() => onDelete(task.id)}
          className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Título */}
      <p className="text-white/85 text-sm font-medium leading-snug mb-3">{task.title}</p>

      {/* Asignado */}
      {task.assignee && (
        <div className="flex items-center gap-1.5 text-white/35 text-xs mb-3">
          <User size={11} /> {task.assignee}
        </div>
      )}

      {/* Navegación de estado */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <button
          onClick={() => canLeft && onStatusChange(task.id, STATUS_ORDER[idx - 1])}
          disabled={!canLeft}
          className="text-white/25 hover:text-white/70 disabled:opacity-0 transition-all p-1 rounded-lg hover:bg-white/10"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-white/25 text-[10px]">mover</span>
        <button
          onClick={() => canRight && onStatusChange(task.id, STATUS_ORDER[idx + 1])}
          disabled={!canRight}
          className="text-white/25 hover:text-white/70 disabled:opacity-0 transition-all p-1 rounded-lg hover:bg-white/10"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
