import mongoose from 'mongoose';

const NewsAlertSchema = new mongoose.Schema({
    commodity: {
        type: String,
        required: true,
        index: true
    },
    headline: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true,
        unique: true
    },
    published_at: {
        type: Date,
        required: true,
        index: true
    },
    source: {
        type: String,
        default: 'Google News'
    },
    sentiment: {
        type: String,
        enum: ['bullish', 'bearish', 'neutral'],
        default: 'neutral'
    },
    demand_signals: [{
        type: String
    }],
    fetched_at: {
        type: Date,
        default: Date.now
    },
    // Translations storage
    translations: {
        type: Map,
        of: {
            headline: String,
            demand_signals: [String]
        },
        default: {}
    }
}, {
    timestamps: true,
    collection: 'newsalerts'  // Match Python scraper collection name  
});

// Indexes for efficient queries
NewsAlertSchema.index({ commodity: 1, published_at: -1 });
NewsAlertSchema.index({ sentiment: 1, published_at: -1 });

export default mongoose.model('NewsAlert', NewsAlertSchema);
