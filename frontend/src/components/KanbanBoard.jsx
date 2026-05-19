import { Lock } from 'lucide-react';

const COLUMNS = [
  { id: 'pending',     label: 'Pendiente',  topColor: '#6b7280' },
  { id: 'in_progress', label: 'En Proceso', topColor: '#004170' },
  { id: 'done',        label: 'Terminado',  topColor: '#10b981' },
];

const CARDS = [
  { id: 1, title: 'Definir requerimientos del sistema',  column: 'pending'     },
  { id: 2, title: 'Diseño de base de datos compartida',  column: 'in_progress' },
  { id: 3, title: 'Configurar entornos de desarrollo',   column: 'done'        },
  { id: 4, title: 'Crear endpoints REST workspaces',     column: 'in_progress' },
  { id: 5, title: 'Implementar autenticación JWT',       column: 'pending'     },
  { id: 6, title: 'Migración de schema inicial',        column: 'done'        },
];

export default function KanbanBoard() {
  return (
    <div>
      {/* Sprint 2 Banner */}
      <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <Lock size={16} className="text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-700">
          <span className="font-semibold">Vista previa — Sprint 2.</span>{' '}
          La gestión de tareas estará disponible en el próximo sprint. Las tarjetas son solo ilustrativas.
        </p>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map(col => {
          const cards = CARDS.filter(c => c.column === col.id);
          return (
            <div key={col.id} className="flex flex-col">
              {/* Column header */}
              <div
                className="bg-white rounded-xl border border-gray-200 border-t-4 shadow-sm mb-3 px-4 py-3 flex items-center justify-between"
                style={{ borderTopColor: col.topColor }}
              >
                <span className="font-semibold text-gray-700 text-sm">{col.label}</span>
                <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {cards.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {cards.map(card => (
                  <div
                    key={card.id}
                    className="bg-white border border-gray-200 rounded-xl px-4 py-3 opacity-60 select-none"
                  >
                    <p className="text-sm text-gray-600 font-medium mb-2">{card.title}</p>
                    <span className="inline-block text-xs bg-amber-100 text-amber-600 font-semibold px-2 py-0.5 rounded-full">
                      Sprint 2
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
