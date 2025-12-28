const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    unique: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  childName: {
    type: String,
    required: true,
    trim: true
  },
  parentEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  template: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  scripts: [
    {
      id: String,
      category: String,
      text: String
    }
  ],
  goodbyeScript: {
    type: String,
    default: null
  },
  photos: {
    type: Number,
    default: 0
  },
  hasLetter: {
    type: Boolean,
    default: false
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  cloudStored: {
    type: Boolean,
    default: false
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'failed', 'refunded'],
      default: 'pending'
    },
    provider: {
      type: String,
      default: 'netopia'
    },
    transactionId: {
      type: String,
      default: null
    },
    amount: {
      type: Number,
      default: null
    },
    currency: {
      type: String,
      default: 'RON'
    },
    paidAt: {
      type: Date,
      default: null
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);


