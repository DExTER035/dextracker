import { cn } from '../utils/cn.js'

export function Card({ className, children }) {
  return (
    <div
      className={cn(
        'rounded-[2rem] border border-primary/20 bg-surface/60 backdrop-blur-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.6)] transition-all duration-300 hover:border-primary/50 hover:shadow-glow',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SectionLabel({ children, className }) {
  return (
    <div className={cn('text-xs font-semibold tracking-[0.24em] text-muted uppercase', className)}>
      {children}
    </div>
  )
}

export function Button({ className, variant = 'primary', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-95'
  const variants = {
    primary: 'bg-gradient-to-r from-primary to-blue-500 text-bg shadow-buttonGlow hover:shadow-[0_0_25px_rgba(0,229,255,0.7),inset_0_0_15px_rgba(0,229,255,0.5)] hover:brightness-125',
    ghost: 'bg-transparent text-text hover:bg-white/5 border border-primary/20 hover:border-primary hover:shadow-glow',
    danger: 'bg-danger text-white hover:brightness-110 shadow-[0_0_15px_rgba(239,68,68,0.4)]',
  }
  return <button className={cn(base, variants[variant] ?? variants.primary, className)} {...props} />
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border border-border bg-bg/40 px-3 py-2 text-sm text-text placeholder:text-muted outline-none transition duration-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/20',
        className,
      )}
      {...props}
    />
  )
}

export function Badge({ children, tone = 'online', className }) {
  const tones = {
    online: 'bg-primary/20 text-primary border-primary/50 shadow-[0_0_10px_rgba(0,229,255,0.4)]',
    active: 'bg-success/20 text-success border-success/50 shadow-[0_0_10px_rgba(52,211,153,0.4)]',
    gold: 'bg-gold/20 text-gold border-gold/50 shadow-[0_0_10px_rgba(245,158,11,0.4)]',
    danger: 'bg-danger/20 text-danger border-danger/50 shadow-[0_0_10px_rgba(239,68,68,0.4)]',
    muted: 'bg-white/5 text-muted border-border',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] uppercase',
        tones[tone] ?? tones.muted,
        className,
      )}
    >
      {tone !== 'muted' && <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_5px_currentColor] animate-pulse" />}
      {children}
    </span>
  )
}

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-white/5 ring-1 ring-border/70',
        className ?? 'h-10 w-full',
      )}
    />
  )
}

export function ProgressBar({ value, tone = 'primary' }) {
  const bg = tone === 'gold' ? 'bg-gold' : 'bg-primary'
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-border/70">
      <div className={cn('h-full transition-all duration-200', bg)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}


