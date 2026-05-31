import React, { useState } from 'react'
import { motion } from 'framer-motion'
import FileUpload from './components/FileUpload'
import FrequencyChart from './components/FrequencyChart'
import TreeVisualizer from './components/TreeVisualizer'
import StatsPanel from './components/StatsPanel'
import { Upload, FileText, BarChart3, Network, Download } from 'lucide-react'

function App() {
  const [compressionData, setCompressionData] = useState(null)
  const [activeTab, setActiveTab] = useState('upload')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCompressionComplete = (data) => {
    setCompressionData(data)
    setActiveTab('frequency')
    setIsProcessing(false)
  }

  const handleProcessingStart = () => {
    setIsProcessing(true)
  }

  const resetApp = () => {
    setCompressionData(null)
    setActiveTab('upload')
    setIsProcessing(false)
  }

  const tabs = [
    { id: 'upload', label: 'Upload File', icon: Upload },
    { id: 'frequency', label: 'Frequency Analysis', icon: BarChart3 },
    { id: 'tree', label: 'Huffman Tree', icon: Network },
    { id: 'codes', label: 'Codes Table', icon: FileText },
    { id: 'stats', label: 'Statistics', icon: Download }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold text-center py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl"
      >
        Inhouse Summer Training — Huffman File Compression & Visualization
      </motion.header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center mb-8 gap-2"
        >
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-blue-500/80 backdrop-blur-sm border border-blue-300 shadow-lg text-white'
                    : 'bg-gray-800/50 backdrop-blur-sm border border-gray-600 hover:bg-blue-500/30 text-gray-200'
                } ${!compressionData && tab.id !== 'upload' ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!compressionData && tab.id !== 'upload'}
              >
                <IconComponent size={20} className="mr-2" />
                {tab.label}
              </button>
            )
          })}
        </motion.div>

        {/* Content Area */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-600 p-6 shadow-2xl">
          {activeTab === 'upload' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FileUpload 
                onCompressionComplete={handleCompressionComplete}
                onProcessingStart={handleProcessingStart}
                isProcessing={isProcessing}
                onReset={resetApp}
              />
            </motion.div>
          )}

          {activeTab === 'frequency' && compressionData && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FrequencyChart frequencies={compressionData.frequencies} />
            </motion.div>
          )}

          {activeTab === 'tree' && compressionData && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <TreeVisualizer 
                finalCodes={compressionData.final_codes}
                frequencies={compressionData.frequencies}
              />
            </motion.div>
          )}

          {activeTab === 'codes' && compressionData && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="code-table p-6">
                <h3 className="text-2xl font-bold mb-4 text-center">Huffman Codes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(compressionData.final_codes).map(([symbol, code]) => (
                    <div key={symbol} className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                      <span className="font-mono text-lg text-white">{symbol === ' ' ? 'Space' : symbol}</span>
                      <span className="text-blue-400 ml-2 font-mono">→</span>
                      <span className="text-green-400 ml-2 font-mono">{code}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && compressionData && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StatsPanel 
                originalSize={compressionData.original_size}
                compressedSize={compressionData.compressed_size}
                compressionRatio={compressionData.compression_ratio}
              />
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 text-white/60"
        >
          <p>Inhouse Summer Training — Huffman Coding Implementation | Algorithm Design and Analysis</p>
          <p className="text-sm mt-2">Developed by Bhavesh Chawla</p>
        </motion.footer>
      </div>
    </div>
  )
}

export default App