import { useEffect, useState } from 'react'
import { Badge } from './ui.jsx'

let xpId = 0

export function GlobalEffects() {
  const [xpPopups, setXpPopups] = useState([])
  const [levelUp, setLevelUp] = useState(null)
  const [badgeUnlock, setBadgeUnlock] = useState(null)
  const [milestone, setMilestone] = useState(null)

  useEffect(() => {
    function onXp(e) {
      if (!e.detail?.amount) return
      const id = ++xpId
      setXpPopups(x => [...x, { id, val: e.detail.amount }].slice(-5))
      setTimeout(() => setXpPopups(x => x.filter(p => p.id !== id)), 2000)
    }
    
    function onLevelUp(e) {
      setLevelUp(e.detail.level)
      setTimeout(() => setLevelUp(null), 3000)
    }

    function onBadge(e) {
      setBadgeUnlock(e.detail.badge)
      setTimeout(() => setBadgeUnlock(null), 4000)
    }
    
    function onMilestone(e) {
      setMilestone(e.detail.days)
      setTimeout(() => setMilestone(null), 3000)
    }

    window.addEventListener('dex:xp', onXp)
    window.addEventListener('dex:levelup', onLevelUp)
    window.addEventListener('dex:badge', onBadge)
    window.addEventListener('dex:milestone', onMilestone)
    
    return () => {
      window.removeEventListener('dex:xp', onXp)
      window.removeEventListener('dex:levelup', onLevelUp)
      window.removeEventListener('dex:badge', onBadge)
      window.removeEventListener('dex:milestone', onMilestone)
    }
  }, [])

  return (
    <>
      {/* XP Popups */}
      <div className="fixed bottom-24 right-8 z-[100] flex flex-col-reverse items-end gap-2 pointer-events-none">
        {xpPopups.map(p => (
          <div key={p.id} className="text-gold font-black text-xl animate-floatText drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] font-mono">
            +{p.val} XP
          </div>
        ))}
      </div>

      {/* Level Up Flash */}
      {levelUp && (
        <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center animate-pageFadeIn" style={{ animationDuration: '3s' }}>
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] mix-blend-overlay"></div>
          <div className="relative z-10 animate-wobble transform">
            <Badge tone="online" className="text-2xl py-4 px-8 shadow-[0_0_50px_rgba(34,211,238,0.8)] border-cyan bg-cyan/20">LEVEL {levelUp} REACHED!</Badge>
          </div>
        </div>
      )}

      {/* Badge Update */}
      {badgeUnlock && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] pointer-events-none">
          <div className="animate-badgeFlip bg-surface border-2 border-gold rounded-3xl p-6 shadow-[0_0_60px_rgba(251,191,36,0.6)] flex items-center gap-4 backdrop-blur-xl bg-bg/90">
             <div className="text-5xl drop-shadow-glow">{badgeUnlock.icon || '🏅'}</div>
             <div>
                <div className="text-gold font-black tracking-[3px] text-xs uppercase mb-1">Badge Unlocked</div>
                <div className="text-white font-bold text-xl">{badgeUnlock.name}</div>
             </div>
          </div>
        </div>
      )}

      {/* Fire Rain for Milestone */}
      {milestone && (
        <div className="fixed inset-0 z-[150] pointer-events-none overflow-hidden animate-pageFadeIn" style={{ animationDuration: '3s' }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute text-3xl animate-fireRain" 
              style={{ 
                left: `${Math.random() * 100}vw`, 
                animationDelay: `${Math.random() * 1}s`,
                top: '-50px' 
              }}
            >
              🔥
            </div>
          ))}
        </div>
      )}
    </>
  )
}
