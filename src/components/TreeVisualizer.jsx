import React, { useCallback, useEffect } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  MarkerType,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from 'reactflow'
import { motion } from 'framer-motion'
import { Network } from 'lucide-react'

import 'reactflow/dist/style.css'

const HORIZONTAL_SPACING = 160
const VERTICAL_SPACING = 150

// Custom node component for Huffman tree nodes
const HuffmanNode = ({ data }) => {
  return (
    <div className="tree-node relative px-6 py-4 rounded-xl border-2 shadow-xl text-center min-w-[140px] transition-all duration-300 hover:scale-[1.03]">
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        style={{ background: '#94a3b8', border: 'none', width: 10, height: 10 }}
      />
      <div className="font-mono text-xl font-bold text-white mb-1">{data.label}</div>
      <div className="text-sm text-blue-50 font-semibold bg-black/25 rounded px-2 py-1">
        Freq: {data.frequency}
      </div>
      {data.meta && (
        <div className="mt-1 text-xs text-slate-200/80">
          {data.meta}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        style={{ background: '#94a3b8', border: 'none', width: 10, height: 10 }}
      />
    </div>
  )
}

const nodeTypes = {
  huffmanNode: HuffmanNode,
}

const sanitizeLabel = (symbol) => {
  if (symbol === undefined || symbol === null) return '•'
  if (typeof symbol === 'number') return `Byte ${symbol}`
  if (symbol === ' ') return 'Space'
  if (symbol === '\n') return 'LF'
  if (symbol === '\r') return 'CR'
  if (symbol === '\t') return 'Tab'
  if (symbol.length === 0) return 'ROOT'
  if (symbol.length === 1) return symbol
  if (symbol.length > 6) return symbol.slice(0, 6) + '…'
  return symbol
}

const buildTreeFromCodes = (codes, frequencies = {}) => {
  if (!codes || Object.keys(codes).length === 0) {
    return null
  }

  const entries = Object.entries(codes)
  const frequencyMap = frequencies || {}
  const root = {
    id: 'root',
    path: '',
    left: null,
    right: null,
    isLeaf: false,
    char: null,
    frequency: 0,
  }

  const getFrequency = (symbol) => {
    if (frequencyMap === null || frequencyMap === undefined) return 0

    const candidates = []

    if (symbol !== undefined && symbol !== null) {
      candidates.push(symbol)

      const asString = typeof symbol === 'string' ? symbol : String(symbol)
      if (!candidates.includes(asString)) {
        candidates.push(asString)
      }

      if (typeof symbol === 'string' && symbol.length === 1) {
        const ascii = symbol.charCodeAt(0)
        candidates.push(ascii)
        candidates.push(String(ascii))
      }

      const numeric = Number(symbol)
      if (!Number.isNaN(numeric)) {
        candidates.push(numeric)
        const asciiChar = String.fromCharCode(numeric)
        if (!candidates.includes(asciiChar)) {
          candidates.push(asciiChar)
        }
      }
    }

    for (const key of candidates) {
      if (Object.prototype.hasOwnProperty.call(frequencyMap, key)) {
        return frequencyMap[key]
      }
    }

    return 0
  }

  // Handle edge case: only one symbol produces empty code
  if (entries.length === 1 && entries[0][1].length === 0) {
    const [symbol] = entries[0]
    root.isLeaf = true
    root.char = symbol
    root.frequency = getFrequency(symbol)
    root.symbols = new Set([symbol])
    return root
  }

  const ensureChild = (node, bit) => {
    if (bit === '0') {
      if (!node.left) {
        const path = `${node.path}0`
        node.left = {
          id: `node-${path || '0'}`,
          path,
          left: null,
          right: null,
          isLeaf: false,
          char: null,
          frequency: 0,
        }
      }
      return node.left
    }

    if (!node.right) {
      const path = `${node.path}1`
      node.right = {
        id: `node-${path || '1'}`,
        path,
        left: null,
        right: null,
        isLeaf: false,
        char: null,
        frequency: 0,
      }
    }
    return node.right
  }

  entries.forEach(([symbol, code]) => {
    let current = root

    if (code.length === 0) {
      current.isLeaf = true
      current.char = symbol
      current.frequency = Math.max(1, getFrequency(symbol))
      current.symbols = new Set([symbol])
      return
    }

    for (let i = 0; i < code.length; i += 1) {
      const bit = code[i]
      current = ensureChild(current, bit)
    }

    current.isLeaf = true
    current.char = symbol
    current.frequency = Math.max(1, getFrequency(symbol))
    current.symbols = new Set([symbol])
  })

  const computeMetrics = (node) => {
    if (!node) {
      return { freq: 0, leaves: 0 }
    }

    if (node.isLeaf || (!node.left && !node.right)) {
      node.leafCount = 1
      if (!node.symbols) {
        node.symbols = new Set()
        if (node.char !== undefined && node.char !== null) {
          node.symbols.add(node.char)
        }
      }
      return { freq: node.frequency ?? 0, leaves: 1 }
    }

    const leftMetrics = computeMetrics(node.left)
    const rightMetrics = computeMetrics(node.right)

    node.frequency = (leftMetrics.freq ?? 0) + (rightMetrics.freq ?? 0)
    node.leafCount = Math.max(1, leftMetrics.leaves + rightMetrics.leaves)
    const symbols = new Set()
    if (node.left?.symbols) {
      node.left.symbols.forEach((s) => symbols.add(s))
    }
    if (node.right?.symbols) {
      node.right.symbols.forEach((s) => symbols.add(s))
    }
    node.symbols = symbols

    return { freq: node.frequency, leaves: node.leafCount }
  }

  computeMetrics(root)
  return root
}

const assignPositions = (node, depth, offsetUnits) => {
  if (!node) return

  const widthUnits = node.leafCount || 1
  const nodeCenterUnit = offsetUnits + (widthUnits - 1) / 2
  node.position = {
    x: nodeCenterUnit * HORIZONTAL_SPACING,
    y: depth * VERTICAL_SPACING,
  }

  if (node.left) {
    assignPositions(node.left, depth + 1, offsetUnits)
  }

  if (node.right) {
    const leftUnits = node.left ? node.left.leafCount : 0
    const nextOffset = offsetUnits + leftUnits
    assignPositions(node.right, depth + 1, nextOffset)
  }
}

const collectBounds = (node, bounds) => {
  if (!node) return
  bounds.minX = Math.min(bounds.minX, node.position.x)
  bounds.maxX = Math.max(bounds.maxX, node.position.x)
  if (node.left) collectBounds(node.left, bounds)
  if (node.right) collectBounds(node.right, bounds)
}

const shiftPositions = (node, deltaX) => {
  if (!node) return
  node.position.x -= deltaX
  if (node.left) shiftPositions(node.left, deltaX)
  if (node.right) shiftPositions(node.right, deltaX)
}

const buildFlowData = (root) => {
  if (!root) {
    return { nodes: [], edges: [] }
  }

  assignPositions(root, 0, 0)

  const bounds = { minX: Infinity, maxX: -Infinity }
  collectBounds(root, bounds)
  const centerOffset = (bounds.minX + bounds.maxX) / 2
  shiftPositions(root, centerOffset)

  const flowNodes = []
  const flowEdges = []

  const traverse = (node) => {
    if (!node) return

    const isRoot = node.path === ''
    const isLeaf = node.isLeaf || (!node.left && !node.right)
    const members = node.symbols ? Array.from(node.symbols) : []
    const limitedMembers = members.slice(0, 4).map((sym) => sanitizeLabel(sym))
    const membersSuffix = members.length > 4 ? ` … +${members.length - 4}` : ''
    const asciiCode = isLeaf && typeof node.char === 'string' && node.char.length === 1
      ? node.char.charCodeAt(0)
      : null

    let meta = ''
    if (isRoot) {
      meta = `Total Symbols: ${members.length || 1}`
    } else if (isLeaf) {
      meta = asciiCode !== null ? `ASCII ${asciiCode}` : 'Leaf'
    } else {
      meta = members.length > 0
        ? `Contains: ${limitedMembers.join(', ')}${membersSuffix}`
        : 'Internal Node'
    }

    const baseStyle = isRoot
      ? {
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          borderColor: '#f87171',
          color: 'white',
          boxShadow: '0 8px 16px rgba(220, 38, 38, 0.35)',
        }
      : isLeaf
        ? {
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            borderColor: '#60a5fa',
            color: 'white',
            boxShadow: '0 6px 14px rgba(30, 64, 175, 0.4)',
          }
        : {
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderColor: '#fbbf24',
            color: 'white',
            boxShadow: '0 6px 14px rgba(180, 83, 9, 0.35)',
          }

    flowNodes.push({
      id: node.id,
      type: 'huffmanNode',
      position: node.position,
      data: {
        label: isRoot ? 'ROOT' : isLeaf ? sanitizeLabel(node.char) : '∙',
        frequency: node.frequency ?? 0,
        meta,
      },
      style: baseStyle,
    })

    if (node.left) {
      flowEdges.push({
        id: `${node.id}-0`,
        source: node.id,
  sourceHandle: 'source',
        target: node.left.id,
  targetHandle: 'target',
        label: '0',
        type: 'smoothstep',
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#60a5fa',
          width: 18,
          height: 18,
        },
        style: {
          stroke: '#60a5fa',
          strokeWidth: 4,
          opacity: 0.95,
        },
        labelStyle: {
          fill: '#60a5fa',
          fontWeight: 'bold',
          fontSize: '14px',
        },
        labelBgStyle: { fill: '#0f172a', fillOpacity: 0.85 },
        labelBgPadding: [8, 6],
        labelBgBorderRadius: 4,
      })
    }

    if (node.right) {
      flowEdges.push({
        id: `${node.id}-1`,
        source: node.id,
  sourceHandle: 'source',
        target: node.right.id,
  targetHandle: 'target',
        label: '1',
        type: 'smoothstep',
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#f87171',
          width: 18,
          height: 18,
        },
        style: {
          stroke: '#f87171',
          strokeWidth: 4,
          opacity: 0.95,
        },
        labelStyle: {
          fill: '#f87171',
          fontWeight: 'bold',
          fontSize: '14px',
        },
        labelBgStyle: { fill: '#0f172a', fillOpacity: 0.85 },
        labelBgPadding: [8, 6],
        labelBgBorderRadius: 4,
      })
    }

    if (node.left) traverse(node.left)
    if (node.right) traverse(node.right)
  }

  traverse(root)
  return { nodes: flowNodes, edges: flowEdges }
}

