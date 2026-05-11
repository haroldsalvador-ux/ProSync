const AUTH_URL = 'http://localhost:8081/api/auth';

async function login() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        mostrarMensaje('⚠️ Completa todos los campos.', 'error');
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
            mostrarMensaje('✅ Bienvenido ' + data.username, 'exito');
            setTimeout(() => {
                window.location.href = '/workspace.html';
            }, 1000);
        } else {
            mostrarMensaje('❌ ' + (data.error || 'Credenciales incorrectas'), 'error');
        }
    } catch (error) {
        mostrarMensaje('❌ Error al conectar con el servidor.', 'error');
    }
}

async function registrar() {
    const username = document.getElementById('username').value.trim();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !email || !password) {
        mostrarMensaje('⚠️ Completa todos los campos.', 'error');
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
            mostrarMensaje('✅ Cuenta creada. Redirigiendo...', 'exito');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);
        } else {
            mostrarMensaje('❌ ' + (data.error || 'Error al registrar'), 'error');
        }
    } catch (error) {
        mostrarMensaje('❌ Error al conectar con el servidor.', 'error');
    }
}

function mostrarMensaje(texto, tipo) {
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
}