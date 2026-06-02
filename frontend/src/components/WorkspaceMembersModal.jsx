import { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, Loader2, Users } from 'lucide-react';
import { getWorkspaceMembers, addWorkspaceMember, removeWorkspaceMember } from '../api/workspaces';

export default function WorkspaceMembersModal({ workspaceId, workspaceName, onClose }) {
  const [members, setMembers]   = useState([]);
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [adding, setAdding]     = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    getWorkspaceMembers(workspaceId)
      .then(setMembers)
      .catch(() => setError('No se pudieron cargar los miembros'))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setAdding(true);
    setError('');
    try {
      const member = await addWorkspaceMember(workspaceId, email.trim());
      setMembers(prev => [...prev, member]);
      setEmail('');
    } catch (err) {
      setError(err.message || 'Error al agregar miembro');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (memberEmail) => {
    try {
      await removeWorkspaceMember(workspaceId, memberEmail);
      setMembers(prev => prev.filter(m => m.email !== memberEmail));
    } catch {
      setError('Error al eliminar miembro');
    }
  };

  const initials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card rounded-2xl w-full max-w-md mx-4 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Users size={16} className="text-burgundy-light" />
            <div>
              <h2 className="text-white font-semibold text-sm">Miembros del Workspace</h2>
              <p className="text-white/30 text-[10px]">{workspaceName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Agregar miembro */}
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              placeholder="correo@ejemplo.com"
              className="input-glass flex-1 text-sm"
            />
            <button type="submit" disabled={adding} className="btn-primary flex items-center gap-1.5 text-sm px-4">
              {adding ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              Agregar
            </button>
          </form>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          {/* Lista de miembros */}
          <div>
            <p className="text-white/30 text-xs font-semibold uppercase tracking-wide mb-3">
              {loading ? 'Cargando...' : `${members.length} miembro${members.length !== 1 ? 's' : ''}`}
            </p>
            {!loading && members.length === 0 && (
              <p className="text-white/20 text-sm text-center py-6">Sin miembros aún</p>
            )}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {members.map(m => (
                <div key={m.email} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 group">
                  <div className="w-8 h-8 rounded-full bg-burgundy/30 border border-burgundy/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{initials(m.fullName)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm font-medium truncate">{m.fullName}</p>
                    <p className="text-white/30 text-xs truncate">{m.email}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(m.email)}
                    className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
