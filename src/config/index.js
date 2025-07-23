require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Telnyx configuration
  TELNYX_API_KEY: process.env.TELNYX_API_KEY,
  TELNYX_APP_ID: process.env.TELNYX_APP_ID,
  
  // OpenAI configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_ORG_ID: process.env.OPENAI_ORG_ID,
  
  // ElevenLabs configuration
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
  DEFAULT_VOICE_ID: process.env.DEFAULT_VOICE_ID,
  
  // Database
  MONGO_URI: process.env.MONGO_URI,
  
  // Storage
  STORAGE_BUCKET: process.env.STORAGE_BUCKET,
  STORAGE_ENDPOINT: process.env.STORAGE_ENDPOINT
};