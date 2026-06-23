const BASE = 'http://localhost:8081/api/v1/notifications';

function authHeaders() {
  let token = null;
  try {
    const stored = localStorage.getItem('prosync_user');
    token = stored ? JSON.parse(stored).token : null;
  } catch { /* ignore */ }
  return {
    'Content-Type': 'application/json',
    Authorization:  `Bearer ${token}`,
  };
}

export async function getNotifications() {
  const res = await fetch(BASE, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener notificaciones');
  return res.json();
}

export async function getUnreadCount() {
  const res = await fetch(`${BASE}/unread-count`, { headers: authHeaders() });
  if (!res.ok) return { count: 0 };
  return res.json();
}

export async function markRead(id) {
  const res = await fetch(`${BASE}/${id}/read`, { method: 'PATCH', headers: authHeaders() });
  if (!res.ok) throw new Error('Error al marcar notificación');
  return res.json();
}

export async function markAllRead() {
  const res = await fetch(`${BASE}/read-all`, { method: 'PATCH', headers: authHeaders() });
  if (!res.ok) throw new Error('Error al marcar notificaciones');
}
