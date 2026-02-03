@echo off
echo 🌐 Starting AgriMitra Translation Service...

cd python_ml\translation_service

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing dependencies...
pip install -r requirements.txt

REM Start the translation service
echo 🚀 Starting translation service on port 8001...
python app.py

echo ✅ Translation service is running!
echo 🔗 Service URL: http://localhost:8001
echo 📖 API Documentation: http://localhost:8001/docs

pause