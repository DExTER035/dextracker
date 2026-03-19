import { fetchApi } from './api.js'

export const XP = {
  task: 20,
  habit: 15,
  mood: 5,
  journal: 10,
  workout: 30,
  milestone: 25,
  dailyCheckIn: 10,
  dailyChallenge: 50,
}

export function levelFromXp(xp) {
  const level = Math.floor((xp || 0) / 500) + 1
  const into = (xp || 0) % 500
  return { level, into, next: 500 }
}

export async function addXp(userId, delta, reason = 'activity') {
  if (!userId || !delta) return { ok: false, error: 'missing' }
  try {
    const data = await fetchApi(`/api/${userId}/xp`, {
      method: 'POST',
      body: JSON.stringify({ amount: delta, reason })
    })
    
    // Also save simple XP history event
    await fetchApi(`/api/${userId}/xp-history`, {
      method: 'POST',
      body: JSON.stringify({ amount: delta, reason, time: new Date().toISOString() })
    })
    
    return { ok: true, xp: data.xp, level: data.level, badges: data.newBadges || [] }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

