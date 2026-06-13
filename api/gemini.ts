import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Generative AI using the secure backend environment variable
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

export default async function handler(req: any, res: any) {
  // Enforce POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  // Validate prompt existence
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt in request body' });
  }

  // Validate API key configuration
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is not configured on the server' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return res.status(200).json({ text });
  } catch (error: any) {
    console.error('Gemini API execution failed:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to generate content from Gemini' 
    });
  }
}
