import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey || '');

export async function generateText(prompt: string): Promise<string> {
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}
