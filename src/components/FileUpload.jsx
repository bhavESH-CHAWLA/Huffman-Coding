import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../api'

const FileUpload = ({ onCompressionComplete, onProcessingStart, isProcessing, onReset }) => {
  const [file, setFile] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState('')

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFile = e.dataTransfer.files[0]
    validateAndSetFile(droppedFile)
  }, [])

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    validateAndSetFile(selectedFile)
  }

  const validateAndSetFile = (file) => {
    setError('')
    
    if (!file) return

    const validTypes = ['.txt', '.png', '.jpg', '.bmp', '.csv']
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    
    if (!validTypes.includes(fileExtension)) {
      setError(`Unsupported file type. Supported types: ${validTypes.join(', ')}`)
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size too large. Maximum size is 10MB.')
      return
    }

    setFile(file)
  }

  const removeFile = () => {
    setFile(null)
    setError('')
  }

  const handleCompress = async () => {
    if (!file) return

    onProcessingStart()
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.compressFile(formData)
      onCompressionComplete(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Compression failed. Please try again.')
      onReset()
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
          Huffman File Compression
        </h2>
        <p className="text-lg text-white/70">
          Upload a file to see Huffman coding in action with beautiful visualizations
        </p>
      </motion.div>

      {/* Drag and Drop Area */}
      {!file && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
            isDragOver
              ? 'dropzone-active border-blue-400 bg-blue-500/10'
              : 'border-gray-600 bg-gray-800/30'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload size={64} className="mx-auto mb-4 text-blue-400" />
          <h3 className="text-2xl font-semibold mb-2 text-white">Drop your file here</h3>
          <p className="text-gray-400 mb-6">or click to browse</p>
          
          <label className="cursor-pointer">
            <input
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept=".txt,.png,.jpg,.bmp,.csv"
            />
            <span className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg">
              Choose File
            </span>
          </label>
          
          <p className="text-sm text-gray-500 mt-4">
            Supported formats: TXT, PNG, JPG, BMP, CSV (Max 10MB)
          </p>
        </motion.div>
      )}

      {/* File Preview */}
      {file && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/5 rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <File size={32} className="text-primary-400 mr-4" />
              <div>
                <h3 className="text-xl font-semibold">{file.name}</h3>
                <p className="text-white/60">{formatFileSize(file.size)} • {file.type || 'Unknown type'}</p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleCompress}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Compressing...
                </>
              ) : (
                <>
                  <CheckCircle size={20} className="mr-2" />
                  Compress File
                </>
              )}
            </button>
            
            <button
              onClick={onReset}
              className="px-6 py-3 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-red-500/20 border border-red-500/50 rounded-lg p-4 mt-4"
        >
          <AlertCircle size={20} className="text-red-400" />
          <span className="text-red-300">{error}</span>
        </motion.div>
      )}

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="text-center p-4 bg-gray-800/30 rounded-lg border border-gray-600">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Upload size={24} className="text-blue-400" />
          </div>
          <h4 className="font-semibold mb-2 text-white">Upload File</h4>
          <p className="text-gray-400 text-sm">Select any supported file type up to 10MB</p>
        </div>

        <div className="text-center p-4 bg-gray-800/30 rounded-lg border border-gray-600">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <File size={24} className="text-indigo-400" />
          </div>
          <h4 className="font-semibold mb-2 text-white">Visualize</h4>
          <p className="text-gray-400 text-sm">Watch Huffman algorithm build the optimal tree</p>
        </div>

        <div className="text-center p-4 bg-gray-800/30 rounded-lg border border-gray-600">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle size={24} className="text-green-400" />
          </div>
          <h4 className="font-semibold mb-2 text-white">Analyze Results</h4>
          <p className="text-gray-400 text-sm">See compression statistics and download results</p>
        </div>
      </motion.div>
    </div>
  )
}

export default FileUpload