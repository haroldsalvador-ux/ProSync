import { Link } from 'react-router-dom';
import {
  Zap, LayoutDashboard, Users, BarChart2,
  ArrowRight, CheckCircle, Shield, GitBranch,
} from 'lucide-react';

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: 'Tableros Kanban Agile',
    desc:  'Gestiona sprints con columnas dinámicas. Mueve tareas en tiempo real y visualiza el progreso de cada iteración con claridad.',
  },
  {
    icon: Users,
    title: 'Colaboración en Equipo',
    desc:  'Workspaces por departamento, asignación de responsables y trazabilidad completa de quién hizo qué y cuándo.',
  },
  {
    icon: BarChart2,
    title: 'Analíticas Avanzadas',
    desc:  'Dashboard de métricas globales impulsado por Django. Auditoría de acciones, logs de actividad y reportería en tiempo real.',
  },
  {
    icon: Shield,
    title: 'Autenticación JWT Segura',
    desc:  'Flujo de registro y login robusto con Spring Boot + Spring Security. Tokens firmados y sesiones sin estado.',
  },
  {
    icon: GitBranch,
    title: 'Arquitectura Microservicios',
    desc:  'Backend de usuario (Spring Boot :8081) y backend de administración (Django :8000) conectados a PostgreSQL compartido.',
  },
  {
    icon: Zap,
    title: 'Interfaz Premium',
    desc:  'Diseño Glassmorphic Blaugrana con transiciones fluidas, efectos de cristal y microanimaciones en cada interacción.',
  },
];

const STATS = [
  { value: '2',    label: 'Sprints completados' },
  { value: '100%', label: 'Cobertura de requisitos' },
  { value: '3',    label: 'Servicios integrados' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-blaugrana overflow-x-hidden">

      {/* ── Glow ambiental ───────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-burgundy/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-navy/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-burgundy/10 rounded-full blur-3xl" />
      </div>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-md bg-navy-dark/70">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Zap size={20} className="text-burgundy" />
            <span className="text-white font-bold text-xl tracking-wide">ProSync</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Funcionalidades</a>
            <a href="#stats"    className="hover:text-white transition-colors">Estadísticas</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-white/70 hover:text-white px-4 py-2 rounded-xl hover:bg-white/10 transition-all"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/register"
              className="btn-primary text-sm"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Texto */}
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-burgundy-light bg-burgundy/20 border border-burgundy/30 px-3 py-1.5 rounded-full mb-6">
              <Zap size={11} />
              Sprint 3 — Plataforma completa disponible
            </span>
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Centraliza tu equipo.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
                Acelera cada sprint.
              </span>
            </h1>
            <p className="text-white/60 text-lg mb-8 leading-relaxed max-w-lg">
              ProSync unifica workspaces, tableros Kanban y analíticas avanzadas en una sola plataforma inteligente. Colaboración real, trazabilidad total.
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <Link to="/register" className="btn-primary flex items-center gap-2 text-base">
                Empezar Gratis <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="btn-ghost flex items-center gap-2 text-base">
                Iniciar Sesión
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-white/40">
              {['Sin tarjeta de crédito', 'Setup en 2 minutos', 'Open source'].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle size={13} className="text-emerald-400" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Mockup Kanban */}
          <div className="relative animate-float hidden lg:block">
            <div className="glass-card rounded-2xl p-5 shadow-glass-lg">
              {/* Barra de título */}
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/10">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                </div>
                <span className="text-white/30 text-xs ml-2">ProSync — Sprint Board</span>
              </div>
              {/* Columnas Kanban */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Por Hacer',  color: '#6b7280', cards: ['Diseño UI/UX', 'Tests E2E'] },
                  { label: 'En Proceso', color: '#004170', cards: ['Auth JWT', 'Kanban Board'] },
                  { label: 'Completado', color: '#10b981', cards: ['Base de datos', 'CI/CD setup'] },
                ].map(col => (
                  <div key={col.label}>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                      <span className="text-white/40 text-xs font-medium">{col.label}</span>
                    </div>
                    {col.cards.map(card => (
                      <div key={card} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 mb-2">
                        <p className="text-white/70 text-xs font-medium">{card}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-4 h-4 rounded-full bg-burgundy/40 border border-burgundy/30 flex-shrink-0" />
                          <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-burgundy/50 rounded-full" style={{ width: col.label === 'Completado' ? '100%' : col.label === 'En Proceso' ? '60%' : '20%' }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            {/* Acento de glow */}
            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-burgundy/20 rounded-full blur-2xl pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ── Funcionalidades ───────────────────────────────────────────────── */}
      <section id="features" className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">Todo lo que tu equipo necesita</h2>
          <p className="text-white/50 max-w-xl mx-auto">
            Una plataforma unificada para gestionar proyectos con metodología Agile, desde el primer commit hasta el deploy.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="glass-card-hover rounded-2xl p-6 group"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-burgundy/30 to-navy-mid/50 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Icon size={20} className="text-white/80" />
              </div>
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section id="stats" className="border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-3 gap-8 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <div className="text-5xl font-bold text-white mb-2">{value}</div>
              <div className="text-white/40 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Final ─────────────────────────────────────────────────────── */}
      <footer className="relative max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">¿Listo para sincronizar tu equipo?</h2>
        <p className="text-white/50 mb-8 text-lg">Únete ahora y lleva tu gestión Agile al siguiente nivel</p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 btn-primary text-lg px-8 py-4"
        >
          Crear cuenta gratis <ArrowRight size={18} />
        </Link>
        <p className="text-white/20 text-sm mt-12">© 2026 ProSync. Plataforma colaborativa Agile.</p>
      </footer>
    </div>
  );
}
