const BASE = 'http://localhost:8080/api'
export async function api(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  })
  if (!response.ok) {
    let message = 'Something went wrong'
    try { message = (await response.json()).message || message } catch {}
    throw new Error(message)
  }
  if (response.status === 204) return null
  return response.json()
}
export const money = n => `₹${Number(n || 0).toFixed(2)}`
