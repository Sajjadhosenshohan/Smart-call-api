const Agent = require('../models/Agent');

// Create new agent
async function createAgent(agentData) {
  try {
    const agent = await Agent.create(agentData);
    return agent;
  } catch (error) {
    console.error('createAgent error:', error);
    throw error;
  }
}

// Update agent availability
async function updateAgentAvailability(agentId, isAvailable) {
  try {
    const agent = await Agent.findByIdAndUpdate(
      agentId,
      { isAvailable },
      { new: true }
    );
    
    return agent;
  } catch (error) {
    console.error('updateAgentAvailability error:', error);
    throw error;
  }
}

// Get available agents by skill
async function getAvailableAgentsBySkill(skill) {
  try {
    const agents = await Agent.find({
      skills: skill,
      isAvailable: true
    });
    
    return agents;
  } catch (error) {
    console.error('getAvailableAgentsBySkill error:', error);
    throw error;
  }
}

// Get agent performance stats
async function getAgentPerformance(agentId) {
  try {
    const stats = await Call.aggregate([
      { $match: { agent: agentId } },
      {
        $group: {
          _id: null,
          totalCalls: { $sum: 1 },
          avgDuration: { $avg: { $subtract: ['$endedAt', '$createdAt'] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
        }
      }
    ]);
    
    return stats[0] || {};
  } catch (error) {
    console.error('getAgentPerformance error:', error);
    throw error;
  }
}

module.exports = {
  createAgent,
  updateAgentAvailability,
  getAvailableAgentsBySkill,
  getAgentPerformance
};