import { useState } from 'react'
import { Link2, Search, Clock, AlertTriangle, ArrowRight } from 'lucide-react'

interface SessionRequest {
  time: string
  method: string
  path: string
  status: number
  size: number
  threat: string | null
}

interface SessionIP {
  ip: string
  country: string
  totalRequests: number
  threats: number
  requests: SessionRequest[]
}

const mockSessions: SessionIP[] = [
  {
    ip: '185.220.101.34', country: '俄罗斯', totalRequests: 47, threats: 23,
    requests: [
      { time: '14:12:45', method: 'GET', path: '/api/v1/users?id=1', status: 200, size: 1234, threat: null },
      { time: '14:12:42', method: 'GET', path: '/api/v1/users?id=1 OR 1=1', status: 403, size: 89, threat: 'SQL注入' },
      { time: '14:12:38', method: 'POST', path: '/api/v1/login', status: 401, size: 67, threat: '暴力破解' },
      { time: '14:12:35', method: 'GET', path: '/api/v1/users?id=1 UNION SELECT', status: 403, size: 89, threat: 'SQL注入' },
      { time: '14:12:30', method: 'GET', path: '/wp-admin/', status: 301, size: 0, threat: '扫描探测' },
      { time: '14:12:25', method: 'GET', path: '/robots.txt', status: 200, size: 45, threat: null },
      { time: '14:12:20', method: 'GET', path: '/.env', status: 404, size: 0, threat: '敏感文件' },
      { time: '14:12:15', method: 'GET', path: '/api/v1/search?q=<script>', status: 403, size: 89, threat: 'XSS' },
      { time: '14:12:10', method: 'POST', path: '/api/v1/login', status: 401, size: 67, threat: '暴力破解' },
      { time: '14:12:05', method: 'GET', path: '/api/v1/users?id=1; DROP TABLE', status: 403, size: 89, threat: 'SQL注入' },
      { time: '14:12:00', method: 'GET', path: '/sitemap.xml', status: 200, size: 2345, threat: null },
      { time: '14:11:55', method: 'GET', path: '/wp-content/uploads/shell.php', status: 403, size: 89, threat: 'Webshell' },
    ],
  },
  {
    ip: '45.134.26.97', country: '荷兰', totalRequests: 31, threats: 15,
    requests: [
      { time: '14:10:30', method: 'GET', path: '/', status: 200, size: 5678, threat: null },
      { time: '14:10:25', method: 'GET', path: '/search?q=<script>alert(1)</script>', status: 403, size: 89, threat: 'XSS' },
      { time: '14:10:20', method: 'GET', path: '/page?id=1"><img onerror=alert(1)>', status: 403, size: 89, threat: 'XSS' },
      { time: '14:10:15', method: 'GET', path: '/api/v1/products', status: 200, size: 3456, threat: null },
      { time: '14:10:10', method: 'POST', path: '/comment', status: 403, size: 102, threat: 'XSS' },
      { time: '14:10:05', method: 'GET', path: '/about', status: 200, size: 2345, threat: null },
      { time: '14:10:00', method: 'GET', path: '/api/v2/items', status: 200, size: 4567, threat: null },
      { time: '14:09:55', method: 'GET', path: '/api/v1/users', status: 200, size: 789, threat: null },
    ],
  },
  {
    ip: '103.75.201.18', country: '越南', totalRequests: 24, threats: 18,
    requests: [
      { time: '14:08:00', method: 'GET', path: '/cgi-bin/test.cgi', status: 403, size: 67, threat: 'RCE' },
      { time: '14:07:55', method: 'GET', path: '/cgi-bin/test.cgi;ls', status: 403, size: 67, threat: 'RCE' },
      { time: '14:07:50', method: 'POST', path: '/shell.php?cmd=whoami', status: 403, size: 89, threat: 'RCE' },
      { time: '14:07:45', method: 'GET', path: '/shell.php?cmd=cat+/etc/passwd', status: 403, size: 89, threat: 'RCE' },
      { time: '14:07:40', method: 'POST', path: '/api/exec', status: 403, size: 67, threat: 'RCE' },
      { time: '14:07:35', method: 'GET', path: '/admin/', status: 401, size: 45, threat: null },
    ],
  },
  {
    ip: '162.247.74.202', country: '美国', totalRequests: 18, threats: 8,
    requests: [
      { time: '14:06:00', method: 'GET', path: '/uploads/img.php', status: 403, size: 89, threat: 'Webshell' },
      { time: '14:05:55', method: 'POST', path: '/upload.php', status: 403, size: 89, threat: 'Webshell' },
      { time: '14:05:50', method: 'GET', path: '/images/logo.png', status: 200, size: 12345, threat: null },
      { time: '14:05:45', method: 'GET', path: '/', status: 200, size: 5678, threat: null },
      { time: '14:05:40', method: 'GET', path: '/uploads/', status: 301, size: 0, threat: null },
    ],
  },
  {
    ip: '194.163.137.89', country: '法国', totalRequests: 12, threats: 5,
    requests: [
      { time: '14:04:00', method: 'GET', path: '/wp-admin/', status: 301, size: 0, threat: '扫描探测' },
      { time: '14:03:55', method: 'GET', path: '/phpmyadmin/', status: 404, size: 0, threat: '扫描探测' },
      { time: '14:03:50', method: 'GET', path: '/.git/HEAD', status: 404, size: 0, threat: '扫描探测' },
      { time: '14:03:45', method: 'GET', path: '/admin/', status: 401, size: 45, threat: null },
    ],
  },
]

