import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import DashboardPage from './pages/DashboardPage'
import LogUploadPage from './pages/LogUploadPage'
import ThreatPage from './pages/ThreatPage'
import GeoMapPage from './pages/GeoMapPage'
import PathTreePage from './pages/PathTreePage'
import SessionPage from './pages/SessionPage'
import StatsPage from './pages/StatsPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="logs" element={<LogUploadPage />} />
          <Route path="threats" element={<ThreatPage />} />
          <Route path="geo" element={<GeoMapPage />} />
          <Route path="paths" element={<PathTreePage />} />
          <Route path="sessions" element={<SessionPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
