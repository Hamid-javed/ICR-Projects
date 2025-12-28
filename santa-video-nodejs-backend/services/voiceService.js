const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class VoiceService {
  constructor() {
    this.elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    this.voiceId = process.env.SANTA_VOICE_ID || 'default-santa-voice';
  }

  async generateNamePreview(name, voice = 'santa_voice') {
    try {
      const text = `Ho ho ho! Hello there, ${name}!`;

      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${this.voiceId}`,
        {
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        },
        {
          headers: {
            Accept: 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.elevenLabsApiKey,
          },
          responseType: 'arraybuffer',
        },
      );

      const fileName = `name-preview-${uuidv4()}.mp3`;
      const filePath = path.join(__dirname, '../uploads/audio', fileName);

      // Ensure directory exists
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

      await fs.promises.writeFile(filePath, response.data);

      return `/uploads/audio/${fileName}`;
    } catch (error) {
      console.error('ElevenLabs API Error:', error.response?.data || error.message);
      
      // Fallback: Create a mock audio file for development
      if (process.env.NODE_ENV === 'development') {
        return this.createMockAudioFile(name, 'preview');
      }
      
      throw new Error('Failed to generate voice preview');
    }
  }

  async generateFullVoiceover(name, script, voice = 'santa_voice') {
    try {
      // Replace placeholder with actual name
      const personalizedScript = script.replace(/{name}/g, name);

      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${this.voiceId}`,
        {
          text: personalizedScript,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        },
        {
          headers: {
            Accept: 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.elevenLabsApiKey,
          },
          responseType: 'arraybuffer',
        },
      );

      const fileName = `voiceover-${uuidv4()}.mp3`;
      const filePath = path.join(__dirname, '../uploads/audio', fileName);

      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      await fs.promises.writeFile(filePath, response.data);

      return `/uploads/audio/${fileName}`;
    } catch (error) {
      console.error('ElevenLabs API Error:', error.response?.data || error.message);
      
      // Fallback: Create a mock audio file for development
      if (process.env.NODE_ENV === 'development') {
        return this.createMockAudioFile(name, 'voiceover');
      }
      
      throw new Error('Failed to generate full voiceover');
    }
  }

  async getAudioDuration(audioPath) {
    try {
      // This would typically use ffprobe to get audio duration
      // For now, return estimated duration based on text length
      const stats = await fs.promises.stat(audioPath.replace('/uploads/', 'uploads/'));
      // Rough estimation: 1MB ~ 30 seconds of audio
      const estimatedDuration = Math.max(30, (stats.size / 1024 / 1024) * 30);
      return Math.round(estimatedDuration);
    } catch (error) {
      console.error('Error getting audio duration:', error);
      return 30; // Default fallback
    }
  }

  async createMockAudioFile(name, type) {
    try {
      const fileName = `mock-${type}-${uuidv4()}.mp3`;
      const filePath = path.join(__dirname, '../uploads/audio', fileName);
      
      // Ensure directory exists
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      
      // Create a small mock MP3 file (just empty content for development)
      await fs.promises.writeFile(filePath, Buffer.alloc(1024, 0));
      
      return `/uploads/audio/${fileName}`;
    } catch (error) {
      console.error('Error creating mock audio file:', error);
      throw new Error('Failed to create mock audio file');
    }
  }

  async getAvailableVoices() {
    try {
      if (!this.elevenLabsApiKey) {
        return this.getMockVoices();
      }

      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.elevenLabsApiKey,
        },
      });

      return response.data.voices || [];
    } catch (error) {
      console.error('Error fetching voices:', error);
      return this.getMockVoices();
    }
  }

  getMockVoices() {
    return [
      {
        voice_id: 'santa-voice-1',
        name: 'Classic Santa',
        category: 'generated',
        description: 'Traditional jolly Santa voice',
      },
      {
        voice_id: 'santa-voice-2',
        name: 'Warm Santa',
        category: 'generated',
        description: 'Gentle and warm Santa voice',
      },
    ];
  }

  async deleteAudioFile(audioPath) {
    try {
      const fullPath = path.join(__dirname, '..', audioPath);
      await fs.promises.unlink(fullPath);
    } catch (error) {
      console.error('Error deleting audio file:', error);
    }
  }
}

module.exports = new VoiceService();
