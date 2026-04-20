import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layout/AppLayout'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const InventoryPage = lazy(() => import('./pages/InventoryPage'))
const OperationsPage = lazy(() => import('./pages/OperationsPage'))
const BuildingPage = lazy(() => import('./pages/BuildingPage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))
const CompliancePage = lazy(() => import('./pages/CompliancePage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

function App() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-600">Loading page...</div>}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="operations" element={<OperationsPage />} />
          <Route path="building" element={<BuildingPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="compliance" element={<CompliancePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
