import { useState } from 'react'
import { Settings, Shield, Regex, Brain, Info, Save, TestTube, ToggleLeft, ToggleRight } from 'lucide-react'

interface Rule {
  id: number
  name: string
  category: string
  level: string
  pattern: string
  description: string
  enabled: boolean
}

const mockRules: Rule[] = [
  { id: 1, name: 'SQL 注入 - OR 1=1', category: 'SQL 注入', level: 'critical', pattern: "' OR 1=1--", description: '经典 SQL 注入', enabled: true },
  { id: 2, name: 'SQL 注入 - UNION', category: 'SQL 注入', level: 'critical', pattern: 'UNION SELECT', description: 'UNION 查询注入', enabled: true },
  { id: 3, name: 'SQL 注入 - 注释绕过', category: 'SQL 注入', level: 'high', pattern: "'--", description: '注释符绕过', enabled: true },
  { id: 4, name: 'XSS - Script 标签', category: 'XSS 攻击', level: 'critical', pattern: '<script>', description: 'Script 标签注入', enabled: true },
  { id: 5, name: 'XSS - 事件属性', category: 'XSS 攻击', level: 'high', pattern: 'onerror=', description: '事件处理器注入', enabled: true },
  { id: 6, name: 'XSS - SVG', category: 'XSS 攻击', level: 'medium', pattern: '<svg', description: 'SVG 标签注入', enabled: true },
  { id: 7, name: 'RCE - 命令执行', category: '远程代码执行', level: 'critical', pattern: '; ls', description: '分号后接系统命令', enabled: true },
  { id: 8, name: 'RCE - 管道', category: '远程代码执行', level: 'critical', pattern: '| nc ', description: '管道到网络连接', enabled: true },
  { id: 9, name: '路径遍历 - ../', category: '路径穿越', level: 'high', pattern: '../', description: '目录遍历', enabled: true },
  { id: 10, name: '路径遍历 - 编码', category: '路径穿越', level: 'high', pattern: '%2e%2e', description: 'URL 编码绕过', enabled: true },
  { id: 11, name: 'Webshell - PHP', category: 'WebShell', level: 'critical', pattern: 'eval($_POST', description: 'PHP Webshell', enabled: true },
  { id: 12, name: 'Webshell - 上传', category: 'WebShell', level: 'high', pattern: '.phtml', description: '可疑文件上传', enabled: true },
  { id: 13, name: '扫描器 - Nikto', category: '扫描探测', level: 'medium', pattern: 'nikto', description: 'Nikto 扫描器', enabled: false },
  { id: 14, name: '扫描器 - sqlmap', category: '扫描探测', level: 'medium', pattern: 'sqlmap', description: 'sqlmap 工具', enabled: false },
  { id: 15, name: '漏洞利用 - Log4j', category: '漏洞利用', level: 'critical', pattern: '${jndi:', description: 'Log4Shell 漏洞', enabled: true },
  { id: 16, name: '漏洞利用 - Spring Actuator', category: '漏洞利用', level: 'high', pattern: '/actuator/', description: 'Spring 未授权访问', enabled: true },
  { id: 17, name: '暴力破解检测', category: '暴力破解', level: 'medium', pattern: 'LOGIN_FAILED', description: '连续登录失败', enabled: true },
]

const categories = [...new Set(mockRules.map(r => r.category))]

