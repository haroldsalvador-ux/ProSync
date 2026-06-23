import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, User as UserIcon, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { loginUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate       = useNavigate();
  const { login }      = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handle = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Completa todos los campos.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await loginUser(form);
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blaugrana flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-burgundy/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-navy/40 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center gap-2.5 group">
            <Zap size={28} className="text-burgundy group-hover:text-burgundy-light transition-colors" />
            <span className="text-white font-bold text-2xl tracking-wide">ProSync Admin</span>
          </Link>
          <p className="text-white/40 text-sm mt-2">Panel exclusivo de administración</p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-6">Iniciar Sesión</h1>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label-glass">Usuario</label>
              <div className="relative">
                <UserIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handle}
                  placeholder="xiomara"
                  autoComplete="username"
                  className="input-glass pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label-glass">Contraseña</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handle}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="input-glass pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Ingresar <ArrowRight size={15} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}