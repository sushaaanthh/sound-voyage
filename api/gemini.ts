import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

const supabaseUrl = process.env.VITE_DB_URL || process.env.DB_URL || '';
const supabaseAnonKey = process.env.VITE_DB_ANON_KEY || process.env.DB_ANON_KEY || '';
const APP_ORIGIN = process.env.APP_ORIGIN || '';
const MAX_PROMPT_LENGTH = 2000;

async function verifyToken(token: string): Promise<boolean> {
  try {
    const client = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await client.auth.getUser(token);
    if (error || !user) return false;
    return true;
  } catch {
    return false;
  }
}

export default async function handler(req: any, res: any) {
  const corsOrigin = APP_ORIGIN || '*';

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.slice(7);
  const authenticated = await verifyToken(token);
  if (!authenticated) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Missing or invalid prompt in request body' });
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ error: 'Prompt exceeds maximum allowed length' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is not configured on the server' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return res.status(200).json({ text });
  } catch (error) {
    console.error('Gemini API execution failed:', error);
    return res.status(500).json({ error: 'Failed to generate content from AI' });
  }
}
