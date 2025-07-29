#!/usr/bin/env python3
"""
SUVAI Startup Script
Automatically starts the Flask backend server and opens the website
"""

import subprocess
import sys
import time
import webbrowser
import os
from pathlib import Path

def print_banner():
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║      🛒 SUVAI - Grocery E-commerce with AI Chatbot 🤖       ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
    """)

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        print(f"Current version: {sys.version}")
        return False
    print(f"✅ Python version: {sys.version.split()[0]}")
    return True

def check_dependencies():
    """Check if required dependencies are installed"""
    print("\n📦 Checking dependencies...")
    
    required_packages = [
        'flask', 'flask_cors', 'sqlalchemy', 
        'flask_sqlalchemy', 'requests', 'fuzzywuzzy'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package}")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n⚠️  Missing packages: {', '.join(missing_packages)}")
        print("Installing missing packages...")
        
        try:
            subprocess.check_call([
                sys.executable, '-m', 'pip', 'install', 
                '-r', 'backend/requirements.txt'
            ])
            print("✅ Dependencies installed successfully")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install dependencies")
            print("Please run manually: pip install -r backend/requirements.txt")
            return False
    
    return True

def start_backend_server():
    """Start the Flask backend server"""
    print("\n🚀 Starting Flask backend server...")
    
    backend_path = Path("backend")
    if not backend_path.exists():
        print("❌ Backend directory not found")
        return None
    
    try:
        # Change to backend directory and start server
        process = subprocess.Popen([
            sys.executable, 'app.py'
        ], cwd=backend_path, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait a moment for server to start
        time.sleep(3)
        
        # Check if process is still running
        if process.poll() is None:
            print("✅ Flask server started successfully")
            print("📍 Server running at: http://localhost:5000")
            return process
        else:
            stdout, stderr = process.communicate()
            print("❌ Failed to start Flask server")
            print(f"Error: {stderr.decode()}")
            return None
            
    except Exception as e:
        print(f"❌ Error starting server: {str(e)}")
        return None

def open_website():
    """Open the website in default browser"""
    print("\n🌐 Opening website...")
    
    frontend_path = Path("frontend/index.html")
    if not frontend_path.exists():
        print("❌ Frontend index.html not found")
        return False
    
    try:
        # Get absolute path
        html_path = frontend_path.resolve()
        
        # Open in browser
        webbrowser.open(f"file://{html_path}")
        print("✅ Website opened in browser")
        print("📍 Website location: frontend/index.html")
        return True
        
    except Exception as e:
        print(f"❌ Error opening website: {str(e)}")
        print("Please manually open frontend/index.html in your browser")
        return False

def show_usage_instructions():
    """Show usage instructions"""
    print("""
    🎉 SUVAI is now running!
    
    📋 What you can do:
    
    🛒 WEBSITE FEATURES:
    • Browse 29 grocery products across 6 categories
    • Use search and filters to find products
    • Add items to shopping cart and checkout
    • Responsive design works on all devices
    
    🤖 CHATBOT FEATURES:
    • Click the chatbot widget in bottom-left corner
    • Try these example queries:
      - "find apples"
      - "show nearby stores"  
      - "I need dairy products"
      - "where can I buy milk"
      - "help me"
    
    🗺️ MAP FEATURES:
    • View store locations on interactive map
    • Get directions to stores
    • See store details and services
    
    🔧 TECHNICAL INFO:
    • Backend API: http://localhost:5000
    • Frontend: file://[your-path]/frontend/index.html
    • Database: backend/grocery_store.db (auto-created)
    
    ⚠️  IMPORTANT:
    • Keep this terminal window open (Flask server is running)
    • Allow location access for store distance calculation
    • Use modern browser for best experience
    
    🛑 TO STOP:
    • Press Ctrl+C in this terminal to stop the server
    """)

def main():
    """Main startup function"""
    print_banner()
    
    # Check system requirements
    if not check_python_version():
        sys.exit(1)
    
    if not check_dependencies():
        sys.exit(1)
    
    # Start backend server
    server_process = start_backend_server()
    if not server_process:
        sys.exit(1)
    
    # Open website
    open_website()
    
    # Show instructions
    show_usage_instructions()
    
    try:
        print("🔄 Server is running... Press Ctrl+C to stop")
        
        # Keep the script running and monitor server
        while True:
            time.sleep(1)
            
            # Check if server process is still alive
            if server_process.poll() is not None:
                print("\n❌ Server process has stopped")
                break
                
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down SUVAI...")
        
        # Terminate server process
        if server_process:
            server_process.terminate()
            try:
                server_process.wait(timeout=5)
                print("✅ Server stopped successfully")
            except subprocess.TimeoutExpired:
                server_process.kill()
                print("⚠️  Server force-killed")
        
        print("👋 Thank you for using SUVAI!")

if __name__ == "__main__":
    main()
