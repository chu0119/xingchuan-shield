import ReactECharts from 'echarts-for-react'
import { Globe, MapPin, AlertTriangle } from 'lucide-react'

const mockAttackPoints = [
  { ip: '185.220.101.34', country: '俄罗斯', city: '莫斯科', count: 234, level: 'critical', lat: 55.75, lon: 37.62 },
  { ip: '45.134.26.97', country: '荷兰', city: '阿姆斯特丹', count: 189, level: 'high', lat: 52.37, lon: 4.9 },
  { ip: '103.75.201.18', country: '越南', city: '河内', count: 156, level: 'critical', lat: 21.03, lon: 105.85 },
  { ip: '91.240.118.172', country: '乌克兰', city: '基辅', count: 134, level: 'high', lat: 50.45, lon: 30.52 },
  { ip: '194.163.137.89', country: '法国', city: '巴黎', count: 112, level: 'medium', lat: 48.86, lon: 2.35 },
  { ip: '5.188.86.17', country: '俄罗斯', city: '圣彼得堡', count: 98, level: 'high', lat: 59.93, lon: 30.32 },
  { ip: '162.247.74.202', country: '美国', city: '旧金山', count: 87, level: 'medium', lat: 37.77, lon: -122.42 },
  { ip: '212.21.66.6', country: '德国', city: '柏林', count: 76, level: 'low', lat: 52.52, lon: 13.41 },
  { ip: '171.25.193.77', country: '瑞典', city: '斯德哥尔摩', count: 65, level: 'medium', lat: 59.33, lon: 18.07 },
  { ip: '103.152.220.23', country: '印度', city: '新德里', count: 54, level: 'low', lat: 28.61, lon: 77.21 },
  { ip: '36.92.36.234', country: '印尼', city: '雅加达', count: 45, level: 'medium', lat: -6.2, lon: 106.85 },
  { ip: '154.89.5.78', country: '中国', city: '上海', count: 38, level: 'high', lat: 31.23, lon: 121.47 },
  { ip: '177.54.150.200', country: '巴西', city: '圣保罗', count: 32, level: 'low', lat: -23.55, lon: -46.63 },
  { ip: '41.33.178.45', country: '埃及', city: '开罗', count: 28, level: 'medium', lat: 30.04, lon: 31.24 },
  { ip: '196.188.120.34', country: '肯尼亚', city: '内罗毕', count: 22, level: 'low', lat: -1.29, lon: 36.82 },
  { ip: '201.20.116.89', country: '巴西', city: '里约', count: 19, level: 'low', lat: -22.91, lon: -43.17 },
  { ip: '89.160.20.112', country: '挪威', city: '奥斯陆', count: 15, level: 'medium', lat: 59.91, lon: 10.75 },
  { ip: '58.97.8.234', country: '泰国', city: '曼谷', count: 12, level: 'low', lat: 13.76, lon: 100.5 },
]

const levelColorMap: Record<string, string> = { critical: '#ff0050', high: '#ff8800', medium: '#ffd000', low: '#00d4ff' }

export default function GeoMapPage() {
  const sorted = [...mockAttackPoints].sort((a, b) => b.count - a.count)
  const totalAttacks = mockAttackPoints.reduce((s, p) => s + p.count, 0)

  const chartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1a1f2e',
      borderColor: '#00d4ff33',
      textStyle: { color: '#e2e8f0', fontSize: 12 },
      formatter: (params: any) => {
        const d = params.data
        return `<b>${d.city}</b> (${d.country})<br/>IP: ${d.ip}<br/>攻击次数: <b style="color:${d.itemStyle.color}">${d.count}</b><br/>威胁级别: ${d.level}`
      },
    },
    xAxis: {
      type: 'value', min: -180, max: 180, show: false,
    },
    yAxis: {
      type: 'value', min: -90, max: 90, show: false,
    },
    grid: { top: 10, right: 10, bottom: 10, left: 10 },
    series: [{
      type: 'scatter',
      symbolSize: (val: number[], params: any) => Math.max(8, params.data.count / 5),
      data: mockAttackPoints.map(p => ({
        value: [p.lon, p.lat, p.count],
        ip: p.ip,
        country: p.country,
        city: p.city,
        count: p.count,
        level: p.level,
        itemStyle: { color: levelColorMap[p.level] },
      })),
      itemStyle: {
        shadowBlur: 10,
        shadowColor: 'rgba(0,212,255,0.3)',
      },
    }],
  }

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-cyber-blue glow-blue flex items-center gap-2">
          <Globe size={20} /> 地理溯源
        </h2>
        <div className="flex items-center gap-4 text-xs">
          {Object.entries(levelColorMap).map(([level, color]) => (
            <span key={level} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-gray-500">{level}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <div className="lg:col-span-2 cyber-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">🌍 全球攻击分布</h3>
          <ReactECharts option={chartOption} style={{ height: 480 }} />
        </div>

        {/* Top IPs */}
        <div className="cyber-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <MapPin size={14} className="text-cyber-orange" /> Top 攻击源
          </h3>
          <div className="text-xs text-gray-500 mb-3">
            共 <span className="text-cyber-blue font-mono">{mockAttackPoints.length}</span> 个地区，{' '}
            <span className="text-cyber-red font-mono">{totalAttacks.toLocaleString()}</span> 次攻击
          </div>
          <div className="space-y-2 overflow-auto max-h-[420px]">
            {sorted.map((p, i) => (
              <div key={p.ip} className="flex items-center gap-3 bg-dark-900/50 rounded-lg px-3 py-2">
                <span className="text-xs font-mono text-gray-600 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-cyber-blue">{p.ip}</span>
                    <span className={`badge-${p.level} px-1.5 py-0.5 rounded text-[10px]`}>{p.level}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{p.city}，{p.country}</div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-bold" style={{ color: levelColorMap[p.level] }}>{p.count}</span>
                  <div className="text-[10px] text-gray-600">次攻击</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
