const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const generateAIResponse = async (message, profile = {}) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            return 'Groq AI is not configured. Please add your GROQ_API_KEY.';
        }

        const prompt = `You are BursaryBot, an AI assistant for South African students looking for bursaries. Student field: ${profile.field_of_study || 'Unknown'}. Student question: ${message}. Give a helpful, concise response.`;

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 800
        });

        return completion.choices[0].message.content;

    } catch (error) {
        console.error('Groq Error FULL:', JSON.stringify(error, null, 2));
        console.error('Groq Error message:', error.message);
        console.error('Groq Error status:', error.status);
        return 'Sorry, I am having trouble right now. Please try again.';
    }
};

module.exports = generateAIResponse;