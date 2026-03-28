import { useState } from 'react'
import { GitBranch, ChevronDown, ChevronRight, AlertTriangle, Eye } from 'lucide-react'

interface PathNode {
  path: string
  visits: number
  threats: number
  children: PathNode[]
}

const mockTree: PathNode = {
  path: '/', visits: 15234, threats: 12, children: [
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
  ],
}

function getThreatLevel(node: PathNode): string {
  if (node.threats / node.visits > 0.5) return 'critical'
  if (node.threats / node.visits > 0.2) return 'high'
  if (node.threats / node.visits > 0.05) return 'medium'
  return 'low'
}

const levelColorMap: Record<string, string> = { critical: '#ff0050', high: '#ff8800', medium: '#ffd000', low: '#00d4ff' }

function TreeNode({ node, depth = 0 }: { node: PathNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 1)
  const hasChildren = node.children.length > 0
  const level = getThreatLevel(node)
  const color = levelColorMap[level]

  return (
    <div>
      <div
        className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-dark-700/30 transition-colors group"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        {/* Expand toggle */}
        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="text-gray-600 hover:text-gray-300">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-3.5" />
        )}

        {/* Connector line */}
        {depth > 0 && (
          <span className="text-gray-700 text-xs">├─</span>
        )}

        {/* Path */}
        <span className="font-mono text-xs text-gray-300 flex-1 truncate" style={{ color }}>
          {node.path}
        </span>

        {/* Threat indicator */}
        {node.threats > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-gray-500">
            <AlertTriangle size={10} style={{ color }} />
            <span className="font-mono">{node.threats}</span>
          </span>
        )}

        {/* Visits */}
        <span className="flex items-center gap-1 text-[10px] text-gray-600">
          <Eye size={10} />
          <span className="font-mono">{node.visits.toLocaleString()}</span>
        </span>

        {/* Level badge */}
        <span className={`badge-${level} px-1.5 py-0.5 rounded text-[10px]`}>{level}</span>
      </div>

      {expanded && hasChildren && (
        <div>
          {node.children.map(child => (
            <TreeNode key={child.path} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function flattenTree(node: PathNode): PathNode[] {
  const result = [node]
  for (const child of node.children) {
    result.push(...flattenTree(child))
  }
  return result
}

export default function PathTreePage() {
  const allNodes = flattenTree(mockTree)
  const totalVisits = allNodes.reduce((s, n) => s + n.visits, 0)
  const totalThreats = allNodes.reduce((s, n) => s + n.threats, 0)
  const criticalPaths = allNodes.filter(n => getThreatLevel(n) === 'critical').length

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-cyber-blue glow-blue flex items-center gap-2">
          <GitBranch size={20} /> 路径分析
        </h2>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="cyber-border rounded-lg p-3">
          <p className="text-xs text-gray-500">总路径数</p>
          <p className="text-lg font-bold font-mono text-cyber-blue">{allNodes.length}</p>
        </div>
        <div className="cyber-border rounded-lg p-3">
          <p className="text-xs text-gray-500">总访问量</p>
          <p className="text-lg font-bold font-mono text-cyber-green">{totalVisits.toLocaleString()}</p>
        </div>
        <div className="cyber-border rounded-lg p-3">
          <p className="text-xs text-gray-500">威胁路径</p>
          <p className="text-lg font-bold font-mono text-cyber-red">{totalThreats.toLocaleString()}</p>
        </div>
        <div className="cyber-border rounded-lg p-3">
          <p className="text-xs text-gray-500">高危路径</p>
          <p className="text-lg font-bold font-mono text-cyber-orange">{criticalPaths}</p>
        </div>
      </div>

      {/* Tree */}
      <div className="cyber-border rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
          <GitBranch size={14} /> URL 路径树
        </h3>
        <div className="overflow-auto max-h-[500px]">
          {mockTree.children.map(node => (
            <TreeNode key={node.path} node={node} depth={0} />
          ))}
        </div>
      </div>
    </div>
  )
}
