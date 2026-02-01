import mongoose from 'mongoose';

const filterMetadataSchema = new mongoose.Schema({
  filterType: {
    type: String,
    required: true,
    enum: [
      'state',
      'gender',
      'age',
      'caste',
      'residence',
      'benefitType',
      'disability',
      'employmentStatus',
      'occupation'
    ],
    unique: true
  },
  options: [{
    label: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      default: 0
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const FilterMetadata = mongoose.model('FilterMetadata', filterMetadataSchema);

export default FilterMetadata;
