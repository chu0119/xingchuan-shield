// Mock data for dashboard demo

export const mockOverview = {
  total_entries: 128456,
  total_threats: 1847,
  critical: 89,
  high: 312,
  medium: 892,
  low: 554,
  unique_ips: 3842,
  unique_paths: 1256,
}

export const mockTimeline = {
  '2026-03-28T00': 452, '2026-03-28T01': 389, '2026-03-28T02': 278,
  '2026-03-28T03': 156, '2026-03-28T04': 98, '2026-03-28T05': 134,
  '2026-03-28T06': 267, '2026-03-28T07': 445, '2026-03-28T08': 678,
  '2026-03-28T09': 892, '2026-03-28T10': 1023, '2026-03-28T11': 1156,
  '2026-03-28T12': 1345, '2026-03-28T13': 1234, '2026-03-28T14': 1089,
  '2026-03-28T15': 956, '2026-03-28T16': 867, '2026-03-28T17': 745,
  '2026-03-28T18': 634, '2026-03-28T19': 523, '2026-03-28T20': 456,
  '2026-03-28T21': 389, '2026-03-28T22': 312, '2026-03-28T23': 234,
}

export const mockThreatByType = [
  { name: 'SQL注入', value: 456, color: '#ff0050' },
  { name: 'XSS攻击', value: 312, color: '#ff8800' },
  { name: 'RCE', value: 89, color: '#ff0050' },
  { name: '路径遍历', value: 234, color: '#ffd000' },
  { name: '扫描探测', value: 389, color: '#00d4ff' },
  { name: 'Webshell', value: 67, color: '#b026ff' },
  { name: '漏洞利用', value: 178, color: '#ff8800' },
  { name: '暴力破解', value: 122, color: '#ffd000' },
]

export const mockTopIps = [
  { ip: '185.220.101.34', country: '俄罗斯', count: 234, level: 'critical' },
  { ip: '45.134.26.97', country: '荷兰', count: 189, level: 'high' },
  { ip: '103.75.201.18', country: '越南', count: 156, level: 'critical' },
  { ip: '91.240.118.172', country: '乌克兰', count: 134, level: 'high' },
  { ip: '194.163.137.89', country: '法国', count: 112, level: 'medium' },
  { ip: '5.188.86.17', country: '俄罗斯', count: 98, level: 'high' },
  { ip: '162.247.74.202', country: '美国', count: 87, level: 'medium' },
  { ip: '212.21.66.6', country: '德国', count: 76, level: 'low' },
  { ip: '171.25.193.77', country: '瑞典', count: 65, level: 'medium' },
  { ip: '103.152.220.23', country: '印度', count: 54, level: 'low' },
]

export const mockTopPaths = [
  { path: '/wp-admin/login.php', count: 456, threats: 89 },
  { path: '/api/v1/users', count: 345, threats: 67 },
  { path: '/cgi-bin/test.cgi', count: 234, threats: 56 },
  { path: '/.env', count: 198, threats: 45 },
  { path: '/wp-content/uploads/shell.php', count: 167, threats: 34 },
  { path: '/admin/config', count: 145, threats: 28 },
  { path: '/phpmyadmin/', count: 134, threats: 23 },
  { path: '/actuator/health', count: 112, threats: 19 },
  { path: '/api/graphql', count: 98, threats: 17 },
  { path: '/solr/admin/cores', count: 87, threats: 15 },
]

