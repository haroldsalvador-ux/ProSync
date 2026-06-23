import { useState, useEffect, useRef } from 'react';
import { Bell, Check, UserPlus, MessageSquare, Activity, ClipboardList } from 'lucide-react';
import { getNotifications, getUnreadCount, markAllRead, markRead } from '../api/notifications';

const ICONS = {
  TASK_ASSIGNED:   ClipboardList,
  TASK_STATUS:     Activity,
  WORKSPACE_ADDED: UserPlus,
  TASK_COMMENT:    MessageSquare,
};

function timeAgo(iso) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1)  return 'ahora';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function NotificationBell() {
  const [open, setOpen]   = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const refreshCount = () => getUnreadCount().then(d => setUnread(d.count)).catch(() => {});

  // Polling del contador cada 20s
  useEffect(() => {
    refreshCount();
    const id = setInterval(refreshCount, 20000);
    return () => clearInterval(id);
  }, []);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      const data = await getNotifications().catch(() => []);
      setItems(data);
    }
  };

  const handleMarkAll = async () => {
    await markAllRead().catch(() => {});
    setItems(items.map(n => ({ ...n, read: true })));
    setUnread(0);
  };

  const handleClickItem = async (n) => {
    if (!n.read) {
      await markRead(n.id).catch(() => {});
      setItems(items.map(x => x.id === n.id ? { ...x, read: true } : x));
      setUnread(u => Math.max(0, u - 1));
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        className="relative p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/8 transition-all"
        title="Notificaciones"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-burgundy text-white text-[9px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-72 max-h-96 overflow-y-auto rounded-2xl border border-white/10 bg-[#1a1025]/95 backdrop-blur-md shadow-xl z-50 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 sticky top-0 bg-[#1a1025]/95">
            <span className="text-white/80 text-sm font-semibold">Notificaciones</span>
            {items.some(n => !n.read) && (
              <button onClick={handleMarkAll} className="text-[11px] text-burgundy-light hover:text-white flex items-center gap-1">
                <Check size={11} /> Marcar todas
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p className="text-white/20 text-xs text-center py-8">Sin notificaciones</p>
          ) : (
            <div className="divide-y divide-white/5">
              {items.map(n => {
                const Icon = ICONS[n.type] ?? Bell;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClickItem(n)}
                    className={`w-full text-left flex items-start gap-2.5 px-4 py-3 hover:bg-white/5 transition-colors ${n.read ? 'opacity-50' : ''}`}
                  >
                    <div className="mt-0.5 text-burgundy-light flex-shrink-0"><Icon size={14} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-xs leading-snug">{n.message}</p>
                      <p className="text-white/25 text-[10px] mt-0.5">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-burgundy flex-shrink-0 mt-1.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
