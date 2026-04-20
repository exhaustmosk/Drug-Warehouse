import { AlertCircle, CircleCheck, Plus, Search, TriangleAlert } from 'lucide-react'
import Badge from '../components/Badge'
import DataTable from '../components/DataTable'
import StatCard from '../components/StatCard'
import { inventoryRows, inventorySummary } from '../data/mockData'

const columns = [
  {
    key: 'drugName',
    label: 'Drug Name',
    render: (_, row) => (
      <div>
        <p className="font-medium text-slate-900">{row.drugName}</p>
        <p className="text-xs text-slate-500">{row.genericName}</p>
      </div>
    ),
  },
  { key: 'batch', label: 'Batch #' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'expiryDate', label: 'Expiry Date' },
  { key: 'storage', label: 'Storage' },
  { key: 'location', label: 'Location' },
  {
    key: 'status',
    label: 'Status',
    render: (value) => {
      if (value === 'Expired') return <Badge tone="danger">Expired</Badge>
      if (value === 'Low Stock') return <Badge tone="dark">Low Stock</Badge>
      return <Badge tone="success">In Stock</Badge>
    },
  },
  {
    key: 'actions',
    label: 'Actions',
    render: () => <button className="text-sm font-medium text-slate-700 hover:text-slate-950">Edit</button>,
  },
]

function InventoryPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Inventory Management</h2>
          <p className="text-sm text-muted">Track and manage drug inventory across all storage zones</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primaryDark">
          <Plus size={16} />
          Add New Item
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard {...inventorySummary[0]} />
        <StatCard {...inventorySummary[1]} rightContent={<CircleCheck className="text-emerald-500" size={16} />} />
        <StatCard {...inventorySummary[2]} rightContent={<TriangleAlert className="text-amber-500" size={16} />} />
        <StatCard {...inventorySummary[3]} rightContent={<AlertCircle className="text-red-600" size={16} />} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-surface p-4 shadow-card">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-64 flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by drug name, generic name, or batch number..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
            />
          </div>
          <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            <option>All Status</option>
          </select>
        </div>
        <DataTable columns={columns} data={inventoryRows} />
      </section>
    </div>
  )
}

export default InventoryPage
