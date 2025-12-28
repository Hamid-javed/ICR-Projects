import express from 'express';
import User from '../models/User.js';
import Question from '../models/Question.js';
import QuizSettings from '../models/QuizSettings.js';
import SpecialBestSettings from '../models/SpecialBestSettings.js';
import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Create initial admin user
router.post('/setup', async (req, res) => {
  try {
    // Check if any admin exists
    const adminExists = await Admin.findOne();
    if (adminExists) {
      return res.status(400).json({
        status: 'error',
        message: 'Admin user already exists'
      });
    }

    // Create admin user
    const admin = await Admin.create({
      email: 'admin@neoja.com',
      password: 'Admin@123',
      role: 'admin'
    });

    res.status(201).json({
      status: 'success',
      message: 'Admin user created successfully',
      data: {
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Error in admin setup:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to create admin user'
    });
  }
});

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email and include password
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin || !(await admin.correctPassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: admin._id,
        role: admin.role
      }, 
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN
      }
    );

    // Set cookie
    const cookieOptions = {
      expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    };

    res.cookie('token', token, cookieOptions);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          email: admin.email,
          role: admin.role
        }
      }
    });
  } catch (error) {
    console.error('Error in admin login:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to login'
    });
  }
});

// Get all users with pagination and search
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const role = req.query.role || '';

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contactNo: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('name email score questionsAttempted role profilePicture contactNo gender createdAt dailyScore weeklyScore monthlyScore yearlyScore position maxAttempts')
      .sort('-score')
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);

    // Calculate rankings and transform data to match UI structure
    const usersWithRankings = users.map((user, index) => {
      // Calculate positions based on scores
      const allTimePosition = index + 1;
      const weeklyPosition = users.findIndex(u => u.weeklyScore > user.weeklyScore) + 1;
      const monthlyPosition = users.findIndex(u => u.monthlyScore > user.monthlyScore) + 1;
      const dailyPosition = users.findIndex(u => u.dailyScore > user.dailyScore) + 1;

      return {
        userId: user._id.toString(),
        fullName: user.name,
        role: user.role,
        rankings: {
          allTime: { 
            position: allTimePosition, 
            highestScore: user.score || 0 
          },
          weekly: { 
            position: weeklyPosition, 
            highestScore: user.weeklyScore || 0 
          },
          monthly: { 
            position: monthlyPosition, 
            highestScore: user.monthlyScore || 0 
          },
          daily: { 
            position: dailyPosition, 
            highestScore: user.dailyScore || 0 
          }
        },
        attempts: user.questionsAttempted?.length || 0,
        stats: {
          totalQuestionsAttempted: user.questionsAttempted?.length || 0,
          correctAnswers: user.questionsAttempted?.filter(q => q.isCorrect)?.length || 0,
          accuracy: user.questionsAttempted?.length > 0 
            ? (user.questionsAttempted.filter(q => q.isCorrect).length / user.questionsAttempted.length * 100).toFixed(2)
            : 0,
          lastActive: user.lastQuestionAt || user.createdAt
        }
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        users: usersWithRankings,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error in GET /users:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to fetch users'
    });
  }
});

