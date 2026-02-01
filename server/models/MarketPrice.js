import mongoose from 'mongoose';

const MarketPriceSchema = new mongoose.Schema({
    commodity: {
        type: String,
        required: [true, 'Please specify commodity'],
        index: true
    },
    state: {
        type: String,
        required: true
    },
    market: String,
    modal_price: {
        type: Number,
        required: [true, 'Please specify modal price']
    },
    min_price: Number,
    max_price: Number,
    arrival_quantity: Number,
    date: {
        type: Date,
        required: true,
        index: true
    },
    source: {
        type: String,
        enum: ['eNAM', 'Agmarknet', 'Manual', 'data.gov.in'],
        default: 'eNAM'
    },
    scraped_at: {
        type: Date,
        default: Date.now
    },
    // Weather correlation fields
    weather_impact: {
        type: String,
        enum: ['positive', 'negative', 'neutral'],
        required: false
    },
    // News sentiment fields
    news_sentiment: {
        type: String,
        enum: ['bullish', 'bearish', 'neutral'],
        required: false
    },
    demand_signals: [{
        type: String
    }],
    // Data quality score (1-10)
    data_quality_score: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
    },
    // Translations storage
    translations: {
        type: Map,
        of: {
            commodity: String,
            market: String,
            state: String
        },
        default: {}
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
MarketPriceSchema.index({ commodity: 1, date: -1 });
MarketPriceSchema.index({ state: 1, commodity: 1 });
MarketPriceSchema.index({ commodity: 1, state: 1, date: -1 });

export default mongoose.model('MarketPrice', MarketPriceSchema);

