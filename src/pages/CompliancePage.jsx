import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Badge from '../components/Badge'
import DataTable from '../components/DataTable'
import { useOrganizationId } from '../hooks/useOrganizationId'

const severities = ['Compliant', 'Minor Issues', 'Critical']

function CompliancePage() {
  const organizationId = useOrganizationId()
  const [checks, setChecks] = useState([])
  const [loading, setLoading] = useState(() => !!organizationId)
  const [formData, setFormData] = useState({ title: '', severity: 'Compliant', notes: '' })

  async function refreshCompliance() {
    if (!organizationId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('compliance_checks')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setChecks(data ?? [])
    } catch (error) {
      console.error('Error fetching compliance checks:', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void refreshCompliance()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- organizationId triggers reload; refresh closes over latest handlers
  }, [organizationId])

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      const userId = userData?.user?.id
      if (!userId) throw new Error('Please login again.')
      if (!organizationId) throw new Error('Missing organization.')

      const { error } = await supabase
        .from('compliance_checks')
        .insert([{ ...formData, user_id: userId, organization_id: organizationId }])
      if (error) throw error
      setFormData({ title: '', severity: 'Compliant', notes: '' })
      await refreshCompliance()
    } catch (error) {
      alert('Failed to save compliance check: ' + error.message)
    }
  }

  const columns = [
    { key: 'title', label: 'Check Title' },
    {
      key: 'severity',
      label: 'Severity',
      render: (value) => {
        if (value === 'Critical') return <Badge tone="danger">Critical</Badge>
        if (value === 'Minor Issues') return <Badge tone="warning">Minor Issues</Badge>
        return <Badge tone="success">Compliant</Badge>
      },
    },
    { key: 'notes', label: 'Notes' },
    {
      key: 'created_at',
      label: 'Created',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ]

  if (!organizationId) {
    return (
      <div className="p-6 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 text-amber-950 text-sm">
        Compliance checks are grouped by organization. Run multitenant SQL and onboarding first.
      </div>
    )
  }

  if (loading) {
    return <div className="p-6 text-slate-500">Loading compliance data...</div>
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-slate-900">Compliance</h2>
        <p className="mt-1 text-sm text-slate-500">Monitor regulatory checks and audit notes</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <h3 className="mb-3 text-lg font-semibold">Add Compliance Check</h3>
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-4">
          <input
            required
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Check title"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <select
            value={formData.severity}
            onChange={(e) => setFormData((prev) => ({ ...prev, severity: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {severities.map((severity) => (
              <option key={severity} value={severity}>{severity}</option>
            ))}
          </select>
          <input
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Notes"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primaryDark">
            Save Check
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <DataTable columns={columns} data={checks} />
      </section>
    </div>
  )
}

export default CompliancePage
