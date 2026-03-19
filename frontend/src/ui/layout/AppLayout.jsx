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
import { supabase } from '../../lib/supabase.js'
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
          'flex items-center gap-3 rounded-full px-4 py-3 text-sm font-bold transition-all duration-300',
          isActive
            ? 'bg-primary/20 text-primary ring-1 ring-primary/50 shadow-[0_0_15px_rgba(0,229,255,0.4)] translate-x-1'
            : 'text-text/80 hover:bg-white/5 hover:text-white',
        )
      }
    >
      <Icon size={20} className={({ isActive }) => (isActive ? 'drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]' : '')} />
      <span className="tracking-wide truncate">{label}</span>
    </NavLink>
  )
}

export function AppLayout() {
  const navigate = useNavigate()

  async function onSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen">
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-[220px] md:flex-col md:border-r md:border-border md:bg-bg/40 md:backdrop-blur">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/20 ring-1 ring-primary/50 shadow-[0_0_20px_rgba(0,229,255,0.5)]">
              <Activity className="text-primary drop-shadow-[0_0_8px_rgba(0,229,255,0.9)]" size={24} />
            </div>
            <div className="leading-tight">
              <div className="text-xl font-black text-white tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">DEXTRACK</div>
              <div className="text-xs font-semibold text-primary tracking-[0.3em] uppercase drop-shadow-[0_0_5px_rgba(0,229,255,0.5)]">life OS</div>
            </div>
          </div>
          <div className="mt-4">
            <Badge tone="online">ONLINE</Badge>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-4">
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

      <div className="md:pl-[220px]">
        <main className="mx-auto w-full max-w-[1200px] px-6 py-6 md:px-6">
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

