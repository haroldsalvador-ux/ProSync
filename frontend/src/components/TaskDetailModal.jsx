import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, User, Calendar, Loader2, Tag } from 'lucide-react';
import { getComments, addComment } from '../api/tasks';

const PRIORITY_BADGE = {
  low:    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  high:   'bg-red-500/20 text-red-300 border-red-500/30',
};
const PRIORITY_LABEL = { low: 'Baja', medium: 'Media', high: 'Alta' };

// Color determinístico por etiqueta
const LABEL_COLORS = [
  'bg-purple-500/25 text-purple-200 border-purple-500/35',
  'bg-blue-500/25 text-blue-200 border-blue-500/35',
  'bg-emerald-500/25 text-emerald-200 border-emerald-500/35',
  'bg-amber-500/25 text-amber-200 border-amber-500/35',
  'bg-pink-500/25 text-pink-200 border-pink-500/35',
  'bg-cyan-500/25 text-cyan-200 border-cyan-500/35',
];
export function labelColor(label) {
  let h = 0;
  for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) % LABEL_COLORS.length;
  return LABEL_COLORS[h];
}

function currentEmail() {
  try { return JSON.parse(localStorage.getItem('prosync_user'))?.email ?? null; } catch { return null; }
}

function timeAgo(iso) {
  const d = new Date(iso);
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1)  return 'ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `hace ${hrs} h`;
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
}

export default function TaskDetailModal({ task, onClose }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [text, setText]         = useState('');
  const [sending, setSending]   = useState(false);
  const endRef = useRef(null);

  const me     = currentEmail();
  const labels = (task.labels || '').split(',').map(s => s.trim()).filter(Boolean);

  useEffect(() => {
    getComments(task.id).then(setComments).catch(() => {}).finally(() => setLoading(false));
  }, [task.id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [comments]);

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setSending(true);
    try {
      const c = await addComment(task.id, body);
      setComments(cs => [...cs, c]);
      setText('');
    } catch { /* noop */ } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="glass-card rounded-2xl w-full max-w-lg max-h-[88vh] flex flex-col animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-white/10">
          <div className="flex-1 min-w-0">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_BADGE[task.priority] ?? PRIORITY_BADGE.medium}`}>
              {PRIORITY_LABEL[task.priority] ?? task.priority}
            </span>
            <h2 className="text-white font-semibold mt-2 leading-snug">{task.title}</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors mt-1">
            <X size={18} />
          </button>
        </div>

        {/* Detalle */}
        <div className="px-6 py-4 border-b border-white/10 space-y-3">
          {task.description && (
            <p className="text-white/50 text-sm leading-relaxed">{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/40">
            {task.assignee && (
              <span className="flex items-center gap-1.5"><User size={12} /> {task.assignee}</span>
            )}
            {task.dueDate && (
              <span className="flex items-center gap-1.5"><Calendar size={12} /> {task.dueDate}</span>
            )}
          </div>
          {labels.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Tag size={12} className="text-white/30" />
              {labels.map(l => (
                <span key={l} className={`text-[10px] px-2 py-0.5 rounded-md border ${labelColor(l)}`}>{l}</span>
              ))}
            </div>
          )}
        </div>

        {/* Comentarios */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="text-white/60 text-xs font-semibold flex items-center gap-1.5 mb-4">
            <MessageSquare size={13} /> Comentarios ({comments.length})
          </p>

          {loading ? (
            <div className="flex justify-center py-6 text-white/30"><Loader2 size={18} className="animate-spin" /></div>
          ) : comments.length === 0 ? (
            <p className="text-white/20 text-xs text-center py-6">Sé el primero en comentar.</p>
          ) : (
            <div className="space-y-3">
              {comments.map(c => {
                const mine = c.authorEmail === me;
                return (
                  <div key={c.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 ${mine ? 'bg-burgundy/40 border border-burgundy/30' : 'bg-white/5 border border-white/10'}`}>
                      <p className="text-white/80 text-sm whitespace-pre-wrap break-words">{c.body}</p>
                    </div>
                    <span className="text-white/25 text-[10px] mt-1 px-1">
                      {mine ? 'Tú' : c.authorEmail} · {timeAgo(c.createdAt)}
                    </span>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>
          )}
        </div>

        {/* Nuevo comentario */}
        <form onSubmit={send} className="px-6 py-4 border-t border-white/10 flex items-center gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Escribe un comentario..."
            className="input-glass flex-1 text-sm"
          />
          <button type="submit" disabled={sending || !text.trim()} className="btn-primary px-3 py-2 disabled:opacity-40">
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </form>
      </div>
    </div>
  );
}
