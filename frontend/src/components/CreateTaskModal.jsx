import { useState } from 'react';
import { X } from 'lucide-react';
import { createTask } from '../api/tasks';

const PRIORITIES = ['low', 'medium', 'high'];
const PRIORITY_LABEL = { low: 'Baja', medium: 'Media', high: 'Alta' };

export default function CreateTaskModal({ workspaceId, onClose, onCreated }) {
  const [form, setForm]     = useState({ title: '', description: '', priority: 'medium', assignee: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('El título es obligatorio.'); return; }
    setSaving(true);
    setError('');
    try {
      const task = await createTask({
        workspaceId,
        title:       form.title.trim(),
        description: form.description.trim() || null,
        priority:    form.priority,
        assignee:    form.assignee.trim() || null,
        status:      'pending',
      });
      onCreated(task);
      onClose();
    } catch {
      setError('Error al crear la tarea. Verifica que Spring Boot esté activo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card rounded-2xl w-full max-w-md mx-4 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold">Nueva Tarea</h2>
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
            <label className="label-glass">Título <span className="text-burgundy-light">*</span></label>
            <input
              name="title"
              value={form.title}
              onChange={handle}
              placeholder="Ej. Implementar endpoint de login"
              className="input-glass"
            />
          </div>

          <div>
            <label className="label-glass">Prioridad</label>
            <div className="flex gap-2 mt-1">
              {PRIORITIES.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, priority: p }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                    form.priority === p
                      ? 'bg-burgundy/80 border-burgundy text-white shadow-neon-burgundy'
                      : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30 hover:text-white/70'
                  }`}
                >
                  {PRIORITY_LABEL[p]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label-glass">Responsable</label>
            <input
              name="assignee"
              value={form.assignee}
              onChange={handle}
              placeholder="Nombre del responsable"
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
              placeholder="Describe qué hay que hacer..."
              className="input-glass resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 btn-ghost">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary">
              {saving ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creando...
                </span>
              ) : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
