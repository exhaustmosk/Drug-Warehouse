import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  KeyRound,
  Loader2,
  MapPin,
  Phone,
  Ruler,
  User,
} from 'lucide-react'

function OnboardingPage() {
  const [signupRole, setSignupRole] = useState(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [stepBusy, setStepBusy] = useState(false)
  const [error, setError] = useState(null)
  const [lookupError, setLookupError] = useState(null)

  const [organizationName, setOrganizationName] = useState('')
  const [createdOrgId, setCreatedOrgId] = useState(null)
  const [createdJoinCode, setCreatedJoinCode] = useState(null)

  const [joinCodeInput, setJoinCodeInput] = useState('')
  const [joinedOrgId, setJoinedOrgId] = useState(null)
  const [joinedOrgName, setJoinedOrgName] = useState(null)

  const [formData, setFormData] = useState({
    full_name: '',
    job_title: '',
    phone_number: '',
    warehouse_name: '',
    warehouse_location: '',
    warehouse_area: '',
    warehouse_type: 'General Storage',
    license_number: '',
  })

  const isOwner = signupRole === 'admin'
  const maxStep = isOwner ? 4 : 3

  useEffect(() => {
    let cancelled = false
    supabase.auth.getUser().then(({ data }) => {
      const r = data.user?.user_metadata?.role === 'admin' ? 'admin' : 'employee'
      if (!cancelled) setSignupRole(r)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function lookupOrganization(required = false) {
    setLookupError(null)
    const code = joinCodeInput.trim()
    if (!code) {
      if (required) setLookupError('Organization join code is required.')
      return null
    }
    const { data, error: rpcErr } = await supabase.rpc('lookup_organization', {
      join_code_input: code,
    })
    if (rpcErr) {
      setLookupError(rpcErr.message)
      return null
    }
    const row = Array.isArray(data) ? data[0] : null
    if (!row?.id) {
      setLookupError('No organization matches that join code.')
      setJoinedOrgId(null)
      setJoinedOrgName(null)
      return null
    }
    setJoinedOrgId(row.id)
    setJoinedOrgName(row.name)
    return row
  }

  async function goNextFromOwnerOrgStep() {
    setStepBusy(true)
    setLookupError(null)
    setError(null)
    try {
      if (createdOrgId && createdJoinCode) {
        setStep(3)
        return
      }
      const name = organizationName.trim()
      if (!name) {
        setLookupError('Organization name is required.')
        return
      }
      const { data, error: rpcErr } = await supabase.rpc('create_organization', { org_name: name })
      if (rpcErr) throw rpcErr
      const row = Array.isArray(data) ? data[0] : null
      if (!row?.id) throw new Error('Could not create organization.')
      setCreatedOrgId(row.id)
      setCreatedJoinCode(row.join_code)
      setStep(3)
    } catch (e) {
      setLookupError(e.message || String(e))
    } finally {
      setStepBusy(false)
    }
  }

  async function goNextFromEmployeePersonal() {
    setStepBusy(true)
    setLookupError(null)
    setError(null)
    try {
      const row = await lookupOrganization(true)
      if (!row?.id) return
      setStep(2)
    } finally {
      setStepBusy(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const orgId = isOwner ? createdOrgId : joinedOrgId

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No active session. Please log in again.')
      if (!orgId) throw new Error('Missing organization — go back and complete organization setup.')

      const roleFromSignup = user.user_metadata?.role === 'admin' ? 'admin' : 'employee'

      const { error: profileErr } = await supabase.from('profiles').upsert({
        id: user.id,
        ...formData,
        email: user.email ?? null,
        role: roleFromSignup,
        organization_id: orgId,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })

      if (profileErr) throw profileErr

      const { data: existingZones, error: zoneFetchError } = await supabase
        .from('warehouse_zones')
        .select('id')
        .eq('organization_id', orgId)
        .limit(1)

      if (zoneFetchError) throw zoneFetchError

      if (!existingZones?.length) {
        const { error: zoneInsertError } = await supabase.from('warehouse_zones').insert([
          {
            user_id: user.id,
            organization_id: orgId,
            name: 'Primary Zone',
            type: formData.warehouse_type,
            status: 'Normal',
            area: `${formData.warehouse_area} m²`,
            capacity: 0,
            temperature: '22',
            humidity: '45%',
            items_count: 0,
            last_maintenance: new Date().toISOString().split('T')[0],
          },
        ])

        if (zoneInsertError) throw zoneInsertError
      }

      window.location.href = '/'
    } catch (err) {
      console.error('Onboarding save error:', err)
      setError('Failed to save: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const warehouseTypes = [
    'General Storage',
    'Cold Storage (2-8°C)',
    'Frozen Storage (-20°C)',
    'Pharmaceutical Grade',
    'Hazardous Materials',
    'Distribution Center',
  ]

  if (signupRole === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-muted">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    )
  }

  const warehouseStep = isOwner ? 3 : 2
  const reviewStep = isOwner ? 4 : 3

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl transition-all duration-500">
        <div className="relative overflow-hidden bg-primary p-10 text-center text-white">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

          <h1 className="relative text-3xl font-bold tracking-tight">Welcome to DrugWare</h1>
          <p className="relative mt-2 text-primary-foreground/80">
            {isOwner ? 'Create your organization, then configure your warehouse.' : 'Join your company with a join code.'}
          </p>

          <div className="relative mt-8 flex justify-center gap-2">
            {Array.from({ length: maxStep }, (_, i) => i + 1).map((s) => (
              <div
                key={s}
                className={`h-2.5 flex-1 max-w-[4.5rem] rounded-full transition-all duration-500 ${
                  step >= s ? 'bg-white shadow-lg shadow-white/20' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-10">
          <form onSubmit={handleSubmit}>
            {/* Step 1: personal */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="mb-2 flex items-center gap-3 text-primary">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <User size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Personal information</h2>
                    {!isOwner && (
                      <p className="text-xs text-muted">You will connect to your employer using their join code.</p>
                    )}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Full name</label>
                    <input
                      required
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary"
                      placeholder="e.g. Jane Lee"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Job title</label>
                    <input
                      required
                      name="job_title"
                      value={formData.job_title}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary"
                      placeholder="e.g. Warehouse associate"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Phone number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                      required
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition-all focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                {!isOwner && (
                  <div className="space-y-2 rounded-2xl border border-primary/20 bg-primary/5 p-5">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <KeyRound className="text-primary" size={20} aria-hidden />
                      Organization join code<span className="text-red-500">*</span>
                    </div>
                    <p className="text-xs text-muted">
                      Ask your supervisor for this code (shown when they created the company workspace).
                    </p>
                    <input
                      required
                      value={joinCodeInput}
                      onChange={(e) => {
                        setJoinCodeInput(e.target.value.toUpperCase())
                        setLookupError(null)
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm tracking-wide outline-none focus:border-primary"
                      placeholder="e.g. DW-ABC12XY8"
                      autoComplete="off"
                    />
                    {joinedOrgId && joinedOrgName && (
                      <p className="text-sm text-emerald-700">
                        Connected to <span className="font-semibold">{joinedOrgName}</span>
                      </p>
                    )}
                    {lookupError && <p className="text-sm text-red-600">{lookupError}</p>}
                    <button
                      type="button"
                      disabled={stepBusy}
                      className="text-sm font-semibold text-primary hover:underline"
                      onClick={() => lookupOrganization(true)}
                    >
                      Verify join code
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  disabled={stepBusy}
                  onClick={() => {
                    if (isOwner) setStep(2)
                    else void goNextFromEmployeePersonal()
                  }}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primaryDark"
                >
                  {stepBusy ? <Loader2 className="animate-spin" size={18} /> : (
                    <>
                      Continue <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Owner step 2: create organization */}
            {isOwner && step === 2 && (
              <div className="space-y-6">
                <div className="mb-2 flex items-center gap-3 text-primary">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Create your organization</h2>
                    <p className="text-xs text-muted">Each company gets a private workspace and a join code for staff.</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Company / organization name</label>
                  <input
                    value={organizationName}
                    onChange={(e) => {
                      setOrganizationName(e.target.value)
                      setLookupError(null)
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                    placeholder="e.g. Meridian Pharma Logistics"
                  />
                  {createdJoinCode && (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                      Your join code <span className="font-mono font-bold">{createdJoinCode}</span> · share it only with{' '}
                      trusted warehouse staff.
                    </div>
                  )}
                  {lookupError && <p className="mt-2 text-sm text-red-600">{lookupError}</p>}
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    disabled={stepBusy}
                    onClick={() => {
                      setStep(1)
                      setLookupError(null)
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-3.5 font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <ChevronLeft size={18} /> Back
                  </button>
                  <button
                    type="button"
                    disabled={stepBusy}
                    onClick={() => void goNextFromOwnerOrgStep()}
                    className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primaryDark"
                  >
                    {stepBusy ? <Loader2 className="animate-spin" size={18} /> : (
                      <>
                        {createdOrgId ? 'Continue to warehouse' : 'Create workspace'} <ChevronRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Warehouse (owner step 3, employee step 2) */}
            {step === warehouseStep && (
              <div className="space-y-6">
                <div className="mb-2 flex items-center gap-3 text-primary">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Building2 size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Warehouse details</h2>
                </div>
                {!isOwner && joinedOrgName && (
                  <p className="text-sm text-muted">
                    Organization <span className="font-semibold text-slate-800">{joinedOrgName}</span>
                  </p>
                )}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-left text-sm font-semibold text-slate-700">Warehouse name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 text-slate-400" size={18} />
                      <input
                        required
                        name="warehouse_name"
                        value={formData.warehouse_name}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white"
                        placeholder="e.g. East distribution hub"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="block text-left text-sm font-semibold text-slate-700">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input
                          required
                          name="warehouse_location"
                          value={formData.warehouse_location}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white"
                          placeholder="City, country"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-left text-sm font-semibold text-slate-700">Total area (m²)</label>
                      <div className="relative">
                        <Ruler className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input
                          required
                          type="number"
                          name="warehouse_area"
                          value={formData.warehouse_area}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white"
                          placeholder="e.g. 15000"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="block text-left text-sm font-semibold text-slate-700">Warehouse type</label>
                      <select
                        name="warehouse_type"
                        value={formData.warehouse_type}
                        onChange={handleChange}
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white"
                      >
                        {warehouseTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-left text-sm font-semibold text-slate-700">License number</label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input
                          required
                          name="license_number"
                          value={formData.license_number}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white"
                          placeholder="e.g. W-12345-X"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null)
                      setStep(isOwner ? 2 : 1)
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-3.5 font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <ChevronLeft size={18} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(reviewStep)}
                    className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primaryDark"
                  >
                    Review <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === reviewStep && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Review &amp; complete</h2>
                  <p className="mt-2 text-slate-500">Confirm organization and warehouse details.</p>
                </div>

                <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-6 text-sm">
                  {isOwner && createdJoinCode && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
                      <p className="font-semibold">Staff join code</p>
                      <p className="mt-1 font-mono text-lg tracking-wide">{createdJoinCode}</p>
                      <p className="mt-2 text-xs text-amber-900/90">Warehouse teammates must enter this on signup.</p>
                    </div>
                  )}
                  {!isOwner && joinedOrgName && (
                    <div>
                      <p className="text-slate-500 font-medium">Organization</p>
                      <p className="text-slate-900 font-semibold">{joinedOrgName}</p>
                      <p className="font-mono text-xs text-muted">{joinCodeInput}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-y-4">
                    <div>
                      <p className="text-slate-500 font-medium">Full name</p>
                      <p className="text-slate-900 font-semibold">{formData.full_name}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Warehouse</p>
                      <p className="text-slate-900 font-semibold">{formData.warehouse_name}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-500 font-medium">License</p>
                      <p className="text-slate-900 font-semibold">{formData.license_number}</p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <AlertCircle size={16} className="shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setError(null)
                      setStep(warehouseStep)
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-3.5 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <ChevronLeft size={18} /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primaryDark disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Go to dashboard'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default OnboardingPage
