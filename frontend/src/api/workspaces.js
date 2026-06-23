const BASE = 'http://localhost:8081/api';

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
    Authorization:  `Bearer ${getToken()}`,
  };
}

export async function getWorkspaces() {
  const res = await fetch(`${BASE}/workspaces`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener workspaces');
  return res.json();
}

export async function getWorkspaceMembers(workspaceId) {
  const res = await fetch(`${BASE}/workspaces/${workspaceId}/members`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener miembros');
  return res.json();
}

export async function addWorkspaceMember(workspaceId, email) {
  const res = await fetch(`${BASE}/workspaces/${workspaceId}/members`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify({ email }),
  });
  if (!res.ok) {
    let msg = 'Error al agregar miembro';
    try {
      const data = await res.json();
      msg = data.message || msg;
    } catch {}
    throw new Error(msg);
  }
}

export async function removeWorkspaceMember(workspaceId, email) {
  const res = await fetch(`${BASE}/workspaces/${workspaceId}/members/${encodeURIComponent(email)}`, {
    method:  'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Error al eliminar miembro');
}

export async function createWorkspace(data) {
  const res = await fetch(`${BASE}/workspaces`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear workspace');
  return res.json();
}
