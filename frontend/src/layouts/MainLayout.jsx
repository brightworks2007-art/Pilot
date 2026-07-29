import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar.jsx'
import TopBar from '../components/layout/TopBar.jsx'

/**
 * Shared shell for every page: sidebar + top bar + content outlet.
 *
 * Each page controls its own top bar title/subtitle by calling the
 * `usePageHeader` hook (see hooks/usePageHeader.js). That hook reaches this
 * layout's `setHeader` via React Router's Outlet context, so pages stay
 * fully decoupled from the layout that renders them.
 */
export default function MainLayout() {
  const [header, setHeader] = useState({ title: 'Dashboard', subtitle: '' })

  return (
    <div className="min-h-screen bg-surface dark:bg-slate-950">
      <Sidebar />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <TopBar title={header.title} subtitle={header.subtitle} />
        <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-8">
          <Outlet context={{ setHeader }} />
        </main>
      </div>
    </div>
  )
}
