import { useEffect, useState } from 'react'
import { Users, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import Badge from '../components/Badge'
import { useOrganizationId } from '../hooks/useOrganizationId'

function EmployeesPage() {
  const organizationId = useOrganizationId()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(() => !!organizationId)
  const [error, setError] = useState(null)

  async function loadDirectory() {
    setLoading(true)
    setError(null)
    if (!organizationId) {
      setRows([])
      setLoading(false)
      return
    }
    const { data, error: qErr } = await supabase
      .from('profiles')
      .select('id, full_name, email, job_title, warehouse_name, role, onboarding_completed')
      .eq('organization_id', organizationId)
      .order('full_name', { ascending: true, nullsFirst: false })

    if (qErr) {
      setError(qErr.message)
      setRows([])
    } else {
      setRows(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadDirectory()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- organizationId triggers reload; load closes over latest handlers
  }, [organizationId])

  if (!organizationId) {
    return (
      <div className="p-6 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 text-amber-950 text-sm">
        Employee directory loads after multitenant onboarding associates your account with an organization.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted">
        <Loader2 className="animate-spin text-primary" size={28} aria-hidden />
        <p className="text-sm">Loading directory…</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Users size={24} aria-hidden />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Employees & supervisors</h2>
            <p className="text-sm text-muted">
              Profiles linked to DrugWare accounts in your workspace. Invite staff to register as team members; assign
              admin for owners and senior supervisors who need directory access.
            </p>
          </div>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Could not load the directory ({error}). If you recently deployed schema changes, ensure the profiles table
          exposes this list to admin accounts via Row Level Security.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/90 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Site</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 && !error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted">
                    No profiles yet—complete onboarding for the first account to populate this directory.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">{r.full_name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{r.email || '—'}</td>
                    <td className="px-4 py-3">
                      {r.role === 'admin' ? (
                        <Badge tone="warning">Admin</Badge>
                      ) : (
                        <Badge tone="success">Employee</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.job_title || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{r.warehouse_name || '—'}</td>
                    <td className="px-4 py-3">
                      {r.onboarding_completed ? (
                        <span className="text-emerald-600 font-medium">Active</span>
                      ) : (
                        <span className="text-amber-600 font-medium">Onboarding</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default EmployeesPage
