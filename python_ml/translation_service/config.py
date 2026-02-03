import os
from typing import List

class Settings:
    """Translation service configuration"""
    
    # LibreTranslate settings
    LIBRETRANSLATE_URL: str = os.getenv("LIBRETRANSLATE_URL", "http://localhost:5000")
    
    # Service settings
    SERVICE_HOST: str = os.getenv("SERVICE_HOST", "0.0.0.0")
    SERVICE_PORT: int = int(os.getenv("SERVICE_PORT", "8001"))
    
    # Supported languages
    SUPPORTED_LANGUAGES: List[str] = ["en", "hi", "mr", "ta", "te", "kn", "bn", "gu"]
    
    # Translation settings
    CONFIDENCE_THRESHOLD: float = 0.7
    MAX_BATCH_SIZE: int = 10
    CHUNK_SIZE: int = 500  # Characters per chunk
    
    # Redis settings (optional)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    REDIS_ENABLED: bool = os.getenv("REDIS_ENABLED", "false").lower() == "true"
    CACHE_TTL: int = 3600  # 1 hour
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

settings = Settings()
