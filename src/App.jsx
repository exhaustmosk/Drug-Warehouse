import { lazy, Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import { supabase } from './lib/supabaseClient'

const DashboardPage  = lazy(() => import('./pages/DashboardPage'))
const InventoryPage  = lazy(() => import('./pages/InventoryPage'))
const OperationsPage = lazy(() => import('./pages/OperationsPage'))
const BuildingPage   = lazy(() => import('./pages/BuildingPage'))
const ReportsPage    = lazy(() => import('./pages/ReportsPage'))
const CompliancePage = lazy(() => import('./pages/CompliancePage'))
const SettingsPage   = lazy(() => import('./pages/SettingsPage'))
const ProfilePage    = lazy(() => import('./pages/ProfilePage'))

function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check current session and profile
    async function initialize() {
      // Safety timeout: don't stay on loading screen forever
      const timeout = setTimeout(() => {
        setLoading(false)
      }, 3000)

      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        
        if (session) {
          await fetchProfile(session.user.id)
        }
      } catch (error) {
        console.error('Initialization error:', error)
      } finally {
        clearTimeout(timeout)
        setLoading(false)
      }
    }

    initialize()

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      setProfile(data)
    }
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-slate-500">Loading...</div>
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // If session exists but onboarding not completed or profile missing, redirect to onboarding
  if (!profile || !profile.onboarding_completed) {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    )
  }

  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-600">Loading page...</div>}>
      <Routes>
        <Route
          path="/"
          element={<AppLayout />}
        >
          <Route index element={<DashboardPage />} />
          <Route path="inventory"  element={<InventoryPage />} />
          <Route path="operations" element={<OperationsPage />} />
          <Route path="building"   element={<BuildingPage />} />
          <Route path="reports"    element={<ReportsPage />} />
          <Route path="compliance" element={<CompliancePage />} />
          <Route path="settings"   element={<SettingsPage />} />
          <Route path="profile"    element={<ProfilePage />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App


