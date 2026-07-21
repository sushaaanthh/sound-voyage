export const fetchHFAudio = async (text: string, retries = 3): Promise<string | null> => {
  const API_URL = "https://api-inference.huggingface.co/models/espnet/kan-bayashi_ljspeech_vits";
  const API_KEY = import.meta.env.VITE_HF_API_KEY;

  // Global override interceptor
  const sanitizedText = text.replace(/\/sh\//gi, 'sha');

  try {
    const response = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ inputs: sanitizedText }),
    });

    // Handle waking up the model
    if (response.status === 503 && retries > 0) {
      console.warn("Model waking up, retrying in 2s...");
      await new Promise(res => setTimeout(res, 2000));
      return fetchHFAudio(text, retries - 1);
    }

    if (!response.ok) throw new Error("TTS Request failed");

    const blob = await response.blob();
    return URL.createObjectURL(blob); // Returns a playable local URL
  } catch (error) {
    console.error("HF TTS Error:", error);
    return null;
  }
};
