import os
import sys
import uvicorn

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def print_banner():
    banner = r"""
======================================================================
  ____  _______     ______ _   _    _    ____  ____  
 |  _ \| ____\ \   / / ___| | | |  / \  |  _ \|  _ \ 
 | |_) |  _|  \ \ / / |  _| | | | / _ \ | |_) | | | |
 |  _ <| |___  \ V /| |_| | |_| |/ ___ \|  _ <| |_| |
 |_| \_\_____|  \_/  \____|\___//_/   \_\_| \_\____/ 
                                                     
  Revenue Leakage Intelligence & Control Platform
  Enterprise Production Mode • v2.0.0
======================================================================
  [Dashboard URL]    http://localhost:8000
  [API Docs Swagger] http://localhost:8000/docs
  [AI Engine]        Hugging Face (all-MiniLM-L6-v2) + Scikit-Learn
  [Compliance]       SOX-Compliant Cryptographic SHA-256 Ledger
======================================================================
"""
    print(banner)

if __name__ == "__main__":
    print_banner()
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting server on {host}:{port}...")
    uvicorn.run("app.main:app", host=host, port=port, log_level="info", reload=False)

