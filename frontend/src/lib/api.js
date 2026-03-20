export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002'

export async function fetchApi(endpoint, options = {}) {
  let base = API_BASE.replace(/\/$/, '')
  if (base.endsWith('/api') && endpoint.startsWith('/api')) {
    base = base.slice(0, -4)
  }
  const url = `${base}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let err
    try {
      const data = await response.json()
      err = data.error || data.message || response.statusText
    } catch {
      err = response.statusText
    }
    throw new Error(err)
  }

  // Handle empty responses
  const text = await response.text()
  return text ? JSON.parse(text) : null
}
