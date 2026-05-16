const AUTH_URL = 'http://localhost:8081/api/auth';

async function login() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        mostrarMensaje('Completa todos los campos.', 'text-amber-400');
        return;
    }

    try {
        const response = await fetch(`${AUTH_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('usuario', JSON.stringify(data));
            mostrarMensaje('¡Bienvenido, ' + data.username + '!', 'text-emerald-400');
            setTimeout(() => {
                window.location.href = '/workspace.html';
            }, 1000);
        } else {
            mostrarMensaje(data.error || 'Credenciales incorrectas', 'text-red-400');
        }
    } catch (error) {
        mostrarMensaje('Error al conectar con el servidor.', 'text-red-400');
    }
}

async function registrar() {
    const username = document.getElementById('username').value.trim();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !email || !password) {
        mostrarMensaje('Completa todos los campos.', 'text-amber-400');
        return;
    }

    try {
        const response = await fetch(`${AUTH_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            mostrarMensaje('Cuenta creada. Redirigiendo...', 'text-emerald-400');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);
        } else {
            mostrarMensaje(data.error || 'Error al registrar', 'text-red-400');
        }
    } catch (error) {
        mostrarMensaje('Error al conectar con el servidor.', 'text-red-400');
    }
}

function mostrarMensaje(texto, clases) {
    const mensaje = document.getElementById('mensaje');
    if (!mensaje) return;
    mensaje.textContent = texto;
    mensaje.className = `text-sm font-medium min-h-[20px] text-center ${clases}`;
    setTimeout(() => {
        mensaje.textContent = '';
        mensaje.className = 'text-sm font-medium min-h-[20px] text-center';
    }, 3000);
}
