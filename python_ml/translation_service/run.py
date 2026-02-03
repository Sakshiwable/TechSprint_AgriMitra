"""
Launcher script for AgriMitra Translation Service
Run this instead of app.py directly
"""
import sys
from pathlib import Path

# Add the service directory to Python path
service_dir = Path(__file__).parent
sys.path.insert(0, str(service_dir))

# Now import and run the app
from app import app
import uvicorn
from config import settings

if __name__ == "__main__":
    print(f"🌍 Starting AgriMitra Translation Service...")
    print(f"📍 LibreTranslate URL: {settings.LIBRETRANSLATE_URL}")
    print(f"🔤 Supported Languages: {', '.join(settings.SUPPORTED_LANGUAGES)}")
    print(f"🚀 Service will run on http://{settings.SERVICE_HOST}:{settings.SERVICE_PORT}")
    
    uvicorn.run(
        app, 
        host=settings.SERVICE_HOST, 
        port=settings.SERVICE_PORT,
        log_level=settings.LOG_LEVEL.lower()
    )
