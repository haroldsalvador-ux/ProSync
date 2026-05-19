import { useState } from 'react';
import { X } from 'lucide-react';
import { createWorkspace } from '../api/workspaces';

const DEPARTMENTS = [
  'Engineering', 'Marketing', 'Design', 'Product',
  'Sales', 'HR', 'Finance', 'Operations',
];

export default function CreateWorkspaceModal({ onClose, onCreated }) {
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
        owner:       form.owner.trim() || null,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-navy rounded-t-2xl">
          <h2 className="text-white font-semibold text-lg">Nuevo Espacio de Trabajo</h2>
          <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-burgundy">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handle}
              placeholder="Ej. Plataforma Digital"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
            <select
              name="department"
              value={form.department}
              onChange={handle}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent bg-white"
            >
              <option value="">— Sin departamento —</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
            <input
              name="owner"
              value={form.owner}
              onChange={handle}
              placeholder="Ej. Gabriel Vargas"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handle}
              rows={3}
              placeholder="Describe el propósito del espacio..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-burgundy text-white py-2 rounded-lg text-sm font-medium hover:bg-burgundy-dark transition-colors disabled:opacity-60"
            >
              {saving ? 'Creando...' : 'Crear Espacio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
