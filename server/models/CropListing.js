import mongoose from 'mongoose';

const CropListingSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    commodity: {
        type: String,
        required: [true, 'Please specify commodity'],
        index: true
    },
    quantity: {
        type: Number,
        required: [true, 'Please specify quantity in quintals']
    },
    expectedPrice: {
        type: Number,
        required: true
    },
    location: {
        state: String,
        district: String,
        village: String,
        pincode: String
    },
    harvestDate: Date,
    quality: {
        type: String,
        enum: ['A', 'B', 'C'],
        default: 'A'
    },
    images: [String],
    description: String,
    status: {
        type: String,
        enum: ['active', 'in_negotiation', 'sold', 'expired'],
        default: 'active',
        index: true
    },
    interestedBuyers: [{
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        offeredPrice: Number,
        message: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    expiresAt: {
        type: Date,
        default: () => Date.now() + 30*24*60*60*1000 // 30 days
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
CropListingSchema.index({ commodity: 1, status: 1, createdAt: -1 });
CropListingSchema.index({ 'location.state': 1, commodity: 1 });
CropListingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired

export default mongoose.model('CropListing', CropListingSchema);
