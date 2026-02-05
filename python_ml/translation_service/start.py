#!/usr/bin/env python3
import sys
import os

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Now import and run the app
from app import app
import uvicorn
from config import settings

if __name__ == "__main__":
    print(f"Starting translation service on {settings.SERVICE_HOST}:{settings.SERVICE_PORT}")
    print(f"Supported languages: {settings.SUPPORTED_LANGUAGES}")
    
    uvicorn.run(
        app, 
        host=settings.SERVICE_HOST, 
        port=settings.SERVICE_PORT,
        log_level=settings.LOG_LEVEL.lower()
    )