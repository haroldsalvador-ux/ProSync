import { useState, useEffect, useMemo } from 'react';
import { RefreshCw, AlertCircle, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { getAllTasks } from '../api/tasks';
import TaskDetailModal from '../components/TaskDetailModal';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const PRIORITY_DOT = { low: 'bg-emerald-400', medium: 'bg-amber-400', high: 'bg-red-400' };
const STATUS_RING  = { done: 'opacity-50 line-through', pending: '', in_progress: '' };

// Clave local YYYY-MM-DD sin desfases de zona horaria
function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function CalendarPage() {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [tasks, setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [detailTask, setDetailTask] = useState(null);

  useEffect(() => {
    getAllTasks()
      .then(setTasks)
      .catch(() => setError('No se pudo conectar con el servidor.'))
      .finally(() => setLoading(false));
  }, []);

  // Agrupar tareas por fecha límite
  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      if (!t.dueDate) return;
      (map[t.dueDate] ??= []).push(t);
    });
    return map;
  }, [tasks]);

  // Construir la cuadrícula del mes (semanas que empiezan en lunes)
  const weeks = useMemo(() => {
    const { year, month } = cursor;
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7; // lunes = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [cursor]);

  const prevMonth = () => setCursor(c => c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 });
  const nextMonth = () => setCursor(c => c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 });
  const goToday   = () => setCursor({ year: today.getFullYear(), month: today.getMonth() });

  const isToday = (d) =>
    d && cursor.year === today.getFullYear() && cursor.month === today.getMonth() && d === today.getDate();

  const withDue = tasks.filter(t => t.dueDate).length;

  if (loading) return (
    <div className="flex items-center justify-center py-32 text-white/40">
      <RefreshCw size={20} className="animate-spin mr-3" /> Cargando calendario...
    </div>
  );

  if (error) return (
    <div className="p-8">
      <div className="glass-card rounded-2xl p-6 text-center">
        <AlertCircle size={24} className="text-red-400 mx-auto mb-3" />
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <CalendarDays size={22} className="text-burgundy" /> Calendario
          </h1>
          <p className="text-white/40 text-sm">{withDue} tarea{withDue !== 1 ? 's' : ''} con fecha límite</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={goToday} className="btn-ghost text-xs px-3 py-2">Hoy</button>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="btn-ghost p-2"><ChevronLeft size={16} /></button>
            <span className="text-white font-semibold text-sm min-w-[140px] text-center">
              {MONTHS[cursor.month]} {cursor.year}
            </span>
            <button onClick={nextMonth} className="btn-ghost p-2"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Cuadrícula */}
      <div className="glass-card rounded-2xl p-4">
        {/* Cabecera de días */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center text-white/30 text-xs font-semibold uppercase tracking-wide py-1">{d}</div>
          ))}
        </div>

        {/* Semanas */}
        <div className="space-y-2">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-2">
              {week.map((day, di) => {
                if (!day) return <div key={di} className="min-h-[92px] rounded-xl bg-white/[0.015]" />;
                const key = dateKey(cursor.year, cursor.month, day);
                const dayTasks = tasksByDate[key] ?? [];
                return (
                  <div
                    key={di}
                    className={`min-h-[92px] rounded-xl border p-1.5 flex flex-col gap-1 transition-colors ${
                      isToday(day)
                        ? 'border-burgundy/50 bg-burgundy/5'
                        : 'border-white/5 bg-white/[0.02] hover:border-white/15'
                    }`}
                  >
                    <span className={`text-[11px] font-semibold px-1 ${isToday(day) ? 'text-burgundy-light' : 'text-white/40'}`}>
                      {day}
                    </span>
                    <div className="flex flex-col gap-1 overflow-hidden">
                      {dayTasks.slice(0, 3).map(t => (
                        <button
                          key={t.id}
                          onClick={() => setDetailTask(t)}
                          className={`flex items-center gap-1 text-left text-[10px] px-1.5 py-1 rounded-md bg-white/5 hover:bg-white/10 transition-colors ${STATUS_RING[t.status] ?? ''}`}
                          title={t.title}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[t.priority] ?? 'bg-white/30'}`} />
                          <span className="text-white/70 truncate">{t.title}</span>
                        </button>
                      ))}
                      {dayTasks.length > 3 && (
                        <span className="text-white/30 text-[9px] px-1.5">+{dayTasks.length - 3} más</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {detailTask && (
        <TaskDetailModal task={detailTask} onClose={() => setDetailTask(null)} />
      )}
    </div>
  );
}
