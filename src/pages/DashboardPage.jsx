import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Badge from '../components/Badge'
import StatCard from '../components/StatCard'
import { complianceData, dashboardStats, monthlyOperations, temperatureZones } from '../data/mockData'

function DashboardPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="text-sm text-muted">High-level warehouse overview</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard {...dashboardStats[0]} />
        <StatCard
          {...dashboardStats[1]}
          rightContent={<span className="text-sm font-semibold text-slate-600">78%</span>}
        />
        <StatCard {...dashboardStats[2]} />
        <StatCard {...dashboardStats[3]} rightContent={<Badge tone="success">Excellent</Badge>} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-surface p-4 shadow-card lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Monthly Operations</h3>
            <p className="text-sm text-muted">Inventory movements over the past 6 months</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyOperations}>
                <XAxis dataKey="month" />
                <YAxis domain={[0, 3200]} />
                <Tooltip />
                <Bar dataKey="movements" fill="#00BFA6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-surface p-4 shadow-card">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Compliance Status</h3>
            <p className="text-sm text-muted">Overall facility compliance</p>
          </div>
          <div className="mx-auto h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceData}
                  innerRadius={52}
                  outerRadius={78}
                  dataKey="value"
                  stroke="none"
                >
                  {complianceData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 text-sm">
            {complianceData.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: entry.color }} />
                  {entry.name}
                </span>
                <span className="font-medium">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-surface p-4 shadow-card">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Temperature Monitoring</h3>
          <p className="text-sm text-muted">Real-time temperature across storage zones</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {temperatureZones.map((zone) => (
            <div key={zone.zone} className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-muted">{zone.zone}</p>
              <p className="mt-1 text-xl font-semibold">{zone.temp}</p>
              <div className="mt-3">
                <Badge tone={zone.status === 'Warning' ? 'danger' : 'success'}>{zone.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
