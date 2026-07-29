import { Routes, Route } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import Upload from '../pages/Upload.jsx'
import AITasks from '../pages/AITasks.jsx'
import History from '../pages/History.jsx'
import Settings from '../pages/Settings.jsx'

/**
 * All application routes live here so `App.jsx` stays a one-liner and
 * new pages only ever need a new <Route> + a new file in `pages/`.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/ai-tasks" element={<AITasks />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