// Get user by ID with detailed stats
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email score questionsAttempted role profilePicture contactNo gender createdAt dailyScore weeklyScore monthlyScore yearlyScore position maxAttempts');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get all users to calculate rankings
    const allUsers = await User.find()
      .select('score weeklyScore monthlyScore yearlyScore')
      .sort('-score');

    // Calculate positions
    const allTimePosition = allUsers.findIndex(u => u._id.toString() === user._id.toString()) + 1;
    const weeklyPosition = allUsers.findIndex(u => u.weeklyScore > user.weeklyScore) + 1;
    const monthlyPosition = allUsers.findIndex(u => u.monthlyScore > user.monthlyScore) + 1;
    const dailyPosition = allUsers.findIndex(u => u.dailyScore > user.dailyScore) + 1;

    // Transform data to match UI structure
    const userData = {
      userId: user._id.toString(),
      fullName: user.name,
      role: user.role,
      rankings: {
        allTime: { 
          position: allTimePosition, 
          highestScore: user.score || 0 
        },
        weekly: { 
          position: weeklyPosition, 
          highestScore: user.weeklyScore || 0 
        },
        monthly: { 
          position: monthlyPosition, 
          highestScore: user.monthlyScore || 0 
        },
        daily: { 
          position: dailyPosition, 
          highestScore: user.dailyScore || 0 
        }
      },
      attempts: user.questionsAttempted?.length || 0,
      stats: {
        totalQuestionsAttempted: user.questionsAttempted?.length || 0,
        correctAnswers: user.questionsAttempted?.filter(q => q.isCorrect)?.length || 0,
        accuracy: user.questionsAttempted?.length > 0 
          ? (user.questionsAttempted.filter(q => q.isCorrect).length / user.questionsAttempted.length * 100).toFixed(2)
          : 0,
        lastActive: user.lastQuestionAt || user.createdAt
      }
    };

    res.status(200).json({
      status: 'success',
      data: {
        user: userData
      }
    });
  } catch (error) {
    console.error('Error in GET /users/:id:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to fetch user details'
    });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const allowedUpdates = [
      'fullName',
      'email',
      'role',
      'contactNo',
      'gender',
      'maxAttempts',
      'position',
      'rankings'
    ];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid updates!'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Prevent changing role of the last admin
    if (updates.includes('role') && user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot change role of the last admin'
        });
      }
    }

    // Update user fields
    updates.forEach(update => {
      if (update === 'fullName') {
        user.name = req.body[update];
      } else if (update === 'rankings') {
        const rankings = req.body[update];
        // Update scores based on their respective time periods
        if (rankings.daily?.highestScore !== undefined) {
          user.dailyScore = rankings.daily.highestScore;
        }
        if (rankings.weekly?.highestScore !== undefined) {
          user.weeklyScore = rankings.weekly.highestScore;
        }
        if (rankings.monthly?.highestScore !== undefined) {
          user.monthlyScore = rankings.monthly.highestScore;
        }
        if (rankings.allTime?.highestScore !== undefined) {
          user.score = rankings.allTime.highestScore;
          user.yearlyScore = rankings.allTime.highestScore;
        }
        // Update position if provided
        if (rankings.allTime?.position !== undefined) {
          user.position = rankings.allTime.position;
        }
      } else if (['maxAttempts'].includes(update)) {
        user[update] = parseInt(req.body[update]) || 0;
      } else {
        user[update] = req.body[update];
      }
    });

    await user.save();

    // Get all users to calculate updated rankings
    const allUsers = await User.find()
      .select('score weeklyScore monthlyScore yearlyScore')
      .sort('-score');

    // Calculate positions
    const allTimePosition = allUsers.findIndex(u => u._id.toString() === user._id.toString()) + 1;
    const weeklyPosition = allUsers.findIndex(u => u.weeklyScore > user.weeklyScore) + 1;
    const monthlyPosition = allUsers.findIndex(u => u.monthlyScore > user.monthlyScore) + 1;
    const dailyPosition = allUsers.findIndex(u => u.dailyScore > user.dailyScore) + 1;

    // Transform data to match UI structure
    const userData = {
      userId: user._id.toString(),
      fullName: user.name,
      role: user.role,
      rankings: {
        allTime: { 
          position: allTimePosition, 
          highestScore: user.score || 0 
        },
        weekly: { 
          position: weeklyPosition, 
          highestScore: user.weeklyScore || 0 
        },
        monthly: { 
          position: monthlyPosition, 
          highestScore: user.monthlyScore || 0 
        },
        daily: { 
          position: dailyPosition, 
          highestScore: user.dailyScore || 0 
        }
      },
      attempts: user.questionsAttempted?.length || 0,
      stats: {
        totalQuestionsAttempted: user.questionsAttempted?.length || 0,
        correctAnswers: user.questionsAttempted?.filter(q => q.isCorrect)?.length || 0,
        accuracy: user.questionsAttempted?.length > 0 
          ? (user.questionsAttempted.filter(q => q.isCorrect).length / user.questionsAttempted.length * 100).toFixed(2)
          : 0,
        lastActive: user.lastQuestionAt || user.createdAt
      }
    };

    res.status(200).json({
      status: 'success',
      data: {
        user: userData
      }
    });
  } catch (error) {
    console.error('Error in PUT /users/:id:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to update user'
    });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot delete the last admin'
        });
      }
    }

    await user.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('Error in DELETE /users/:id:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to delete user'
    });
  }
});

