import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, LayoutDashboard, Users, BarChart2,
  ArrowRight, CheckCircle, Shield, ChevronLeft,
  ChevronRight, Calendar, Layers, CheckSquare,
  GitBranch, Star, TrendingUp,
} from 'lucide-react';

/* ─── Datos ──────────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: 'Tableros Kanban',
    desc: 'Arrastra y suelta tareas entre columnas en tiempo real. Visualiza el progreso de cada sprint al instante.',
    gradient: 'from-blue-500/20 to-blue-600/5',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-400',
  },
  {
    icon: Users,
    title: 'Colaboración Total',
    desc: 'Invita miembros por email, asigna responsables y mantén a todo el equipo sincronizado en un solo lugar.',
    gradient: 'from-purple-500/20 to-purple-600/5',
    border: 'border-purple-500/20',
    iconColor: 'text-purple-400',
  },
  {
    icon: BarChart2,
    title: 'Analíticas en Tiempo Real',
    desc: 'Dashboard de métricas globales, historial de auditoría y reportería completa del proyecto.',
    gradient: 'from-emerald-500/20 to-emerald-600/5',
    border: 'border-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Shield,
    title: 'Seguridad JWT',
    desc: 'Autenticación robusta con Spring Security. Tokens firmados y sesiones sin estado para tu tranquilidad.',
    gradient: 'from-amber-500/20 to-amber-600/5',
    border: 'border-amber-500/20',
    iconColor: 'text-amber-400',
  },
  {
    icon: Calendar,
    title: 'Calendario de Tareas',
    desc: 'Visualiza fechas límite en un calendario interactivo. Nunca más pierdas una entrega importante.',
    gradient: 'from-pink-500/20 to-pink-600/5',
    border: 'border-pink-500/20',
    iconColor: 'text-pink-400',
  },
  {
    icon: GitBranch,
    title: 'Microservicios',
    desc: 'Arquitectura escalable con Spring Boot y Django conectados a PostgreSQL. Preparado para crecer.',
    gradient: 'from-cyan-500/20 to-cyan-600/5',
    border: 'border-cyan-500/20',
    iconColor: 'text-cyan-400',
  },
];

const STATS = [
  { value: '3',    label: 'Sprints completados', icon: Star },
  { value: '100%', label: 'Cobertura Agile',     icon: CheckCircle },
  { value: '3',    label: 'Servicios integrados', icon: GitBranch },
  { value: '∞',   label: 'Tareas posibles',      icon: TrendingUp },
];

const STEPS = [
  { num: '01', title: 'Crea tu workspace', desc: 'Organiza tu equipo por departamento en segundos.' },
  { num: '02', title: 'Agrega tareas',     desc: 'Define título, prioridad, responsable y fecha límite.' },
  { num: '03', title: 'Arrastra y avanza', desc: 'Mueve tareas entre columnas y mide el progreso en tiempo real.' },
];

/* ─── Mockups del carrusel ───────────────────────────────────────────────── */

