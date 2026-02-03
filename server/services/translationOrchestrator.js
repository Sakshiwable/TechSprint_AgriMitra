import axios from 'axios';
import crypto from 'crypto';
import TranslationCache from '../models/TranslationCache.js';

const TRANSLATION_SERVICE_URL = process.env.TRANSLATION_SERVICE_URL || 'http://localhost:8001';

class TranslationOrchestrator {
  /**
   * Main translation function with intelligent caching
   */
  async translateContent(content, targetLang, contentType = 'general', sourceId = null) {
    try {
      // If no sourceId provided, generate one from content
      if (!sourceId) {
        sourceId = this.generateHash(content).substring(0, 16);
      }

      // If target is English (default), return original
      if (targetLang === 'en') {
        return {
          text: content,
          confidence: 1.0,
          source: 'original'
        };
      }

      // Generate content hash for change detection
      const contentHash = this.generateHash(content);
      
      // Check cache
      const cached = await this.getCachedTranslation(sourceId, targetLang, contentHash);
      
      if (cached) {
        return cached;
      }
      
      // Cache miss - translate via service
      const translated = await this.callTranslationService(content, 'en', targetLang);
      
      // Store in cache only if translation was successful
      if (translated.translated_text && translated.confidence > 0.5) {
        await this.storeTranslation(
          sourceId,
          contentHash,
          contentType,
          content,
          targetLang,
          translated.translated_text,
          translated.confidence
        );
      }
      
      return {
        text: translated.translated_text || content,
        confidence: translated.confidence || 0.1,
        source: translated.error ? 'fallback' : 'live'
      };
      
    } catch (error) {
      console.error('Translation error:', error.message);
      
      // Fallback to original content
      return {
        text: content,
        confidence: 0,
        source: 'fallback',
        error: error.message
      };
    }
  }

  /**
   * Get cached translation if available and fresh
   */
  async getCachedTranslation(sourceId, targetLang, contentHash) {
    try {
      const cached = await TranslationCache.findOne({
        sourceId,
        contentHash
      });
      
      if (!cached) {
        return null;
      }

      // Check if translation exists for target language
      const translation = cached.getTranslation(targetLang);
      
      if (!translation) {
        return null;
      }
      
      // Update access stats asynchronously
      cached.incrementAccess().catch(err => 
        console.error('Failed to update access stats:', err)
      );
      
      return {
        text: translation,
        confidence: cached.confidence.get(targetLang) || 0.9,
        source: 'cache'
      };
      
    } catch (error) {
      console.error('Cache lookup error:', error);
      return null;
    }
  }

  /**
   * Store translation in cache
   */
  async storeTranslation(sourceId, contentHash, contentType, originalContent, targetLang, translatedText, confidence) {
    try {
      // Find or create cache entry
      let cacheEntry = await TranslationCache.findOne({ sourceId });
      
      if (!cacheEntry) {
        cacheEntry = new TranslationCache({
          sourceId,
          contentHash,
          contentType,
          originalLang: 'en',
          originalContent
        });
      } else {
        // Update hash if content changed
        cacheEntry.contentHash = contentHash;
        cacheEntry.originalContent = originalContent;
      }
      
      // Store translation
      cacheEntry.setTranslation(targetLang, translatedText, confidence);
      cacheEntry.accessCount += 1;
      cacheEntry.lastAccessed = new Date();
      
      await cacheEntry.save();
      
    } catch (error) {
      console.error('Cache storage error:', error);
      // Don't throw - caching failure shouldn't break translation
    }
  }

  /**
   * Call Python translation service
   */
  async callTranslationService(text, sourceLang, targetLang) {
    try {
      const response = await axios.post(
        `${TRANSLATION_SERVICE_URL}/translate`,
        {
          text,
          source_lang: sourceLang,
          target_lang: targetLang,
          preserve_html: true,
          calculate_back_translation: false
        },
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
      
    } catch (error) {
      console.warn('Translation service unavailable, using fallback');
      
      // Simple fallback - return original text with low confidence
      return {
        translated_text: text,
        confidence: 0.1,
        source: 'fallback',
        error: 'Translation service unavailable'
      };
    }
  }

  /**
   * Batch translate multiple contents
   */
  async batchTranslate(contents, targetLang) {
    const results = await Promise.all(
      contents.map(item => 
        this.translateContent(
          item.text || item.content,
          targetLang,
          item.type || 'general',
          item.id || item.sourceId
        )
      )
    );
    
    return results;
  }

  /**
   * Invalidate cache for specific content
   */
  async invalidateCache(sourceId) {
    try {
      await TranslationCache.deleteOne({ sourceId });
      return true;
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return false;
    }
  }

  /**
   * Invalidate all cache for a content type
   */
  async invalidateCacheByType(contentType) {
    try {
      const result = await TranslationCache.deleteMany({ contentType });
      return result.deletedCount;
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return 0;
    }
  }

  /**
   * Get translation statistics
   */
  async getStats() {
    try {
      const stats = await TranslationCache.aggregate([
        {
          $group: {
            _id: '$contentType',
            count: { $sum: 1 },
            totalAccess: { $sum: '$accessCount' },
            avgConfidence: { $avg: { $avg: { $objectToArray: '$confidence' } } }
          }
        }
      ]);
      
      const total = await TranslationCache.countDocuments();
      
      return {
        total,
        byType: stats
      };
    } catch (error) {
      console.error('Stats error:', error);
      return { total: 0, byType: [] };
    }
  }

  /**
   * Generate SHA256 hash of content
   */
  generateHash(content) {
    return crypto
      .createHash('sha256')
      .update(content.trim())
      .digest('hex');
  }

  /**
   * Detect language of content
   */
  async detectLanguage(text) {
    try {
      const response = await axios.post(
        `${TRANSLATION_SERVICE_URL}/detect-language`,
        { text },
        { timeout: 5000 }
      );
      
      return response.data.detected_lang;
      
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en'; // Default to English
    }
  }
}

// Singleton instance
const translationOrchestrator = new TranslationOrchestrator();

export default translationOrchestrator;
