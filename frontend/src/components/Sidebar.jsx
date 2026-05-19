import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  FolderOpen,
  CheckSquare,
  Calendar,
  BarChart2,
  Settings,
  Zap,
} from 'lucide-react';

const NAV = [
  { label: 'Dashboard',   icon: LayoutDashboard, to: '/',       end: true },
  { label: 'Workspaces',  icon: Layers,           to: '/',       end: true },
  { label: 'Tasks',       icon: CheckSquare,      to: '/board',  end: false },
  { label: 'Projects',    icon: FolderOpen,       to: '/projects', end: false },
  { label: 'Calendar',    icon: Calendar,         to: '/calendar', end: false },
  { label: 'Reports',     icon: BarChart2,        to: '/reports',  end: false },
];

const linkClass = ({ isActive }) =>
  [
    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
    isActive
      ? 'bg-burgundy text-white'
      : 'text-blue-100 hover:bg-navy-light hover:text-white',
  ].join(' ');

export default function Sidebar() {
  return (
    <aside className="w-60 flex-shrink-0 bg-navy flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-navy-light">
        <Zap size={22} className="text-burgundy" />
        <span className="text-white font-bold text-lg tracking-wide">ProSync</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ label, icon: Icon, to, end }) => (
          <NavLink key={label} to={to} end={end} className={linkClass}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Settings */}
      <div className="px-3 py-4 border-t border-navy-light">
        <NavLink to="/settings" className={linkClass}>
          <Settings size={18} />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
