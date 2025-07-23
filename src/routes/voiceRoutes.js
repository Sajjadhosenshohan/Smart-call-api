const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createVoiceClone,
  testVoiceClone,
  getAvailableVoices,
  assignVoiceToClient
} = require('../controllers/voices');
const { authenticateClient } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/voice_samples/' });

// Create voice clone
router.post('/clone', 
  authenticateClient,
  upload.array('samples', 5), // Max 5 samples
  async (req, res) => {
    try {
      const { userId } = req.client;
      const { name, description } = req.body;
      const voice = await createVoiceClone(
        userId, 
        name, 
        description, 
        req.files
      );
      res.status(201).json(voice);
    } catch (error) {
      console.error('Voice clone error:', error);
      res.status(500).json({ error: 'Failed to create voice clone' });
    }
  }
);

// Test voice clone
router.post('/:voiceId/test', authenticateClient, async (req, res) => {
  try {
    const { voiceId } = req.params;
    const { text } = req.body;
    const result = await testVoiceClone(voiceId, text);
    res.status(200).json(result);
  } catch (error) {
    console.error('Voice test error:', error);
    res.status(500).json({ error: 'Failed to test voice' });
  }
});

// List available voices
router.get('/', authenticateClient, async (req, res) => {
  try {
    const voices = await getAvailableVoices();
    res.status(200).json(voices);
  } catch (error) {
    console.error('List voices error:', error);
    res.status(500).json({ error: 'Failed to list voices' });
  }
});

// Assign voice to client
router.post('/:voiceId/assign', authenticateClient, async (req, res) => {
  try {
    const { voiceId } = req.params;
    const { clientId } = req.body;
    const client = await assignVoiceToClient(clientId, voiceId);
    res.status(200).json(client);
  } catch (error) {
    console.error('Assign voice error:', error);
    res.status(500).json({ error: 'Failed to assign voice' });
  }
});

module.exports = router;