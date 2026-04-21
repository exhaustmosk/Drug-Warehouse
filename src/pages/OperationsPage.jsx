import { useEffect, useState } from 'react'
import { ArrowRightLeft, Clock3, PackagePlus, Plus, Search, Truck } from 'lucide-react'
import Badge from '../components/Badge'
import DataTable from '../components/DataTable'
import StatCard from '../components/StatCard'

import { operationsData } from '../data/mockData'

const tabFilters = ['All Operations', 'Receiving', 'Dispatching', 'Transfers', 'Inspections']

const typeIconMap = {
  Receiving:   PackagePlus,
  Dispatching: Truck,
  Transfer:    ArrowRightLeft,
  Inspection:  Search,
}

const columns = [
  { key: 'id', label: 'Operation ID' },
  {
    key: 'type',
    label: 'Type',
    render: (value) => {
      const Icon = typeIconMap[value] || Clock3
      return (
        <span className="inline-flex items-center gap-2">
          <Icon size={14} />
          {value}
        </span>
      )
    },
  },
  { key: 'description', label: 'Description' },
  {
    key: 'priority',
    label: 'Priority',
    render: (value) => {
      if (value === 'High')   return <Badge tone="dark">High</Badge>
      if (value === 'Medium') return <Badge tone="neutral">Medium</Badge>
      if (value === 'Urgent') return <Badge tone="danger">Urgent</Badge>
      return <Badge tone="neutral">Low</Badge>
    },
  },
  {
    key: 'status',
    label: 'Status',
    render: (value) => {
      if (value === 'Completed')   return <Badge tone="success">Completed</Badge>
      if (value === 'In Progress') return <Badge tone="info">In Progress</Badge>
      if (value === 'Delayed')     return <Badge tone="danger">Delayed</Badge>
      return <Badge tone="warning">Pending</Badge>
    },
  },
  { key: 'assignedTo', label: 'Assigned To' },
  { key: 'scheduled',  label: 'Scheduled Date' },
  {
    key: 'actions',
    label: 'Actions',
    render: () => (
      <button className="text-sm font-medium text-slate-700 hover:text-slate-950">View Details</button>
    ),
  },
]

function OperationsPage() {
  const [activeTab, setActiveTab] = useState('All Operations')

  const data = operationsData
  const { summary, operations } = data
  const typeFilterMap = {
    'All Operations': null,
    'Receiving':      'Receiving',
    'Dispatching':    'Dispatching',
    'Transfers':      'Transfer',
    'Inspections':    'Inspection',
  }
  const filtered = typeFilterMap[activeTab]
    ? operations.filter((o) => o.type === typeFilterMap[activeTab])
    : operations

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Operations Management</h2>
          <p className="text-sm text-muted">Track and manage warehouse operations and workflows</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primaryDark">
          <Plus size={16} />
          New Operation
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {summary.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-surface p-4 shadow-card">
        <div className="flex flex-wrap gap-2">
          {tabFilters.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                activeTab === tab ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <DataTable columns={columns} data={filtered} />
      </section>
    </div>
  )
}

export default OperationsPage
