import { useNavigate, NavLink } from 'react-router-dom'
import {
  Building2,
  ClipboardList,
  FileBarChart2,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShieldCheck,
  UserCircle2,
} from 'lucide-react'

const navSections = [
  {
    label: 'Main',
    items: [
      { to: '/',           icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/inventory',  icon: Package,         label: 'Inventory',          badge: 3 },
      { to: '/operations', icon: ClipboardList,   label: 'Operations',         badge: 1 },
      { to: '/building',   icon: Building2,       label: 'Building Management', badge: 2 },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/reports',    icon: FileBarChart2, label: 'Reports' },
      { to: '/compliance', icon: ShieldCheck,   label: 'Compliance' },
      { to: '/settings',   icon: Settings,      label: 'Settings' },
    ],
  },
]

function Sidebar() {
  const user = { name: 'Admin', role: 'Warehouse Manager' }

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-slate-200 bg-surface p-5">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-primary">DrugWare</h1>
        <p className="text-xs text-muted">Warehouse Management</p>
      </div>

      <nav className="space-y-6">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={`${section.label}-${item.label}`}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`
                    }
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={16} />
                      {item.label}
                    </span>
                    {item.badge ? (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-xs text-white">
                        {item.badge}
                      </span>
                    ) : null}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User profile */}
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `mt-auto flex items-center gap-2 rounded-lg border px-3 py-2 text-left ${
            isActive
              ? 'border-primary bg-primary/10'
              : 'border-slate-200 hover:bg-slate-50'
          }`
        }
      >
        <UserCircle2 className="text-slate-600 shrink-0" size={18} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-slate-800">
            {user?.name || 'User'}
          </span>
          <span className="block text-xs text-slate-500 capitalize">
            {user?.role || 'staff'}
          </span>
        </span>
      </NavLink>

    </aside>
  )
}

export default Sidebar
