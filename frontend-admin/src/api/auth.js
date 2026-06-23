const BASE = 'http://localhost:8000/api/admin';

export async function loginUser({ username, password }) {
  const res = await fetch(`${BASE}/login/`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Credenciales inválidas');
  }
  return res.json(); // { token, username }
}