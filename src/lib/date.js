export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function startOfWeekISO(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = (date.getUTCDay() + 6) % 7 // Mon=0
  date.setUTCDate(date.getUTCDate() - day)
  return date.toISOString().slice(0, 10)
}

export function isoDays(n, from = new Date()) {
  const out = []
  const base = new Date(Date.UTC(from.getFullYear(), from.getMonth(), from.getDate()))
  for (let i = 0; i < n; i++) {
    const x = new Date(base)
    x.setUTCDate(base.getUTCDate() - (n - 1 - i))
    out.push(x.toISOString().slice(0, 10))
  }
  return out
}

