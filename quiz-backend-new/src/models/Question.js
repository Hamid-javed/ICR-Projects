import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionId: {
    type: Number,
    required: true,
    unique: true
  },
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  }],
  qrCode: {
    type: String,
    required: false
  },
  qrCodeId: {
    type: String,
    required: [true, 'QR code identifier is required'],
    unique: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate sequential questionId and qrCodeId
questionSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generate questionId
    const lastQuestion = await this.constructor.findOne({}, {}, { sort: { 'questionId': -1 } });
    this.questionId = lastQuestion ? lastQuestion.questionId + 1 : 1;

    // Generate qrCodeId if not provided
    if (!this.qrCodeId) {
      this.qrCodeId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }
  }
  next();
});

const Question = mongoose.model('Question', questionSchema);

export default Question; 