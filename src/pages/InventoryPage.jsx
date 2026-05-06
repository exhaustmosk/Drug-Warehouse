import { useEffect, useState } from 'react'
import { AlertCircle, CircleCheck, Plus, Search, TriangleAlert, Trash2 } from 'lucide-react'
import Badge from '../components/Badge'
import DataTable from '../components/DataTable'
import StatCard from '../components/StatCard'
import Modal from '../components/Modal'
import InventoryForm from '../components/InventoryForm'
import { supabase } from '../lib/supabaseClient'
import { useOrganizationId } from '../hooks/useOrganizationId'

function InventoryPage() {
  const organizationId = useOrganizationId()
  const [search, setSearch]     = useState('')
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(() => !!organizationId)
  const [isModalOpen, setIsModalOpen] = useState(false)

  async function refreshInventoryData() {
    if (!organizationId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('organization_id', organizationId)
        .order('drug_name', { ascending: true })

      if (error) throw error

      const transformedData = (data ?? []).map((item) => ({
        id: item.id,
        drugName: item.drug_name,
        genericName: item.generic_name,
        batch: item.batch,
        quantity: item.quantity,
        expiryDate: item.expiry_date,
        storage: item.storage_type,
        location: item.location,
        status: item.status,
      }))

      setItems(transformedData)
    } catch (error) {
      console.error('Error fetching inventory:', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void refreshInventoryData()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- organizationId triggers reload; refresh closes over latest handlers
  }, [organizationId])

  async function handleAddItem(formData) {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      const userId = userData?.user?.id
      if (!userId) throw new Error('Please login again.')
      if (!organizationId) throw new Error('Missing organization.')

      const { error } = await supabase
        .from('inventory_items')
        .insert([{ ...formData, user_id: userId, organization_id: organizationId }])
        .select()

      if (error) throw error

      // Refresh list and close modal
      await refreshInventoryData()
      setIsModalOpen(false)
      alert('Item added successfully!')
    } catch (error) {
      alert('Error adding item: ' + error.message)
    }
  }

  async function handleDeleteItem(id) {
    if (!window.confirm('Are you sure you want to delete this item?')) return

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      const userId = userData?.user?.id
      if (!userId) throw new Error('Please login again.')

      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id)
        .eq('organization_id', organizationId)

      if (error) throw error

      await refreshInventoryData()
      alert('Item deleted successfully!')
    } catch (error) {
      alert('Error deleting item: ' + error.message)
    }
  }

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
    { key: 'batch',      label: 'Batch #' },
    { key: 'quantity',   label: 'Quantity' },
    { key: 'expiryDate', label: 'Expiry Date' },
    { key: 'storage',    label: 'Storage' },
    { key: 'location',   label: 'Location' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        if (value === 'Expired')   return <Badge tone="danger">Expired</Badge>
        if (value === 'Low Stock') return <Badge tone="dark">Low Stock</Badge>
        return <Badge tone="success">In Stock</Badge>
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <button className="text-sm font-medium text-slate-700 hover:text-slate-950">Edit</button>
          <button 
            onClick={() => handleDeleteItem(row.id)}
            className="text-slate-400 hover:text-red-600 transition"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  const filtered = items.filter(
    (i) =>
      i.drugName?.toLowerCase().includes(search.toLowerCase()) ||
      i.genericName?.toLowerCase().includes(search.toLowerCase()) ||
      i.batch?.toLowerCase().includes(search.toLowerCase()),
  )

  const summary = [
    { title: 'Total Items', value: items.length.toString(), subtitle: 'Active drug items' },
    { title: 'In Stock', value: items.filter(i => i.status === 'In Stock').length.toString(), subtitle: 'Available items' },
    { title: 'Low Stock', value: items.filter(i => i.status === 'Low Stock').length.toString(), subtitle: 'Need restocking' },
    { title: 'Expired', value: items.filter(i => i.status === 'Expired').length.toString(), subtitle: 'Require disposal' },
  ]

  if (!organizationId) {
    return (
      <div className="p-6 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 text-amber-950 text-sm">
        Inventory is grouped by organization. Apply the multitenant migration and onboarding first.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-slate-500 animate-pulse">Loading inventory data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Inventory Management</h2>
          <p className="text-sm text-slate-500">Track and manage drug inventory across all storage zones</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primaryDark transition shadow-sm"
        >
          <Plus size={16} />
          Add New Item
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard {...summary[0]} />
        <StatCard {...summary[1]} rightContent={<CircleCheck className="text-emerald-500" size={16} />} />
        <StatCard {...summary[2]} rightContent={<TriangleAlert className="text-amber-500" size={16} />} />
        <StatCard {...summary[3]} rightContent={<AlertCircle className="text-red-600" size={16} />} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-surface p-4 shadow-card">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-64 flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by drug name, generic name, or batch number..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-400 transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-slate-400">
            <option>All Status</option>
            <option>In Stock</option>
            <option>Low Stock</option>
            <option>Expired</option>
          </select>
        </div>
        <DataTable columns={columns} data={filtered} />
      </section>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Inventory Item"
      >
        <InventoryForm 
          onSubmit={handleAddItem} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  )
}

export default InventoryPage


