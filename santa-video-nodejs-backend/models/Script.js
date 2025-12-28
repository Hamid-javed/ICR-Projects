const mongoose = require('mongoose');

const scriptSegmentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const goodbyeMessageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const customScriptSchema = new mongoose.Schema({
  childName: {
    type: String,
    required: true
  },
  segmentIds: [{
    type: String,
    required: true
  }],
  goodbyeMessageId: {
    type: String,
    required: true
  },
  fullScript: {
    type: String,
    required: true
  },
  estimatedDuration: {
    type: Number,
    required: true
  },
  userId: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const ScriptSegment = mongoose.model('ScriptSegment', scriptSegmentSchema);
const GoodbyeMessage = mongoose.model('GoodbyeMessage', goodbyeMessageSchema);
const CustomScript = mongoose.model('CustomScript', customScriptSchema);

module.exports = {
  ScriptSegment,
  GoodbyeMessage,
  CustomScript
};