function MockupDashboard() {
  return (
    <div className="w-full h-full p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        <span className="text-white/25 text-[10px] ml-2">ProSync — Dashboard</span>
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {[['3','Workspaces','text-purple-400'],['5','Por Hacer','text-gray-400'],['3','En Proceso','text-blue-400'],['8','Completadas','text-emerald-400']].map(([v,l,c]) => (
          <div key={l} className="bg-white/5 border border-white/8 rounded-xl p-2.5">
            <div className={`text-xl font-bold ${c}`}>{v}</div>
            <div className="text-white/30 text-[9px] mt-0.5">{l}</div>
          </div>
        ))}
      </div>
      {/* Calendar mini */}
      <div className="flex-1 grid grid-cols-2 gap-2">
        <div className="bg-white/5 border border-white/8 rounded-xl p-3">
          <div className="text-white/40 text-[9px] font-semibold mb-2">Workspaces</div>
          {['Frontend','Backend','Diseño UX'].map(w => (
            <div key={w} className="flex items-center gap-1.5 py-1 border-b border-white/5 last:border-0">
              <div className="w-3 h-3 rounded bg-burgundy/40" />
              <span className="text-white/50 text-[9px]">{w}</span>
            </div>
          ))}
        </div>
        <div className="bg-white/5 border border-white/8 rounded-xl p-3">
          <div className="text-white/40 text-[9px] font-semibold mb-2">Junio 2026</div>
          <div className="grid grid-cols-7 gap-0.5">
            {['L','M','X','J','V','S','D'].map(d => <div key={d} className="text-white/20 text-[8px] text-center">{d}</div>)}
            {[null,null,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30].map((d,i) => (
              <div key={i} className={`text-center text-[8px] rounded py-0.5 ${d===15?'bg-burgundy text-white font-bold':d?'text-white/40 hover:bg-white/10':''}`}>
                {d||''}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MockupKanban() {
  return (
    <div className="w-full h-full p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        </div>
        <span className="text-white/25 text-[10px]">ProSync — Kanban Board</span>
        <div className="bg-burgundy/60 rounded-lg px-2 py-0.5 text-[9px] text-white">+ Nueva Tarea</div>
      </div>
      <div className="grid grid-cols-3 gap-2 flex-1">
        {[
          { label:'Por Hacer', color:'#6b7280', cards:[
            {t:'Diseño UI/UX', p:'Alta', a:'GA'},
            {t:'Tests E2E', p:'Media', a:'PA'},
          ]},
          { label:'En Proceso', color:'#004170', cards:[
            {t:'Auth JWT', p:'Alta', a:'GA'},
            {t:'Kanban Board', p:'Media', a:'LU'},
          ]},
          { label:'Completado', color:'#10b981', cards:[
            {t:'Base de datos', p:'Alta', a:'PA'},
            {t:'CI/CD setup', p:'Baja', a:'GA'},
          ]},
        ].map(col => (
          <div key={col.label} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white/5 rounded-lg border-l-2" style={{borderColor:col.color}}>
              <span className="text-white/60 text-[9px] font-semibold">{col.label}</span>
              <span className="text-white/30 text-[8px] ml-auto">{col.cards.length}</span>
            </div>
            {col.cards.map(card => (
              <div key={card.t} className="bg-white/6 border border-white/10 rounded-lg p-2 hover:border-white/20 transition-colors">
                <div className="flex items-start justify-between gap-1 mb-1">
                  <span className={`text-[7px] px-1 py-0.5 rounded-full font-semibold ${card.p==='Alta'?'bg-red-500/20 text-red-400':card.p==='Media'?'bg-amber-500/20 text-amber-400':'bg-emerald-500/20 text-emerald-400'}`}>{card.p}</span>
                </div>
                <p className="text-white/70 text-[9px] font-medium mb-1.5">{card.t}</p>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-burgundy/50 border border-burgundy/40 flex items-center justify-center">
                    <span className="text-white text-[7px] font-bold">{card.a}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupWorkspaces() {
  return (
    <div className="w-full h-full p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        <span className="text-white/25 text-[10px] ml-2">ProSync — Workspaces</span>
        <div className="ml-auto bg-burgundy/60 rounded-lg px-2 py-0.5 text-[9px] text-white">+ Nuevo</div>
      </div>
      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full border border-white/30" />
          <span className="text-white/20 text-[9px]">Buscar workspace...</span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[9px] text-white/30">Dept ▾</div>
      </div>
      {/* Grid */}
      <div className="grid grid-cols-2 gap-2 flex-1">
        {[
          {n:'Frontend Team',    d:'Engineering', c:'border-blue-500/30',   bc:'bg-blue-500/10'},
          {n:'Marketing Q3',     d:'Marketing',   c:'border-emerald-500/30',bc:'bg-emerald-500/10'},
          {n:'App Design',       d:'Design',      c:'border-purple-500/30', bc:'bg-purple-500/10'},
          {n:'Product Roadmap',  d:'Product',     c:'border-orange-500/30', bc:'bg-orange-500/10'},
        ].map(ws => (
          <div key={ws.n} className={`bg-white/5 border ${ws.c} rounded-xl p-3 hover:bg-white/8 transition-colors`}>
            <div className={`w-6 h-6 ${ws.bc} rounded-lg flex items-center justify-center mb-2`}>
              <div className="w-3 h-3 border border-white/30 rounded" />
            </div>
            <p className="text-white/70 text-[9px] font-semibold">{ws.n}</p>
            <span className={`text-[7px] ${ws.bc} px-1.5 py-0.5 rounded-full text-white/60 mt-1 inline-block`}>{ws.d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupReports() {
  return (
    <div className="w-full h-full p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        <span className="text-white/25 text-[10px] ml-2">ProSync — Reportes</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {[['4','Workspaces','text-purple-400'],['16','Tareas','text-amber-400'],['3','Usuarios','text-blue-400'],['8','Completadas','text-emerald-400']].map(([v,l,c]) => (
          <div key={l} className="bg-white/5 border border-white/8 rounded-xl p-2 text-center">
            <div className={`text-base font-bold ${c}`}>{v}</div>
            <div className="text-white/25 text-[8px]">{l}</div>
          </div>
        ))}
      </div>
      {/* Bars */}
      <div className="flex-1 bg-white/5 border border-white/8 rounded-xl p-3">
        <div className="text-white/40 text-[9px] font-semibold mb-3">Distribución por Estado</div>
        {[['Por Hacer','bg-gray-500',35],['En Proceso','bg-blue-500',25],['Completado','bg-emerald-500',40]].map(([l,c,pct]) => (
          <div key={l} className="mb-2.5">
            <div className="flex justify-between text-[8px] mb-1">
              <span className="text-white/50">{l}</span>
              <span className="text-white/30">{pct}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className={`h-full ${c} rounded-full`} style={{width:`${pct}%`}} />
            </div>
          </div>
        ))}
      </div>
      {/* Activity */}
      <div className="bg-white/5 border border-white/8 rounded-xl p-3">
        <div className="text-white/40 text-[9px] font-semibold mb-2">Actividad Reciente</div>
        {[['Tarea creada','ga@gmail.com'],['Estado actualizado','paolo@mail.com'],['Usuario registrado','lucia@mail.com']].map(([a,u]) => (
          <div key={u} className="flex items-center gap-2 py-1 border-b border-white/5 last:border-0">
            <div className="w-1 h-1 rounded-full bg-burgundy-light" />
            <span className="text-white/50 text-[8px] flex-1">{a}</span>
            <span className="text-white/25 text-[7px]">{u}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const SLIDES = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    title: 'Dashboard con Calendario',
    desc: 'Ve todas tus métricas, estadísticas y tareas con fechas límite en un calendario interactivo.',
    mockup: MockupDashboard,
  },
  {
    label: 'Kanban Board',
    icon: CheckSquare,
    title: 'Tablero Kanban con Drag & Drop',
    desc: 'Arrastra tareas entre columnas, filtra por responsable y monitorea el progreso del sprint en tiempo real.',
    mockup: MockupKanban,
  },
  {
    label: 'Workspaces',
    icon: Layers,
    title: 'Gestión de Workspaces',
    desc: 'Organiza proyectos por departamento, busca con filtros y agrega miembros del equipo por email.',
    mockup: MockupWorkspaces,
  },
  {
    label: 'Reportes',
    icon: BarChart2,
    title: 'Reportes y Analíticas',
    desc: 'Barras de progreso, distribución de tareas por estado y log completo de actividad del equipo.',
    mockup: MockupReports,
  },
];

/* ─── Componente principal ───────────────────────────────────────────────── */

export default function LandingPage() {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  const prev = () => setSlide(s => (s - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setSlide(s => (s + 1) % SLIDES.length);

  const ActiveMockup = SLIDES[slide].mockup;

  return (
    <div className="min-h-screen bg-blaugrana overflow-x-hidden">

      {/* ── Glows ambientales ─────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-burgundy/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-burgundy/8 rounded-full blur-[100px]" />
      </div>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/8 backdrop-blur-xl bg-navy-dark/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-burgundy/30 border border-burgundy/40 flex items-center justify-center">
              <Zap size={16} className="text-burgundy-light" />
            </div>
            <span className="text-white font-bold text-xl tracking-wide">ProSync</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/50">
            <a href="#features"  className="hover:text-white transition-colors duration-200">Funcionalidades</a>
            <a href="#carousel"  className="hover:text-white transition-colors duration-200">Vista previa</a>
            <a href="#stats"     className="hover:text-white transition-colors duration-200">Estadísticas</a>
            <a href="#how"       className="hover:text-white transition-colors duration-200">Cómo funciona</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-white/60 hover:text-white px-4 py-2 rounded-xl hover:bg-white/8 transition-all duration-200">
              Iniciar Sesión
            </Link>
            <Link to="/register" className="btn-primary text-sm">
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 pt-28 pb-20 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-white/50 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Plataforma colaborativa Agile
        </div>

        <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight">
          Centraliza tu equipo.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-burgundy-light via-pink-400 to-blue-400">
            Acelera cada sprint.
          </span>
        </h1>

        <p className="text-white/50 text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          ProSync unifica workspaces, tableros Kanban y analíticas avanzadas en una sola plataforma inteligente.
          Colaboración real, trazabilidad total.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <Link to="/register" className="inline-flex items-center gap-2 btn-primary text-base px-7 py-3.5 rounded-2xl">
            Empezar Gratis <ArrowRight size={17} />
          </Link>
          <Link to="/login" className="inline-flex items-center gap-2 btn-ghost text-base px-7 py-3.5 rounded-2xl">
            Iniciar Sesión
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-white/35">
          {['Sin tarjeta de crédito', 'Setup en 2 minutos', 'Open source'].map(t => (
            <span key={t} className="flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-400" /> {t}
            </span>
          ))}
        </div>
      </section>

      {/* ── Carrusel ─────────────────────────────────────────────────────── */}
      <section id="carousel" className="relative max-w-6xl mx-auto px-6 pb-28">
        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {SLIDES.map((s, i) => {
            const Icon = s.icon;
            return (
              <button
                key={s.label}
                onClick={() => setSlide(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  i === slide
                    ? 'bg-burgundy/70 text-white border border-burgundy/50 shadow-neon-burgundy'
                    : 'text-white/40 hover:text-white hover:bg-white/8 border border-transparent'
                }`}
              >
                <Icon size={14} />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Slide */}
        <div className="relative">
          {/* Glow behind mockup */}
          <div className="absolute inset-0 bg-burgundy/10 rounded-3xl blur-3xl scale-95 pointer-events-none" />

          <div className="relative glass-card rounded-3xl border border-white/12 overflow-hidden shadow-glass-lg">
            {/* Barra de navegación del "browser" */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/8 bg-white/3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                <div className="w-3 h-3 rounded-full bg-green-400/60" />
              </div>
              <div className="flex-1 max-w-xs mx-auto bg-white/8 rounded-lg px-3 py-1 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-white/30 text-xs">localhost:5173 — ProSync</span>
              </div>
              <div className="flex gap-2 ml-auto">
                <button onClick={prev} className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center hover:bg-white/15 transition-colors">
                  <ChevronLeft size={14} className="text-white/50" />
                </button>
                <button onClick={next} className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center hover:bg-white/15 transition-colors">
                  <ChevronRight size={14} className="text-white/50" />
                </button>
              </div>
            </div>

            {/* Sidebar del "app" */}
            <div className="flex" style={{ minHeight: 380 }}>
              <div className="w-36 border-r border-white/8 bg-white/2 flex flex-col py-3 px-2 flex-shrink-0">
                <div className="flex items-center gap-2 px-2 py-2 mb-3">
                  <div className="w-5 h-5 rounded-lg bg-burgundy/40 border border-burgundy/40 flex items-center justify-center">
                    <Zap size={10} className="text-burgundy-light" />
                  </div>
                  <span className="text-white/60 text-[10px] font-bold">ProSync</span>
                </div>
                {SLIDES.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.label}
                      onClick={() => setSlide(i)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg mb-0.5 text-left transition-colors ${
                        i === slide ? 'bg-burgundy/60 text-white' : 'text-white/35 hover:text-white/60 hover:bg-white/5'
                      }`}
                    >
                      <Icon size={11} />
                      <span className="text-[9px] font-medium">{s.label}</span>
                    </button>
                  );
                })}
                <div className="mt-auto px-2 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-burgundy/40 flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">GA</span>
                    </div>
                    <div>
                      <p className="text-white/50 text-[8px] font-medium">gabriel</p>
                      <p className="text-white/25 text-[7px]">ga@mail.com</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenido del slide */}
              <div className="flex-1 bg-transparent overflow-hidden">
                <div
                  key={slide}
                  className="w-full h-full animate-fade-in"
                >
                  <ActiveMockup />
                </div>
              </div>
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === slide ? 'w-6 h-2 bg-burgundy' : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Descripción del slide */}
        <div className="text-center mt-8">
          <p className="text-white font-semibold text-lg">{SLIDES[slide].title}</p>
          <p className="text-white/40 text-sm mt-1 max-w-md mx-auto">{SLIDES[slide].desc}</p>
        </div>
      </section>

      {/* ── Funcionalidades ───────────────────────────────────────────────── */}
      <section id="features" className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold text-burgundy-light bg-burgundy/15 border border-burgundy/25 px-3 py-1.5 rounded-full">
            Funcionalidades
          </span>
          <h2 className="text-4xl font-bold text-white mt-5 mb-3">Todo lo que tu equipo necesita</h2>
          <p className="text-white/45 max-w-xl mx-auto">
            Una plataforma unificada para gestionar proyectos Agile, desde el primer commit hasta el deploy.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, gradient, border, iconColor }) => (
            <div
              key={title}
              className={`relative bg-gradient-to-br ${gradient} border ${border} rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm overflow-hidden`}
            >
              <div className="absolute inset-0 bg-white/[0.02] rounded-2xl" />
              <div className="relative z-10">
                <div className={`w-11 h-11 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={20} className={iconColor} />
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section id="stats" className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="glass-card rounded-2xl p-6 text-center hover:scale-[1.03] transition-transform duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-burgundy/20 border border-burgundy/20 flex items-center justify-center mx-auto mb-4">
                <Icon size={18} className="text-burgundy-light" />
              </div>
              <div className="text-4xl font-black text-white mb-1">{value}</div>
              <div className="text-white/40 text-xs">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Cómo funciona ─────────────────────────────────────────────────── */}
      <section id="how" className="relative max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold text-blue-400 bg-blue-500/15 border border-blue-500/25 px-3 py-1.5 rounded-full">
            Cómo funciona
          </span>
          <h2 className="text-4xl font-bold text-white mt-5 mb-3">En 3 pasos simples</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Línea conectora */}
          <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          {STEPS.map(({ num, title, desc }) => (
            <div key={num} className="glass-card rounded-2xl p-7 text-center relative">
              <div className="w-12 h-12 rounded-2xl bg-burgundy/25 border border-burgundy/30 flex items-center justify-center mx-auto mb-5">
                <span className="text-burgundy-light font-black text-base">{num}</span>
              </div>
              <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Final ─────────────────────────────────────────────────────── */}
      <section className="relative max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="relative glass-card rounded-3xl p-14 border border-white/10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-burgundy/15 via-transparent to-blue-600/8 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-5">
              ¿Listo para sincronizar tu equipo?
            </h2>
            <p className="text-white/45 mb-8 text-lg max-w-xl mx-auto">
              Únete ahora y lleva tu gestión Agile al siguiente nivel. Gratis, sin límites.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 btn-primary text-lg px-10 py-4 rounded-2xl"
            >
              Crear cuenta gratis <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/8 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap size={15} className="text-burgundy" />
            <span className="text-white/40 text-sm font-semibold">ProSync</span>
          </div>
          <p className="text-white/20 text-xs">© 2026 ProSync. Plataforma colaborativa Agile.</p>
          <div className="flex items-center gap-5 text-xs text-white/30">
            <Link to="/login"    className="hover:text-white transition-colors">Iniciar Sesión</Link>
            <Link to="/register" className="hover:text-white transition-colors">Registrarse</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
