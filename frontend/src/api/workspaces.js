const BASE = 'http://localhost:8081/api';

export async function getWorkspaces() {
  const res = await fetch(`${BASE}/workspaces`);
  if (!res.ok) throw new Error('Error al obtener workspaces');
  return res.json();
}

export async function createWorkspace(data) {
  const res = await fetch(`${BASE}/workspaces`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear workspace');
  return res.json();
}
