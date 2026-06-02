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
    Authorization:  `Bearer ${getToken()}`,
  };
}

export async function getTasks(workspaceId) {
  const res = await fetch(`${BASE}/tasks?workspaceId=${workspaceId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Error al obtener tareas');
  return res.json();
}

export async function createTask(data) {
  const res = await fetch(`${BASE}/tasks`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear tarea');
  return res.json();
}

export async function updateTaskStatus(id, status) {
  const res = await fetch(`${BASE}/tasks/${id}/status`, {
    method:  'PATCH',
    headers: authHeaders(),
    body:    JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Error al actualizar estado');
  return res.json();
}

export async function getAllTasks() {
  const res = await fetch(`${BASE}/tasks/all`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener todas las tareas');
  return res.json();
}

export async function deleteTask(id) {
  const res = await fetch(`${BASE}/tasks/${id}`, {
    method:  'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Error al eliminar tarea');
}
