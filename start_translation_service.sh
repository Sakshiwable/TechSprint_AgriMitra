#!/bin/bash

echo "🌐 Starting AgriMitra Translation Service..."

# Navigate to translation service directory
cd python_ml/translation_service

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Start the translation service
echo "🚀 Starting translation service on port 8001..."
python app.py

echo "✅ Translation service is running!"
echo "🔗 Service URL: http://localhost:8001"
echo "📖 API Documentation: http://localhost:8001/docs"