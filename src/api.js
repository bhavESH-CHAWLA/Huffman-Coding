import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api', // This will be proxied to Flask backend via Vite config
  timeout: 30000, // 30 seconds timeout for file processing
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})

// Request interceptor to add loading states if needed
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens or other headers here if needed
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error)
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.data?.message || 'Server error occurred'
      return Promise.reject(new Error(message))
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject(new Error('No response from server. Please check your connection.'))
    } else {
      // Something else happened
      return Promise.reject(new Error('An unexpected error occurred'))
    }
  }
)

// API methods
const compressFile = (formData) => {
  return api.post('/compress', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

const decompressFile = (formData) => {
  return api.post('/decompress', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

const healthCheck = () => {
  return api.get('/health')
}

// Export the API methods
export default {
  compressFile,
  decompressFile,
  healthCheck,
}

// Also export the axios instance for direct use if needed
export { api }