// Delete all users (except admins)
router.delete('/users', async (req, res) => {
  try {
    const result = await User.deleteMany({ role: { $ne: 'admin' } });
    
    res.status(200).json({
      status: 'success',
      message: `Deleted ${result.deletedCount} users`,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('Error in DELETE /users:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to delete users'
    });
  }
});

// Get all questions
router.get('/questions', async (req, res) => {
  try {
    const questions = await Question.find()
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      data: {
        questions
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get single question
router.get('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findOne({ questionId: parseInt(req.params.id) });

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        question
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update question
router.put('/questions/:id', async (req, res) => {
  try {
    const allowedUpdates = ['questionText', 'options', 'category', 'difficulty', 'active'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid updates!'
      });
    }

    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found'
      });
    }

    updates.forEach(update => question[update] = req.body[update]);
    await question.save();

    res.status(200).json({
      status: 'success',
      data: {
        question
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Delete question
router.delete('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findOneAndDelete({ questionId: parseInt(req.params.id) });

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Delete all questions
router.delete('/questions', async (req, res) => {
  try {
    await Question.deleteMany({});
    
    res.status(200).json({
      status: 'success',
      message: 'All questions have been deleted'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get question QR code
router.get('/questions/:id/qr', async (req, res) => {
  try {
    const question = await Question.findOne({ questionId: parseInt(req.params.id) });

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        qrCode: question.qrCode
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get quiz settings
router.get('/settings', async (req, res) => {
  try {
    let settings = await QuizSettings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await QuizSettings.create({
        questionTimeLimit: 25,
        scorePerQuestion: 50
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        settings
      }
    });
  } catch (error) {
    console.error('Error in GET /settings:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update quiz settings
router.put('/settings', async (req, res) => {
  try {
    const { questionTimeLimit, scorePerQuestion } = req.body;

    // Validate input
    if (typeof questionTimeLimit !== 'number' || typeof scorePerQuestion !== 'number') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid input: questionTimeLimit and scorePerQuestion must be numbers'
      });
    }

    // Find existing settings or create new ones
    let settings = await QuizSettings.findOne();
    
    if (!settings) {
      settings = new QuizSettings({
        questionTimeLimit,
        scorePerQuestion
      });
    } else {
      settings.questionTimeLimit = questionTimeLimit;
      settings.scorePerQuestion = scorePerQuestion;
    }

    // Save the settings
    await settings.save();

    res.status(200).json({
      status: 'success',
      data: {
        settings
      }
    });
  } catch (error) {
    console.error('Error in PUT /settings:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to update settings'
    });
  }
});

// Get special best settings
router.get('/special-best', async (req, res) => {
  try {
    let settings = await SpecialBestSettings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await SpecialBestSettings.create({
        maxAttempts: 3,
        topBestPlayer: 10,
        startDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB').replace(/\//g, '-')
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        settings
      }
    });
  } catch (error) {
    console.error('Error in GET /special-best:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update special best settings
router.put('/special-best', async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    const { topBestPlayer, startDate, endDate } = req.body;

    // Validate input
    console.log('Validating input:', { topBestPlayer, startDate, endDate });
    console.log('topBestPlayer type:', typeof topBestPlayer);

    if (topBestPlayer === undefined || topBestPlayer === null || isNaN(topBestPlayer)) {
      console.log('Invalid topBestPlayer:', topBestPlayer);
      return res.status(400).json({
        status: 'error',
        message: 'topBestPlayer must be a valid number'
      });
    }

    if (topBestPlayer < 1) {
      console.log('topBestPlayer too small:', topBestPlayer);
      return res.status(400).json({
        status: 'error',
        message: 'topBestPlayer must be a positive number'
      });
    }

    if (!startDate || !endDate) {
      console.log('Missing dates:', { startDate, endDate });
      return res.status(400).json({
        status: 'error',
        message: 'startDate and endDate are required'
      });
    }

    // Find existing settings or create new ones
    let settings = await SpecialBestSettings.findOne();
    console.log('Existing settings:', settings);
    
    if (!settings) {
      console.log('Creating new settings');
      settings = new SpecialBestSettings({
        topBestPlayer,
        startDate,
        endDate
      });
    } else {
      console.log('Updating existing settings');
      settings.topBestPlayer = topBestPlayer;
      settings.startDate = startDate;
      settings.endDate = endDate;
    }

    // Save the settings
    await settings.save();
    console.log('Settings saved successfully:', settings);

    res.status(200).json({
      status: 'success',
      data: {
        settings
      }
    });
  } catch (error) {
    console.error('Error in PUT /special-best:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to update settings'
    });
  }
});

export default router; 