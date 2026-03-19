import { Card } from './ui.jsx'
import { cn } from '../utils/cn.js'

export function EmptyState({ icon: Icon, title, message, action, className }) {
  return (
    <Card className={cn('flex items-center justify-between gap-6', className)}>
      <div className="flex items-start gap-4">
        {Icon ? (
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/5 ring-1 ring-border">
            <Icon size={18} className="text-primary" />
          </div>
        ) : null}
        <div>
          <div className="text-base font-bold text-text">{title}</div>
          <div className="mt-1 text-sm text-muted">{message}</div>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </Card>
  )
}

