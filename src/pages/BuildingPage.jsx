import { AlertTriangle, MapPin } from 'lucide-react'
import Badge from '../components/Badge'
import ProgressBar from '../components/ProgressBar'
import StatCard from '../components/StatCard'
import { buildingAlerts, buildingMetrics, zones } from '../data/mockData'

function BuildingPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Building & Facility Management</h2>
          <p className="text-sm text-muted">Monitor and manage warehouse infrastructure and systems</p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primaryDark">
          System Settings
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard {...buildingMetrics[0]} />
        <StatCard
          {...buildingMetrics[1]}
          rightContent={<span className="text-sm font-semibold text-slate-700">{buildingMetrics[1].value}</span>}
        />
        <StatCard {...buildingMetrics[2]} rightContent={<Badge tone="success">Excellent</Badge>} />
        <StatCard {...buildingMetrics[3]} rightContent={<Badge tone="success">Secure</Badge>} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-surface p-4 shadow-card">
        <h3 className="mb-3 text-lg font-semibold">System Alerts</h3>
        <div className="space-y-2">
          {buildingAlerts.map((alert) => (
            <div key={alert} className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              <AlertTriangle size={16} className="mt-0.5" />
              <span>{alert}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button className="rounded-full bg-primary px-3 py-1.5 text-sm text-white">Storage Zones</button>
          <button className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">Building Systems</button>
          <button className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">Maintenance</button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {zones.map((zone) => (
            <article key={zone.name} className="rounded-2xl border border-slate-200 bg-surface p-4 shadow-card">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-semibold">{zone.name}</h4>
                  <p className="text-sm text-muted">{zone.type}</p>
                </div>
                <Badge tone={zone.status === 'Warning' ? 'warning' : 'success'}>{zone.status}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted">Area</p>
                  <p className="font-semibold">{zone.area}</p>
                </div>
                <div>
                  <p className="text-muted">Drug Items</p>
                  <p className="font-semibold">{zone.items}</p>
                </div>
              </div>

              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted">Capacity</span>
                  <span className="font-medium">{zone.capacity}%</span>
                </div>
                <ProgressBar value={zone.capacity} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted">Temperature</p>
                  <p className="font-semibold">{zone.temperature}</p>
                </div>
                <div>
                  <p className="text-muted">Humidity</p>
                  <p className="font-semibold">{zone.humidity}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
                <span className="text-muted">Last maintenance: {zone.maintenance}</span>
                <button className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-950">
                  <MapPin size={14} />
                  View Map
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default BuildingPage
