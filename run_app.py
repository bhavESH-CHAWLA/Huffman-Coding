#!/usr/bin/env python3
"""
Inhouse Summer Training Huffman Compression & Visualization Application
Startup script for both frontend and backend
"""

import os
import sys
import subprocess
import time
import threading

def check_dependencies():
    """Check if required dependencies are installed"""
    print("🔍 Checking dependencies...")
    
    # Check Python dependencies
    try:
        import flask
        import flask_cors
        print("✅ Python dependencies found")
    except ImportError as e:
        print(f"❌ Missing Python dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        return False
    
    # Check if Node.js is installed
    try:
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
        if result.returncode != 0:
            print("❌ Node.js/npm not found")
            print("Please install Node.js from https://nodejs.org/")
            return False
        print(f"✅ Node.js found (npm v{result.stdout.strip()})")
    except FileNotFoundError:
        print("❌ Node.js/npm not found")
        print("Please install Node.js from https://nodejs.org/")
        return False
    
    # Check if frontend dependencies are installed
    if not os.path.exists('node_modules'):
        print("📦 Frontend dependencies not found. Installing...")
        result = subprocess.run(['npm', 'install'], capture_output=True, text=True)
        if result.returncode != 0:
            print("❌ Failed to install frontend dependencies")
            print(result.stderr)
            return False
        print("✅ Frontend dependencies installed")
    
    return True

def start_backend():
    """Start the Flask backend server"""
    print("🚀 Starting backend server on http://localhost:5000")
    try:
        # Use the same Python interpreter to run the server
        subprocess.run([sys.executable, 'server.py'], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Backend server failed to start: {e}")
    except KeyboardInterrupt:
        print("\n🛑 Backend server stopped")

def start_frontend():
    """Start the React frontend development server"""
    print("🌐 Starting frontend server on http://localhost:3000")
    try:
        subprocess.run(['npm', 'run', 'dev'], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Frontend server failed to start: {e}")
    except KeyboardInterrupt:
        print("\n🛑 Frontend server stopped")

def main():
    """Main application startup function"""
    print("=" * 60)
    print("🎯 Inhouse Summer Training — Huffman File Compression & Visualization")
    print("=" * 60)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    print("\n🔄 Starting application servers...")
    
    # Start backend in a separate thread
    backend_thread = threading.Thread(target=start_backend, daemon=True)
    backend_thread.start()
    
    # Wait a moment for backend to start
    time.sleep(2)
    
    # Start frontend
    try:
        start_frontend()
    except KeyboardInterrupt:
        print("\n👋 Application stopped by user")
    finally:
        print("🛑 Shutting down...")

if __name__ == "__main__":
    main()