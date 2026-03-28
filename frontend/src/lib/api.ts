const API_BASE = '/api/v1'

export const api = {
  // 日志
  uploadLogs: (files: FileList) => {
    const fd = new FormData()
    Array.from(files).forEach(f => fd.append('files', f))
    return fetch(`${API_BASE}/logs/upload`, { method: 'POST', body: fd })
  },
  parseLogs: (sessionId: string, filename: string) =>
    fetch(`${API_BASE}/logs/parse?session_id=${sessionId}&filename=${filename}`, { method: 'POST' }),
  pasteLogs: (content: string, filename = 'pasted.log') => {
    const fd = new FormData()
    fd.append('content', content)
    fd.append('filename', filename)
    return fetch(`${API_BASE}/logs/paste`, { method: 'POST', body: fd })
  },
  getStats: () => fetch(`${API_BASE}/logs/stats`).then(r => r.json()),
  getEntries: (sessionId: string, page = 1, pageSize = 50, threatOnly = false) =>
    fetch(`${API_BASE}/logs/entries?session_id=${sessionId}&page=${page}&page_size=${pageSize}&threat_only=${threatOnly}`).then(r => r.json()),

  // 威胁
  getThreatSummary: (sessionId?: string) =>
    fetch(`${API_BASE}/threats/summary${sessionId ? `?session_id=${sessionId}` : ''}`).then(r => r.json()),
  getThreatList: (sessionId: string, page = 1, pageSize = 50) =>
    fetch(`${API_BASE}/threats/list?session_id=${sessionId}&page=${page}&page_size=${pageSize}`).then(r => r.json()),

  // 仪表盘
  getOverview: (sessionId?: string) =>
    fetch(`${API_BASE}/dashboard/overview${sessionId ? `?session_id=${sessionId}` : ''}`).then(r => r.json()),
  getTimeline: (sessionId: string) =>
    fetch(`${API_BASE}/dashboard/timeline?session_id=${sessionId}`).then(r => r.json()),
  getTopIps: (sessionId: string) =>
    fetch(`${API_BASE}/dashboard/top-ips?session_id=${sessionId}`).then(r => r.json()),
  getTopPaths: (sessionId: string) =>
    fetch(`${API_BASE}/dashboard/top-paths?session_id=${sessionId}`).then(r => r.json()),
  getStatusCodes: (sessionId: string) =>
    fetch(`${API_BASE}/dashboard/status-codes?session_id=${sessionId}`).then(r => r.json()),

  // 地理
  getAttackMap: (sessionId: string) =>
    fetch(`${API_BASE}/geo/attack-map?session_id=${sessionId}`).then(r => r.json()),
  getIpDetail: (ip: string) =>
    fetch(`${API_BASE}/geo/ip/${ip}`).then(r => r.json()),

  // 规则
  getRules: () => fetch(`${API_BASE}/rules`).then(r => r.json()),
  addRule: (rule: Record<string, string>) =>
    fetch(`${API_BASE}/rules`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rule) }).then(r => r.json()),
  deleteRule: (id: number) =>
    fetch(`${API_BASE}/rules/${id}`, { method: 'DELETE' }).then(r => r.json()),

  // AI
  analyze: (sessionId: string, type = 'threats') =>
    fetch(`${API_BASE}/ai/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sessionId, analysis_type: type }) }).then(r => r.json()),
}
