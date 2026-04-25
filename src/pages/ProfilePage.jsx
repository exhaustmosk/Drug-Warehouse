import { useEffect, useState } from 'react'
import { Mail, Phone, ShieldCheck, UserCircle2, Building2, MapPin, FileText, Ruler } from 'lucide-react'
import Badge from '../components/Badge'
import StatCard from '../components/StatCard'
import { supabase } from '../lib/supabaseClient'

function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile({ ...data, email: user.email })
    } catch (error) {
      console.error('Error fetching profile:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const userStats = [
    { title: 'Open Tasks', value: '12', subtitle: 'Assigned operations' },
    { title: 'Completed This Month', value: '38', subtitle: 'Workflows finalized' },
    { title: 'Role Access', value: profile?.job_title || 'Manager', subtitle: 'Warehouse Admin Scope' },
  ]

  if (loading) {
    return <div className="p-6 text-slate-500">Loading profile...</div>
  }

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
              <h3 className="text-xl font-semibold text-slate-900">{profile?.full_name || 'User'}</h3>
              <p className="text-sm text-slate-500">{profile?.job_title || 'Warehouse Manager'}</p>
              <div className="mt-2">
                <Badge tone="success">Active Account</Badge>
              </div>
            </div>
          </div>
          <Badge tone="info">ID: {profile?.id?.slice(0, 8).toUpperCase() || 'WRH-EMP-XXXX'}</Badge>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-600 mb-3">Contact Information</p>
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm text-slate-700">
                <Mail size={15} className="text-slate-400" />
                {profile?.email}
              </p>
              <p className="flex items-center gap-2 text-sm text-slate-700">
                <Phone size={15} className="text-slate-400" />
                {profile?.phone_number || 'Not provided'}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-600 mb-3">Permissions & Access</p>
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm text-slate-700">
                <ShieldCheck size={15} className="text-slate-400" />
                Inventory, Operations, and Building Management
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Last updated: {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Recent'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex items-center gap-3 text-slate-900 mb-6">
          <Building2 size={20} className="text-primary" />
          <h3 className="text-lg font-semibold">Warehouse Information</h3>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Name</p>
            <p className="text-sm font-semibold text-slate-900">{profile?.warehouse_name || 'Not set'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Location</p>
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-slate-400" />
              <p className="text-sm font-semibold text-slate-900">{profile?.warehouse_location || 'Not set'}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Area</p>
            <div className="flex items-center gap-1.5">
              <Ruler size={14} className="text-slate-400" />
              <p className="text-sm font-semibold text-slate-900">{profile?.warehouse_area ? `${profile.warehouse_area} m²` : 'Not set'}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">License</p>
            <div className="flex items-center gap-1.5">
              <FileText size={14} className="text-slate-400" />
              <p className="text-sm font-semibold text-slate-900">{profile?.license_number || 'Pending'}</p>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Type: {profile?.warehouse_type || 'General'}
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
