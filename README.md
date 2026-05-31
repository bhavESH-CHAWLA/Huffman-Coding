# Inhouse Summer Training — Huffman File Compression & Visualization

A visually interactive web application demonstrating Huffman Coding algorithm for file compression and decompression with beautiful educational visualizations.

##   Features

- **File Compression**: Upload files (.txt, .png, .jpg, .bmp, .csv) for Huffman compression
- **Interactive Visualizations**: 
  - Real-time frequency analysis charts
  - Animated Huffman tree construction
  - Step-by-step algorithm visualization
- **Compression Statistics**: Detailed performance metrics and analysis
- **Modern UI**: Dark theme with smooth animations and responsive design
- **Educational Tool**: Perfect for understanding Huffman coding algorithm

##  Tech Stack

### Frontend
- **React.js** with Vite
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization
- **React Flow** for tree diagrams
- **Axios** for API communication

### Backend
- **Flask** (Python) REST API
- **Huffman Coding Algorithm** implementation
- **File upload/download** handling
- **CORS** enabled for frontend-backend communication

## 📦 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd inhouse-summer-training-huffman-compression
```

### 2. Install Dependencies

#### Backend (Python)
```bash
pip install -r requirements.txt
```

#### Frontend (Node.js)
```bash
npm install
```

### 3. Run the Application

#### Option 1: Automated Startup (Recommended)
```bash
python run_app.py
```

#### Option 2: Manual Startup
**Terminal 1 - Backend:**
```bash
python server.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

##  How to Use

1. **Upload a File**: Use the drag-drop area or file selector to upload a supported file
2. **Compress**: Click "Compress File" to start Huffman coding process
3. **Visualize**: Navigate through tabs to see:
   - **Frequency Analysis**: Character/distribution charts
   - **Huffman Tree**: Animated tree construction
   - **Code Table**: Generated Huffman codes
   - **Statistics**: Compression performance metrics
4. **Download**: Get the compressed .huff file
5. **Decompress**: Upload .huff files to restore original content

## 📊 Supported File Types

- **Text Files**: .txt, .csv
- **Image Files**: .png, .jpg, .bmp
- **Maximum Size**: 10MB per file

##  🔬 Algorithm Implementation

The Huffman coding algorithm is implemented with:

- **Priority Queue**: Using Python's heapq for optimal node selection
- **Tree Construction**: Step-by-step visualization of merging process
- **Prefix-free Codes**: Optimal binary code generation
- **Header Metadata**: Store compression information for decompression

### Key Features:
- Real-time frequency calculation
- Animated tree building visualization
- Compression ratio calculation
- Support for both text and binary files

##  Visualization Features

### Frequency Chart
- Interactive bar chart showing character frequencies
- Sorting and filtering options
- Color-coded by frequency intensity
- Statistical summaries

### Huffman Tree
- Animated step-by-step construction
- Interactive zoom and pan
- Color-coded nodes (leaves, internal, root)
- Play/pause/step controls

### Statistics Panel
- Animated number counters
- Compression quality assessment
- Space savings breakdown
- Algorithm performance metrics

##  Project Structure

```
inhouse-summer-training-huffman-compression/
├── src/                    # React frontend
│   ├── components/         # React components
│   │   ├── FileUpload.jsx
│   │   ├── FrequencyChart.jsx
│   │   ├── TreeVisualizer.jsx
│   │    └── StatsPanel.jsx
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # React entry point
│   ├── api.js             # API service
│   └── index.css          # Tailwind styles
├── server.py              # Flask backend
├── huffman.py             # Huffman algorithm
├── requirements.txt       # Python dependencies
├── package.json           # Node.js dependencies
├── run_app.py            # Startup script
└── README.md             # This file
```

##  🔧 API Endpoints

- `GET /api/health` - Server status check
- `POST /api/compress` - File compression with visualization data
- `POST /api/decompress` - File decompression
- `GET /api/download/<file_id>` - Download compressed file

##  🎯 Educational Value

This project serves as an excellent educational tool for:

- **Algorithm Design**: Understanding Huffman coding principles
- **Data Structures**: Tree construction and traversal
- **Information Theory**: Entropy and compression efficiency
- **Web Development**: Full-stack application architecture
- **Data Visualization**: Interactive educational displays

##  🤝 Contributing

This project was developed as part of the Inhouse Summer Training program. Contributions for educational enhancements are welcome!

## 📄 License

Educational Use - Inhouse Summer Training

##  👨‍💻 Developers

**Project Developed by: Bhavesh Chawla**

- Algorithm Implementation: Huffman Coding
- Frontend Development: React.js with modern UI/UX
- Backend Development: Flask REST API
- Visualization: Interactive educational displays

---

**Inhouse Summer Training** - Demonstrating the power of algorithmic thinking through beautiful visualizations. 