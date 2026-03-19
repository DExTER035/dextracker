import { supabase } from './supabase.js'

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
  const level = Math.floor(xp / 500) + 1
  const into = xp % 500
  return { level, into, next: 500 }
}

export async function addXp(userId, delta) {
  if (!userId || !delta) return { ok: false, error: 'missing' }
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('xp, level')
    .eq('id', userId)
    .single()
  if (error) return { ok: false, error: error.message }

  const nextXp = Math.max(0, (profile?.xp ?? 0) + delta)
  const { level } = levelFromXp(nextXp)

  const { error: upErr } = await supabase
    .from('profiles')
    .update({ xp: nextXp, level })
    .eq('id', userId)

  if (upErr) return { ok: false, error: upErr.message }
  return { ok: true, xp: nextXp, level }
}

