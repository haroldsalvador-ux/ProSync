import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { registerUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';

function PasswordRule({ ok, text }) {
  return (
    <span className={`flex items-center gap-1.5 text-xs transition-colors ${ok ? 'text-emerald-400' : 'text-white/30'}`}>
      {ok ? <CheckCircle size={11} /> : <XCircle size={11} />}
      {text}
    </span>
  );
}

export default function RegisterPage() {
  const navigate       = useNavigate();
  const { login }      = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const pwd = form.password;
  const rules = {
    length:   pwd.length >= 8,
    number:   /\d/.test(pwd),
    upper:    /[A-Z]/.test(pwd),
    match:    pwd.length > 0 && pwd === form.confirm,
  };
  const allRulesPass = Object.values(rules).every(Boolean);

  const handle = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) {
      setError('Completa todos los campos.');
      return;
    }
    if (!allRulesPass) {
      setError('La contraseña no cumple todos los requisitos.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await registerUser({
        email:    form.email,
        password: form.password,
        fullName: form.fullName,
      });
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blaugrana flex items-center justify-center px-4 py-10">
      {/* Glow ambiental */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-burgundy/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-navy/40 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <Zap size={28} className="text-burgundy group-hover:text-burgundy-light transition-colors" />
            <span className="text-white font-bold text-2xl tracking-wide">ProSync</span>
          </Link>
          <p className="text-white/40 text-sm mt-2">Crea tu cuenta gratuita</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-6">Registrarse</h1>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="label-glass">Nombre completo</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handle}
                  placeholder="Tu nombre completo"
                  autoComplete="name"
                  className="input-glass pl-10"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label-glass">Correo electrónico</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handle}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  className="input-glass pl-10"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="label-glass">Contraseña</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handle}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
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
              {/* Reglas en tiempo real */}
              {form.password.length > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 pl-1">
                  <PasswordRule ok={rules.length} text="8+ caracteres" />
                  <PasswordRule ok={rules.number} text="1 número" />
                  <PasswordRule ok={rules.upper}  text="1 mayúscula" />
                </div>
              )}
            </div>

            {/* Confirmar */}
            <div>
              <label className="label-glass">Confirmar contraseña</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="confirm"
                  value={form.confirm}
                  onChange={handle}
                  placeholder="Repite la contraseña"
                  autoComplete="new-password"
                  className={`input-glass pl-10 ${form.confirm.length > 0 ? (rules.match ? 'border-emerald-500/50' : 'border-red-500/40') : ''}`}
                />
              </div>
              {form.confirm.length > 0 && !rules.match && (
                <p className="text-red-400 text-xs mt-1.5 pl-1">Las contraseñas no coinciden</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Crear cuenta <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="text-white/40 text-sm text-center mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-burgundy-light hover:text-white transition-colors font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
