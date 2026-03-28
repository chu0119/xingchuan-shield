import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Upload, Shield, Globe, GitBranch,
  Link2, BarChart3, Settings, ChevronLeft, ChevronRight, Activity
} from 'lucide-react'

const NAV_ITEMS = [
  { path: '/', icon: LayoutDashboard, label: '仪表盘' },
  { path: '/logs', icon: Upload, label: '日志分析' },
  { path: '/threats', icon: Shield, label: '威胁检测' },
  { path: '/geo', icon: Globe, label: '地理溯源' },
  { path: '/paths', icon: GitBranch, label: '路径分析' },
  { path: '/sessions', icon: Link2, label: '会话追踪' },
  { path: '/stats', icon: BarChart3, label: '统计报表' },
  { path: '/settings', icon: Settings, label: '设置' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside className={`flex flex-col border-r border-dark-600 bg-dark-800/80 backdrop-blur-sm transition-all duration-300 ${collapsed ? 'w-14' : 'w-48'}`}>
      {/* Logo */}
      <div className="flex h-12 items-center justify-center border-b border-dark-600 gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyber-blue to-cyber-green flex items-center justify-center">
          <Shield size={16} className="text-dark-900" />
        </div>
        {!collapsed && <span className="text-sm font-bold text-cyber-blue">星川智盾</span>}
      </div>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="flex h-8 items-center justify-center text-gray-500 hover:text-cyber-blue hover:bg-dark-700 transition-colors"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Nav */}
      <nav className="flex-1 py-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-cyber-blue/10 text-cyber-blue border-r-2 border-cyber-blue shadow-[2px_0_8px_rgba(0,212,255,0.2)]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-dark-700/50'
              } ${collapsed ? 'justify-center px-2' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={16} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-dark-600">
        {!collapsed && (
          <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-600">
            <Activity size={12} className="text-cyber-green" />
            <span>System Active</span>
          </div>
        )}
      </div>
    </aside>
  )
}
