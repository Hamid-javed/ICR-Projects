import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  deviceId: {
    type: String,
    required: [true, 'Device ID is required'],
    unique: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  contactNo: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  score: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 0
  },
  position: {
    type: String,
    default: ''
  },
  dailyScore: {
    type: Number,
    default: 0
  },
  weeklyScore: {
    type: Number,
    default: 0
  },
  monthlyScore: {
    type: Number,
    default: 0
  },
  yearlyScore: {
    type: Number,
    default: 0
  },
  questionsAttempted: [{
    questionId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Question'
    },
    isCorrect: Boolean,
    attemptedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastQuestionAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Method to update score
userSchema.methods.updateScore = async function(isCorrect) {
  if (isCorrect) {
    // Get quiz settings
    const QuizSettings = mongoose.model('QuizSettings');
    const settings = await QuizSettings.findOne();
    const scoreToAdd = settings ? settings.scorePerQuestion : 50; // Default to 50 if settings not found
    
    this.score += scoreToAdd;
    this.dailyScore += scoreToAdd;
    this.weeklyScore += scoreToAdd;
    this.monthlyScore += scoreToAdd;
    this.yearlyScore += scoreToAdd;
  }
  return this.save();
};

const User = mongoose.model('User', userSchema);

export default User; 