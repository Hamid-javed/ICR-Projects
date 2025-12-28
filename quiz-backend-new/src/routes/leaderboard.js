import express from 'express';
import User from '../models/User.js';
// import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper function to get leaderboard with date filter
const getLeaderboard = async (startDate, endDate) => {
  return await User.find({
    'questionsAttempted.answeredAt': {
      $gte: startDate,
      $lte: endDate
    }
  })
  .select('name email score questionsAttempted')
  .sort('-score')
  .limit(100);
};

// Get today's leaderboard
router.get('/daily', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const leaderboard = await User.find()
      .select('name email dailyScore')
      .sort('-dailyScore')
      .limit(100);

    res.status(200).json({
      status: 'success',
      data: {
        leaderboard: leaderboard.map(user => ({
          _id: user._id,
          name: user.name,
          score: user.dailyScore || 0
        }))
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get weekly leaderboard
router.get('/weekly',  async (req, res) => {
  try {
    const leaderboard = await User.find()
      .select('name email weeklyScore')
      .sort('-weeklyScore')
      .limit(100);

    res.status(200).json({
      status: 'success',
      data: {
        leaderboard: leaderboard.map(user => ({
          _id: user._id,
          name: user.name,
          score: user.weeklyScore || 0
        }))
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get monthly leaderboard
router.get('/monthly',  async (req, res) => {
  try {
    const leaderboard = await User.find()
      .select('name email monthlyScore')
      .sort('-monthlyScore')
      .limit(100);

    res.status(200).json({
      status: 'success',
      data: {
        leaderboard: leaderboard.map(user => ({
          _id: user._id,
          name: user.name,
          score: user.monthlyScore || 0
        }))
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get all-time leaderboard
router.get('/all-time',  async (req, res) => {
  try {
    const leaderboard = await User.find()
      .select('name email score')
      .sort('-score')
      .limit(100);

    res.status(200).json({
      status: 'success',
      data: {
        leaderboard: leaderboard.map(user => ({
          _id: user._id,
          name: user.name,
          score: user.score || 0
        }))
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get custom date range leaderboard
router.get('/custom',  async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide start and end dates'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid date format'
      });
    }

    const leaderboard = await getLeaderboard(start, end);

    res.status(200).json({
      status: 'success',
      data: {
        leaderboard
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router; 