const TreeVisualizer = ({ finalCodes, frequencies }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const buildTree = useCallback(() => {
      if (!finalCodes || Object.keys(finalCodes).length === 0) {
        setNodes([])
        setEdges([])
        return
      }

      const treeRoot = buildTreeFromCodes(finalCodes, frequencies || {})
      const { nodes: flowNodes, edges: flowEdges } = buildFlowData(treeRoot)
      setNodes(flowNodes)
      setEdges(flowEdges)
  }, [finalCodes, frequencies, setNodes, setEdges])

  useEffect(() => {
    buildTree()
  }, [buildTree])

  const hasCodes = finalCodes && Object.keys(finalCodes).length > 0

  if (!hasCodes) {
    return (
      <div className="text-center py-12 text-white/60">
        <Network size={48} className="mx-auto mb-4 opacity-50" />
        <p>No Huffman tree data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
          Huffman Tree Visualization
        </h2>
        <p className="text-white/70">
          Complete binary tree showing optimal prefix codes
        </p>
      </motion.div>

      {/* Tree Visualization */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-black/30 rounded-2xl p-4 border border-white/10 h-[700px]"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.3}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          fitViewOptions={{ padding: 0.3, includeHiddenNodes: false }}
        >
          <Controls className="bg-white/10 backdrop-blur-sm rounded-lg" />
          <MiniMap
            nodeStrokeColor="#000"
            nodeColor="#4f46e5"
            maskColor="rgba(0, 0, 0, 0.5)"
            className="bg-black/50 backdrop-blur-sm rounded-lg"
          />
          <Background variant="dots" gap={16} size={1.5} color="#ffffff20" />
        </ReactFlow>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"
      >
        <div className="flex items-center gap-2 bg-white/5 p-3 rounded-lg">
          <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-blue-700"></div>
          <span className="text-white/80">Leaf Nodes (Characters)</span>
        </div>
        <div className="flex items-center gap-2 bg-white/5 p-3 rounded-lg">
          <div className="w-4 h-4 rounded bg-gradient-to-r from-amber-500 to-amber-700"></div>
          <span className="text-white/80">Internal Nodes</span>
        </div>
        <div className="flex items-center gap-2 bg-white/5 p-3 rounded-lg">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
          </div>
          <span className="text-white/80">0 = Left (Blue) | 1 = Right (Red)</span>
        </div>
      </motion.div>
    </div>
  )
}

export default TreeVisualizer