import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, CheckSquare, Clock, CheckCircle2, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getWorkspaces } from '../api/workspaces';
import { getAllTasks } from '../api/tasks';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS   = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

function buildCalendar(year, month) {
  const first = new Date(year, month, 1).getDay(); // 0=Sun
  const offset = (first + 6) % 7; // Monday = 0
  const total  = new Date(year, month + 1, 0).getDate();
  const cells  = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  return cells;
}

function pad(n) { return String(n).padStart(2, '0'); }

export default function DashboardHome() {
  const { user }        = useAuth();
  const navigate        = useNavigate();
  const today           = new Date();

  const [workspaces, setWorkspaces] = useState([]);
  const [tasks, setTasks]           = useState([]);
  const [year, setYear]             = useState(today.getFullYear());
  const [month, setMonth]           = useState(today.getMonth());
  const [selected, setSelected]     = useState(null); // "YYYY-MM-DD"

  useEffect(() => {
    getWorkspaces().then(setWorkspaces).catch(() => {});
    getAllTasks().then(setTasks).catch(() => {});
  }, []);

  // Tareas por fecha
  const taskMap = {};
  tasks.forEach(t => {
    if (t.dueDate) {
      if (!taskMap[t.dueDate]) taskMap[t.dueDate] = [];
      taskMap[t.dueDate].push(t);
    }
  });

  const cells         = buildCalendar(year, month);
  const pending       = tasks.filter(t => t.status === 'pending').length;
  const inProgress    = tasks.filter(t => t.status === 'in_progress').length;
  const done          = tasks.filter(t => t.status === 'done').length;

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelected(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelected(null);
  };

  const selectedTasks = selected ? (taskMap[selected] ?? []) : [];

  const STATUS_LABEL = { pending: 'Por Hacer', in_progress: 'En Proceso', done: 'Completado' };
  const STATUS_COLOR = { pending: 'text-gray-400', in_progress: 'text-blue-400', done: 'text-emerald-400' };

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="text-white/40 text-sm mb-1">Bienvenido de nuevo,</p>
        <h1 className="text-2xl font-bold text-white">{user?.fullName ?? 'Usuario'}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Workspaces',   value: workspaces.length, icon: Layers,        color: 'text-purple-400' },
          { label: 'Por Hacer',    value: pending,            icon: Clock,         color: 'text-gray-400'   },
          { label: 'En Proceso',   value: inProgress,         icon: CheckSquare,   color: 'text-blue-400'   },
          { label: 'Completadas',  value: done,               icon: CheckCircle2,  color: 'text-emerald-400'},
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card rounded-2xl p-5">
            <div className={`${color} mb-3`}><Icon size={20} /></div>
            <p className="text-3xl font-bold text-white mb-0.5">{value}</p>
            <p className="text-white/40 text-xs">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Workspaces recientes */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm">Workspaces</h2>
            <button onClick={() => navigate('/workspaces')} className="text-xs text-burgundy-light hover:underline">
              Ver todos
            </button>
          </div>
          {workspaces.length === 0 ? (
            <p className="text-white/30 text-xs text-center py-8">Sin workspaces</p>
          ) : (
            <div className="space-y-2">
              {workspaces.slice(0, 5).map(ws => (
                <button
                  key={ws.id}
                  onClick={() => navigate(`/board?workspace=${ws.id}&name=${encodeURIComponent(ws.name)}`)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-burgundy/20 border border-burgundy/20 flex items-center justify-center flex-shrink-0">
                    <Layers size={13} className="text-burgundy-light" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white/80 text-xs font-medium truncate">{ws.name}</p>
                    {ws.department && <p className="text-white/30 text-[10px]">{ws.department}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Calendario */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5">
          {/* Cabecera del mes */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-burgundy-light" />
              <h2 className="text-white font-semibold text-sm">
                {MONTHS[month]} {year}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                <ChevronLeft size={14} />
              </button>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] text-white/30 font-semibold py-1">{d}</div>
            ))}
          </div>

          {/* Celdas */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const dateStr   = `${year}-${pad(month + 1)}-${pad(day)}`;
              const dayTasks  = taskMap[dateStr] ?? [];
              const isToday   = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSelected = dateStr === selected;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelected(isSelected ? null : dateStr)}
                  className={`relative flex flex-col items-center rounded-xl py-1.5 transition-all duration-150
                    ${isSelected ? 'bg-burgundy/60 text-white' :
                      isToday    ? 'bg-white/15 text-white font-bold' :
                                   'hover:bg-white/8 text-white/60'}`}
                >
                  <span className="text-xs">{day}</span>
                  {dayTasks.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayTasks.slice(0, 3).map((_, ti) => (
                        <span key={ti} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-burgundy-light'}`} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tareas del día seleccionado */}
          {selected && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="text-white/50 text-xs mb-2 font-semibold">
                {selectedTasks.length > 0
                  ? `${selectedTasks.length} tarea${selectedTasks.length > 1 ? 's' : ''} el ${selected.split('-').reverse().join('/')}`
                  : `Sin tareas el ${selected.split('-').reverse().join('/')}`}
              </p>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {selectedTasks.map(t => (
                  <div key={t.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5">
                    <span className={`text-[10px] font-semibold ${STATUS_COLOR[t.status] ?? 'text-white/40'}`}>
                      {STATUS_LABEL[t.status] ?? t.status}
                    </span>
                    <span className="text-white/70 text-xs truncate flex-1">{t.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
