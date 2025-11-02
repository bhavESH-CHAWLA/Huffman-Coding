import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TrendingUp, Filter, SortAsc, SortDesc } from 'lucide-react'

const FrequencyChart = ({ frequencies }) => {
  const [sortedData, setSortedData] = useState([])
  const [sortBy, setSortBy] = useState('frequency') // 'frequency' or 'character'
  const [sortOrder, setSortOrder] = useState('desc') // 'asc' or 'desc'
  const [maxItems, setMaxItems] = useState(20)

  // Process frequency data for chart
  useEffect(() => {
    if (!frequencies) return

    let data = Object.entries(frequencies).map(([character, frequency]) => ({
      character: character === ' ' ? 'Space' : character,
      frequency,
      originalChar: character
    }))

    // Sort data based on current sort settings
    data.sort((a, b) => {
      let comparison = 0
      if (sortBy === 'frequency') {
        comparison = a.frequency - b.frequency
      } else {
        comparison = a.character.localeCompare(b.character)
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

    // Limit to maxItems for better visualization
    setSortedData(data.slice(0, maxItems))
  }, [frequencies, sortBy, sortOrder, maxItems])

  // Generate gradient colors based on frequency
  const getColor = (frequency, index) => {
    const maxFreq = Math.max(...sortedData.map(d => d.frequency))
    const ratio = frequency / maxFreq
    
    // Create gradient from blue to purple based on frequency
    const hue = 260 + (ratio * 40) // 260 (blue) to 300 (purple)
    return `hsl(${hue}, 70%, 60%)`
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-2xl">
          <p className="font-semibold text-white">{`Character: ${label}`}</p>
          <p className="text-primary-300">{`Frequency: ${payload[0].value}`}</p>
          <p className="text-secondary-300 text-sm">
            {`${((payload[0].value / Object.values(frequencies).reduce((a, b) => a + b, 0)) * 100).toFixed(2)}% of total`}
          </p>
        </div>
      )
    }
    return null
  }

  if (!frequencies || Object.keys(frequencies).length === 0) {
    return (
      <div className="text-center py-12 text-white/60">
        <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
        <p>No frequency data available</p>
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
          Character Frequency Analysis
        </h2>
        <p className="text-white/70">
          Distribution of characters in your file, sorted by frequency
        </p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-4 justify-center items-center bg-white/5 rounded-xl p-4"
      >
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-white/60" />
          <span className="text-white/80">Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white"
          >
            <option value="frequency">Frequency</option>
            <option value="character">Character</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white/80">Show:</span>
          <select 
            value={maxItems}
            onChange={(e) => setMaxItems(parseInt(e.target.value))}
            className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white"
          >
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
            <option value={50}>Top 50</option>
            <option value={100}>Top 100</option>
            <option value={Infinity}>All</option>
          </select>
          <span className="text-white/60 text-sm">
            ({Object.keys(frequencies).length} total characters)
          </span>
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-black/30 rounded-2xl p-6 border border-white/10"
      >
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="character" 
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <YAxis 
                tick={{ fill: '#9CA3AF' }}
                label={{ 
                  value: 'Frequency', 
                  angle: -90, 
                  position: 'insideLeft',
                  fill: '#9CA3AF'
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="frequency" 
                name="Frequency"
                radius={[4, 4, 0, 0]}
              >
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.frequency, index)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Statistics Summary */}
      <AnimatePresence>
        {sortedData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center">
              <div className="text-2xl font-bold text-primary-400">
                {Object.keys(frequencies).length}
              </div>
              <div className="text-white/60 text-sm">Unique Characters</div>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center">
              <div className="text-2xl font-bold text-secondary-400">
                {Object.values(frequencies).reduce((a, b) => a + b, 0).toLocaleString()}
              </div>
              <div className="text-white/60 text-sm">Total Characters</div>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center">
              <div className="text-2xl font-bold text-green-400">
                {((sortedData[0]?.frequency / Object.values(frequencies).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%
              </div>
              <div className="text-white/60 text-sm">Most Frequent Character</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-xl p-6 border border-primary-500/20"
      >
        <h3 className="text-lg font-semibold mb-3 text-primary-300">Huffman Coding Insight</h3>
        <p className="text-white/80 text-sm">
          Characters with higher frequencies will receive shorter binary codes in the Huffman tree, 
          optimizing the overall compression. The most frequent character "{sortedData[0]?.character}" 
          appears {sortedData[0]?.frequency} times and will likely get the shortest code.
        </p>
      </motion.div>
    </div>
  )
}

export default FrequencyChart