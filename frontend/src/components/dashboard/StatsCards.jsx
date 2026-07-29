import { statCards } from '../../data/mockData.js'

/**
 * Top-of-dashboard stat summary row. Purely presentational, backed by mock data.
 */
export default function StatsCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <div key={stat.id} className="card p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
          <p className="mt-1 text-[11px] text-slate-400">{stat.delta}</p>
        </div>
      ))}
    </div>
  )
}