export default function SettingsPage() {
  const [rules, setRules] = useState(mockRules)
  const [regexInput, setRegexInput] = useState('')
  const [testInput, setTestInput] = useState('')
  const [regexResult, setRegexResult] = useState<{ match: boolean; groups?: string[] } | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('glm-5-turbo')
  const [activeTab, setActiveTab] = useState<'rules' | 'regex' | 'ai' | 'about'>('rules')

  const toggleRule = (id: number) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
  }

  const testRegex = () => {
    try {
      const re = new RegExp(regexInput)
      const match = testInput.match(re)
      setRegexResult({ match: !!match, groups: match ? Array.from(match) : undefined })
    } catch {
      setRegexResult({ match: false })
    }
  }

  const enabledCount = rules.filter(r => r.enabled).length

  const tabs = [
    { id: 'rules' as const, label: '检测规则', icon: Shield },
    { id: 'regex' as const, label: '自定义规则', icon: Regex },
    { id: 'ai' as const, label: 'AI 配置', icon: Brain },
    { id: 'about' as const, label: '关于', icon: Info },
  ]

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-cyber-blue glow-blue flex items-center gap-2">
          <Settings size={20} /> 设置
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
              activeTab === t.id
                ? 'bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/30'
                : 'text-gray-400 hover:text-gray-200 border border-transparent'
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Rules */}
      {activeTab === 'rules' && (
        <div className="cyber-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Shield size={14} /> 检测规则管理
            </h3>
            <span className="text-xs text-gray-500">已启用 {enabledCount}/{rules.length} 条规则</span>
          </div>
          <div className="space-y-4">
            {categories.map(cat => {
              const catRules = rules.filter(r => r.category === cat)
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-cyber-blue">{cat}</span>
                    <span className="text-[10px] text-gray-600">({catRules.length})</span>
                  </div>
                  <div className="space-y-1 ml-2">
                    {catRules.map(rule => (
                      <div
                        key={rule.id}
                        className="flex items-center justify-between bg-dark-900/50 rounded-lg px-3 py-2 group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button onClick={() => toggleRule(rule.id)} className="text-gray-400 hover:text-gray-200">
                            {rule.enabled ? (
                              <ToggleRight size={20} className="text-cyber-green" />
                            ) : (
                              <ToggleLeft size={20} className="text-gray-600" />
                            )}
                          </button>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-300">{rule.name}</span>
                              <span className={`badge-${rule.level} px-1.5 py-0.5 rounded text-[10px]`}>{rule.level}</span>
                            </div>
                            <div className="text-[11px] text-gray-600 mt-0.5">
                              {rule.description} · <code className="font-mono text-cyber-orange">{rule.pattern}</code>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Regex */}
      {activeTab === 'regex' && (
        <div className="cyber-border rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <Regex size={14} /> 自定义解析规则
          </h3>

          <div>
            <label className="text-xs text-gray-500 block mb-1">正则表达式</label>
            <input
              value={regexInput}
              onChange={e => setRegexInput(e.target.value)}
              placeholder={'例如: /(\\d+\\.\\d+\\.\\d+\\.\\d+).*?"(GET|POST)\\s+(\\S+)/'}
              className="shield-input w-full font-mono"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">测试文本</label>
            <textarea
              value={testInput}
              onChange={e => setTestInput(e.target.value)}
              placeholder="粘贴日志行进行测试..."
              className="w-full h-32 bg-dark-900/50 border border-gray-700 rounded-lg p-3 text-xs font-mono text-gray-300 outline-none focus:border-cyber-blue/50 resize-none"
            />
          </div>

          <button onClick={testRegex} className="shield-btn flex items-center gap-2">
            <TestTube size={14} /> 测试正则
          </button>

          {regexResult && (
            <div className={`rounded-lg p-3 ${regexResult.match ? 'bg-cyber-green/5 border border-cyber-green/20' : 'bg-cyber-red/5 border border-cyber-red/20'}`}>
              <span className={`text-xs ${regexResult.match ? 'text-cyber-green' : 'text-cyber-red'}`}>
                {regexResult.match ? '✅ 匹配成功' : '❌ 无匹配'}
              </span>
              {regexResult.groups && (
                <div className="mt-2 space-y-1">
                  {regexResult.groups.map((g, i) => (
                    <div key={i} className="text-xs font-mono text-gray-400">
                      <span className="text-gray-600">组 {i}:</span> {g}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button className="shield-btn-green flex items-center gap-2">
            <Save size={14} /> 保存规则
          </button>
        </div>
      )}

      {/* AI Config */}
      {activeTab === 'ai' && (
        <div className="cyber-border rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <Brain size={14} /> AI 分析配置
          </h3>

          <div>
            <label className="text-xs text-gray-500 block mb-1">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="输入 AI 服务 API Key..."
              className="shield-input w-full font-mono"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">模型选择</label>
            <select value={model} onChange={e => setModel(e.target.value)} className="shield-select w-full">
              <option value="glm-5-turbo">GLM-5 Turbo（推荐）</option>
              <option value="glm-5">GLM-5</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
            </select>
          </div>

          <button className="shield-btn-green flex items-center gap-2">
            <Save size={14} /> 保存配置
          </button>

          <div className="bg-dark-900/50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
            <p>💡 AI 功能说明：</p>
            <p>• 威胁分析：自动识别复杂攻击模式</p>
            <p>• 行为画像：生成攻击者行为报告</p>
            <p>• 风险评估：综合评估安全态势</p>
          </div>
        </div>
      )}

      {/* About */}
      {activeTab === 'about' && (
        <div className="cyber-border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyber-blue to-cyber-green flex items-center justify-center">
              <Shield size={32} className="text-dark-900" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gradient-blue">星川智盾</h3>
              <p className="text-xs text-gray-500">AI Log Analysis System</p>
              <p className="text-xs text-gray-600 mt-1">v1.0.0 · 2026</p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">版本</span>
              <span className="font-mono text-cyber-blue">1.0.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">作者</span>
              <span className="text-gray-300">星川</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">框架</span>
              <span className="text-gray-300">React + TypeScript + Tailwind CSS</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">后端</span>
              <span className="text-gray-300">Python FastAPI</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">AI 引擎</span>
              <span className="text-gray-300">GLM-5 Turbo</span>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4 text-xs text-gray-600 text-center">
            © 2026 星川智盾 · AI-Powered Threat Detection
          </div>
        </div>
      )}
    </div>
  )
}
