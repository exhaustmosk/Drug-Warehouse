import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { User, Building2, MapPin, Ruler, CheckCircle2, Loader2, Phone, FileText, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react'

function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    full_name: '',
    job_title: '',
    phone_number: '',
    warehouse_name: '',
    warehouse_location: '',
    warehouse_area: '',
    warehouse_type: 'General',
    license_number: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No active session. Please log in again.')

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...formData,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      // Force full reload so App.jsx re-fetches the updated profile from Supabase
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
    'Distribution Center'
  ]

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-500 border border-slate-100">
        <div className="bg-primary p-10 text-center text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          
          <h1 className="relative text-3xl font-bold tracking-tight">Welcome to DrugWare</h1>
          <p className="relative mt-2 text-primary-foreground/80">Let's set up your warehouse environment</p>
          
          <div className="relative mt-8 flex justify-center items-center gap-4">
            <div className={`h-2.5 w-16 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-white shadow-lg shadow-white/20' : 'bg-white/20'}`} />
            <div className={`h-2.5 w-16 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-white shadow-lg shadow-white/20' : 'bg-white/20'}`} />
            <div className={`h-2.5 w-16 rounded-full transition-all duration-500 ${step >= 3 ? 'bg-white shadow-lg shadow-white/20' : 'bg-white/20'}`} />
          </div>
        </div>

        <div className="p-10">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right duration-500">
                <div className="flex items-center gap-3 text-primary mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Full Name</label>
                    <input
                      required
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Job Title</label>
                    <input
                      required
                      name="job_title"
                      value={formData.job_title}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all"
                      placeholder="e.g. Warehouse Manager"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                      required
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-white hover:bg-primaryDark hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                >
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right duration-500">
                <div className="flex items-center gap-3 text-primary mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Warehouse Details</h2>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700 text-left block">Warehouse Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 text-slate-400" size={18} />
                      <input
                        required
                        name="warehouse_name"
                        value={formData.warehouse_name}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all"
                        placeholder="e.g. North Hub Logistics"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700 text-left block">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input
                          required
                          name="warehouse_location"
                          value={formData.warehouse_location}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all"
                          placeholder="City, Country"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700 text-left block">Total Area (m²)</label>
                      <div className="relative">
                        <Ruler className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input
                          required
                          type="number"
                          name="warehouse_area"
                          value={formData.warehouse_area}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all"
                          placeholder="e.g. 15000"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700 text-left block">Warehouse Type</label>
                      <select
                        name="warehouse_type"
                        value={formData.warehouse_type}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                      >
                        {warehouseTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700 text-left block">License Number</label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input
                          required
                          name="license_number"
                          value={formData.license_number}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all"
                          placeholder="e.g. W-12345-X"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3.5 font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    <ChevronLeft size={18} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-white hover:bg-primaryDark hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                  >
                    Almost Done <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in zoom-in duration-500">
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 mb-4">
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Review & Complete</h2>
                  <p className="mt-2 text-slate-500">Please review your information before we finalize your account.</p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div>
                      <p className="text-slate-500 font-medium">Full Name</p>
                      <p className="text-slate-900 font-semibold">{formData.full_name}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Job Title</p>
                      <p className="text-slate-900 font-semibold">{formData.job_title}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Warehouse</p>
                      <p className="text-slate-900 font-semibold">{formData.warehouse_name}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Type</p>
                      <p className="text-slate-900 font-semibold">{formData.warehouse_type}</p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                    <AlertCircle size={16} className="shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => { setStep(2); setError(null) }}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3.5 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
                  >
                    <ChevronLeft size={18} /> Review
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-white hover:bg-primaryDark hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Go to Dashboard'}
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
