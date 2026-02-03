from fastapi import FastAPI, WebSocket, HTTPException, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import logging
from translator import Translator
from config import settings

# Configure logging
logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AgriMitra Translation Service",
    description="Production-grade multilingual translation API using LibreTranslate",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize translator
translator = Translator()

# Request models
class TranslationRequest(BaseModel):
    text: str = Field(..., description="Text or HTML to translate")
    source_lang: str = Field(default="en", description="Source language code")
    target_lang: str = Field(..., description="Target language code")
    preserve_html: bool = Field(default=True, description="Preserve HTML structure")
    calculate_back_translation: bool = Field(default=False, description="Calculate back-translation for higher confidence accuracy")

class BatchTranslationRequest(BaseModel):
    texts: List[str] = Field(..., description="List of texts to translate")
    source_lang: str = Field(default="en", description="Source language code")
    target_lang: str = Field(..., description="Target language code")

class LanguageDetectionRequest(BaseModel):
    text: str = Field(..., description="Text to detect language from")

# Response models
class TranslationResponse(BaseModel):
    translated_text: str
    confidence: float
    source_lang: str
    target_lang: str
    error: Optional[str] = None
    text_nodes_count: Optional[int] = None

class BatchTranslationResponse(BaseModel):
    results: List[TranslationResponse]
    total: int

class LanguageDetectionResponse(BaseModel):
    detected_lang: str
    supported: bool

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

manager = ConnectionManager()

# Routes
@app.get("/")
async def root():
    return {
        "service": "AgriMitra Translation Service",
        "status": "running",
        "supported_languages": settings.SUPPORTED_LANGUAGES
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "libretranslate_url": settings.LIBRETRANSLATE_URL,
        "supported_languages": settings.SUPPORTED_LANGUAGES
    }

@app.post("/translate", response_model=TranslationResponse)
async def translate(request: TranslationRequest):
    """
    Translate text or HTML content
    
    - **text**: Content to translate
    - **source_lang**: Source language (default: en)
    - **target_lang**: Target language (required)
    - **preserve_html**: Whether to preserve HTML structure (default: true)
    - **calculate_back_translation**: Calculate back-translation for accuracy (slower)
    """
    try:
        if request.preserve_html and ('<' in request.text and '>' in request.text):
            # HTML translation
            result = await translator.translate_html(
                request.text,
                request.source_lang,
                request.target_lang,
                request.calculate_back_translation
            )
        else:
            # Plain text translation
            result = await translator.translate_text(
                request.text,
                request.source_lang,
                request.target_lang
            )
        
        return TranslationResponse(**result)
    
    except Exception as e:
        logger.error(f"Translation endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/translate/batch", response_model=BatchTranslationResponse)
async def batch_translate(request: BatchTranslationRequest):
    """
    Batch translate multiple texts
    
    - **texts**: List of texts to translate (max 10)
    - **source_lang**: Source language (default: en)
    - **target_lang**: Target language (required)
    """
    try:
        if len(request.texts) > settings.MAX_BATCH_SIZE:
            raise HTTPException(
                status_code=400, 
                detail=f"Batch size exceeds maximum of {settings.MAX_BATCH_SIZE}"
            )
        
        results = await translator.batch_translate(
            request.texts,
            request.source_lang,
            request.target_lang
        )
        
        return BatchTranslationResponse(
            results=[TranslationResponse(**r) for r in results],
            total=len(results)
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Batch translation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect-language", response_model=LanguageDetectionResponse)
async def detect_language(request: LanguageDetectionRequest):
    """
    Detect language of text
    
    - **text**: Text to analyze
    """
    try:
        detected = await translator.detect_language(request.text)
        
        return LanguageDetectionResponse(
            detected_lang=detected,
            supported=detected in settings.SUPPORTED_LANGUAGES
        )
    
    except Exception as e:
        logger.error(f"Language detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/chat")
async def websocket_chat_translation(websocket: WebSocket):
    """
    WebSocket endpoint for real-time chat translation
    
    Expected message format:
    {
        "text": "message to translate",
        "source_lang": "en",
        "target_langs": ["hi", "mr", "ta"]
    }
    
    Response format:
    {
        "translations": {
            "hi": "translated text",
            "mr": "translated text",
            "ta": "translated text"
        },
        "confidence": {
            "hi": 0.92,
            "mr": 0.89,
            "ta": 0.91
        },
        "original_lang": "en"
    }
    """
    await manager.connect(websocket)
    
    try:
        while True:
            # Receive message
            data = await websocket.receive_json()
            
            text = data.get("text")
            source_lang = data.get("source_lang", "en")
            target_langs = data.get("target_langs", [])
            
            if not text or not target_langs:
                await manager.send_personal_message({
                    "error": "Missing required fields: text or target_langs"
                }, websocket)
                continue
            
            # Translate to all target languages
            translations = {}
            confidences = {}
            
            for target_lang in target_langs:
                if target_lang in settings.SUPPORTED_LANGUAGES:
                    result = await translator.translate_text(text, source_lang, target_lang)
                    translations[target_lang] = result["translated_text"]
                    confidences[target_lang] = result["confidence"]
            
            # Send response
            await manager.send_personal_message({
                "translations": translations,
                "confidence": confidences,
                "original_lang": source_lang
            }, websocket)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host=settings.SERVICE_HOST, 
        port=settings.SERVICE_PORT,
        log_level=settings.LOG_LEVEL.lower()
    )
