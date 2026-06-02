import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Layers, CheckSquare,
  BarChart2, Settings, Zap, LogOut, User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { label: 'Dashboard',  icon: LayoutDashboard, to: '/dashboard',  end: true  },
  { label: 'Workspaces', icon: Layers,           to: '/workspaces', end: true  },
  { label: 'Tareas',     icon: CheckSquare,      to: '/tasks',      end: true  },
  { label: 'Reportes',   icon: BarChart2,        to: '/reports',    end: true  },
];

const linkClass = ({ isActive }) =>
  [
    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
    isActive
      ? 'bg-burgundy/80 text-white shadow-neon-burgundy'
      : 'text-white/50 hover:bg-white/8 hover:text-white',
  ].join(' ');

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <aside className="w-60 flex-shrink-0 bg-navy-dark border-r border-white/10 flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <Zap size={20} className="text-burgundy" />
        <span className="text-white font-bold text-lg tracking-wide">ProSync</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ label, icon: Icon, to, end }) => (
          <NavLink key={label} to={to} end={end} className={linkClass}>
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
        <NavLink to="/settings" className={linkClass}>
          <Settings size={17} />
          Configuración
        </NavLink>

        {/* Perfil */}
        {user && (
          <NavLink
            to="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl mt-1 hover:bg-white/8 transition-colors group"
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                className="w-7 h-7 rounded-full object-cover border border-burgundy/40 flex-shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-burgundy/50 border border-burgundy/40 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] font-bold">{initials}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-xs font-medium truncate">{user.fullName}</p>
              <p className="text-white/30 text-[10px] truncate">{user.email}</p>
            </div>
          </NavLink>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut size={17} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
