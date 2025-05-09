// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Gemini API client setup
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || (isDevelopment ? "AIzaSyBOlZSEpVPyidZN84POQju5wGjmVVIUlZ0" : undefined);
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

/**
 * Send a prompt to the Gemini API
 * @param prompt The prompt to send to Gemini
 * @returns The response from Gemini
 */
export async function generateWithGemini(prompt: string) {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured");
    }
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
} 