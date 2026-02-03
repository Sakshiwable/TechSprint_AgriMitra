import mongoose from 'mongoose';

const schemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  state: {
    type: String,
    default: 'All India'
  },
  type: {
    type: String,
    enum: ['Central', 'State'],
    default: 'Central'
  },
  category: [{
    type: String
  }],
  tags: [{
    type: String
  }],
  shortDescription: {
    type: String
  },
  schemeUrl: {
    type: String
  },
  scrapingStatus: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  details: {
    benefits: String,
    eligibility: String,
    applicationProcess: String,
    documentsRequired: String
  }
}, {
  timestamps: true
});

// Add text index for search
schemeSchema.index({ name: 'text', shortDescription: 'text' });

const Scheme = mongoose.model('Scheme', schemeSchema);

export default Scheme;
