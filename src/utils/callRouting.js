const { classifyCall } = require('../services/openai');
const { getAvailableAgentsBySkill } = require('../controllers/agents');

// Determine how to route a call
async function determineRouting(transcript, clientId) {
  try {
    // Classify call type
    const categories = ['sales', 'support', 'billing', 'technical'];
    const callType = await classifyCall(transcript, categories);
    
    // Get client's routing preferences
    const client = await Client.findById(clientId).select('callRoutingPreferences');
    const preferences = client.callRoutingPreferences || {};
    
    // Check if human agent is requested explicitly
    const wantsHuman = transcript.toLowerCase().includes('speak to a human') || 
                      transcript.toLowerCase().includes('real person');
    
    // Check client preferences for this call type
    const preferredHandler = preferences[callType] || 'ai';
    
    // Determine final handler
    let handler = preferredHandler;
    let agentId = null;
    
    if (wantsHuman || preferredHandler === 'human') {
      // Find available agent with matching skills
      const agents = await getAvailableAgentsBySkill(callType);
      if (agents.length > 0) {
        handler = 'human';
        agentId = agents[0]._id; // Simple round-robin
      } else if (preferredHandler === 'human') {
        // Fallback to hybrid if no agents available but human preferred
        handler = 'hybrid';
        agentId = null; // Will find any available agent
      }
    } else if (preferredHandler === 'hybrid') {
      // Hybrid handling - start with AI then transfer
      const agents = await getAvailableAgentsBySkill(callType);
      if (agents.length > 0) {
        agentId = agents[0]._id;
      }
    }
    
    return { handler, callType, agentId };
  } catch (error) {
    console.error('determineRouting error:', error);
    // Fallback to AI handling
    return { handler: 'ai', callType: 'unknown', agentId: null };
  }
}

module.exports = {
  determineRouting
};