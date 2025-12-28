const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();


const voiceController = {
  // Generate voice using ElevenLabs API for child's name only
  generateNameVoice: async (req, res) => {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({
          error: "Name is required",
          message: "Please provide a child's name to generate voice"
        });
      }

      // Validate name length
      if (name.length > 50) {
        return res.status(400).json({
          error: "Name too long",
          message: "Name must be 50 characters or less"
        });
      }

      // Create a simple greeting with the name
      const greeting = `Ho ho ho! Hello ${name}!`;

      // ElevenLabs API configuration
      const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
      // Using a default, free, deep voice for Santa. You can set ELEVENLABS_VOICE_ID in your .env for a different one.
      const voiceId = process.env.ELEVENLABS_VOICE_ID || 'mBxe7tYxRAMLpIP3fPEp';

      if (!elevenLabsApiKey) {
        // Return placeholder response if API key is not configured
        return res.json({
          success: true,
          audioUrl: `/audio/placeholder-${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.mp3`,
          name: name,
          text: greeting,
          message: "ElevenLabs API key not configured - using placeholder"
        });
      }

      try {
        // Call ElevenLabs API
        const response = await axios.post(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            text: greeting,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          },
          {
            headers: {
              'Accept': 'audio/mpeg',
              'xi-api-key': elevenLabsApiKey,
              'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
          }
        );

        // Save audio file
        const audioId = uuidv4();
        const audioPath = path.join(__dirname, '../uploads/audio', `${name}.mp3`);

        // Ensure audio directory exists
        const audioDir = path.dirname(audioPath);
        if (!fs.existsSync(audioDir)) {
          fs.mkdirSync(audioDir, { recursive: true });
        }

        fs.writeFileSync(audioPath, response.data);

        res.json({
          success: true,
          audioUrl: `/uploads/audio/${audioId}.mp3`,
          name: name,
          text: greeting,
          audioId: audioId
        });
      } catch (elevenLabsError) {
        let errorMessage = elevenLabsError.message;
        if (elevenLabsError.response && elevenLabsError.response.data) {
          try {
            // The error from ElevenLabs is a buffer, so we decode it.
            const decodedError = Buffer.from(elevenLabsError.response.data).toString('utf-8');
            const errorJson = JSON.parse(decodedError);
            errorMessage = errorJson.detail ? JSON.stringify(errorJson.detail) : decodedError;
          } catch (e) {
            errorMessage = Buffer.from(elevenLabsError.response.data).toString('utf-8');
          }
        }
        console.error('ElevenLabs API Error:', errorMessage);

        // Return placeholder if ElevenLabs API fails
        res.json({
          success: true,
          audioUrl: `/audio/placeholder-${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.mp3`,
          name: name,
          text: greeting,
          message: "Using placeholder audio due to API error"
        });
      }
    } catch (error) {
      console.error('Voice generation error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Generate full voiceover for video
  generate: async (req, res) => {
    try {
      const { name, script, voice = "santa_voice" } = req.body;

      if (!name || !script) {
        return res.status(400).json({ error: "Name and script are required" });
      }

      const audioUrl = await voiceService.generateFullVoiceover(name, script, voice);

      res.json({
        success: true,
        audioUrl,
        duration: await voiceService.getAudioDuration(audioUrl),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get available voices
  getVoices: async (req, res) => {
    try {
      const voices = await voiceService.getAvailableVoices();

      res.json({
        success: true,
        voices,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete audio file
  deleteAudio: async (req, res) => {
    try {
      const { filename } = req.params;
      const audioPath = `/uploads/audio/${filename}`;

      await voiceService.deleteAudioFile(audioPath);

      res.json({
        success: true,
        message: "Audio file deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = voiceController;
