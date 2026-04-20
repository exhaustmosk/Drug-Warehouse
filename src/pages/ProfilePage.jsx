import { Mail, Phone, ShieldCheck, UserCircle2 } from 'lucide-react'
import Badge from '../components/Badge'
import StatCard from '../components/StatCard'

const userStats = [
  { title: 'Open Tasks', value: '12', subtitle: 'Assigned operations' },
  { title: 'Completed This Month', value: '38', subtitle: 'Workflows finalized' },
  { title: 'Role Access', value: 'Manager', subtitle: 'Warehouse Admin Scope' },
]

function ProfilePage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Profile</h2>
        <p className="text-sm text-muted">User information, access, and activity summary</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
              <UserCircle2 className="text-primary" size={34} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">John Doe</h3>
              <p className="text-sm text-slate-500">Warehouse Manager</p>
              <div className="mt-2">
                <Badge tone="success">Active Account</Badge>
              </div>
            </div>
          </div>
          <Badge tone="info">ID: WRH-EMP-0098</Badge>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-600">Contact</p>
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-slate-700">
              <Mail size={15} />
              john.doe@drugware.com
            </p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-700">
              <Phone size={15} />
              +1 (555) 201-8890
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-600">Permissions</p>
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-slate-700">
              <ShieldCheck size={15} />
              Inventory, Operations, and Building Management Access
            </p>
            <p className="mt-2 text-sm text-slate-500">Last login: 2026-04-20 21:45</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {userStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>
    </div>
  )
}

export default ProfilePage
