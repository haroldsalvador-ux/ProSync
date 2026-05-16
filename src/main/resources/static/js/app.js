const API_URL = 'http://localhost:8081/api/workspaces';

// Cargar espacios al abrir la página
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    listarEspacios();
});

// Proteger la página
function verificarSesion() {
    const usuario = localStorage.getItem('usuario');
    if (!usuario) {
        window.location.href = '/login.html';
    }
}

// Cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('usuario');
    window.location.href = '/login.html';
}

// Crear espacio de trabajo
async function crearEspacio() {
    const input = document.getElementById('workspaceName');
    const nombre = input.value.trim();

    if (!nombre) {
        mostrarMensaje('Escribe un nombre para el espacio.', 'text-amber-400');
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: nombre })
        });

        if (response.ok) {
            mostrarMensaje('Espacio creado exitosamente.', 'text-emerald-400');
            input.value = '';
            setTimeout(() => {
                toggleModal(false); // Función definida en workspace.html
                listarEspacios();
            }, 1000);
        } else {
            mostrarMensaje('Ya existe un espacio con ese nombre.', 'text-red-400');
        }
    } catch (error) {
        mostrarMensaje('Error al conectar con el servidor.', 'text-red-400');
    }
}

// Listar todos los espacios
async function listarEspacios() {
    const lista = document.getElementById('listaEspacios');
    const totalContador = document.getElementById('totalEspacios');

    try {
        const response = await fetch(API_URL);
        const espacios = await response.json();

        if (totalContador) totalContador.textContent = espacios.length;

        if (espacios.length === 0) {
            lista.innerHTML = `
                <tr>
                    <td colspan="4" class="px-6 py-10 text-center text-slate-500 italic">
                        No hay espacios creados aún. Empieza creando uno nuevo.
                    </td>
                </tr>
            `;
            return;
        }

        lista.innerHTML = espacios.map(e => `
            <tr class="hover:bg-slate-800/30 transition-colors group">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-violet-400 group-hover:bg-violet-500/10 transition-colors">
                            <i data-lucide="folder" class="w-4 h-4"></i>
                        </div>
                        <span class="font-medium text-white">${e.name}</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm text-slate-400">
                    ${formatearFecha(e.createdAt)}
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                        Activo
                    </span>
                </td>
                <td class="px-6 py-4 text-right">
                    <div class="flex justify-end gap-2">
                        <button class="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
                            <i data-lucide="edit-3" class="w-4 h-4"></i>
                        </button>
                        <button onclick="eliminarEspacio(${e.id})" class="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Reinicializar iconos para los nuevos elementos
        if (window.lucide) {
            lucide.createIcons();
        }

    } catch (error) {
        lista.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-10 text-center text-red-400 italic">
                    Error al cargar los espacios de trabajo.
                </td>
            </tr>
        `;
    }
}

// Eliminar espacio
async function eliminarEspacio(id) {
    if (!confirm('¿Seguro que quieres eliminar este espacio?')) return;
    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        listarEspacios();
    } catch (error) {
        console.error("Error al eliminar:", error);
    }
}

// Formatear fecha
function formatearFecha(fechaISO) {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-PE', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
}

// Mostrar mensaje temporal
function mostrarMensaje(texto, clases) {
    const mensaje = document.getElementById('mensaje');
    if (!mensaje) return;
    mensaje.textContent = texto;
    mensaje.className = `text-sm font-medium min-h-[20px] ${clases}`;
    setTimeout(() => {
        mensaje.textContent = '';
        mensaje.className = 'text-sm font-medium min-h-[20px]';
    }, 3000);
}
