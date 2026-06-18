from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from io import BytesIO
from datetime import datetime

from huffman import HuffmanCoder

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB

UPLOAD_FOLDER = 'uploads'
COMPRESSED_FOLDER = 'compressed'

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(COMPRESSED_FOLDER, exist_ok=True)

# Initialize Huffman coder
huffman_coder = HuffmanCoder()


@app.route('/')
def home():
    return "Huffman Coding API Running"


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'Server Running',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })


@app.route('/api/compress', methods=['POST'])
def compress_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        allowed_extensions = {'.txt', '.png', '.jpg', '.bmp', '.csv'}

        filename = file.filename
        extension = os.path.splitext(filename)[1].lower()

        if extension not in allowed_extensions:
            return jsonify({
                'error': f'File type {extension} not supported'
            }), 400

        file_content = file.read()

        if len(file_content) == 0:
            return jsonify({'error': 'File is empty'}), 400

        compression_result = huffman_coder.compress(
            file_content,
            filename
        )

        response_data = {
            'success': True,
            'filename': filename,
            'original_size': f"{len(file_content)/1024:.2f} KB",
            'compressed_size': f"{compression_result['compressed_size']/1024:.2f} KB",
            'compression_ratio': f"{compression_result['compression_ratio']:.2f}%",
            'frequencies': compression_result['frequencies'],
            'tree_steps': compression_result['tree_steps'],
            'final_codes': compression_result['codes'],
            'compressed_file_id': compression_result['file_id']
        }

        return jsonify(response_data)

    except Exception as e:
        app.logger.error(f"Compression error: {str(e)}")
        return jsonify({
            'error': f'Compression failed: {str(e)}'
        }), 500


@app.route('/api/decompress', methods=['POST'])
def decompress_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not file.filename.lower().endswith('.huff'):
            return jsonify({
                'error': 'Only .huff files can be decompressed'
            }), 400

        file_content = file.read()

        decompression_result = huffman_coder.decompress(file_content)

        output_file = BytesIO()
        output_file.write(decompression_result['data'])
        output_file.seek(0)

        return send_file(
            output_file,
            as_attachment=True,
            download_name=decompression_result['original_filename'],
            mimetype='application/octet-stream'
        )

    except Exception as e:
        app.logger.error(f"Decompression error: {str(e)}")
        return jsonify({
            'error': f'Decompression failed: {str(e)}'
        }), 500


@app.route('/api/download/<file_id>', methods=['GET'])
def download_compressed_file(file_id):
    try:
        file_path = os.path.join(
            COMPRESSED_FOLDER,
            f"{file_id}.huff"
        )

        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404

        return send_file(
            file_path,
            as_attachment=True,
            download_name=f"{file_id}.huff"
        )

    except Exception as e:
        app.logger.error(f"Download error: {str(e)}")
        return jsonify({
            'error': f'Download failed: {str(e)}'
        }), 500


@app.errorhandler(413)
def too_large(e):
    return jsonify({
        'error': 'File too large. Maximum size is 10MB.'
    }), 413


@app.errorhandler(500)
def internal_error(e):
    return jsonify({
        'error': 'Internal server error'
    }), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))

    print("🚀 Huffman Compression Server Starting...")
    print(f"🌐 Running on port {port}")

    app.run(
        host='0.0.0.0',
        port=port,
        debug=False
    )