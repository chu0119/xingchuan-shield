import ReactECharts from 'echarts-for-react'
import { BarChart3 } from 'lucide-react'

const statusCodes = [
  { code: '200', count: 98456 },
  { code: '301', count: 5678 },
  { code: '302', count: 3456 },
  { code: '403', count: 8934 },
  { code: '404', count: 7823 },
  { code: '500', count: 1234 },
  { code: '502', count: 456 },
  { code: '503', count: 123 },
]

const httpMethods = [
  { name: 'GET', value: 89234 },
  { name: 'POST', value: 23456 },
  { name: 'PUT', value: 3456 },
  { name: 'DELETE', value: 1234 },
  { name: 'HEAD', value: 5678 },
  { name: 'OPTIONS', value: 4567 },
]

const userAgents = [
  { ua: 'Mozilla/5.0 (compatible; Googlebot/2.1)', count: 4523 },
  { ua: 'python-requests/2.28.0', count: 3456 },
  { ua: 'curl/7.88.1', count: 1890 },
  { ua: 'nikto/2.1.6', count: 1234 },
  { ua: 'sqlmap/1.7.8', count: 987 },
  { ua: 'dirbuster/1.0', count: 654 },
  { ua: 'Mozilla/5.0 (Windows NT 10.0)', count: 23456 },
  { ua: 'Mozilla/5.0 (Linux; Android 13)', count: 1567 },
  { ua: 'Wget/1.21.4', count: 432 },
  { ua: 'masscan/1.3.2', count: 321 },
]

const hourlyTraffic = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  requests: Math.floor(Math.random() * 1200 + 100),
  errors: Math.floor(Math.random() * 200 + 20),
}))

const tooltipStyle = { backgroundColor: '#1a1f2e', borderColor: '#00d4ff33', textStyle: { color: '#e2e8f0', fontSize: 12 } }
const axisLabelStyle = { color: '#64748b', fontSize: 10 }
const splitLineStyle = { color: '#1e293b33' }

const statusCodeChartOption = {
  backgroundColor: 'transparent',
  tooltip: { trigger: 'axis', ...tooltipStyle },
  grid: { top: 20, right: 20, bottom: 40, left: 60 },
  xAxis: {
    type: 'category',
    data: statusCodes.map(s => s.code),
    axisLine: { lineStyle: { color: '#1e293b' } },
    axisLabel: axisLabelStyle,
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: splitLineStyle },
    axisLabel: axisLabelStyle,
  },
  series: [{
    data: statusCodes.map(s => ({
      value: s.count,
      itemStyle: {
        color: s.code.startsWith('2') ? '#00ff88' : s.code.startsWith('3') ? '#00d4ff' : s.code.startsWith('4') ? '#ffd000' : '#ff0050',
      },
    })),
    type: 'bar',
    barWidth: '50%',
    itemStyle: { borderRadius: [4, 4, 0, 0] },
  }],
}

const methodChartOption = {
  backgroundColor: 'transparent',
  tooltip: { trigger: 'item', ...tooltipStyle },
  series: [{
    type: 'pie',
    radius: ['35%', '65%'],
    center: ['50%', '50%'],
    itemStyle: { borderColor: '#1a1f2e', borderWidth: 2 },
    label: { color: '#94a3b8', fontSize: 11 },
    data: [
      { name: 'GET', value: 89234, itemStyle: { color: '#00d4ff' } },
      { name: 'POST', value: 23456, itemStyle: { color: '#00ff88' } },
      { name: 'PUT', value: 3456, itemStyle: { color: '#ffd000' } },
      { name: 'DELETE', value: 1234, itemStyle: { color: '#ff0050' } },
      { name: 'HEAD', value: 5678, itemStyle: { color: '#b026ff' } },
      { name: 'OPTIONS', value: 4567, itemStyle: { color: '#ff8800' } },
    ],
  }],
}

const uaChartOption = {
  backgroundColor: 'transparent',
  tooltip: { trigger: 'axis', ...tooltipStyle },
  grid: { top: 10, right: 60, bottom: 10, left: 200 },
  xAxis: { type: 'value', splitLine: { lineStyle: splitLineStyle }, axisLabel: axisLabelStyle },
  yAxis: {
    type: 'category',
    data: [...userAgents].reverse().map(u => u.ua.length > 30 ? u.ua.slice(0, 30) + '...' : u.ua),
    axisLabel: { ...axisLabelStyle, width: 200, overflow: 'truncate' },
  },
  series: [{
    data: [...userAgents].reverse().map(u => u.count),
    type: 'bar',
    barWidth: '60%',
    itemStyle: { borderRadius: [0, 4, 4, 0], color: '#00d4ff' },
  }],
}

const trafficChartOption = {
  backgroundColor: 'transparent',
  tooltip: { trigger: 'axis', ...tooltipStyle },
  legend: { data: ['请求数', '错误数'], textStyle: { color: '#64748b', fontSize: 11 }, top: 0, right: 0 },
  grid: { top: 30, right: 20, bottom: 30, left: 50 },
  xAxis: {
    type: 'category',
    data: hourlyTraffic.map(h => h.hour),
    axisLine: { lineStyle: { color: '#1e293b' } },
    axisLabel: axisLabelStyle,
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: splitLineStyle },
    axisLabel: axisLabelStyle,
  },
  series: [
    {
      name: '请求数',
      data: hourlyTraffic.map(h => h.requests),
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { color: '#00d4ff', width: 2 },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [
        { offset: 0, color: 'rgba(0,212,255,0.2)' },
        { offset: 1, color: 'rgba(0,212,255,0)' },
      ]}},
    },
    {
      name: '错误数',
      data: hourlyTraffic.map(h => h.errors),
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { color: '#ff0050', width: 2 },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [
        { offset: 0, color: 'rgba(255,0,80,0.15)' },
        { offset: 1, color: 'rgba(255,0,80,0)' },
      ]}},
    },
  ],
}

export default function StatsPage() {
  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-cyber-blue glow-blue flex items-center gap-2">
          <BarChart3 size={20} /> 统计报表
        </h2>
        <span className="text-xs text-gray-500">基于最近 24 小时数据</span>
      </div>

      {/* Status Codes */}
      <div className="cyber-border rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3">📊 HTTP 状态码分布</h3>
        <ReactECharts option={statusCodeChartOption} style={{ height: 280 }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Methods */}
        <div className="cyber-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">🥧 HTTP 方法分布</h3>
          <ReactECharts option={methodChartOption} style={{ height: 300 }} />
        </div>

        {/* User Agents */}
        <div className="cyber-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">🤖 User-Agent Top 10</h3>
          <ReactECharts option={uaChartOption} style={{ height: 300 }} />
        </div>
      </div>

      {/* Traffic */}
      <div className="cyber-border rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3">📈 每小时流量趋势</h3>
        <ReactECharts option={trafficChartOption} style={{ height: 300 }} />
      </div>
    </div>
  )
}
