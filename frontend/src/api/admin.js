const BASE = 'http://localhost:8000/api/admin';

export async function getMetrics() {
  const res = await fetch(`${BASE}/metrics/`);
  if (!res.ok) throw new Error('Error al obtener métricas');
  return res.json();
}

export async function getAuditLogs(page = 1) {
  const res = await fetch(`${BASE}/logs/?page=${page}`);
  if (!res.ok) throw new Error('Error al obtener logs de auditoría');
  return res.json();
}
