import { useState } from 'react';
import { User, Mail, Lock, Briefcase, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DEPARTMENTS = [
  'Seleccionar Departamento',
  'Engineering',
  'Marketing',
  'Design',
  'Product',
  'Sales',
  'HR',
  'Finance',
  'Operations',
];

export default function RegisterPage({ onRegister }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim() || department === DEPARTMENTS[0]) {
      setError('Completa todos los campos para crear tu cuenta.');
      return;
    }

    setError('');
    const user = { name: name.trim(), email: email.trim(), department };
    localStorage.setItem('prosync-auth', 'true');
    localStorage.setItem('prosync-user', JSON.stringify(user));
    onRegister?.();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#080912] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/95 p-10 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="text-center mb-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-burgundy/10 text-burgundy shadow-inner shadow-burgundy/20">
            <span className="font-semibold text-2xl">PS</span>
          </div>
          <h1 className="text-3xl font-semibold text-white">Crear Cuenta</h1>
          <p className="mt-2 text-sm text-slate-400">Únete a ProSync para gestionar tus proyectos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-slate-300">
              Nombre Completo
            </label>
            <div className="relative rounded-3xl border border-white/10 bg-slate-900/80 focus-within:border-burgundy focus-within:ring-2 focus-within:ring-burgundy/20">
              <User size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nombre Completo"
                className="w-full rounded-3xl border-none bg-transparent px-14 py-4 text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-300">
              Email corporativo
            </label>
            <div className="relative rounded-3xl border border-white/10 bg-slate-900/80 focus-within:border-burgundy focus-within:ring-2 focus-within:ring-burgundy/20">
              <Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email corporativo"
                className="w-full rounded-3xl border-none bg-transparent px-14 py-4 text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="department" className="text-sm font-medium text-slate-300">
              Seleccionar Departamento
            </label>
            <div className="relative rounded-3xl border border-white/10 bg-slate-900/80 focus-within:border-burgundy focus-within:ring-2 focus-within:ring-burgundy/20">
              <Briefcase size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <select
                id="department"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="w-full appearance-none rounded-3xl border-none bg-transparent px-14 py-4 text-sm text-white focus:outline-none"
              >
                {DEPARTMENTS.map((option) => (
                  <option key={option} value={option} className="bg-slate-950 text-white">
                    {option}
                  </option>
                ))}
              </select>
              <ArrowRight size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-300">
              Contraseña
            </label>
            <div className="relative rounded-3xl border border-white/10 bg-slate-900/80 focus-within:border-burgundy focus-within:ring-2 focus-within:ring-burgundy/20">
              <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Contraseña"
                className="w-full rounded-3xl border-none bg-transparent px-14 py-4 text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-burgundy px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-burgundy/25 transition hover:bg-burgundy-dark"
          >
            Crear Cuenta
          </button>

          <div className="text-center text-sm text-slate-500">
            <span>¿Ya tienes cuenta? </span>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-semibold text-yellow-400 hover:text-yellow-300"
            >
              Iniciar Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
