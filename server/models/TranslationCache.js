import mongoose from 'mongoose';

const translationCacheSchema = new mongoose.Schema({
  // Content identification
  sourceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  contentHash: {
    type: String,
    required: true,
    index: true
  },
  contentType: {
    type: String,
    enum: ['news', 'scheme', 'weather', 'market_price', 'chat_message', 'general'],
    required: true,
    index: true
  },
  
  // Original content
  originalLang: {
    type: String,
    required: true,
    default: 'en'
  },
  originalContent: {
    type: String,
    required: true
  },
  
  // Translations stored as Map
  translations: {
    type: Map,
    of: String,
    default: new Map()
    // Example: { 'hi': '<html>...', 'mr': '<html>...' }
  },
  
  // Confidence scores for each translation
  confidence: {
    type: Map,
    of: Number,
    default: new Map()
    // Example: { 'hi': 0.92, 'mr': 0.89 }
  },
  
  // Metadata
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true
  },
  accessCount: {
    type: Number,
    default: 0
  },
  lastAccessed: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for performance
translationCacheSchema.index({ contentType: 1, sourceId: 1 });
translationCacheSchema.index({ contentHash: 1, originalLang: 1 });

// TTL index to auto-delete old translations after 30 days
translationCacheSchema.index(
  { lastAccessed: 1 }, 
  { expireAfterSeconds: 2592000 } // 30 days
);

// Methods
translationCacheSchema.methods.getTranslation = function(lang) {
  return this.translations.get(lang);
};

translationCacheSchema.methods.setTranslation = function(lang, text, confidence) {
  this.translations.set(lang, text);
  if (confidence !== undefined) {
    this.confidence.set(lang, confidence);
  }
  this.lastUpdated = new Date();
};

translationCacheSchema.methods.incrementAccess = async function() {
  this.accessCount += 1;
  this.lastAccessed = new Date();
  await this.save();
};

const TranslationCache = mongoose.model('TranslationCache', translationCacheSchema);

export default TranslationCache;
