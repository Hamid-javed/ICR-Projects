import mongoose from 'mongoose';

const quizSettingsSchema = new mongoose.Schema({
  questionTimeLimit: {
    type: Number,
    required: true,
    default: 25,
    min: 5,
    max: 30
  },
  scorePerQuestion: {
    type: Number,
    required: true,
    default: 50,
    min: 20,
    max: 80
  }
}, {
  timestamps: true
});

// Only check for existing documents when creating new ones
quizSettingsSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    if (count > 0) {
      next(new Error('Only one settings document can exist'));
    } else {
      next();
    }
  } else {
    next();
  }
});

const QuizSettings = mongoose.model('QuizSettings', quizSettingsSchema);

export default QuizSettings; 