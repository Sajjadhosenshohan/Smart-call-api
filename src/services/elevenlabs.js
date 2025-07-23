const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { ELEVENLABS_API_KEY, DEFAULT_VOICE_ID } = require('../config');

const elevenlabs = axios.create({
  baseURL: 'https://api.elevenlabs.io/v1',
  headers: {
    'xi-api-key': ELEVENLABS_API_KEY,
    'Content-Type': 'application/json'
  }
});

// Clone voice from audio samples
async function cloneVoice(name, description, audioFiles, labels = {}) {
  try {
    const formData = new FormData();
    
    formData.append('name', name);
    formData.append('description', description);
    
    audioFiles.forEach(file => {
      formData.append('files', fs.createReadStream(file.path), {
        filename: file.originalname,
        contentType: file.mimetype
      });
    });
    
    formData.append('labels', JSON.stringify(labels));

    const response = await elevenlabs.post('/voices/add', formData, {
      headers: {
        ...formData.getHeaders(),
        'xi-api-key': ELEVENLABS_API_KEY
      }
    });

    return response.data;
  } catch (error) {
    console.error('ElevenLabs cloneVoice error:', error.response?.data || error.message);
    throw error;
  }
}

// Generate speech from text
async function generateSpeech(voiceId, text, stability = 0.5, similarityBoost = 0.75) {
  try {
    const response = await elevenlabs.post(
      `/text-to-speech/${voiceId}`,
      {
        text,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost
        }
      },
      { responseType: 'arraybuffer' }
    );

    return response.data;
  } catch (error) {
    console.error('ElevenLabs generateSpeech error:', error.response?.data || error.message);
    throw error;
  }
}

// Get voice settings
async function getVoiceSettings(voiceId) {
  try {
    const response = await elevenlabs.get(`/voices/${voiceId}/settings`);
    return response.data;
  } catch (error) {
    console.error('ElevenLabs getVoiceSettings error:', error.response?.data || error.message);
    throw error;
  }
}

// List available voices
async function listVoices() {
  try {
    const response = await elevenlabs.get('/voices');
    return response.data;
  } catch (error) {
    console.error('ElevenLabs listVoices error:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  cloneVoice,
  generateSpeech,
  getVoiceSettings,
  listVoices
};