import mongoose from 'mongoose';

const WeatherDataSchema = new mongoose.Schema({
    city: {
        type: String,
        required: true,
        index: true
    },
    state: {
        type: String,
        required: true,
        index: true
    },
    temperature: {
        type: Number,
        required: true
    },
    feels_like: Number,
    humidity: Number,
    pressure: Number,
    weather_condition: String,
    weather_description: String,
    wind_speed: Number,
    rainfall_1h: {
        type: Number,
        default: 0
    },
    rainfall_3h: {
        type: Number,
        default: 0
    },
    impact_analysis: {
        overall_impact: {
            type: String,
            enum: ['positive', 'negative', 'neutral'],
            default: 'neutral'
        },
        factors: [String]
    },
    timestamp: {
        type: Date,
        required: true,
        index: true,
        default: Date.now
    },
    source: {
        type: String,
        default: 'OpenWeatherMap'
    }
}, {
    timestamps: true,
    collection: 'weatherdata'  // Match Python scraper collection name
});

// Indexes for efficient queries
WeatherDataSchema.index({ state: 1, timestamp: -1 });
WeatherDataSchema.index({ city: 1, timestamp: -1 });

export default mongoose.model('WeatherData', WeatherDataSchema);
