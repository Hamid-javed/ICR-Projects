const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  previewUrl: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true,
    default: 19.99
  },
  // Pre-rendered video clips for this template
  clips: [{
    id: String,
    name: String,
    file: String, // Path to the video file
    duration: Number,
    type: {
      type: String,
      enum: ['intro', 'name_mention', 'green_screen_book', 'custom_message', 'goodbye']
    },
    hasGreenScreen: {
      type: Boolean,
      default: false
    },
    // Position for green screen replacement
    greenScreenArea: {
      x: Number,
      y: Number, 
      width: Number,
      height: Number
    }
  }],
  // Text overlay positions for child's name
  nameOverlay: {
    x: Number,
    y: Number,
    fontSize: Number,
    fontColor: String,
    fontFamily: String,
    startTime: Number, // seconds
    endTime: Number    // seconds
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Template', templateSchema);
