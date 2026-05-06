import { useEffect, useState } from 'react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { supabase } from '../lib/supabaseClient'
import { useOrganizationId } from '../hooks/useOrganizationId'
import { FileText, Loader2 } from 'lucide-react'

function buildSnapshotBody({ inventory, operations, zones, checks, alerts, generatedAt, reportTitle }) {
  const counts = {
    inventory: inventory?.length ?? 0,
    inStock: inventory?.filter((i) => i.status === 'In Stock').length ?? 0,
    lowStock: inventory?.filter((i) => i.status === 'Low Stock').length ?? 0,
    expired: inventory?.filter((i) => i.status === 'Expired').length ?? 0,
    opsPending: operations?.filter((o) => o.status === 'Pending').length ?? 0,
    opsCompleted: operations?.filter((o) => o.status === 'Completed').length ?? 0,
    zones: zones?.length ?? 0,
    checks: checks?.length ?? 0,
    alerts: alerts?.length ?? 0,
  }

  const lines = [
    `══════════════════════════════════════════════════════════════`,
    `${reportTitle}`,
    `Generated: ${generatedAt}`,
    `══════════════════════════════════════════════════════════════`,
    '',
    'INVENTORY',
    `  Total SKU rows: ${counts.inventory}`,
    `  In stock:       ${counts.inStock}`,
    `  Low stock:      ${counts.lowStock}`,
    `  Expired:        ${counts.expired}`,
    '',
    'OPERATIONS',
    `  Total recorded: ${operations?.length ?? 0}`,
    `  Pending:        ${counts.opsPending}`,
    `  Completed:      ${counts.opsCompleted}`,
    '',
    'FACILITY ZONES',
    `  Active zones:   ${counts.zones}`,
    ...(zones || []).slice(0, 12).map((z) => `  • ${z.name}: ${z.status}${z.capacity ? ` · capacity ${z.capacity}` : ''}${z.items_count != null ? ` · items ~${z.items_count}` : ''}`),
    counts.zones > 12 ? `  … and ${counts.zones - 12} more zones` : '',
    '',
    'COMPLIANCE CHECKS SNAPSHOT',
    `  Entries: ${counts.checks}`,
    ...(checks || []).slice(0, 8).map((c) => `  • ${c.title} (${c.severity})`),
    counts.checks > 8 ? `  … truncated (showing latest 8 of ${counts.checks})` : '',
    '',
    'RECENT FACILITY ALERTS',
    `  Alerts: ${counts.alerts}`,
    ...(alerts || []).slice(0, 6).map((a) => `  • ${a.severity}: ${a.message}`),
    counts.alerts > 6 ? `  … truncated` : '',
    '',
    '— End of warehouse snapshot —',
  ]

  return lines.filter(Boolean).join('\n')
}

async function gatherOrgDataset(orgId) {
  const [inv, ops, zones, checks, alerts] = await Promise.all([
    supabase.from('inventory_items').select('*').eq('organization_id', orgId),
    supabase.from('operations').select('*').eq('organization_id', orgId),
    supabase.from('warehouse_zones').select('*').eq('organization_id', orgId),
    supabase.from('compliance_checks').select('*').eq('organization_id', orgId).order('created_at', { ascending: false }).limit(200),
    supabase.from('facility_alerts').select('*').eq('organization_id', orgId).order('created_at', { ascending: false }).limit(100),
  ])

  const firstErr = [inv, ops, zones, checks, alerts].find((x) => x.error)?.error
  if (firstErr) throw firstErr

  return {
    inventory: inv.data ?? [],
    operations: ops.data ?? [],
    zones: zones.data ?? [],
    checks: checks.data ?? [],
    alerts: alerts.data ?? [],
  }
}

