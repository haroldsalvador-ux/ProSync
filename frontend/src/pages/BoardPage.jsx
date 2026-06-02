import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Layers, Users } from 'lucide-react';
import KanbanBoard from '../components/KanbanBoard';
import WorkspaceMembersModal from '../components/WorkspaceMembersModal';

export default function BoardPage() {
  const navigate         = useNavigate();
  const [params]         = useSearchParams();
  const workspaceId      = params.get('workspace');
  const workspaceName    = params.get('name') ? decodeURIComponent(params.get('name')) : 'Tablero';

  const [showMembers, setShowMembers] = useState(false);

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/workspaces')}
            className="w-9 h-9 glass-card rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-burgundy/20 border border-burgundy/20 flex items-center justify-center">
              <Layers size={16} className="text-burgundy-light" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{workspaceName}</h1>
              <p className="text-white/40 text-xs">Tablero Kanban — Sprint 3</p>
            </div>
          </div>
        </div>

        {workspaceId && (
          <button
            onClick={() => setShowMembers(true)}
            className="btn-ghost flex items-center gap-2 text-sm"
          >
            <Users size={15} />
            Miembros
          </button>
        )}
      </div>

      <KanbanBoard workspaceId={workspaceId} />

      {showMembers && workspaceId && (
        <WorkspaceMembersModal
          workspaceId={workspaceId}
          workspaceName={workspaceName}
          onClose={() => setShowMembers(false)}
        />
      )}
    </div>
  );
}
