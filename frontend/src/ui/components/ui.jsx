import { cn } from '../utils/cn.js'

export function Card({ className, children, style }) {
  return (
    <div
      style={style}
      className={cn(
        'rounded-[2rem] border border-border bg-surface bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-[24px] p-6 shadow-cardGlow transition-all duration-300 hover:border-violet/50 hover:shadow-[0_8px_30px_rgba(139,92,246,0.2)] hover:-translate-y-0.5',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SectionLabel({ children, className }) {
  return (
    <div className={cn('text-xs font-bold tracking-[2px] text-muted uppercase font-heading drop-shadow-[0_0_8px_rgba(148,163,184,0.3)]', className)}>
      {children}
    </div>
  )
}

export function Button({ className, variant = 'primary', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold tracking-wide transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-95 hover:scale-[1.03]'
  const variants = {
    primary: 'bg-gradient-to-br from-violet to-cyan text-white shadow-buttonGlow hover:shadow-[0_0_25px_rgba(139,92,246,0.8),inset_0_0_15px_rgba(34,211,238,0.5)] border border-white/10 hover:brightness-110',
    ghost: 'bg-transparent text-text hover:bg-violet/10 border border-violet/30 hover:border-violet hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]',
    danger: 'bg-gradient-to-br from-danger to-orange-500 text-white hover:brightness-110 shadow-[0_0_20px_rgba(239,68,68,0.4)] border border-white/10',
  }
  return <button className={cn(base, variants[variant] ?? variants.primary, className)} {...props} />
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border border-border bg-white/5 backdrop-blur-md px-3 py-2 text-sm text-text placeholder:text-muted outline-none transition duration-200 focus:border-cyan/50 focus:ring-2 focus:ring-cyan/20 shadow-[inset_0_2px_5px_rgba(0,0,0,0.3)]',
        className,
      )}
      {...props}
    />
  )
}

export function Badge({ children, tone = 'online', className }) {
  const tones = {
    online: 'bg-cyan/10 text-cyan border-cyan/40 shadow-[0_0_10px_rgba(34,211,238,0.3)]',
    active: 'bg-success/10 text-success border-success/40 shadow-[0_0_10px_rgba(52,211,153,0.3)]',
    gold: 'bg-gold/10 text-gold border-gold/40 shadow-[0_0_10px_rgba(251,191,36,0.3)]',
    danger: 'bg-danger/10 text-danger border-danger/40 shadow-[0_0_10px_rgba(239,68,68,0.3)]',
    muted: 'bg-white/5 text-muted border-border',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold tracking-[2px] uppercase backdrop-blur-md',
        tones[tone] ?? tones.muted,
        className,
      )}
    >
      {tone !== 'muted' && <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_5px_currentColor] animate-pulseSoft" />}
      {children}
    </span>
  )
}

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-white/5 ring-1 ring-border shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]',
        className ?? 'h-10 w-full',
      )}
    />
  )
}

export function ProgressBar({ value, tone = 'primary' }) {
  const bg = tone === 'gold' ? 'bg-gold' : 'bg-cyan'
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface ring-1 ring-border shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
      <div 
        className={cn('absolute top-0 bottom-0 left-0 transition-all duration-300 shadow-[0_0_10px_currentColor]', bg)} 
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }} 
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-[200%] animate-shimmer" />
      </div>
    </div>
  )
}