function downloadTxt(filename, body) {
  const blob = new Blob([body], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function ReportsPage() {
  const organizationId = useOrganizationId()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(() => !!organizationId)
  const [newReportName, setNewReportName] = useState('')
  const [generating, setGenerating] = useState(false)
  const [preview, setPreview] = useState(null)

  async function refreshReports() {
    if (!organizationId) {
      setReports([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
      if (error) throw error
      setReports(data ?? [])
    } catch (e) {
      console.error(e)
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void refreshReports()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- organizationId triggers reload; refresh closes over latest handlers
  }, [organizationId])

  async function handleGenerate(e) {
    e.preventDefault()
    if (!organizationId) {
      alert('Your profile is missing an organization. Finish onboarding after applying multitenant migrations.')
      return
    }

    try {
      setGenerating(true)
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      const userId = userData?.user?.id
      if (!userId) throw new Error('Please login again.')

      const dataset = await gatherOrgDataset(organizationId)

      const titleBase = newReportName.trim() || `Warehouse snapshot ${new Date().toISOString().split('T')[0]}`
      const generatedAt = new Date().toISOString()

      const body_text = buildSnapshotBody({
        ...dataset,
        generatedAt,
        reportTitle: titleBase,
      })

      const name = `${titleBase} (${new Date().toLocaleDateString()})`

      const { error: insertErr } = await supabase.from('reports').insert([
        {
          user_id: userId,
          organization_id: organizationId,
          name,
          status: 'Ready',
          body_text,
        },
      ])

      if (insertErr) throw insertErr

      setNewReportName('')
      await refreshReports()
    } catch (err) {
      alert('Could not generate report: ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  const columns = [
    { key: 'name', label: 'Report' },
    { key: 'status', label: 'Status' },
    {
      key: 'body_text',
      label: 'Summary',
      render: (value) => (
        <span className="line-clamp-2 block max-w-xs text-muted" title={value || ''}>
          {value ? `${value.slice(0, 120)}${value.length > 120 ? '…' : ''}` : '—'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value) => new Date(value).toLocaleString(),
    },
    {
      key: '_actions',
      label: '',
      render: (_, row) => (
        <div className="flex flex-wrap gap-2">
          {row.body_text && (
            <>
              <button
                type="button"
                onClick={() => setPreview(row)}
                className="text-sm font-medium text-primary hover:underline"
              >
                View
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadTxt(
                    `${(row.name || 'report').replace(/[^\w\s-]/g, '').slice(0, 60)}.txt`,
                    row.body_text,
                  )
                }
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Download
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  if (!organizationId) {
    return (
      <div className="p-6 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 text-amber-950 text-sm">
        Reports require an organization. Apply the multitenant migration in Supabase and complete onboarding (join code /
        workspace).
      </div>
    )
  }

  if (loading) {
    return <div className="p-6 text-slate-500">Loading reports...</div>
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-slate-900">Reports</h2>
        <p className="mt-1 text-sm text-slate-500">
          Builds a textual warehouse snapshot from live inventory, operations, zones, compliance, and alerts for your{' '}
          organization.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <form onSubmit={handleGenerate} className="flex flex-wrap items-start gap-3">
          <div className="min-w-72 flex flex-1 flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted">Report title (optional)</label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 text-slate-400" size={16} aria-hidden />
              <input
                value={newReportName}
                onChange={(e) => setNewReportName(e.target.value)}
                placeholder="Leave blank for date-based snapshot name"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={generating}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primaryDark disabled:opacity-50 md:mt-8"
          >
            {generating ? <Loader2 className="animate-spin" size={16} aria-hidden /> : null}
            {generating ? 'Generating…' : 'Generate warehouse report'}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <DataTable columns={columns} data={reports} />
      </section>

      <Modal isOpen={!!preview} onClose={() => setPreview(null)} title={preview?.name || 'Report'} wide>
        {preview?.body_text && (
          <pre className="max-h-[min(70vh,540px)] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-xs text-slate-800 md:text-sm">
            {preview.body_text}
          </pre>
        )}
      </Modal>
    </div>
  )
}

export default ReportsPage
