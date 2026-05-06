import { useEffect, useState } from 'react'
import { AlertTriangle, MapPin } from 'lucide-react'
import Badge from '../components/Badge'
import ProgressBar from '../components/ProgressBar'
import StatCard from '../components/StatCard'
import { supabase } from '../lib/supabaseClient'
import { useOrganizationId } from '../hooks/useOrganizationId'

function BuildingPage() {
  const organizationId = useOrganizationId()
  const [metrics, setMetrics] = useState([])
  const [alerts, setAlerts] = useState([])
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(() => !!organizationId)

  async function refreshBuilding() {
    if (!organizationId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      const userId = userData?.user?.id
      if (!userId) return

      const [{ data: profile, error: profileError }, { data: zoneData, error: zoneError }, { data: alertData, error: alertError }] =
        await Promise.all([
          supabase.from('profiles').select('*').eq('id', userId).single(),
          supabase.from('warehouse_zones').select('*').eq('organization_id', organizationId).order('name', { ascending: true }),
          supabase.from('facility_alerts').select('*').eq('organization_id', organizationId).order('created_at', { ascending: false }),
        ])

      if (profileError) throw profileError
      if (zoneError) throw zoneError
      if (alertError) throw alertError

      const totalArea = Number(profile?.warehouse_area) || 0
      const capacities = zoneData.map((z) => Number(z.capacity)).filter((v) => !Number.isNaN(v))
      const occupancy = capacities.length ? Math.round(capacities.reduce((a, b) => a + b, 0) / capacities.length) : 0
      const avgTemp = zoneData.length
        ? `${(zoneData.reduce((a, z) => a + Number.parseFloat(String(z.temperature || '0')), 0) / zoneData.length).toFixed(1)} C`
        : 'N/A'

      setMetrics([
        { title: 'Total Area', value: totalArea ? `${totalArea} m²` : 'Not Set', subtitle: 'Warehouse facility' },
        { title: 'Occupancy Rate', value: `${occupancy}%`, subtitle: 'Space utilization' },
        { title: 'Avg. Temperature', value: avgTemp, subtitle: 'Across all zones' },
        { title: 'Security Level', value: alertData.some((a) => a.severity === 'Critical') ? 'Review Needed' : 'Stable', subtitle: 'System alerts based' },
      ])

      setAlerts(alertData.map((a) => a.message))
      setZones(zoneData)
    } catch (error) {
      console.error('Error fetching building data:', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void refreshBuilding()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- organizationId triggers reload; refresh closes over latest handlers
  }, [organizationId])

  if (!organizationId) {
    return (
      <div className="p-6 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 text-amber-950 text-sm">
        Building views use organization-wide zones and alerts after multitenant setup.
      </div>
    )
  }

  if (loading) {
    return <div className="p-6 text-slate-500">Loading facility data...</div>
  }

  const safeMetrics = [
    metrics[0] || { title: 'Total Area', value: 'Not Set', subtitle: 'Warehouse facility' },
    metrics[1] || { title: 'Occupancy Rate', value: '0%', subtitle: 'Space utilization' },
    metrics[2] || { title: 'Avg. Temperature', value: 'N/A', subtitle: 'Across all zones' },
    metrics[3] || { title: 'Security Level', value: 'Stable', subtitle: 'System alerts based' },
  ]

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Building &amp; Facility Management</h2>
          <p className="text-sm text-muted">Monitor and manage warehouse infrastructure and systems</p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primaryDark">
          System Settings
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard {...safeMetrics[0]} />
        <StatCard {...safeMetrics[1]} rightContent={<span className="text-sm font-semibold text-slate-700">{safeMetrics[1].value}</span>} />
        <StatCard {...safeMetrics[2]} rightContent={<Badge tone="success">Live</Badge>} />
        <StatCard {...safeMetrics[3]} rightContent={<Badge tone={safeMetrics[3].value === 'Stable' ? 'success' : 'warning'}>{safeMetrics[3].value}</Badge>} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-surface p-4 shadow-card">
        <h3 className="mb-3 text-lg font-semibold">System Alerts</h3>
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div key={alert} className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              <AlertTriangle size={16} className="mt-0.5" />
              <span>{alert}</span>
            </div>
          ))}
          {!alerts.length && <p className="text-sm text-slate-500">No active alerts.</p>}
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
                <Badge tone={zone.status === 'Warning' ? 'warning' : 'success'}>{zone.status || 'Normal'}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted">Area</p>
                  <p className="font-semibold">{zone.area || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted">Drug Items</p>
                  <p className="font-semibold">{zone.items_count || 0}</p>
                </div>
              </div>

              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted">Capacity</span>
                  <span className="font-medium">{zone.capacity || 0}%</span>
                </div>
                <ProgressBar value={Number(zone.capacity) || 0} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted">Temperature</p>
                  <p className="font-semibold">{zone.temperature || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted">Humidity</p>
                  <p className="font-semibold">{zone.humidity || 'N/A'}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
                <span className="text-muted">Last maintenance: {zone.last_maintenance || 'Not logged'}</span>
                <button className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-950">
                  <MapPin size={14} />
                  View Map
                </button>
              </div>
            </article>
          ))}
        </div>
        {!zones.length && <p className="text-sm text-slate-500">No zones found. Add zones in your backend to see facility cards.</p>}
      </section>
    </div>
  )
}

export default BuildingPage
