import { useState } from 'react'

function InventoryForm({ onSubmit, onCancel, initialData = {} }) {
  const [formData, setFormData] = useState({
    drug_name: initialData.drugName || '',
    generic_name: initialData.genericName || '',
    batch: initialData.batch || '',
    quantity: initialData.quantity || '',
    expiry_date: initialData.expiryDate || '',
    storage_type: initialData.storage || 'Ambient',
    location: initialData.location || '',
    status: initialData.status || 'In Stock'
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Drug Name</label>
          <input
            required
            name="drug_name"
            value={formData.drug_name}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none"
            placeholder="e.g. Amoxicillin 500mg"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Generic Name</label>
          <input
            name="generic_name"
            value={formData.generic_name}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none"
            placeholder="e.g. Amoxicillin"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Batch Number</label>
          <input
            required
            name="batch"
            value={formData.batch}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none"
            placeholder="e.g. AMX2024001"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Quantity</label>
          <input
            required
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none"
            placeholder="e.g. 5,000 tabs"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Expiry Date</label>
          <input
            required
            type="date"
            name="expiry_date"
            value={formData.expiry_date}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Storage Type</label>
          <select
            name="storage_type"
            value={formData.storage_type}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none"
          >
            <option value="Ambient">Ambient</option>
            <option value="Cold Storage">Cold Storage</option>
            <option value="Frozen Storage">Frozen Storage</option>
            <option value="Controlled">Controlled</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Location</label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none"
            placeholder="e.g. A-1-001"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none"
          >
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primaryDark"
        >
          Save Item
        </button>
      </div>
    </form>
  )
}

export default InventoryForm
