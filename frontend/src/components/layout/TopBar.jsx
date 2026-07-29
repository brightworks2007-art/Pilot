import { useState } from 'react'
import { Bell, Moon, Sun } from 'lucide-react'
import { mockUser } from '../../data/mockData.js'

/**
 * Top bar shown on every page. Page title/subtitle are passed in as props
 * so each page controls its own heading while sharing the same chrome.
 */
export default function TopBar({ title, subtitle }) {
  const [isDark, setIsDark] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  function toggleTheme() {
    setIsDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      return next
    })
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-surface/80 dark:bg-slate-950/80 backdrop-blur border-b border-slate-200/70 dark:border-slate-800 px-4 md:px-8 h-16">
      <div>
        <h1 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-1.5 md:gap-3">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-danger" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card-hover p-3 text-sm animate-scale-in">
              <p className="font-medium text-slate-700 dark:text-slate-200 mb-1">Notifications</p>
              <p className="text-xs text-slate-400">No new notifications yet.</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pl-1.5 md:pl-3 md:border-l border-slate-200 dark:border-slate-700">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-xs font-semibold">
            {mockUser.avatarInitials}
          </span>
          <span className="hidden lg:block text-sm font-medium text-slate-700 dark:text-slate-200">
            {mockUser.name}
          </span>
        </div>
      </div>
    </header>
  )
}
