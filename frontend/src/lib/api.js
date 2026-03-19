export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
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
