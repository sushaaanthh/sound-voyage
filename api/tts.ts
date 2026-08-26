import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_DB_URL || process.env.DB_URL || '';
const supabaseAnonKey = process.env.VITE_DB_ANON_KEY || process.env.DB_ANON_KEY || '';
const APP_ORIGIN = process.env.APP_ORIGIN || '';
const MAX_TEXT_LENGTH = 1000;

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isValidPhoneme(text: string): boolean {
  return /^[\s\/a-zA-Z0-9ˌˈːáéíóúàèìòùâêîôûäëïöüãõñçÇ-]+$/.test(text);
}

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

  const { text, isPhoneme } = req.body;
  const region = process.env.AZURE_SPEECH_REGION;
  const key = process.env.AZURE_SPEECH_KEY;

  if (!text || typeof text !== 'string' || text.length > MAX_TEXT_LENGTH || text.trim().length === 0) {
    return res.status(400).json({ error: 'Missing or invalid text in request body' });
  }

  if (isPhoneme && !isValidPhoneme(text)) {
    return res.status(400).json({ error: 'Invalid phoneme format' });
  }

  if (!region || !key) {
    return res.status(500).json({ error: 'Azure Speech credentials are not configured on the server' });
  }

  const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const escapedText = escapeXml(text);

  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-IN">
    <voice name="en-IN-NeerjaNeural">
      <prosody rate="85%">
        ${isPhoneme ? `<phoneme alphabet="ipa" ph="${escapedText}">${escapedText}</phoneme>` : escapedText}
      </prosody>
    </voice>
  </speak>`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        'User-Agent': 'SoundVoyageApp'
      },
      body: ssml
    });

    if (!response.ok) {
      console.error('[TTS] Azure TTS error:', response.status);
      return res.status(502).json({ error: 'Audio generation failed' });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  } catch (error) {
    console.error('[TTS] Azure TTS execution failed:', error);
    res.status(500).json({ error: 'Audio generation failed' });
  }
}
