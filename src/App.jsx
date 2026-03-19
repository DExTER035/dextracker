import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './providers/AuthProvider.jsx'
import { AppLayout } from './ui/layout/AppLayout.jsx'
import { LoginPage } from './views/auth/LoginPage.jsx'
import { DashboardPage } from './views/dashboard/DashboardPage.jsx'
import { PlannerPage } from './views/planner/PlannerPage.jsx'
import { HealthPage } from './views/health/HealthPage.jsx'
import { FinancePage } from './views/finance/FinancePage.jsx'
import { GoalsPage } from './views/goals/GoalsPage.jsx'
import { StudyPage } from './views/study/StudyPage.jsx'
import { FitnessPage } from './views/fitness/FitnessPage.jsx'
import { AiChatPage } from './views/ai/AiChatPage.jsx'
import { SettingsPage } from './views/settings/SettingsPage.jsx'

function Protected({ children }) {
  const { session, loading } = useAuth()
  if (loading) return null
  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <Protected>
              <AppLayout />
            </Protected>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="planner" element={<PlannerPage />} />
          <Route path="health" element={<HealthPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="study" element={<StudyPage />} />
          <Route path="fitness" element={<FitnessPage />} />
          <Route path="ai" element={<AiChatPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
