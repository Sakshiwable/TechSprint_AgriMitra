import libretranslatepy
from typing import List, Dict, Optional
import logging
from html_parser import HTMLParser
from confidence_scorer import ConfidenceScorer
from config import settings

logger = logging.getLogger(__name__)

class Translator:
    """Core translation engine using LibreTranslate"""
    
    def __init__(self):
        self.lt = libretranslatepy.LibreTranslateAPI(settings.LIBRETRANSLATE_URL)
        self.html_parser = HTMLParser()
        self.confidence_scorer = ConfidenceScorer()
    
    async def translate_text(
        self, 
        text: str, 
        source_lang: str = "en", 
        target_lang: str = "hi"
    ) -> Dict[str, any]:
        """
        Translate plain text
        
        Args:
            text: Text to translate
            source_lang: Source language code
            target_lang: Target language code
        
        Returns:
            Dictionary with translated_text and confidence
        """
        try:
            # Validate languages
            if target_lang not in settings.SUPPORTED_LANGUAGES:
                raise ValueError(f"Unsupported target language: {target_lang}")
            
            # If source and target are same, return original
            if source_lang == target_lang:
                return {
                    "translated_text": text,
                    "confidence": 1.0,
                    "source_lang": source_lang,
                    "target_lang": target_lang
                }
            
            # Translate
            translated = self.lt.translate(text, source_lang, target_lang)
            
            # Calculate confidence (without back-translation for speed)
            confidence = self.confidence_scorer.calculate_confidence(text, translated)
            
            return {
                "translated_text": translated,
                "confidence": confidence,
                "source_lang": source_lang,
                "target_lang": target_lang
            }
            
        except Exception as e:
            logger.error(f"Translation error: {str(e)}")
            return {
                "translated_text": text,  # Fallback to original
                "confidence": 0.0,
                "error": str(e),
                "source_lang": source_lang,
                "target_lang": target_lang
            }
    
    async def translate_html(
        self, 
        html_content: str, 
        source_lang: str = "en", 
        target_lang: str = "hi",
        calculate_back_translation: bool = False
    ) -> Dict[str, any]:
        """
        Translate HTML while preserving structure
        
        Args:
            html_content: HTML content to translate
            source_lang: Source language code
            target_lang: Target language code
            calculate_back_translation: Whether to calculate back-translation for confidence
        
        Returns:
            Dictionary with translated HTML and confidence
        """
        try:
            # Same language check
            if source_lang == target_lang:
                return {
                    "translated_text": html_content,
                    "confidence": 1.0,
                    "source_lang": source_lang,
                    "target_lang": target_lang
                }
            
            # Extract text nodes
            soup, text_nodes = self.html_parser.extract_text_nodes(html_content)
            
            if not text_nodes:
                return {
                    "translated_text": html_content,
                    "confidence": 0.9,
                    "source_lang": source_lang,
                    "target_lang": target_lang
                }
            
            # Translate each text node
            translated_texts = []
            for text in text_nodes:
                # Chunk if too long
                chunks = self.html_parser.chunk_text(text, settings.CHUNK_SIZE)
                translated_chunks = []
                
                for chunk in chunks:
                    try:
                        result = self.lt.translate(chunk, source_lang, target_lang)
                        translated_chunks.append(result)
                    except Exception as e:
                        logger.warning(f"Chunk translation failed: {str(e)}, using original")
                        translated_chunks.append(chunk)
                
                # Join chunks
                translated_texts.append(" ".join(translated_chunks))
            
            # Reconstruct HTML
            translated_html = self.html_parser.reconstruct_html(soup, translated_texts)
            
            # Calculate confidence
            if calculate_back_translation:
                # Expensive operation - use for critical content only
                back_translated = self.lt.translate(translated_html, target_lang, source_lang)
                confidence = self.confidence_scorer.calculate_confidence(
                    html_content, translated_html, back_translated
                )
            else:
                # Faster estimation
                confidence = self.confidence_scorer.calculate_confidence(
                    html_content, translated_html
                )
            
            return {
                "translated_text": translated_html,
                "confidence": confidence,
                "source_lang": source_lang,
                "target_lang": target_lang,
                "text_nodes_count": len(text_nodes)
            }
            
        except Exception as e:
            logger.error(f"HTML translation error: {str(e)}")
            return {
                "translated_text": html_content,  # Fallback to original
                "confidence": 0.0,
                "error": str(e),
                "source_lang": source_lang,
                "target_lang": target_lang
            }
    
    async def batch_translate(
        self, 
        texts: List[str], 
        source_lang: str = "en", 
        target_lang: str = "hi"
    ) -> List[Dict[str, any]]:
        """
        Batch translate multiple texts
        
        Args:
            texts: List of texts to translate
            source_lang: Source language code
            target_lang: Target language code
        
        Returns:
            List of translation results
        """
        results = []
        
        for text in texts[:settings.MAX_BATCH_SIZE]:
            result = await self.translate_text(text, source_lang, target_lang)
            results.append(result)
        
        return results
    
    async def detect_language(self, text: str) -> str:
        """
        Detect language of text
        
        Args:
            text: Text to analyze
        
        Returns:
            Detected language code
        """
        try:
            import langdetect
            detected = langdetect.detect(text)
            return detected
        except Exception as e:
            logger.warning(f"Language detection failed: {str(e)}")
            return "en"  # Default to English
