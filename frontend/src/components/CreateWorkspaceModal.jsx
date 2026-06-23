import { useState } from 'react';
import { X } from 'lucide-react';
import { createWorkspace } from '../api/workspaces';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = [
  'Engineering', 'Marketing', 'Design', 'Product',
  'Sales', 'HR', 'Finance', 'Operations',
];

export default function CreateWorkspaceModal({ onClose, onCreated }) {
  const { user } = useAuth();
  const [form, setForm]     = useState({ name: '', description: '', department: '', owner: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return; }
    setSaving(true);
    setError('');
    try {
      const ws = await createWorkspace({
        name:        form.name.trim(),
        description: form.description.trim() || null,
        department:  form.department || null,
        owner:       user?.email || null,
      });
      onCreated(ws);
      onClose();
    } catch {
      setError('Error al crear el espacio. Verifica que el backend esté activo en :8081.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card rounded-2xl w-full max-w-md mx-4 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold">Nuevo Espacio de Trabajo</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="label-glass">Nombre <span className="text-burgundy-light">*</span></label>
            <input
              name="name"
              value={form.name}
              onChange={handle}
              placeholder="Ej. Plataforma Digital"
              className="input-glass"
            />
          </div>

          <div>
            <label className="label-glass">Departamento</label>
            <select
              name="department"
              value={form.department}
              onChange={handle}
              className="input-glass appearance-none"
            >
              <option value="" className="bg-navy-dark">— Sin departamento —</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d} className="bg-navy-dark">{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-glass">Responsable</label>
            <input
              name="owner"
              value={form.owner}
              onChange={handle}
              placeholder="Ej. Gabriel Vargas"
              className="input-glass"
            />
          </div>

          <div>
            <label className="label-glass">Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handle}
              rows={3}
              placeholder="Describe el propósito del espacio..."
              className="input-glass resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 btn-ghost">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary">
              {saving ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creando...
                </span>
              ) : 'Crear Espacio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
