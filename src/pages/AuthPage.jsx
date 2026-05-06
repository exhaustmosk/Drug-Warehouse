import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Shield,
  Truck,
} from 'lucide-react'

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [signUpRole, setSignUpRole] = useState('employee')
  const [error, setError] = useState(null)

  function resetSensitiveFields() {
    setError(null)
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  async function handleAuth(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!isLogin) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        setLoading(false)
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
        setLoading(false)
        return
      }
    }

    try {
      if (isLogin) {
        const { error: signErr } = await supabase.auth.signInWithPassword({ email, password })
        if (signErr) throw signErr
      } else {
        const { data, error: signErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: signUpRole },
          },
        })
        if (signErr) throw signErr
        if (!data.session) {
          alert(
            'Account created. If email confirmation is enabled in your Supabase project, check inbox/spam — or turn it off under Authentication → Providers → Email.',
          )
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} aria-hidden />
            Back
          </Link>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">DrugWare</span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-500">
          <div className="bg-primary p-8 text-center text-white">
            <h1 className="text-3xl font-bold">DrugWare</h1>
            <p className="mt-2 text-primary-foreground/80">
              {isLogin ? 'Welcome back! Please login to your account.' : 'Create your account to get started.'}
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleAuth} className="space-y-6">
              {error && (
                <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">{error}</div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:bg-white"
                    placeholder="admin@drugware.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-12 text-sm outline-none transition-all focus:border-primary focus:bg-white"
                    placeholder="••••••••"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-2.5 rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Confirm password</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-3 text-slate-400" size={18} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-12 text-sm outline-none transition-all focus:border-primary focus:bg-white"
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute right-3 top-2.5 rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">Account type</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setSignUpRole('employee')}
                        className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left text-sm transition ${
                          signUpRole === 'employee'
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Truck className="text-primary" size={22} aria-hidden />
                        <span className="font-semibold text-slate-900">Warehouse team</span>
                        <span className="text-xs text-muted leading-snug">
                          Day-to-day inventory and operations access.
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignUpRole('admin')}
                        className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left text-sm transition ${
                          signUpRole === 'admin'
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Shield className="text-primary" size={22} aria-hidden />
                        <span className="font-semibold text-slate-900">Supervisor / owner</span>
                        <span className="text-xs text-muted leading-snug">
                          Full access plus employee directory and oversight tools.
                        </span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primaryDark disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : isLogin ? 'Login' : 'Create Account'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin)
                    resetSensitiveFields()
                  }}
                  className="font-semibold text-primary hover:underline"
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
