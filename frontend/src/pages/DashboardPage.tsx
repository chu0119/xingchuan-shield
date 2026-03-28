import { useState, useEffect, useRef } from 'react'
import ReactECharts from 'echarts-for-react'
import { Activity, ShieldAlert, Shield, Globe, TrendingUp, AlertTriangle } from 'lucide-react'
import { api } from '../lib/api'
import {
  mockOverview, mockTimeline, mockThreatByType,
  mockTopIps, mockTopPaths, mockRecentThreats
} from '../lib/mockData'

const levelColors: Record<string, string> = { critical: '#ff0050', high: '#ff8800', medium: '#ffd000', low: '#00d4ff' }

function StatCard({ icon: Icon, label, value, color, sub }: {
  icon: any, label: string, value: string | number, color: string, sub?: string
}) {
  return (
    <div className="cyber-border rounded-lg p-4 card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold mt-1 font-mono" style={{ color }}>{value.toLocaleString()}</p>
          {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [overview, setOverview] = useState(mockOverview)
  const [threats, setThreats] = useState(mockRecentThreats)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.getStats().then(data => {
      const sessions = data.sessions || []
      if (sessions.length > 0) {
        const latest = sessions[sessions.length - 1]
        setOverview({
          total_entries: latest.parsed_lines || 0,
          total_threats: latest.threat_count || 0,
          critical: latest.entries?.filter((e: any) => e.threat_level === 'critical').length || 0,
          high: latest.entries?.filter((e: any) => e.threat_level === 'high').length || 0,
          medium: latest.entries?.filter((e: any) => e.threat_level === 'medium').length || 0,
          low: latest.entries?.filter((e: any) => e.threat_level === 'low').length || 0,
          unique_ips: new Set(latest.entries?.map((e: any) => e.ip).filter(Boolean)).size || 0,
          unique_paths: new Set(latest.entries?.map((e: any) => e.path).filter(Boolean)).size || 0,
        })
      }
    }).catch(() => {})
  }, [])

  // Auto-scroll threats
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop += 1
        if (scrollRef.current.scrollTop >= scrollRef.current.scrollHeight - scrollRef.current.clientHeight) {
          scrollRef.current.scrollTop = 0
        }
      }
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const timelineOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: '#1a1f2e', borderColor: '#00d4ff33', textStyle: { color: '#e2e8f0', fontSize: 12 } },
    grid: { top: 20, right: 20, bottom: 30, left: 50 },
    xAxis: {
      type: 'category',
      data: Object.keys(mockTimeline).map(k => k.split('T')[1]),
      axisLine: { lineStyle: { color: '#1e293b' } },
      axisLabel: { color: '#64748b', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#1e293b33' } },
      axisLabel: { color: '#64748b', fontSize: 10 },
    },
    series: [{
      data: Object.values(mockTimeline),
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { color: '#00d4ff', width: 2 },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [
        { offset: 0, color: 'rgba(0,212,255,0.3)' },
        { offset: 1, color: 'rgba(0,212,255,0)' },
      ]}},
    }],
  }

  const pieOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', backgroundColor: '#1a1f2e', borderColor: '#00d4ff33', textStyle: { color: '#e2e8f0', fontSize: 12 } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      itemStyle: { borderColor: '#1a1f2e', borderWidth: 2 },
      label: { color: '#94a3b8', fontSize: 11 },
      data: mockThreatByType,
    }],
  }

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-cyber-blue glow-blue flex items-center gap-2">
          <TrendingUp size={20} /> 安全态势总览
        </h2>
        <span className="text-xs text-gray-500">数据实时更新中</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Activity} label="日志总数" value={overview.total_entries} color="#00d4ff" sub="已解析条目" />
        <StatCard icon={ShieldAlert} label="威胁总数" value={overview.total_threats} color="#ff0050" sub={`高危 ${overview.critical + overview.high}`} />
        <StatCard icon={Shield} label="高危威胁" value={overview.critical + overview.high} color="#ff8800" sub={`严重 ${overview.critical} / 高 ${overview.high}`} />
        <StatCard icon={Globe} label="唯一 IP" value={overview.unique_ips} color="#00ff88" sub={`唯一路径 ${overview.unique_paths}`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 cyber-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">📈 攻击趋势（24h）</h3>
          <ReactECharts option={timelineOption} style={{ height: 260 }} />
        </div>
        <div className="cyber-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">🎯 威胁类型分布</h3>
          <ReactECharts option={pieOption} style={{ height: 260 }} />
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top IPs */}
        <div className="cyber-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">🔥 Top 10 攻击源 IP</h3>
          <div className="overflow-auto max-h-64">
            <table className="w-full shield-table">
              <thead><tr>
                <th>IP 地址</th><th>地区</th><th>威胁数</th><th>级别</th>
              </tr></thead>
              <tbody>
                {mockTopIps.map((item, i) => (
                  <tr key={i}>
                    <td className="font-mono text-cyber-blue text-xs">{item.ip}</td>
                    <td className="text-gray-400 text-xs">{item.country}</td>
                    <td className="font-mono text-xs">{item.count}</td>
                    <td><span className={`badge-${item.level} px-2 py-0.5 rounded text-xs`}>{item.level}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Paths */}
        <div className="cyber-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">⚠️ Top 10 被攻击路径</h3>
          <div className="overflow-auto max-h-64">
            <table className="w-full shield-table">
              <thead><tr>
                <th>路径</th><th>访问量</th><th>威胁数</th>
              </tr></thead>
              <tbody>
                {mockTopPaths.map((item, i) => (
                  <tr key={i}>
                    <td className="font-mono text-xs text-cyber-orange truncate max-w-[200px]">{item.path}</td>
                    <td className="font-mono text-xs">{item.count}</td>
                    <td><span className="text-cyber-red font-mono text-xs">{item.threats}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Threats - scrolling */}
      <div className="cyber-border rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
          <AlertTriangle size={14} className="text-cyber-yellow" />
          实时威胁事件
          <span className="ml-auto text-xs text-gray-600">自动滚动</span>
        </h3>
        <div ref={scrollRef} className="overflow-auto max-h-48">
          <table className="w-full shield-table">
            <thead className="sticky top-0"><tr>
              <th>时间</th><th>IP</th><th>类型</th><th>级别</th><th>路径</th><th>详情</th>
            </tr></thead>
            <tbody>
              {[...threats, ...threats].map((t, i) => (
                <tr key={i}>
                  <td className="font-mono text-xs text-gray-500 whitespace-nowrap">{t.time}</td>
                  <td className="font-mono text-xs text-cyber-blue">{t.ip}</td>
                  <td className="text-xs">{t.type}</td>
                  <td><span className={`badge-${t.level} px-2 py-0.5 rounded text-xs`}>{t.level}</span></td>
                  <td className="font-mono text-xs text-cyber-orange truncate max-w-[200px]">{t.path}</td>
                  <td className="text-xs text-gray-500 truncate max-w-[250px]">{t.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
