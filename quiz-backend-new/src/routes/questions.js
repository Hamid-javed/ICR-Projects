import express from 'express';
import multer from 'multer';
import { parse } from 'csv-parse';
import fs from 'fs';
import QRCode from 'qrcode';
import Question from '../models/Question.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Multer configuration for CSV upload
const upload = multer({ dest: 'uploads/' });

// Generate unique QR code
const generateQRCode = async (questionId) => {
  try {
    // Generate a unique identifier for the QR code
    const qrCodeId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    // Create a URL that points to the question
    const questionUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/quiz/${qrCodeId}`;
    
    // Generate QR code with the URL
    const qrCode = await QRCode.toDataURL(questionUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    
    return { qrCode, qrCodeId };
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Get total count of active questions - Public route
router.get('/count', async (req, res) => {
  try {
    const count = await Question.countDocuments({ active: true });
    
    res.status(200).json({
      status: 'success',
      data: {
        count
      }
    });
  } catch (error) {
    console.error('Error in GET /count:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to get question count'
    });
  }
});

// Get question by QR code - Public route
router.get('/qr/:qrCode', async (req, res) => {
  try {
    // Try to find the question by either qrCodeId or qrCode
    const question = await Question.findOne({ 
      $or: [
        { qrCodeId: req.params.qrCode },
        { qrCode: req.params.qrCode }
      ],
      active: true
    });

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found'
      });
    }

    // Don't send correct answer to client
    const questionData = question.toObject();
    questionData.options = questionData.options.map(option => ({
      _id: option._id,
      text: option.text
    }));

    // Ensure questionId is included in the response
    questionData.questionId = question.questionId;

    res.status(200).json({
      status: 'success',
      data: {
        question: questionData
      }
    });
  } catch (error) {
    console.error('Error in QR code lookup:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to process QR code'
    });
  }
});

// Get question by ID - Public route
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findOne({ 
      questionId: parseInt(req.params.id),
      active: true
    });

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found'
      });
    }

    // Don't send correct answer to client
    const questionData = question.toObject();
    questionData.options = questionData.options.map(option => ({
      _id: option._id,
      text: option.text,
      isCorrect: option.isCorrect
    }));

    // Ensure questionId is included in the response
    questionData.questionId = question.questionId;

    res.status(200).json({
      status: 'success',
      data: {
        question: questionData
      }
    });
  } catch (error) {
    console.error('Error in question lookup:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to fetch question'
    });
  }
});

// Protected routes below this line
router.use(protect);

// Answer a question - Protected route
router.post('/:id/answer', async (req, res) => {
  try {
    const { optionId } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found'
      });
    }

    // Find selected option
    const selectedOption = question.options.id(optionId);
    if (!selectedOption) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid option selected'
      });
    }

    // Record attempt
    req.user.questionsAttempted.push({
      questionId: question._id,
      isCorrect: selectedOption.isCorrect
    });
    req.user.lastQuestionAt = new Date();

    // Update score if answer is correct
    if (selectedOption.isCorrect) {
      await req.user.updateScore(true);
    }

    await req.user.save();

    res.status(200).json({
      status: 'success',
      data: {
        isCorrect: selectedOption.isCorrect,
        score: req.user.score,
        questionsAttempted: req.user.questionsAttempted.length
      }
    });
  } catch (error) {
    console.error('Error in answer submission:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to process answer'
    });
  }
});

// Import questions from CSV - Protected route
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload a CSV file'
      });
    }

    const questions = [];
    const records = [];

    // First, read and parse the CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(parse({ columns: true, trim: true }))
        .on('data', (row) => {
          records.push(row);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Get the last questionId
    const lastQuestion = await Question.findOne({}, {}, { sort: { 'questionId': -1 } });
    let nextQuestionId = (lastQuestion && lastQuestion.questionId) ? lastQuestion.questionId : 0;

    // Generate QR codes and prepare questions
    for (const row of records) {
      nextQuestionId += 1; // Increment first
      const { qrCode, qrCodeId } = await generateQRCode(nextQuestionId);
      
      const options = [
        { text: row.option1, isCorrect: row.correctOption === '1' },
        { text: row.option2, isCorrect: row.correctOption === '2' },
        { text: row.option3, isCorrect: row.correctOption === '3' },
        { text: row.option4, isCorrect: row.correctOption === '4' }
      ];

      questions.push({
        questionId: nextQuestionId,
        questionText: row.question,
        options,
        category: row.category,
        difficulty: row.difficulty || 'medium',
        qrCode,
        qrCodeId
      });
    }

    // Insert all questions at once
    const insertedQuestions = await Question.insertMany(questions);
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      status: 'success',
      data: {
        count: questions.length
      }
    });
  } catch (error) {
    // Clean up uploaded file if exists
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router; 