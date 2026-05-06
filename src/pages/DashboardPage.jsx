import { useEffect, useState } from 'react'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Badge from '../components/Badge'
import StatCard from '../components/StatCard'
import { supabase } from '../lib/supabaseClient'
import { useOrganizationId } from '../hooks/useOrganizationId'

function DashboardPage() {
  const organizationId = useOrganizationId()
  const [stats, setStats] = useState([])
  const [zones, setZones] = useState([])
  const [monthlyOperations, setMonthlyOperations] = useState([])
  const [complianceData, setComplianceData] = useState([])
  const [loading, setLoading] = useState(() => !!organizationId)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!organizationId) {
        queueMicrotask(() => {
          if (!cancelled) setLoading(false)
        })
        return
      }
      setLoading(true)

      try {
        const org = organizationId
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory_items')
          .select('status')
          .eq('organization_id', org)

        if (inventoryError) throw inventoryError

        const { data: zoneData, error: zoneError } = await supabase
          .from('warehouse_zones')
          .select('*')
          .eq('organization_id', org)

        if (zoneError) throw zoneError

        const { data: operationsData, error: operationsError } = await supabase
          .from('operations')
          .select('scheduled_date')
          .eq('organization_id', org)

        if (operationsError) throw operationsError

        const { data: checksData, error: checksError } = await supabase
          .from('compliance_checks')
          .select('severity')
          .eq('organization_id', org)

        if (checksError) throw checksError

        const totalInventory = inventoryData.length
        const lowStock = inventoryData.filter((i) => i.status === 'Low Stock').length
        const expired = inventoryData.filter((i) => i.status === 'Expired').length
        const capacityValues = zoneData.map((z) => Number(z.capacity)).filter((c) => !Number.isNaN(c))
        const avgCapacity = capacityValues.length
          ? Math.round(capacityValues.reduce((acc, n) => acc + n, 0) / capacityValues.length)
          : 0

        const compliantCount = checksData.filter((c) => c.severity === 'Compliant').length
        const minorCount = checksData.filter((c) => c.severity === 'Minor Issues').length
        const criticalCount = checksData.filter((c) => c.severity === 'Critical').length
        const totalChecks = checksData.length || 1
        const complianceScore = Math.round((compliantCount / totalChecks) * 100)

        const monthMap = new Map()
        operationsData.forEach((op) => {
          if (!op.scheduled_date) return
          const date = new Date(op.scheduled_date)
          const key = date.toLocaleString('en-US', { month: 'short' })
          monthMap.set(key, (monthMap.get(key) || 0) + 1)
        })
        const orderedMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const monthlyData = orderedMonths.map((month) => ({
          month,
          movements: monthMap.get(month) || 0,
        }))

        if (cancelled) return

        setStats([
          { title: 'Total Inventory', value: totalInventory.toLocaleString(), subtitle: 'Active drug items' },
          { title: 'Storage Capacity', value: `${avgCapacity}%`, subtitle: 'Average zone utilization' },
          { title: 'Active Alerts', value: (lowStock + expired).toString(), subtitle: `${lowStock} low stock, ${expired} expired` },
          { title: 'Compliance Score', value: `${complianceScore}%`, subtitle: 'From compliance checks' },
        ])

        setZones(
          zoneData.map((z) => ({
            zone: z.name,
            temp: z.temperature,
            status: z.status,
          })),
        )
        setMonthlyOperations(monthlyData)
        setComplianceData([
          { name: 'Compliant', value: Math.round((compliantCount / totalChecks) * 100), color: '#00BFA6' },
          { name: 'Minor Issues', value: Math.round((minorCount / totalChecks) * 100), color: '#F59E0B' },
          { name: 'Critical', value: Math.round((criticalCount / totalChecks) * 100), color: '#DC2626' },
        ])
      } catch (error) {
        console.error('Error fetching dashboard data:', error.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [organizationId])

  if (!organizationId) {
    return (
      <div className="p-6 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 text-amber-950 text-sm">
        Dashboard data is scoped to your organization. Run the multitenant SQL migration and finish onboarding so your
        profile has an organization.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-slate-500">Loading dashboard data...</div>
      </div>
    )
  }

  const safeStats = [
    stats[0] || { title: 'Total Inventory', value: '0', subtitle: 'Active drug items' },
    stats[1] || { title: 'Storage Capacity', value: '0%', subtitle: 'Average zone utilization' },
    stats[2] || { title: 'Active Alerts', value: '0', subtitle: '0 low stock, 0 expired' },
    stats[3] || { title: 'Compliance Score', value: '0%', subtitle: 'From compliance checks' },
  ]

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="text-sm text-muted">High-level warehouse overview</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard {...safeStats[0]} />
        <StatCard
          {...safeStats[1]}
          rightContent={<span className="text-sm font-semibold text-slate-600">{safeStats[1].value}</span>}
        />
        <StatCard {...safeStats[2]} />
        <StatCard {...safeStats[3]} rightContent={<Badge tone="success">Live</Badge>} />
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
                <Pie data={complianceData} innerRadius={52} outerRadius={78} dataKey="value" stroke="none">
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
          {zones.map((zone) => (
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

