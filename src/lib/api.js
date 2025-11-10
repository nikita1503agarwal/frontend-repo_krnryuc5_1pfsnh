export const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export async function apiGet(path, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

export async function apiPost(path, body, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body || {}),
  })
  if (!res.ok) {
    let msg = `${res.status}`
    try { const j = await res.json(); msg = j.detail || j.message || msg } catch {}
    throw new Error(msg)
  }
  return res.json()
}

export async function apiPut(path, body, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body || {}),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

export async function apiUpload(path, file, token) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: form,
  })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}
