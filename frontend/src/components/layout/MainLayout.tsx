import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Shield, Download, Activity } from 'lucide-react'
import Sidebar from './Sidebar'

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-dark-900">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-12 items-center justify-between border-b border-dark-600 bg-dark-800/80 backdrop-blur-sm px-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-cyber-blue to-cyber-green flex items-center justify-center">
              <Shield size={14} className="text-dark-900" />
            </div>
            <h1 className="text-sm font-semibold text-cyber-blue glow-blue">
              星川智盾
              <span className="ml-2 text-xs text-gray-500 font-normal">AI Log Analysis System</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="px-2 py-0.5 rounded bg-cyber-green/10 text-cyber-green border border-cyber-green/20 font-mono">
              v1.0.0
            </span>
            <button className="shield-btn flex items-center gap-1">
              <Download size={12} /> 导出报告
            </button>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>

        {/* Status bar */}
        <footer className="flex h-7 items-center justify-between border-t border-dark-600 bg-dark-800/80 px-4 text-xs text-gray-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Activity size={10} className="text-cyber-green" /> System Online
            </span>
            <span className="hidden sm:inline">🛡️ AI-Powered Threat Detection</span>
          </div>
          <span>© 2026 星川智盾</span>
        </footer>
      </div>
    </div>
  )
}
