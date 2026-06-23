const BASE = 'http://localhost:8000/api/admin';

function authHeaders() {
  const stored = localStorage.getItem('prosync_admin_user');
  const token  = stored ? JSON.parse(stored).token : null;
  return { Authorization: `Token ${token}` };
}

export async function getMetrics() {
  const res = await fetch(`${BASE}/metrics/`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener métricas');
  return res.json();
}

export async function getVelocity() {
  const res = await fetch(`${BASE}/metrics/velocity/`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener velocidad');
  return res.json();
}

export async function getAuditLogs(page = 1) {
  const res = await fetch(`${BASE}/logs/?page=${page}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener logs de auditoría');
  return res.json();
}

export async function getAppUsers(page = 1) {
  const res = await fetch(`${BASE}/users/?page=${page}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener usuarios');
  return res.json();
}

export async function toggleBlockUser(userId) {
  const res = await fetch(`${BASE}/users/${userId}/block/`, {
    method:  'PATCH',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Error al actualizar el usuario');
  return res.json();
}

export async function getAdminWorkspaces() {
  const res = await fetch('http://localhost:8000/api/workspaces/workspaces/', { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener workspaces');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.results ?? []);
}