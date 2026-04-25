import { useEffect, useState } from 'react'
import { ArrowRightLeft, Clock3, PackagePlus, Plus, Search, Truck, Trash2 } from 'lucide-react'
import Badge from '../components/Badge'
import DataTable from '../components/DataTable'
import StatCard from '../components/StatCard'
import Modal from '../components/Modal'
import OperationForm from '../components/OperationForm'
import { supabase } from '../lib/supabaseClient'

const tabFilters = ['All Operations', 'Receiving', 'Dispatching', 'Transfers', 'Inspections']

const typeIconMap = {
  Receiving:   PackagePlus,
  Dispatching: Truck,
  Transfer:    ArrowRightLeft,
  Inspection:  Search,
}

function OperationsPage() {
  const [activeTab, setActiveTab] = useState('All Operations')
  const [operations, setOperations] = useState([])
  const [loading, setLoading]     = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchOperations()
  }, [])

  async function fetchOperations() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('operations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const transformedData = data.map(op => ({
        id: op.id,
        type: op.type,
        description: op.description,
        priority: op.priority,
        status: op.status,
        assignedTo: op.assigned_to,
        scheduled: op.scheduled_date
      }))

      setOperations(transformedData)
    } catch (error) {
      console.error('Error fetching operations:', error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddOperation(formData) {
    try {
      const { error } = await supabase
        .from('operations')
        .insert([formData])

      if (error) throw error

      await fetchOperations()
      setIsModalOpen(false)
      alert('Operation created successfully!')
    } catch (error) {
      alert('Error creating operation: ' + error.message)
    }
  }

  async function handleDeleteOperation(id) {
    if (!window.confirm('Are you sure you want to delete this operation?')) return

    try {
      const { error } = await supabase
        .from('operations')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchOperations()
      alert('Operation deleted successfully!')
    } catch (error) {
      alert('Error deleting operation: ' + error.message)
    }
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
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <button className="text-sm font-medium text-slate-700 hover:text-slate-950">Details</button>
          <button 
            onClick={() => handleDeleteOperation(row.id)}
            className="text-slate-400 hover:text-red-600 transition"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

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

  const summary = [
    { title: 'Total Operations', value: operations.length.toString(), subtitle: 'All time' },
    { title: 'Pending', value: operations.filter(o => o.status === 'Pending').length.toString(), subtitle: 'Awaiting start' },
    { title: 'In Progress', value: operations.filter(o => o.status === 'In Progress').length.toString(), subtitle: 'Active tasks' },
    { title: 'Completed', value: operations.filter(o => o.status === 'Completed').length.toString(), subtitle: 'Finished' },
    { title: 'Delayed', value: operations.filter(o => o.status === 'Delayed').length.toString(), subtitle: 'Need attention' },
  ]

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-slate-500 animate-pulse">Loading operations...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Operations Management</h2>
          <p className="text-sm text-slate-500">Track and manage warehouse operations and workflows</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primaryDark transition shadow-sm"
        >
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
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                activeTab === tab ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <DataTable columns={columns} data={filtered} />
      </section>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create New Operation"
      >
        <OperationForm 
          onSubmit={handleAddOperation} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  )
}

export default OperationsPage