const methodColors: Record<string, string> = {
  GET: '#00d4ff', POST: '#00ff88', PUT: '#ffd000', DELETE: '#ff0050', HEAD: '#94a3b8', OPTIONS: '#94a3b8',
}

const statusColor = (s: number) => {
  if (s >= 200 && s < 300) return '#00ff88'
  if (s >= 300 && s < 400) return '#00d4ff'
  if (s >= 400 && s < 500) return '#ffd000'
  return '#ff0050'
}

export default function SessionPage() {
  const [searchIp, setSearchIp] = useState('')
  const [selectedIp, setSelectedIp] = useState<SessionIP | null>(null)

  const filteredIPs = searchIp
    ? mockSessions.filter(s => s.ip.includes(searchIp))
    : mockSessions

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-cyber-blue glow-blue flex items-center gap-2">
          <Link2 size={20} /> 会话追踪
        </h2>
      </div>

      {/* Search */}
      <div className="cyber-border rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Search size={14} className="text-gray-500" />
          <input
            value={searchIp}
            onChange={e => { setSearchIp(e.target.value); setSelectedIp(null) }}
            placeholder="输入 IP 地址搜索会话..."
            className="shield-input flex-1"
          />
          {selectedIp && (
            <button onClick={() => setSelectedIp(null)} className="shield-btn text-xs">清除选择</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* IP List */}
        <div className="cyber-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">IP 列表</h3>
          <div className="space-y-2 overflow-auto max-h-[500px]">
            {filteredIPs.map(s => (
              <div
                key={s.ip}
                onClick={() => setSelectedIp(s)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-all ${
                  selectedIp?.ip === s.ip
                    ? 'bg-cyber-blue/10 border border-cyber-blue/30'
                    : 'bg-dark-900/50 hover:bg-dark-700/30'
                }`}
              >
                <div>
                  <div className="text-xs font-mono text-cyber-blue">{s.ip}</div>
                  <div className="text-[11px] text-gray-600">{s.country} · {s.totalRequests} 次请求</div>
                </div>
                {s.threats > 0 && (
                  <span className="text-xs font-mono text-cyber-red">{s.threats} 威胁</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-3 cyber-border rounded-lg p-4">
          {selectedIp ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Clock size={14} /> 请求时间线 — {selectedIp.ip}
                </h3>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-gray-500">共 {selectedIp.totalRequests} 次请求</span>
                  <span className="text-cyber-red">{selectedIp.threats} 威胁</span>
                </div>
              </div>

              <div className="relative space-y-0">
                {selectedIp.requests.map((req, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center mt-1">
                      <div
                        className="w-2.5 h-2.5 rounded-full border-2"
                        style={{
                          borderColor: req.threat ? '#ff0050' : '#1e293b',
                          background: req.threat ? 'rgba(255,0,80,0.3)' : 'transparent',
                        }}
                      />
                      {i < selectedIp.requests.length - 1 && (
                        <div className={`w-px h-8 ${req.threat ? 'bg-cyber-red/30' : 'bg-gray-800'}`} />
                      )}
                    </div>

                    {/* Request card */}
                    <div className={`flex-1 rounded-lg px-3 py-2 mb-1 transition-all ${
                      req.threat ? 'bg-cyber-red/5 border border-cyber-red/10' : 'bg-dark-900/30'
                    }`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] text-gray-600">{req.time}</span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono"
                          style={{ background: `${methodColors[req.method]}15`, color: methodColors[req.method] }}
                        >
                          {req.method}
                        </span>
                        <span className="font-mono text-xs text-gray-300 truncate max-w-[300px]">{req.path}</span>
                        <span className="font-mono text-[11px]" style={{ color: statusColor(req.status) }}>
                          {req.status}
                        </span>
                        <span className="text-[11px] text-gray-600">{req.size}B</span>
                        {req.threat && (
                          <span className="flex items-center gap-1 text-[10px] text-cyber-red ml-auto">
                            <AlertTriangle size={10} /> {req.threat}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-gray-600">
              <Link2 size={40} className="mb-3 opacity-30" />
              <p className="text-sm">选择一个 IP 查看会话详情</p>
              <p className="text-xs mt-1">或输入 IP 地址进行搜索</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
