// ai-call-center/
// ├── config/
// │   ├── index.js          # Environment config
// │   └── db.js            # Database connection
// ├── controllers/
// │   ├── calls.js         # Call handling logic
// │   ├── voices.js        # Voice cloning
// │   ├── agents.js        # Human agent management
// │   └── clients.js       # Client dashboard
// ├── middleware/
// │   ├── auth.js          # Authentication
// │   └── errorHandler.js  # Error handling
// ├── models/
// │   ├── Call.js          # Call records
// │   ├── VoiceProfile.js  # Voice clones
// │   ├── Agent.js         # Human agents
// │   └── Client.js        # Client accounts
// ├── routes/
// │   ├── callRoutes.js    # Call endpoints
// │   ├── voiceRoutes.js   # Voice endpoints
// │   ├── agentRoutes.js   # Agent endpoints
// │   └── clientRoutes.js  # Client endpoints
// ├── services/
// │   ├── telnyx.js        # Telnyx integration
// │   ├── openai.js        # OpenAI integration
// │   ├── elevenlabs.js    # ElevenLabs integration
// │   └── storage.js       # File storage
// ├── utils/
// │   ├── callRouting.js   # Routing logic
// │   └── audio.js        # Audio processing
// ├── app.js               # Express app
// └── server.js           # Server entry