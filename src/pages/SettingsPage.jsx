import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useOrganizationId } from '../hooks/useOrganizationId'

function SettingsPage() {
  const organizationId = useOrganizationId()
  const [loading, setLoading] = useState(() => !!organizationId)
  const [settings, setSettings] = useState({
    low_stock_threshold: 25,
    temperature_alert_threshold: 8,
  })

  async function refreshSettings() {
    if (!organizationId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('organization_id', organizationId)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error
      if (data) {
        setSettings({
          low_stock_threshold: data.low_stock_threshold ?? 25,
          temperature_alert_threshold: data.temperature_alert_threshold ?? 8,
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void refreshSettings()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- organizationId triggers reload; refresh closes over latest handlers
  }, [organizationId])

  async function saveSettings(e) {
    e.preventDefault()
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      const userId = userData?.user?.id
      if (!userId) throw new Error('Please login again.')
      if (!organizationId) throw new Error('Missing organization.')

      const thresholds = {
        low_stock_threshold: Number(settings.low_stock_threshold),
        temperature_alert_threshold: Number(settings.temperature_alert_threshold),
      }

      const { data: existing, error: readErr } = await supabase
        .from('app_settings')
        .select('user_id')
        .eq('organization_id', organizationId)
        .maybeSingle()

      if (readErr) throw readErr

      const payloadRow = {
        organization_id: organizationId,
        user_id: userId,
        ...thresholds,
        updated_at: new Date().toISOString(),
      }

      let saveErr = null
      if (existing) {
        ;({ error: saveErr } = await supabase
          .from('app_settings')
          .update(thresholds)
          .eq('organization_id', organizationId))
      } else {
        ;({ error: saveErr } = await supabase.from('app_settings').insert([payloadRow]))
      }
      if (saveErr) throw saveErr
      alert('Settings saved.')
    } catch (error) {
      alert('Failed to save settings: ' + error.message)
    }
  }

  if (!organizationId) {
    return (
      <div className="p-6 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 text-amber-950 text-sm">
        Settings are saved per organization. Complete multitenant setup and onboarding first.
      </div>
    )
  }

  if (loading) {
    return <div className="p-6 text-slate-500">Loading settings...</div>
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-slate-900">Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Configure system settings and preferences</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <form onSubmit={saveSettings} className="grid gap-4 md:max-w-xl">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Low Stock Threshold</span>
            <input
              type="number"
              min="0"
              value={settings.low_stock_threshold}
              onChange={(e) => setSettings((prev) => ({ ...prev, low_stock_threshold: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-primary"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-slate-700">Temperature Alert Threshold (C)</span>
            <input
              type="number"
              min="0"
              value={settings.temperature_alert_threshold}
              onChange={(e) => setSettings((prev) => ({ ...prev, temperature_alert_threshold: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-primary"
            />
          </label>

          <button className="w-fit rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primaryDark">
            Save Settings
          </button>
        </form>
      </section>
    </div>
  )
}

export default SettingsPage
