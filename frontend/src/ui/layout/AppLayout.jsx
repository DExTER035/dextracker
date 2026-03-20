import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Gauge,
  SquareCheck,
  Flame,
  Clock,
  CircleDollarSign,
  Utensils,
  NotebookPen,
  LogOut,
} from 'lucide-react'

import { cn } from '../utils/cn.js'
import { GlobalEffects } from '../components/GlobalEffects.jsx'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'

const navGroups = [
  {
    label: 'DAILY',
    items: [
      { to: '/', label: 'Dashboard', icon: Gauge, hoverClass: 'group-hover:scale-105' },
      { to: '/planner', label: 'Tasks', icon: SquareCheck, hoverClass: 'group-hover:animate-drawCheck' },
      { to: '/goals', label: 'Habits', icon: Flame, hoverClass: 'group-hover:animate-flicker text-orange-500' },
    ]
  },
  {
    label: 'TRACK',
    items: [
      { to: '/study', label: 'Time', icon: Clock, hoverClass: 'group-hover:animate-[spin_2s_linear_infinite]' },
      { to: '/finance', label: 'Money', icon: CircleDollarSign, hoverClass: 'group-hover:animate-coinFlip' },
      { to: '/health', label: 'Food', icon: Utensils, hoverClass: 'group-hover:animate-wobble' },
    ]
  },
  {
    label: 'LEARN',
    items: [
      { to: '/ai', label: 'Notes', icon: NotebookPen, hoverClass: 'group-hover:animate-shake' },
    ]
  }
]

// eslint-disable-next-line no-unused-vars
function NavItem({ to, icon: Icon, label, hoverClass }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-r-xl px-4 py-2.5 my-0.5 text-sm font-bold transition-all duration-300 relative overflow-hidden',
          isActive
            ? 'text-white'
            : 'text-muted hover:bg-white/5 hover:text-white',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="activeNavBackground"
              className="absolute inset-0 bg-violet/15 shadow-activeNav rounded-r-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          {isActive && (
            <motion.div
              layoutId="activeNavIndicator"
              className="absolute left-0 top-0 bottom-0 w-[3px] bg-cyan shadow-[0_0_10px_currentColor]"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={cn('transition-all duration-200 relative z-10', hoverClass)}
          >
            <Icon size={18} className={isActive ? 'text-cyan drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'opacity-70'} />
          </motion.div>
          <span className="tracking-wide text-xs truncate pl-1 font-heading relative z-10">{label}</span>
        </>
      )}
    </NavLink>
  )
}

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  async function onSignOut() {
    localStorage.removeItem('dextracker_user')
    navigate('/login')
  }

  return (
    <div className="flex h-screen w-full bg-[#04050a] text-white overflow-hidden relative selection:bg-violet/30 selection:text-white">
      {/* Background Effects */}
      <GlobalEffects />
      <div className="fixed inset-0 z-0 bg-transparent overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet/[0.03] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan/[0.03] blur-[150px]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+Cjwvc3ZnPg==')] opacity-[0.3]" />
      </div>

      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-[240px] md:flex-col md:border-r border-border bg-transparent backdrop-blur-md z-10">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-violet to-cyan shadow-[0_0_15px_rgba(139,92,246,0.5)] animate-pulseSoft border border-white/20">
               <span className="text-xl drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">⚡</span>
            </div>
            <div className="text-[20px] font-black text-white tracking-widest font-heading drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              DEX<span className="text-cyan">OS</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto mt-2 pr-4 pl-2 space-y-6">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <div className="px-4 text-[10px] font-black tracking-widest text-muted/50 mb-2 uppercase font-heading">{group.label}</div>
              <div className="space-y-1">
                {group.items.map((n) => (
                  <NavItem key={n.to} {...n} />
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-white/5 px-3 py-2 text-sm font-bold tracking-wide uppercase font-heading text-muted transition duration-200 hover:bg-white/10 hover:text-white hover:border-violet/50"
          >
            <LogOut size={16} />
            Sign out
          </motion.button>
        </div>
      </aside>

      <div className="md:pl-[240px] bg-transparent min-h-screen flex flex-col w-full z-10 relative">
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="mx-auto w-full px-0 py-0 flex-1"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>

        <nav className="md:hidden fixed inset-x-0 bottom-0 border-t border-border bg-surface backdrop-blur-3xl z-50">
          <div className="mx-auto flex justify-around max-w-[1200px] p-2">
            {[
              navGroups[0].items[0],
              navGroups[0].items[1],
              navGroups[0].items[2],
              navGroups[1].items[0],
              navGroups[1].items[1],
              navGroups[2].items[0],
            ].map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'group relative flex flex-col items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-[10px] font-bold transition-all duration-300 uppercase tracking-widest font-heading',
                    isActive 
                      ? 'text-cyan -translate-y-1' 
                      : 'text-muted hover:bg-white/5 hover:text-white',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="activeMobileNavBackground"
                        className="absolute inset-0 bg-violet/20 ring-1 ring-cyan/50 shadow-[0_0_15px_rgba(34,211,238,0.4)] rounded-2xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={cn('relative z-10', isActive ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.9)] text-cyan' : '', n.hoverClass)}
                    >
                      <n.icon size={20} />
                    </motion.div>
                    <span className="truncate relative z-10">{n.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
        <div className="md:hidden h-24" />
      </div>
    </div>
  )
}
