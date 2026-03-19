import { Card, SectionLabel } from '../../ui/components/ui.jsx'

export function PageShell({ label, title, right, children }) {
  return (
    <div className="animate-fadeIn">
      <div className="flex items-start justify-between gap-4">
        <div>
          <SectionLabel>{label}</SectionLabel>
          <div className="mt-2 text-2xl font-bold text-text">{title}</div>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="mt-6 grid gap-6">{children}</div>
    </div>
  )
}

export function PlaceholderCard({ title, hint }) {
  return (
    <Card>
      <div className="text-lg font-bold text-text">{title}</div>
      <div className="mt-1 text-sm text-muted">{hint}</div>
    </Card>
  )
}

