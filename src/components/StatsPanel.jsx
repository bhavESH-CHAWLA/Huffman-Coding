import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, BarChart3, TrendingUp, Zap, Clock, FileText } from 'lucide-react'

const StatsPanel = ({ originalSize, compressedSize, compressionRatio }) => {
  const [animatedValues, setAnimatedValues] = useState({
    original: 0,
    compressed: 0,
    ratio: 0
  })

  // Parse size strings to numbers for animation
  const parseSize = (sizeStr) => {
    if (!sizeStr) return 0
    const match = sizeStr.match(/(\d+\.?\d*)\s*([KMGT]?B)/i)
    if (!match) return 0
    
    const value = parseFloat(match[1])
    const unit = match[2].toUpperCase()
    
    const multipliers = { 'B': 1, 'KB': 1024, 'MB': 1024**2, 'GB': 1024**3 }
    return value * (multipliers[unit] || 1)
  }

  // Format bytes to human readable
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Animate numbers when component mounts or values change
  useEffect(() => {
    const originalBytes = parseSize(originalSize)
    const compressedBytes = parseSize(compressedSize)
    const ratioValue = parseFloat(compressionRatio) || 0

    const duration = 2000 // 2 seconds animation
    
    let startTime
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOut = (t) => 1 - Math.pow(1 - t, 3)
      
      setAnimatedValues({
        original: easeOut(progress) * originalBytes,
        compressed: easeOut(progress) * compressedBytes,
        ratio: easeOut(progress) * ratioValue
      })
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [originalSize, compressedSize, compressionRatio])

  const handleDownload = () => {
    // In a real implementation, this would download the compressed file
    alert('Download functionality would be implemented with the backend response')
  }

  const getCompressionQuality = (ratio) => {
    const numRatio = parseFloat(ratio)
    if (numRatio >= 70) return { level: 'Excellent', color: 'text-green-400', bg: 'bg-green-500/20' }
    if (numRatio >= 50) return { level: 'Good', color: 'text-blue-400', bg: 'bg-blue-500/20' }
    if (numRatio >= 30) return { level: 'Fair', color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
    return { level: 'Poor', color: 'text-red-400', bg: 'bg-red-500/20' }
  }

  const quality = getCompressionQuality(compressionRatio)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
          Compression Results
        </h2>
        <p className="text-white/70">
          Detailed analysis of Huffman coding performance
        </p>
      </motion.div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Original Size */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 rounded-2xl p-6 border border-white/10 stats-glow"
        >
          <div className="flex items-center justify-between mb-4">
            <FileText size={32} className="text-blue-400" />
            <span className="text-sm text-white/60">Original</span>
          </div>
          <div className="text-3xl font-bold text-blue-400 mb-2">
            {formatBytes(animatedValues.original)}
          </div>
          <div className="text-white/60 text-sm">File Size Before Compression</div>
        </motion.div>

        {/* Compressed Size */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 rounded-2xl p-6 border border-white/10 stats-glow"
        >
          <div className="flex items-center justify-between mb-4">
            <Zap size={32} className="text-green-400" />
            <span className="text-sm text-white/60">Compressed</span>
          </div>
          <div className="text-3xl font-bold text-green-400 mb-2">
            {formatBytes(animatedValues.compressed)}
          </div>
          <div className="text-white/60 text-sm">File Size After Compression</div>
        </motion.div>

        {/* Compression Ratio */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 rounded-2xl p-6 border border-white/10 stats-glow"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp size={32} className="text-purple-400" />
            <span className="text-sm text-white/60">Ratio</span>
          </div>
          <div className="text-3xl font-bold text-purple-400 mb-2">
            {animatedValues.ratio.toFixed(1)}%
          </div>
          <div className="text-white/60 text-sm">Space Saved</div>
        </motion.div>
      </div>

      {/* Quality Assessment */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className={`${quality.bg} rounded-2xl p-6 border border-white/10`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-xl font-semibold ${quality.color} mb-2`}>
              Compression Quality: {quality.level}
            </h3>
            <p className="text-white/80">
              Huffman coding achieved {compressionRatio} compression ratio. {
                quality.level === 'Excellent' ? 'This is an outstanding result for Huffman coding!' :
                quality.level === 'Good' ? 'This is a good compression result.' :
                quality.level === 'Fair' ? 'The compression ratio is acceptable.' :
                'The file may not be ideal for Huffman compression.'
              }
            </p>
          </div>
          <BarChart3 size={48} className={quality.color} />
        </div>
      </motion.div>

      {/* Detailed Analysis */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Savings Breakdown */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-white">Space Savings</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Bytes Saved:</span>
              <span className="font-mono text-green-400">
                {formatBytes(parseSize(originalSize) - parseSize(compressedSize))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Reduction Factor:</span>
              <span className="font-mono text-blue-400">
                {(parseSize(originalSize) / parseSize(compressedSize)).toFixed(2)}x
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Efficiency:</span>
              <span className="font-mono text-purple-400">
                {(parseSize(compressedSize) / parseSize(originalSize) * 100).toFixed(1)}% of original
              </span>
            </div>
          </div>
        </div>

        {/* Algorithm Performance */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-white">Algorithm Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Algorithm:</span>
              <span className="font-mono text-yellow-400">Huffman Coding</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Type:</span>
              <span className="font-mono text-yellow-400">Lossless</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Optimality:</span>
              <span className="font-mono text-green-400">Prefix-free Codes</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
        >
          <Download size={20} />
          Download Compressed File
        </button>
        
        <button className="flex items-center justify-center gap-2 border border-white/20 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300">
          <Clock size={20} />
          View Encoding Details
        </button>
      </motion.div>

      {/* Technical Insights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-xl p-6 border border-primary-500/20"
      >
        <h3 className="text-lg font-semibold mb-3 text-primary-300">Huffman Coding Insight</h3>
        <div className="text-white/80 text-sm space-y-2">
          <p>
            • Huffman coding achieved {compressionRatio} compression by assigning shorter codes to more frequent characters
          </p>
          <p>
            • The algorithm builds an optimal prefix-free binary tree that minimizes the total encoding length
          </p>
          <p>
            • This result demonstrates the power of statistical compression algorithms for text and structured data
          </p>
          <p>
            • For best results, files with high character frequency variance compress most effectively
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default StatsPanel