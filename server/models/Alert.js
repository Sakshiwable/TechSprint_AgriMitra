import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['PRICE_DROP', 'PRICE_SPIKE', 'WEATHER', 'DEMAND', 'NEWS', 'GENERAL'],
        required: true,
        index: true
    },
    severity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'MEDIUM'
    },
    commodity: {
        type: String,
        index: true
    },
    title: String,
    message: {
        type: String,
        required: true
    },
    messageHindi: String,
    current_price: Number,
    predicted_price: Number,
    change_percentage: Number,
    targetUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    targetStates: [String],
    read_by: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    metadata: {
        source: String,
        confidence: Number,
        actionable: Boolean
    }
}, {
    timestamps: true
});

// TTL index - auto-delete after 7 days
AlertSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });
AlertSchema.index({ targetUsers: 1, 'read_by.user': 1 });
AlertSchema.index({ createdAt: -1 });

export default mongoose.model('Alert', AlertSchema);
