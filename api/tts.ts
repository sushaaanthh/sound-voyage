import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, isPhoneme } = req.body;
  const region = process.env.AZURE_SPEECH_REGION;
  const key = process.env.AZURE_SPEECH_KEY;

  if (!text) {
    return res.status(400).json({ error: 'Missing text in request body' });
  }

  if (!region || !key) {
    return res.status(500).json({ error: 'Azure Speech credentials are not configured on the server' });
  }

  const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

  const ssml = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-IN">
      <voice name="en-IN-NeerjaNeural">
        ${isPhoneme ? `<phoneme alphabet="ipa" ph="${text}">${text}</phoneme>` : text}
      </voice>
    </speak>
  `;

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
      const errorText = await response.text();
      console.error('Azure TTS error:', response.status, errorText);
      return res.status(500).json({ error: 'Audio generation failed' });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(buffer);
  } catch (error) {
    console.error('Azure TTS execution failed:', error);
    res.status(500).json({ error: 'Audio generation failed' });
  }
}
