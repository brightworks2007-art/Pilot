import { useState } from 'react'
import { User, Bell, Palette, ShieldCheck } from 'lucide-react'
import usePageHeader from '../hooks/usePageHeader.js'
import Card, { CardHeader } from '../components/common/Card.jsx'
import Button from '../components/common/Button.jsx'
import { mockUser } from '../data/mockData.js'

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </label>
  )
}

/**
 * Settings page. All fields are local component state only — nothing
 * persists or hits a backend in Phase 1.
 */
export default function Settings() {
  usePageHeader('Settings', 'Manage your profile and preferences')

  const [name, setName] = useState(mockUser.name)
  const [email, setEmail] = useState(mockUser.email)
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [taskAlerts, setTaskAlerts] = useState(true)
  const [compactMode, setCompactMode] = useState(false)

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader title="Profile" icon={User} description={mockUser.plan} />
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Email address</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>
        </div>
        <div className="mt-5">
          <Button variant="primary">Save Changes</Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Notifications" icon={Bell} />
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <Toggle checked={emailNotifs} onChange={setEmailNotifs} label="Email me when a task finishes" />
          <Toggle checked={taskAlerts} onChange={setTaskAlerts} label="Show in-app task alerts" />
        </div>
      </Card>

      <Card>
        <CardHeader title="Appearance" icon={Palette} description="Theme is also toggleable from the top bar" />
        <Toggle checked={compactMode} onChange={setCompactMode} label="Compact layout" />
      </Card>

      <Card>
        <CardHeader title="Security" icon={ShieldCheck} description="Placeholder — Phase 2 will add real auth" />
        <Button variant="secondary" disabled>
          Change Password
        </Button>
      </Card>
    </div>
  )
}
