import { cn } from '../utils/cn.js'

export function Card({ className, children }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-surface/95 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.35)] transition duration-200 hover:shadow-glow',
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
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    primary: 'bg-primary text-bg hover:brightness-110',
    ghost: 'bg-transparent text-text hover:bg-white/5 border border-border',
    danger: 'bg-danger text-white hover:brightness-110',
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
    online: 'bg-primary/15 text-primary border-primary/30',
    active: 'bg-success/15 text-success border-success/30',
    gold: 'bg-gold/15 text-gold border-gold/30',
    danger: 'bg-danger/15 text-danger border-danger/30',
    muted: 'bg-white/5 text-muted border-border',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase',
        tones[tone] ?? tones.muted,
        className,
      )}
    >
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


