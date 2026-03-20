import { createContext, useContext, useMemo, useState } from 'react'
import { cn } from '../utils/cn.js'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  function push(t) {
    const id = crypto.randomUUID?.() ?? String(Math.random())
    const toast = { id, tone: 'muted', ...t }
    setToasts((x) => [toast, ...x].slice(0, 4))
    window.setTimeout(() => {
      setToasts((x) => x.filter((y) => y.id !== id))
    }, toast.ms ?? 2200)
  }

  const value = useMemo(() => ({ push }), [])

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 grid gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'rounded-2xl border px-4 py-3 text-sm font-semibold shadow-[0_20px_50px_rgba(0,0,0,0.55)] backdrop-blur transition duration-200 animate-slideInRight',
              t.tone === 'success'
                ? 'border-success/30 bg-success/10 text-success'
                : t.tone === 'danger'
                  ? 'border-danger/30 bg-danger/10 text-danger'
                  : 'border-border bg-bg/70 text-text',
            )}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const v = useContext(ToastCtx)
  if (!v) throw new Error('useToast must be used within ToastProvider')
  return v
}