export const mockRecentThreats = [
  { id: 1, time: '2026-03-28 14:12:45', ip: '185.220.101.34', type: 'SQL注入', level: 'critical', path: '/api/v1/users?id=1%20OR%201=1', detail: '检测到经典 SQL 注入攻击模式 OR 1=1' },
  { id: 2, time: '2026-03-28 14:12:32', ip: '45.134.26.97', type: 'XSS攻击', level: 'high', path: '/search?q=<script>alert(1)</script>', detail: 'Reflected XSS 攻击，尝试注入恶意脚本' },
  { id: 3, time: '2026-03-28 14:12:18', ip: '103.75.201.18', type: 'RCE', level: 'critical', path: '/cgi-bin/test.cgi;ls', detail: '尝试通过 CGI 执行系统命令' },
  { id: 4, time: '2026-03-28 14:11:56', ip: '91.240.118.172', type: '路径遍历', level: 'medium', path: '/files/../../../etc/passwd', detail: '目录遍历攻击，尝试读取系统文件' },
  { id: 5, time: '2026-03-28 14:11:34', ip: '194.163.137.89', type: '扫描探测', level: 'medium', path: '/wp-admin/', detail: 'WordPress 管理后台扫描' },
  { id: 6, time: '2026-03-28 14:11:12', ip: '5.188.86.17', type: 'SQL注入', level: 'high', path: '/login?user=admin\'--', detail: '登录页面 SQL 注入尝试' },
  { id: 7, time: '2026-03-28 14:10:58', ip: '162.247.74.202', type: 'Webshell', level: 'critical', path: '/uploads/img.php', detail: '疑似 Webshell 文件访问' },
  { id: 8, time: '2026-03-28 14:10:45', ip: '212.21.66.6', type: '暴力破解', level: 'low', path: '/api/auth/login', detail: '连续 15 次登录失败' },
  { id: 9, time: '2026-03-28 14:10:23', ip: '171.25.193.77', type: '漏洞利用', level: 'high', path: '/solr/admin/cores', detail: 'Apache Solr 未授权访问尝试' },
  { id: 10, time: '2026-03-28 14:10:01', ip: '103.152.220.23', type: '扫描探测', level: 'low', path: '/.env', detail: '敏感文件探测' },
]

export const mockAttackMap = [
  { ip: '185.220.101.34', lat: 55.75, lon: 37.62, country: '俄罗斯', city: '莫斯科', count: 234 },
  { ip: '45.134.26.97', lat: 52.37, lon: 4.9, country: '荷兰', city: '阿姆斯特丹', count: 189 },
  { ip: '103.75.201.18', lat: 21.03, lon: 105.85, country: '越南', city: '河内', count: 156 },
  { ip: '91.240.118.172', lat: 50.45, lon: 30.52, country: '乌克兰', city: '基辅', count: 134 },
  { ip: '194.163.137.89', lat: 48.86, lon: 2.35, country: '法国', city: '巴黎', count: 112 },
  { ip: '5.188.86.17', lat: 55.75, lon: 37.62, country: '俄罗斯', city: '圣彼得堡', count: 98 },
  { ip: '162.247.74.202', lat: 37.77, lon: -122.42, country: '美国', city: '旧金山', count: 87 },
  { ip: '212.21.66.6', lat: 52.52, lon: 13.41, country: '德国', city: '柏林', count: 76 },
  { ip: '171.25.193.77', lat: 59.33, lon: 18.07, country: '瑞典', city: '斯德哥尔摩', count: 65 },
  { ip: '103.152.220.23', lat: 28.61, lon: 77.21, country: '印度', city: '新德里', count: 54 },
  { ip: '36.92.36.234', lat: -6.2, lon: 106.85, country: '印尼', city: '雅加达', count: 45 },
  { ip: '154.89.5.78', lat: 31.23, lon: 121.47, country: '中国', city: '上海', count: 38 },
  { ip: '177.54.150.200', lat: -23.55, lon: -46.63, country: '巴西', city: '圣保罗', count: 32 },
  { ip: '41.33.178.45', lat: 30.04, lon: 31.24, country: '埃及', city: '开罗', count: 28 },
  { ip: '196.188.120.34', lat: -1.29, lon: 36.82, country: '肯尼亚', city: '内罗毕', count: 22 },
]

