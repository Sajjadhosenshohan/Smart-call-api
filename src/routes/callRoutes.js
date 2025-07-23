const express = require('express');
const router = express.Router();
const {
  handleInboundCall,
  processUserInput,
  endCall
} = require('../controllers/calls');
const { authenticateClient } = require('../middleware/auth');

// Webhook for inbound calls (from Telnyx)
// POST /api/calls/webhook/inbound
// Content-Type: application/json

// {
//   "call_session_id": "call_123",
//   "from": {"number": "+15551234567"},
//   "to": {"number": "+15557654321"},
//   "client_id": "client_123"
// }

router.post('/webhook/inbound', async (req, res) => {
  try {
    const { call_session_id, from, to } = req.body;
    await handleInboundCall(call_session_id, from.number, to.number,client_id);
    res.status(200).json({ status: 'handling call' });
  } catch (error) {
    console.error('Inbound call webhook error:', error);
    res.status(500).json({ error: 'Failed to handle inbound call' });
  }
});

// Process call transcription updates
router.post('/webhook/transcription', async (req, res) => {
  try {
    const { call_session_id, transcript } = req.body;
    await processUserInput(call_session_id, transcript);
    res.status(200).json({ status: 'processed transcript' });
  } catch (error) {
    console.error('Transcription webhook error:', error);
    res.status(500).json({ error: 'Failed to process transcription' });
  }
});

// End call
router.post('/:callId/end', authenticateClient, async (req, res) => {
  try {
    const { callId } = req.params;
    const result = await endCall(callId);
    res.status(200).json(result);
  } catch (error) {
    console.error('End call error:', error);
    res.status(500).json({ error: 'Failed to end call' });
  }
});

module.exports = router;