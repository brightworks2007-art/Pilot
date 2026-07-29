import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Upload, Bot, History, Settings, Rocket } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/ai-tasks', label: 'AI Tasks', icon: Bot },
  { to: '/history', label: 'History', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings },
]

/**
 * Left navigation. Fixed on desktop, collapses to a bottom bar on mobile
 * (see the `md:` breakpoints) so the app stays usable on small screens.
 */
export default function Sidebar() {
  return (
    <>
      {/* Desktop / tablet sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-sidebar text-slate-300">
        <div className="flex items-center gap-2 px-6 h-16 border-b border-white/10">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white">
            <Rocket size={16} strokeWidth={2.5} />
          </span>
          <span className="text-white font-semibold tracking-tight">PILOT</span>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white shadow-card'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="rounded-xl bg-white/5 px-3 py-3 text-xs text-slate-400">
            Pilot v0.1 — Phase 1 Foundation
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-sidebar border-t border-white/10 flex justify-around py-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium ${
                isActive ? 'text-white' : 'text-slate-400'
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
