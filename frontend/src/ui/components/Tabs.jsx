import { cn } from '../utils/cn.js'

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => {
        const active = t.value === value
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-semibold tracking-[0.18em] uppercase transition duration-200',
              active
                ? 'border-primary/40 bg-primary/15 text-primary'
                : 'border-border bg-white/5 text-muted hover:bg-white/10',
            )}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

