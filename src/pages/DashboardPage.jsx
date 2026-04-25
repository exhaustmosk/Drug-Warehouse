import { useEffect, useState } from 'react'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Badge from '../components/Badge'
import StatCard from '../components/StatCard'
import { supabase } from '../lib/supabaseClient'

function DashboardPage() {
  const [stats, setStats] = useState([])
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      setLoading(true)
      
      // Fetch Inventory stats
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory_items')
        .select('status')
      
      if (inventoryError) throw inventoryError

      // Fetch Warehouse Zones
      const { data: zoneData, error: zoneError } = await supabase
        .from('warehouse_zones')
        .select('*')
      
      if (zoneError) throw zoneError

      // Process Stats
      const totalInventory = inventoryData.length
      const lowStock = inventoryData.filter(i => i.status === 'Low Stock').length
      const expired = inventoryData.filter(i => i.status === 'Expired').length
      
      setStats([
        { title: 'Total Inventory', value: totalInventory.toLocaleString(), subtitle: 'Active drug items' },
        { title: 'Storage Capacity', value: '78%', subtitle: 'Capacity used' },
        { title: 'Active Alerts', value: (lowStock + expired).toString(), subtitle: `${lowStock} low stock, ${expired} expired` },
        { title: 'Compliance Score', value: '92%', subtitle: 'Excellent' },
      ])

      setZones(zoneData.map(z => ({
        zone: z.name,
        temp: z.temperature,
        status: z.status
      })))

    } catch (error) {
      console.error('Error fetching dashboard data:', error.message)
    } finally {
      setLoading(false)
    }
  }

  // Fallback / Hardcoded data for charts (to be connected later if needed)
  const monthlyOperations = [
    { month: 'Jan', movements: 1200 },
    { month: 'Feb', movements: 1450 },
    { month: 'Mar', movements: 1100 },
    { month: 'Apr', movements: 1600 },
    { month: 'May', movements: 1300 },
    { month: 'Jun', movements: 1500 },
  ]

  const complianceData = [
    { name: 'Compliant', value: 92, color: '#00BFA6' },
    { name: 'Minor Issues', value: 6, color: '#F59E0B' },
    { name: 'Critical', value: 2, color: '#DC2626' },
  ]

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-slate-500">Loading dashboard data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="text-sm text-muted">High-level warehouse overview</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard {...stats[0]} />
        <StatCard
          {...stats[1]}
          rightContent={<span className="text-sm font-semibold text-slate-600">78%</span>}
        />
        <StatCard {...stats[2]} />
        <StatCard {...stats[3]} rightContent={<Badge tone="success">Excellent</Badge>} />
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