export const mockPathTree = [
  { path: '/', visits: 15234, threats: 12, children: [
    { path: '/api', visits: 8923, threats: 345, children: [
      { path: '/api/v1', visits: 5678, threats: 234, children: [
        { path: '/api/v1/users', visits: 2345, threats: 67, children: [] },
        { path: '/api/v1/auth', visits: 1890, threats: 45, children: [] },
        { path: '/api/v1/search', visits: 1443, threats: 122, children: [] },
      ]},
      { path: '/api/graphql', visits: 3245, threats: 111, children: [] },
    ]},
    { path: '/wp-admin', visits: 2345, threats: 89, children: [
      { path: '/wp-admin/login.php', visits: 1456, threats: 56, children: [] },
      { path: '/wp-admin/ajax.php', visits: 889, threats: 33, children: [] },
    ]},
    { path: '/uploads', visits: 1876, threats: 78, children: [
      { path: '/uploads/images', visits: 1234, threats: 12, children: [] },
      { path: '/uploads/shell.php', visits: 642, threats: 66, children: [] },
    ]},
    { path: '/cgi-bin', visits: 567, threats: 156, children: [
      { path: '/cgi-bin/test.cgi', visits: 345, threats: 134, children: [] },
    ]},
    { path: '/.env', visits: 234, threats: 234, children: [] },
    { path: '/phpmyadmin', visits: 198, threats: 23, children: [] },
  ]},
]

export const mockSessionRequests = [
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
]

export const mockStatusCodes = [
  { code: '200', count: 98456, color: '#00ff88' },
  { code: '301', count: 5678, color: '#00d4ff' },
  { code: '302', count: 3456, color: '#00d4ff' },
  { code: '403', count: 8934, color: '#ffd000' },
  { code: '404', count: 7823, color: '#ff8800' },
  { code: '500', count: 1234, color: '#ff0050' },
  { code: '502', count: 456, color: '#ff0050' },
  { code: '503', count: 123, color: '#ff0050' },
]

export const mockHttpMethods = [
  { method: 'GET', count: 89234 },
  { method: 'POST', count: 23456 },
  { method: 'PUT', count: 3456 },
  { method: 'DELETE', count: 1234 },
  { method: 'HEAD', count: 5678 },
  { method: 'OPTIONS', count: 4567 },
]

export const mockUserAgents = [
  { ua: 'Mozilla/5.0 (compatible; Googlebot/2.1)', count: 4523 },
  { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', count: 3456 },
  { ua: 'python-requests/2.28.0', count: 2345 },
  { ua: 'curl/7.88.1', count: 1890 },
  { ua: 'Mozilla/5.0 (Linux; Android 13)', count: 1567 },
  { ua: 'nikto/2.1.6', count: 1234 },
  { ua: 'sqlmap/1.7.8', count: 987 },
  { ua: 'dirbuster/1.0', count: 654 },
]

export const mockRules = [
  { id: 1, name: 'SQL 注入 - OR 1=1', category: 'sql_injection', level: 'critical', pattern: "' OR 1=1--", description: '经典 SQL 注入', enabled: true },
  { id: 2, name: 'XSS - Script 标签', category: 'xss', level: 'critical', pattern: '<script>', description: 'Script 标签注入', enabled: true },
  { id: 3, name: 'RCE - 命令执行', category: 'rce', level: 'critical', pattern: '; ls', description: '分号后接系统命令', enabled: true },
  { id: 4, name: '路径遍历 - ../', category: 'path_traversal', level: 'high', pattern: '../', description: '目录遍历', enabled: true },
  { id: 5, name: 'Webshell 检测', category: 'webshell', level: 'critical', pattern: 'eval($_POST', description: 'PHP Webshell', enabled: true },
  { id: 6, name: '扫描器 - Nikto', category: 'scanner', level: 'medium', pattern: 'nikto', description: 'Nikto 扫描器', enabled: false },
  { id: 7, name: '漏洞利用 - Log4j', category: 'vuln_exploit', level: 'critical', pattern: '${jndi:', description: 'Log4Shell 漏洞', enabled: true },
  { id: 8, name: '暴力破解检测', category: 'brute_force', level: 'medium', pattern: 'LOGIN_FAILED', description: '连续登录失败', enabled: true },
]
