const VoiceProfile = require('../models/VoiceProfile');
const { cloneVoice, generateSpeech, listVoices } = require('../services/elevenlabs');
const { uploadAudio } = require('../services/storage');

// Create voice clone
async function createVoiceClone(userId, name, description, audioFiles, labels = {}) {
  try {
    // Clone voice with ElevenLabs
    const voiceData = await cloneVoice(name, description, audioFiles, labels);
    
    // Create voice profile record
    const voiceProfile = await VoiceProfile.create({
      userId,
      voiceId: voiceData.voice_id,
      name,
      description,
      labels,
      samples: audioFiles.map(file => ({
        originalName: file.originalname,
        path: file.path,
        size: file.size
      }))
    });
    
    return voiceProfile;
  } catch (error) {
    console.error('createVoiceClone error:', error);
    throw error;
  }
}

// Test voice clone
async function testVoiceClone(voiceId, text) {
  try {
    // Generate speech
    const audioBuffer = await generateSpeech(voiceId, text);
    
    // Upload audio for playback
    const audioUrl = await uploadAudio(audioBuffer, `tests/${voiceId}/${Date.now()}.mp3`);
    
    return { audioUrl };
  } catch (error) {
    console.error('testVoiceClone error:', error);
    throw error;
  }
}

// List available voices
async function getAvailableVoices() {
  try {
    const voices = await listVoices();
    return voices;
  } catch (error) {
    console.error('getAvailableVoices error:', error);
    throw error;
  }
}

// Assign voice to client
async function assignVoiceToClient(clientId, voiceId) {
  try {
    const client = await Client.findByIdAndUpdate(
      clientId,
      { voiceProfile: voiceId },
      { new: true }
    );
    
    return client;
  } catch (error) {
    console.error('assignVoiceToClient error:', error);
    throw error;
  }
}

module.exports = {
  createVoiceClone,
  testVoiceClone,
  getAvailableVoices,
  assignVoiceToClient
};