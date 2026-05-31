from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import heapq
import struct
from collections import Counter, defaultdict
from io import BytesIO
import tempfile
from datetime import datetime

from huffman import HuffmanCoder

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size
UPLOAD_FOLDER = 'uploads'
COMPRESSED_FOLDER = 'compressed'

# Create necessary directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(COMPRESSED_FOLDER, exist_ok=True)

# Initialize Huffman coder
huffman_coder = HuffmanCoder()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'Server Running',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/compress', methods=['POST'])
def compress_file():
    """
    Compress a file using Huffman coding
    Returns compression data for visualization
    """
    try:
        # Check if file is provided
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if not file or file.filename == '' or file.filename is None:
            return jsonify({'error': 'No file selected'}), 400

        # Validate file type
        allowed_extensions = {'.txt', '.png', '.jpg', '.bmp', '.csv'}
        filename = file.filename or 'unknown'
        file_extension = os.path.splitext(filename)[1].lower()
        if file_extension not in allowed_extensions:
            return jsonify({'error': f'File type {file_extension} not supported'}), 400

        # Read file content
        file_content = file.read()
        original_size = len(file_content)

        if original_size == 0:
            return jsonify({'error': 'File is empty'}), 400

        # Perform Huffman compression
        compression_result = huffman_coder.compress(file_content, file.filename)

        # Prepare response with visualization data
        response_data = {
            'success': True,
            'filename': file.filename,
            'original_size': f"{original_size / 1024:.2f} KB",
            'compressed_size': f"{compression_result['compressed_size'] / 1024:.2f} KB",
            'compression_ratio': f"{compression_result['compression_ratio']:.1f}%",
            'frequencies': compression_result['frequencies'],
            'tree_steps': compression_result['tree_steps'],
            'final_codes': compression_result['codes'],
            'compressed_file_id': compression_result['file_id']
        }

        return jsonify(response_data)

    except Exception as e:
        app.logger.error(f'Compression error: {str(e)}')
        return jsonify({'error': f'Compression failed: {str(e)}'}), 500

@app.route('/api/decompress', methods=['POST'])
def decompress_file():
    """
    Decompress a .huff file using Huffman coding
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if not file or file.filename == '' or file.filename is None:
            return jsonify({'error': 'No file selected'}), 400

        # Validate file type
        filename = file.filename or 'unknown'
        if not filename.lower().endswith('.huff'):
            return jsonify({'error': 'Only .huff files can be decompressed'}), 400

        # Read file content
        file_content = file.read()

        # Perform Huffman decompression
        decompression_result = huffman_coder.decompress(file_content)

        # Create response with decompressed file
        response_file = BytesIO()
        response_file.write(decompression_result['data'])
        response_file.seek(0)

        return send_file(
            response_file,
            as_attachment=True,
            download_name=decompression_result['original_filename'],
            mimetype='application/octet-stream'
        )

    except Exception as e:
        app.logger.error(f'Decompression error: {str(e)}')
        return jsonify({'error': f'Decompression failed: {str(e)}'}), 500

@app.route('/api/download/<file_id>', methods=['GET'])
def download_compressed_file(file_id):
    """
    Download a compressed file
    """
    try:
        file_path = os.path.join(COMPRESSED_FOLDER, f"{file_id}.huff")
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404

        return send_file(
            file_path,
            as_attachment=True,
            download_name=f"compressed_{file_id}.huff"
        )

    except Exception as e:
        app.logger.error(f'Download error: {str(e)}')
        return jsonify({'error': f'Download failed: {str(e)}'}), 500

@app.errorhandler(413)
def too_large(e):
    return jsonify({'error': 'File too large. Maximum size is 10MB.'}), 413

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🚀 Inhouse Summer Training Huffman Compression Server Starting...")
    print("📊 Server will run on http://localhost:5000")
    print("🔗 React frontend should connect to this backend")
    print("⚡ Make sure to install dependencies: pip install -r requirements.txt")
    
    app.run(debug=True, host='0.0.0.0', port=5000)