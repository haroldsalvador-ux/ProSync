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
        mostrarMensaje('⚠️ Escribe un nombre para el espacio.', 'error');
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: nombre })
        });

        if (response.ok) {
            mostrarMensaje('✅ Espacio creado exitosamente.', 'exito');
            input.value = '';
            listarEspacios();
        } else {
            mostrarMensaje('❌ Ya existe un espacio con ese nombre.', 'error');
        }
    } catch (error) {
        mostrarMensaje('❌ Error al conectar con el servidor.', 'error');
    }
}

// Listar todos los espacios
async function listarEspacios() {
    const lista = document.getElementById('listaEspacios');

    try {
        const response = await fetch(API_URL);
        const espacios = await response.json();

        if (espacios.length === 0) {
            lista.innerHTML = '<p class="vacio">🗂️ No hay espacios creados aún.</p>';
            return;
        }

        lista.innerHTML = espacios.map(e => `
            <div class="workspace-item">
                <span class="nombre">📁 ${e.name}</span>
                <span class="fecha">${formatearFecha(e.createdAt)}</span>
                <button onclick="eliminarEspacio(${e.id})" class="btn-eliminar">🗑️</button>
            </div>
        `).join('');

    } catch (error) {
        lista.innerHTML = '<p class="vacio">❌ Error al cargar los espacios.</p>';
    }
}

// Eliminar espacio
async function eliminarEspacio(id) {
    if (!confirm('¿Seguro que quieres eliminar este espacio?')) return;
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    listarEspacios();
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
function mostrarMensaje(texto, tipo) {
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
    setTimeout(() => {
        mensaje.textContent = '';
        mensaje.className = 'mensaje';
    }, 3000);
}