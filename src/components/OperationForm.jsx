import { useState } from 'react'

function OperationForm({ onSubmit, onCancel, initialData = {} }) {
  const [formData, setFormData] = useState({
    id: initialData.id || `OP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    type: initialData.type || 'Receiving',
    description: initialData.description || '',
    priority: initialData.priority || 'Medium',
    status: initialData.status || 'Pending',
    assigned_to: initialData.assignedTo || '',
    scheduled_date: initialData.scheduled || new Date().toISOString().split('T')[0]
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
          <label className="text-sm font-medium text-slate-700">Operation ID</label>
          <input
            required
            name="id"
            value={formData.id}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none"
            placeholder="e.g. OP-2024-001"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none"
          >
            <option value="Receiving">Receiving</option>
            <option value="Dispatching">Dispatching</option>
            <option value="Transfer">Transfer</option>
            <option value="Inspection">Inspection</option>
          </select>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">Description</label>
          <textarea
            required
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none resize-none"
            placeholder="e.g. Hospital order: General medications"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Delayed">Delayed</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Assigned To</label>
          <input
            required
            name="assigned_to"
            value={formData.assigned_to}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none"
            placeholder="e.g. John Smith"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Scheduled Date</label>
          <input
            required
            type="date"
            name="scheduled_date"
            value={formData.scheduled_date}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary outline-none"
          />
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
          Create Operation
        </button>
      </div>
    </form>
  )
}

export default OperationForm
