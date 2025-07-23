const { Configuration, OpenAIApi } = require('openai');
const { OPENAI_API_KEY, OPENAI_ORG_ID } = require('../config');

const configuration = new Configuration({
  organization: OPENAI_ORG_ID,
  apiKey: OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

// Generate AI response for conversation
async function generateConversationResponse(conversationHistory, instructions, model = 'gpt-4') {
  try {
    const messages = [
      { role: 'system', content: instructions },
      ...conversationHistory
    ];

    const response = await openai.createChatCompletion({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 150
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI generateResponse error:', error.response?.data || error.message);
    throw error;
  }
}

// Summarize call transcript
async function summarizeCall(transcript, model = 'gpt-3.5-turbo') {
  try {
    const response = await openai.createChatCompletion({
      model,
      messages: [
        {
          role: 'system',
          content: 'Summarize this call transcript concisely, highlighting key points, actions items, and customer sentiment.'
        },
        { role: 'user', content: transcript }
      ],
      temperature: 0.3
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI summarizeCall error:', error.response?.data || error.message);
    throw error;
  }
}

// Classify call for routing
async function classifyCall(transcript, categories) {
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Classify this call into one of these categories: ${categories.join(', ')}. Respond only with the category name.`
        },
        { role: 'user', content: transcript }
      ],
      temperature: 0.1,
      max_tokens: 20
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI classifyCall error:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  generateConversationResponse,
  summarizeCall,
  classifyCall
};