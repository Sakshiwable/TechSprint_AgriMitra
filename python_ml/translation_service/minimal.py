from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="AgriMitra Translation Service")

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
    calculate_back_translation: bool = False

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
    # Simple mock translation for testing
    # In production, this would call LibreTranslate
    return {
        "translated_text": f"[{request.target_lang.upper()}] {request.text}",
        "confidence": 0.9,
        "source_lang": request.source_lang,
        "target_lang": request.target_lang
    }

if __name__ == "__main__":
    print("Starting minimal translation service on port 8002")
    uvicorn.run(app, host="0.0.0.0", port=8002)