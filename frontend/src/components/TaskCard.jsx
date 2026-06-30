import { ChevronLeft, ChevronRight, Trash2, User, Calendar, MessageSquare } from 'lucide-react';
import { labelColor } from './TaskDetailModal';

const STATUS_ORDER = ['pending', 'in_progress', 'done'];

const PRIORITY_BADGE = {
  low:    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  high:   'bg-red-500/20 text-red-300 border-red-500/30',
};

const PRIORITY_LABEL = { low: 'Baja', medium: 'Media', high: 'Alta' };

function dueDateStyle(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + 'T00:00:00');
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diff < 0)  return { cls: 'text-red-400',   label: 'Vencida' };
  if (diff === 0) return { cls: 'text-orange-400', label: 'Hoy' };
  if (diff <= 2)  return { cls: 'text-amber-400',  label: `${diff}d` };
  return { cls: 'text-white/35', label: null };
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export default function TaskCard({ task, onStatusChange, onDelete, onOpenDetail, loading }) {
  const idx      = STATUS_ORDER.indexOf(task.status);
  const canLeft  = idx > 0;
  const canRight = idx < STATUS_ORDER.length - 1;
  const dueInfo  = dueDateStyle(task.dueDate);

  const labels = (task.labels || '').split(',').map(s => s.trim()).filter(Boolean);

  const assigneeInitials = task.assignee
    ? task.assignee.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : null;

  return (
    <div className={`glass-card rounded-xl p-4 group transition-all duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'hover:border-white/20'}`}>
      {/* Priority + delete */}
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

      {/* Título (clic abre detalle + comentarios) */}
      <button
        type="button"
        onClick={() => onOpenDetail?.(task)}
        className="text-left w-full text-white/85 text-sm font-medium leading-snug mb-2 hover:text-white transition-colors"
      >
        {task.title}
      </button>

      {/* Etiquetas */}
      {labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {labels.map(l => (
            <span key={l} className={`text-[9px] px-1.5 py-0.5 rounded-md border ${labelColor(l)}`}>{l}</span>
          ))}
        </div>
      )}

      {/* Descripción */}
      {task.description && (
        <p className="text-white/35 text-xs leading-relaxed mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Meta: responsable + fecha */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {task.assignee ? (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-burgundy/60 flex items-center justify-center text-[9px] font-bold text-white">
              {assigneeInitials ?? <User size={9} />}
            </div>
            <span className="text-white/40 text-xs truncate max-w-[100px]">{task.assignee}</span>
          </div>
        ) : (
          <span />
        )}

        {task.dueDate && (
          <div className={`flex items-center gap-1 text-xs ${dueInfo?.cls ?? 'text-white/35'}`}>
            <Calendar size={10} />
            <span>
              {dueInfo?.label && dueInfo.label !== 'Vencida' && dueInfo.label !== 'Hoy'
                ? formatDate(task.dueDate)
                : dueInfo?.label ?? formatDate(task.dueDate)}
            </span>
          </div>
        )}
      </div>

      {/* Navegación de estado */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <button
          onClick={() => canLeft && onStatusChange(task.id, STATUS_ORDER[idx - 1])}
          disabled={!canLeft}
          className="text-white/25 hover:text-white/70 disabled:opacity-0 transition-all p-1 rounded-lg hover:bg-white/10"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={() => onOpenDetail?.(task)}
          className="flex items-center gap-1 text-white/25 hover:text-white/70 transition-all px-2 py-1 rounded-lg hover:bg-white/10"
          title="Ver detalle y comentarios"
        >
          <MessageSquare size={12} />
        </button>
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
