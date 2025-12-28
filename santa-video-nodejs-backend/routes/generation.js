const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voiceController');
const videoGenerationController = require('../controllers/videoGenerationController');
const mailController = require('../controllers/mailController');

router.post('/sample-voice', voiceController.generateNameVoice);
router.post('/generate-video', videoGenerationController.createVideo);
router.post('/send-mail', mailController.sendMail);

module.exports = router;
