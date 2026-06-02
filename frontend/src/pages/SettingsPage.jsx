import { useState, useRef } from 'react';
import { Camera, Save, User, Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/users';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const fileRef              = useRef(null);

  const [fullName, setFullName]     = useState(user?.fullName ?? '');
  const [avatar, setAvatar]         = useState(user?.avatar ?? null);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [error, setError]           = useState('');

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('La imagen no debe superar 2 MB.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) { setError('El nombre no puede estar vacío.'); return; }
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await updateProfile({ fullName: fullName.trim() });
      updateUser({ fullName: fullName.trim(), avatar });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Error al guardar. Verifica que Spring Boot esté activo.');
    } finally {
      setSaving(false);
    }
  };

  const initials = (fullName || user?.fullName || 'U')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="p-8 animate-fade-in max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Ajustes de Perfil</h1>
        <p className="text-white/40 text-sm">Edita tu nombre y foto de perfil</p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8 pb-6 border-b border-white/10">
          <div className="relative">
            {avatar ? (
              <img
                src={avatar}
                alt="avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-burgundy/40"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-burgundy/30 border-2 border-burgundy/40 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">{initials}</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-burgundy border-2 border-navy-dark flex items-center justify-center hover:bg-burgundy/80 transition-colors"
            >
              <Camera size={12} className="text-white" />
            </button>
          </div>
          <div>
            <p className="text-white font-semibold">{user?.fullName}</p>
            <p className="text-white/40 text-sm">{user?.email}</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs text-burgundy-light hover:underline mt-1"
            >
              Cambiar foto
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        {/* Formulario */}
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {saved && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-400" />
              <p className="text-emerald-400 text-sm">Cambios guardados correctamente</p>
            </div>
          )}

          <div>
            <label className="label-glass flex items-center gap-1.5">
              <User size={12} /> Nombre completo
            </label>
            <input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Tu nombre"
              className="input-glass"
            />
          </div>

          <div>
            <label className="label-glass flex items-center gap-1.5">
              <Mail size={12} /> Correo electrónico
            </label>
            <input
              value={user?.email ?? ''}
              disabled
              className="input-glass opacity-50 cursor-not-allowed"
            />
            <p className="text-white/25 text-xs mt-1">El correo no se puede modificar</p>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
              {saving ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
              ) : (
                <><Save size={14} /> Guardar cambios</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
