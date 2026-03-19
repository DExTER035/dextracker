import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Activity,
  BadgeDollarSign,
  Bot,
  Dumbbell,
  Gauge,
  GraduationCap,
  HeartPulse,
  ListTodo,
  LogOut,
  Settings,
  Target,
} from 'lucide-react'

import { Badge } from '../components/ui.jsx'
import { cn } from '../utils/cn.js'

const nav = [
  { to: '/', label: 'Dashboard', icon: Gauge },
  { to: '/planner', label: 'Planner', icon: ListTodo },
  { to: '/health', label: 'Health', icon: HeartPulse },
  { to: '/finance', label: 'Finance', icon: BadgeDollarSign },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/study', label: 'Study', icon: GraduationCap },
  { to: '/fitness', label: 'Fitness', icon: Dumbbell },
  { to: '/ai', label: 'AI Chat', icon: Bot },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-[12px] px-4 py-3 text-sm font-bold transition-all duration-300 relative overflow-hidden',
          isActive
            ? 'bg-[#0f172a]/80 text-[#38bdf8] border border-[#1e293b] shadow-[0_0_15px_rgba(56,189,248,0.1)]'
            : 'text-white/50 hover:bg-white/5 hover:text-white',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#06b6d4] shadow-[0_0_10px_#06b6d4]"></div>}
          <Icon size={18} className={isActive ? 'text-[#06b6d4]' : 'opacity-70'} />
          <span className="tracking-wide truncate pl-1">{label}</span>
        </>
      )}
    </NavLink>
  )
}

export function AppLayout() {
  const navigate = useNavigate()

  async function onSignOut() {
      await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen">
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-[240px] md:flex-col md:border-r border-white/5 bg-[#04060A]">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] shadow-[0_0_15px_rgba(59,130,246,0.3)]">
               <span className="text-xl drop-shadow-[0_0_8px_rgba(249,115,22,1)]" style={{ filter: 'hue-rotate(15deg) contrast(1.5)' }}>⚡</span>
            </div>
            <div className="text-[20px] font-bold text-white tracking-wide">
              Life<span className="text-white">OS</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1.5 px-4 mt-4 overflow-y-auto mt-2">
          {nav.map((n) => (
            <NavItem key={n.to} {...n} />
          ))}
        </nav>
        <div className="p-4">
          <button
            onClick={onSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-white/5 px-3 py-2 text-sm font-semibold text-text transition duration-200 hover:bg-white/10"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="md:pl-[240px] bg-[#04060A] min-h-screen">
        <main className="mx-auto w-full px-0 py-0">
          <Outlet />
        </main>

        <nav className="md:hidden fixed inset-x-0 bottom-0 border-t border-border bg-bg/70 backdrop-blur">
          <div className="mx-auto grid max-w-[1200px] grid-cols-5 gap-1 p-2">
            {[
              nav[0],
              nav[1],
              nav[2],
              nav[7],
              nav[8],
            ].map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-2.5 text-[10px] font-bold transition-all duration-300 uppercase tracking-widest',
                    isActive 
                      ? 'bg-primary/20 text-primary ring-1 ring-primary/50 shadow-[0_0_15px_rgba(0,229,255,0.4)] -translate-y-1' 
                      : 'text-muted hover:bg-white/5 hover:text-white',
                  )
                }
              >
                <div className={({isActive}) => (isActive ? 'drop-shadow-[0_0_8px_rgba(0,229,255,0.9)]' : '')}>
                  <n.icon size={22} />
                </div>
                <span className="truncate">{n.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
        <div className="md:hidden h-20" />
      </div>
    </div>
  )
}

