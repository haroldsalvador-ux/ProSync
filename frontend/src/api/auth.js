const BASE = 'http://localhost:8081/api/auth';

export async function loginUser({ email, password }) {
  const res = await fetch(`${BASE}/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Credenciales inválidas');
  }
  return res.json(); // { token, email, fullName }
}

export async function registerUser({ email, password, fullName }) {
  const res = await fetch(`${BASE}/register`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password, fullName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error en el registro');
  }
  return res.json();
}
