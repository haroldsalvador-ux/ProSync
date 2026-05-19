import { useNavigate } from 'react-router-dom';
import { User, Calendar, ArrowRight } from 'lucide-react';

const DEPT_BADGE = {
  Engineering: 'bg-blue-100 text-blue-700',
  Marketing:   'bg-green-100 text-green-700',
  Design:      'bg-purple-100 text-purple-700',
  Product:     'bg-orange-100 text-orange-700',
  Sales:       'bg-teal-100 text-teal-700',
  HR:          'bg-pink-100 text-pink-700',
  Finance:     'bg-yellow-100 text-yellow-700',
  Operations:  'bg-red-100 text-red-700',
};

export default function WorkspaceCard({ workspace }) {
  const navigate = useNavigate();
  const badgeClass = DEPT_BADGE[workspace.department] ?? 'bg-gray-100 text-gray-600';
  const created = workspace.createdAt
    ? new Date(workspace.createdAt).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : '—';

  return (
    <div
      onClick={() => navigate('/board')}
      className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-md hover:border-navy transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        {workspace.department && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>
            {workspace.department}
          </span>
        )}
        <ArrowRight
          size={16}
          className="text-gray-300 group-hover:text-burgundy transition-colors ml-auto"
        />
      </div>

      <h3 className="text-navy font-semibold text-base mb-1">{workspace.name}</h3>
      {workspace.description && (
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{workspace.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-400 pt-3 border-t border-gray-100">
        {workspace.owner && (
          <span className="flex items-center gap-1">
            <User size={12} />
            {workspace.owner}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {created}
        </span>
      </div>
    </div>
  );
}
