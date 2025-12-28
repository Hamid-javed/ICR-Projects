import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
      req.fileValidationError = 'Only image files are allowed!';
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Helper function to create JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Helper function to send token response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res.cookie('token', token, cookieOptions);

  user.deviceId = undefined; // Don't send deviceId in response

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// Check device and register/login
router.post('/check-device', async (req, res) => {
  try {
    const { deviceId, name, email } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        status: 'error',
        message: 'Device ID is required'
      });
    }

    // Check if device exists
    const existingUser = await User.findOne({ deviceId });

    if (existingUser) {
      // Device exists, log in user
      createSendToken(existingUser, 200, res);
    } else {
      // New device, require registration
      res.status(200).json({
        status: 'success',
        requiresRegistration: true
      });
    }
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Register new user
router.post('/register', upload.single('profilePicture'), async (req, res) => {
  try {
    const { name, email, deviceId, contactNo, gender } = req.body;

    if (!name || !email || !deviceId) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide name, email and device ID'
      });
    }

    // Check if deviceId already exists
    const existingDevice = await User.findOne({ deviceId });
    if (existingDevice) {
      return res.status(400).json({
        status: 'error',
        message: 'This device is already registered. Please use a different device or contact support.'
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    const newUser = await User.create({
      name,
      email,
      deviceId,
      profilePicture: req.file ? `/uploads/${req.file.filename}` : undefined,
      contactNo,
      gender,
      totalQuestions: 25
    });

    createSendToken(newUser, 201, res);
  } catch (error) {
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'This device is already registered. Please use a different device or contact support.'
      });
    }
    
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
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