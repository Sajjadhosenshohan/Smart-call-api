const Call = require('../models/Call');
const {
  answerCall,
  playAudio,
  startTranscription,
  transferCall
} = require('../services/telnyx');
const { generateConversationResponse, summarizeCall, classifyCall } = require('../services/openai');
const { generateSpeech } = require('../services/elevenlabs');
const { uploadAudio } = require('../services/storage');
const { determineRouting } = require('../utils/callRouting');

// Active call sessions
const activeCalls = new Map();

// Handle inbound call
async function handleInboundCall(callSessionId, fromNumber, toNumber, clientId) {
  try {
    // Answer the call
    await answerCall(callSessionId);
    
    // Start transcription
    await startTranscription(callSessionId);
    
    // Create call record
    const call = await Call.create({
      sessionId: callSessionId,
      from: fromNumber,
      to: toNumber,
      client: clientId,
      direction: 'inbound',
      status: 'active'
    });
    
    // Store in active calls
    activeCalls.set(callSessionId, {
      call,
      conversation: [],
      clientId
    });
    
    // Play initial greeting
    const greetingText = "Hello! Thanks for calling. How can I help you today?";
    await generateAndPlayResponse(callSessionId, greetingText);
    
    return call;
  } catch (error) {
    console.error('handleInboundCall error:', error);
    throw error;
  }
}

// Process user speech and generate response
async function processUserInput(callSessionId, transcript) {
  try {
    const callData = activeCalls.get(callSessionId);
    if (!callData) throw new Error('Call session not found');
    
    // Add user message to conversation
    callData.conversation.push({
      role: 'user',
      content: transcript,
      timestamp: new Date()
    });
    
    // Determine routing (AI, human, or hybrid)
    const routingDecision = await determineRouting(transcript, callData.clientId);
    
    if (routingDecision.handler === 'ai') {
      // Get AI response
      const instructions = `You are a friendly AI call assistant for ${callData.client.businessName}. 
        Be helpful, concise and professional.`;
      
      const aiResponse = await generateConversationResponse(
        callData.conversation,
        instructions
      );
      
      // Add AI response to conversation
      callData.conversation.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      });
      
      // Generate and play response
      await generateAndPlayResponse(callSessionId, aiResponse);
      
      return { handler: 'ai', response: aiResponse };
    } else if (routingDecision.handler === 'human') {
      // Transfer to human agent
      await transferToHumanAgent(callSessionId, routingDecision.agentId);
      return { handler: 'human', agentId: routingDecision.agentId };
    } else {
      // Hybrid handling
      const aiResponse = "Let me connect you with one of our specialists who can help with that.";
      await generateAndPlayResponse(callSessionId, aiResponse);
      await transferToHumanAgent(callSessionId, routingDecision.agentId);
      
      return { 
        handler: 'hybrid', 
        aiResponse,
        agentId: routingDecision.agentId 
      };
    }
  } catch (error) {
    console.error('processUserInput error:', error);
    throw error;
  }
}

// Generate speech and play in call
async function generateAndPlayResponse(callSessionId, text) {
  try {
    const callData = activeCalls.get(callSessionId);
    if (!callData) throw new Error('Call session not found');
    
    // Get voice profile (default or client-specific)
    const voiceId = callData.call.voiceProfile || DEFAULT_VOICE_ID;
    
    // Generate speech
    const audioBuffer = await generateSpeech(voiceId, text);
    
    // Upload audio
    const audioUrl = await uploadAudio(audioBuffer, `responses/${callSessionId}/${Date.now()}.mp3`);
    
    // Play audio in call
    await playAudio(callSessionId, audioUrl);
    
    return audioUrl;
  } catch (error) {
    console.error('generateAndPlayResponse error:', error);
    throw error;
  }
}

// Transfer call to human agent
async function transferToHumanAgent(callSessionId, agentId) {
  try {
    const callData = activeCalls.get(callSessionId);
    if (!callData) throw new Error('Call session not found');
    
    // Get agent's phone number (in a real app, this would come from DB)
    const agentNumber = await getAgentNumber(agentId);
    
    // Transfer call
    await transferCall(callSessionId, agentNumber);
    
    // Update call record
    callData.call.agent = agentId;
    callData.call.status = 'transferred';
    await callData.call.save();
    
    return agentNumber;
  } catch (error) {
    console.error('transferToHumanAgent error:', error);
    throw error;
  }
}

// End call and save summary
async function endCall(callSessionId) {
  try {
    const callData = activeCalls.get(callSessionId);
    if (!callData) throw new Error('Call session not found');
    
    // Update call status
    callData.call.status = 'completed';
    callData.call.endedAt = new Date();
    
    // Generate transcript
    const transcript = callData.conversation
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
    
    // Generate summary
    const summary = await summarizeCall(transcript);
    callData.call.summary = summary;
    
    // Save call
    await callData.call.save();
    
    // Remove from active calls
    activeCalls.delete(callSessionId);
    
    return { summary, transcript };
  } catch (error) {
    console.error('endCall error:', error);
    throw error;
  }
}

module.exports = {
  handleInboundCall,
  processUserInput,
  generateAndPlayResponse,
  transferToHumanAgent,
  endCall
};