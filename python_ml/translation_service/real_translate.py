from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import requests
import json

app = FastAPI(title="AgriMitra Translation Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Language mapping for Google Translate
LANG_MAP = {
    "hi": "hi",    # Hindi
    "mr": "mr",    # Marathi  
    "ta": "ta",    # Tamil
    "te": "te",    # Telugu
    "kn": "kn",    # Kannada
    "bn": "bn",    # Bengali
    "gu": "gu",    # Gujarati
    "ml": "ml",    # Malayalam
    "pa": "pa",    # Punjabi
    "or": "or",    # Oriya
    "as": "as",    # Assamese
}

class TranslationRequest(BaseModel):
    text: str
    source_lang: str = "en"
    target_lang: str
    preserve_html: bool = True
    calculate_back_translation: bool = False

def translate_with_mymemory(text, target_lang):
    """Use MyMemory free translation API"""
    try:
        url = "https://api.mymemory.translated.net/get"
        params = {
            "q": text,
            "langpair": f"en|{target_lang}"
        }
        
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        
        if response.status_code == 200 and data.get("responseStatus") == 200:
            translated = data["responseData"]["translatedText"]
            return {
                "translated_text": translated,
                "confidence": 0.8,
                "source_lang": "en",
                "target_lang": target_lang
            }
    except Exception as e:
        print(f"Translation error: {e}")
    
    # Fallback
    return {
        "translated_text": text,
        "confidence": 0.1,
        "source_lang": "en", 
        "target_lang": target_lang
    }

@app.get("/")
async def root():
    return {
        "service": "AgriMitra Translation Service",
        "status": "running",
        "supported_languages": ["en", "hi", "mr", "ta", "te", "kn", "bn", "gu", "ml", "pa", "or", "as"]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "supported_languages": ["en", "hi", "mr", "ta", "te", "kn", "bn", "gu", "ml", "pa", "or", "as"]
    }

@app.post("/translate")
async def translate(request: TranslationRequest):
    if request.target_lang == "en" or request.target_lang not in LANG_MAP:
        return {
            "translated_text": request.text,
            "confidence": 1.0,
            "source_lang": request.source_lang,
            "target_lang": request.target_lang
        }
    
    # Use MyMemory API for translation
    result = translate_with_mymemory(request.text, LANG_MAP[request.target_lang])
    return result

if __name__ == "__main__":
    print("Starting translation service with MyMemory API on port 8002")
    uvicorn.run(app, host="0.0.0.0", port=8002)