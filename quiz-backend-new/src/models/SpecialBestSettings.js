import mongoose from 'mongoose';

const specialBestSettingsSchema = new mongoose.Schema({
  topBestPlayer: {
    type: Number,
    required: true,
    min: 1
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Only allow one settings document
specialBestSettingsSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    if (count > 0) {
      next(new Error('Only one special best settings document can exist'));
    } else {
      next();
    }
  } else {
    next();
  }
});

const SpecialBestSettings = mongoose.model('SpecialBestSettings', specialBestSettingsSchema);

export default SpecialBestSettings; 