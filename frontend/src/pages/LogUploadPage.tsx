import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, ClipboardPaste, CheckCircle2, AlertCircle, ChevronRight, Loader2 } from 'lucide-react'
import { api } from '../lib/api'

type ParseFormat = 'auto' | 'nginx' | 'apache' | 'iis' | 'json'

interface ParseResult {
  totalLines: number
  successLines: number
  failedLines: number
  duration: string
  threats: number
  sessionId: string
}

export default function LogUploadPage() {
  const navigate = useNavigate()
  const [format, setFormat] = useState<ParseFormat>('auto')
  const [pastedText, setPastedText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ParseResult | null>(null)
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload')
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = Array.from(e.dataTransfer.files).filter(f =>
      /\.(log|txt|json)$/i.test(f.name)
    )
    setFiles(prev => [...prev, ...dropped])
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const handleParse = async () => {
    setParsing(true)
    setProgress(0)
    setResult(null)
    setError(null)

    try {
      let sessionId: string | null = null

      if (activeTab === 'upload' && files.length > 0) {
        // Upload files
        const fd = new FormData()
        files.forEach(f => fd.append('files', f))
        const uploadRes = await fetch('/api/v1/logs/upload', { method: 'POST', body: fd })
        const uploadData = await uploadRes.json()
        if (uploadData.sessions?.[0]) {
          sessionId = uploadData.sessions[0].session_id
          // Parse the uploaded file
          const parseRes = await fetch(`/api/v1/logs/parse?session_id=${sessionId}&filename=${files[0].name}`, { method: 'POST' })
          const parseData = await parseRes.json()
          sessionId = parseData.session_id
          setProgress(100)
          setResult({
            totalLines: parseData.total_lines,
            successLines: parseData.parsed_lines,
            failedLines: parseData.failed_lines,
            duration: `${parseData.parse_time_ms}ms`,
            threats: parseData.threat_count,
            sessionId: sessionId,
          })
        }
      } else if (activeTab === 'paste' && pastedText.trim()) {
        // Paste parse
        const res = await api.pasteLogs(pastedText)
        const data = await res.json()
        sessionId = data.session_id
        setProgress(100)
        setResult({
          totalLines: data.total_lines,
          successLines: data.parsed_lines,
          failedLines: data.failed_lines,
          duration: `${data.parse_time_ms}ms`,
          threats: data.threat_count,
          sessionId: sessionId,
        })
      }

      if (!sessionId) throw new Error('解析失败')
    } catch (e: any) {
      setError(e.message || '解析失败，请检查日志格式')
    } finally {
      setParsing(false)
    }
  }

  const formats: { value: ParseFormat; label: string }[] = [
    { value: 'auto', label: '自动检测' },
    { value: 'nginx', label: 'Nginx' },
    { value: 'apache', label: 'Apache' },
    { value: 'iis', label: 'IIS' },
    { value: 'json', label: 'JSON' },
  ]

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-cyber-blue glow-blue flex items-center gap-2">
          <Upload size={20} /> 日志上传与分析
        </h2>
      </div>

      {/* Tab Switch */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
            activeTab === 'upload'
              ? 'bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/30'
              : 'text-gray-400 hover:text-gray-200 border border-transparent'
          }`}
        >
          <FileText size={16} /> 文件上传
        </button>
        <button
          onClick={() => setActiveTab('paste')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
            activeTab === 'paste'
              ? 'bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/30'
              : 'text-gray-400 hover:text-gray-200 border border-transparent'
          }`}
        >
          <ClipboardPaste size={16} /> 粘贴日志
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-4">
          {activeTab === 'upload' ? (
            <div className="cyber-border rounded-lg p-6">
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-cyber-blue bg-cyber-blue/5'
                    : 'border-gray-700 hover:border-gray-500'
                }`}
              >
                <Upload size={40} className={`mx-auto mb-3 ${dragOver ? 'text-cyber-blue' : 'text-gray-600'}`} />
                <p className="text-sm text-gray-300">拖拽日志文件到此处，或点击选择文件</p>
                <p className="text-xs text-gray-600 mt-1">支持 .log / .txt / .json 格式</p>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept=".log,.txt,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between bg-dark-900/50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-cyber-blue" />
                        <span className="text-xs font-mono text-gray-300">{f.name}</span>
                        <span className="text-xs text-gray-600">{(f.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <button onClick={() => removeFile(i)} className="text-gray-500 hover:text-cyber-red text-xs">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="cyber-border rounded-lg p-4">
              <textarea
                value={pastedText}
                onChange={e => setPastedText(e.target.value)}
                placeholder="在此粘贴日志内容...&#10;&#10;示例：&#10;192.168.1.1 - - [28/Mar/2026:14:00:00 +0800] &quot;GET /api/users HTTP/1.1&quot; 200 1234"
                className="w-full h-64 bg-dark-900/50 border border-gray-700 rounded-lg p-3 text-xs font-mono text-gray-300 outline-none focus:border-cyber-blue/50 resize-none"
              />
            </div>
          )}

          {/* Parse Config */}
          <div className="cyber-border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">⚙️ 解析配置</h3>
            <div className="flex flex-wrap gap-2">
              {formats.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  className={`px-3 py-1.5 rounded text-xs transition-all ${
                    format === f.value
                      ? 'bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/30'
                      : 'bg-dark-900/50 text-gray-400 border border-gray-700 hover:border-gray-500'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Parse Button */}
            <button
              onClick={handleParse}
              disabled={parsing || (activeTab === 'upload' ? files.length === 0 : !pastedText)}
              className="shield-btn-green mt-4 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {parsing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              {parsing ? '解析中...' : '开始解析'}
            </button>

            {/* Progress */}
            {parsing && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>解析进度</span>
                  <span className="font-mono">{Math.round(progress)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Result Stats */}
          {result ? (
            <div className="cyber-border rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-cyber-green" /> 解析结果
              </h3>
              {[
                { label: '总行数', value: result.totalLines.toLocaleString(), color: '#00d4ff' },
                { label: '成功解析', value: result.successLines.toLocaleString(), color: '#00ff88' },
                { label: '解析失败', value: result.failedLines.toLocaleString(), color: '#ff8800' },
                { label: '威胁检出', value: result.threats.toLocaleString(), color: '#ff0050' },
                { label: '耗时', value: result.duration, color: '#b026ff' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{item.label}</span>
                  <span className="text-sm font-mono font-bold" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
              <button className="shield-btn w-full mt-2 flex items-center justify-center gap-2"
                onClick={() => navigate('/threats')}>
                查看威胁分析 <ChevronRight size={14} />
              </button>
            </div>
          ) : (
            <div className="cyber-border rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <AlertCircle size={14} /> 解析结果
              </h3>
              <p className="text-xs text-gray-600">上传或粘贴日志后点击"开始解析"查看分析结果</p>
              {error && <p className="text-xs text-cyber-red mt-2">{error}</p>}
            </div>
          )}

          {/* Tips */}
          <div className="cyber-border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">💡 使用提示</h3>
            <ul className="space-y-2 text-xs text-gray-500">
              <li className="flex items-start gap-2"><span className="text-cyber-blue">•</span> 支持批量上传多个日志文件</li>
              <li className="flex items-start gap-2"><span className="text-cyber-blue">•</span> 粘贴模式支持直接粘贴原始日志</li>
              <li className="flex items-start gap-2"><span className="text-cyber-blue">•</span> 自动检测模式可识别主流日志格式</li>
              <li className="flex items-start gap-2"><span className="text-cyber-blue">•</span> 解析完成后可进入威胁检测页面</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
