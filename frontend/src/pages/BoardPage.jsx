import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import KanbanBoard from '../components/KanbanBoard';

export default function BoardPage() {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-navy transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-navy">Tablero de Tareas</h1>
          <p className="text-gray-500 text-sm mt-1">Vista previa — Sprint 2</p>
        </div>
      </div>

      <KanbanBoard />
    </div>
  );
}
