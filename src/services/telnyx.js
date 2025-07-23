const axios = require('axios');
const { TELNYX_API_KEY } = require('../config');

const telnyx = axios.create({
  baseURL: 'https://api.telnyx.com/v2',
  headers: {
    'Authorization': `Bearer ${TELNYX_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Initialize call
async function initiateCall(from, to, callControlId, clientState = '') {
  try {
    const response = await telnyx.post('/calls', {
      connection_id: callControlId,
      to,
      from,
      client_state: clientState
    });
    return response.data;
  } catch (error) {
    console.error('Telnyx initiateCall error:', error.response?.data || error.message);
    throw error;
  }
}

// Answer incoming call
async function answerCall(callSessionId) {
  try {
    const response = await telnyx.post(`/calls/${callSessionId}/actions/answer`);
    return response.data;
  } catch (error) {
    console.error('Telnyx answerCall error:', error.response?.data || error.message);
    throw error;
  }
}

// Play audio in call
async function playAudio(callSessionId, audioUrl) {
  try {
    const response = await telnyx.post(
      `/calls/${callSessionId}/actions/playback_start`,
      { audio_url: audioUrl, overlay: false }
    );
    return response.data;
  } catch (error) {
    console.error('Telnyx playAudio error:', error.response?.data || error.message);
    throw error;
  }
}

// Start transcription
async function startTranscription(callSessionId, language = 'en') {
  try {
    const response = await telnyx.post(
      `/calls/${callSessionId}/actions/transcription_start`,
      { language }
    );
    return response.data;
  } catch (error) {
    console.error('Telnyx startTranscription error:', error.response?.data || error.message);
    throw error;
  }
}

// Transfer call to human agent
async function transferCall(callSessionId, targetNumber) {
  try {
    const response = await telnyx.post(
      `/calls/${callSessionId}/actions/transfer`,
      { target: targetNumber }
    );
    return response.data;
  } catch (error) {
    console.error('Telnyx transferCall error:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  initiateCall,
  answerCall,
  playAudio,
  startTranscription,
  transferCall
};