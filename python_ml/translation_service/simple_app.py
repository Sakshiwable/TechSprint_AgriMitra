from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="Simple Translation Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TranslationRequest(BaseModel):
    text: str
    source_lang: str = "en"
    target_lang: str
    preserve_html: bool = True

# Simple word mappings for basic translation
TRANSLATIONS = {
    'hi': {
        'Government Schemes': 'सरकारी योजनाएं',
        'Market Prices': 'बाज़ार भाव',
        'Search': 'खोजें',
        'Filter': 'फ़िल्टर',
        'All Schemes': 'सभी योजनाएं',
        'State Schemes': 'राज्य योजनाएं',
        'Central Schemes': 'केंद्रीय योजनाएं',
        'Sort': 'क्रमबद्ध करें'
    },
    'mr': {
        'Government Schemes': 'सरकारी योजना',
        'Market Prices': 'बाजार भाव',
        'Search': 'शोधा',
        'Filter': 'फिल्टर',
        'All Schemes': 'सर्व योजना',
        'State Schemes': 'राज्य योजना',
        'Central Schemes': 'केंद्रीय योजना',
        'Sort': 'क्रमवारी लावा'
    }
}

@app.get("/")
async def root():
    return {"service": "Simple Translation Service", "status": "running"}

@app.post("/translate")
async def translate(request: TranslationRequest):
    try:
        # Simple translation lookup
        if request.target_lang in TRANSLATIONS:
            translated = TRANSLATIONS[request.target_lang].get(request.text, request.text)
        else:
            translated = request.text
        
        return {
            "translated_text": translated,
            "confidence": 0.9 if translated != request.text else 0.1,
            "source_lang": request.source_lang,
            "target_lang": request.target_lang
        }
    except Exception as e:
        return {
            "translated_text": request.text,
            "confidence": 0.1,
            "error": str(e)
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)