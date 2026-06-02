const BASE = 'http://localhost:8081/api/v1';

function getToken() {
  try {
    const stored = localStorage.getItem('prosync_user');
    return stored ? JSON.parse(stored).token : null;
  } catch {
    return null;
  }
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function getUsers() {
  const res = await fetch(`${BASE}/users`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener usuarios');
  return res.json();
}

export async function updateProfile(data) {
  const res = await fetch(`${BASE}/users/me`, {
    method:  'PATCH',
    headers: authHeaders(),
    body:    JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar perfil');
  return res.json();
}
