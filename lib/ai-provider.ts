/**
 * AI Provider
 * Native fetch implementation for Gemini 2.5 Flash API to avoid dependency issues.
 * Ensures zero-dependency, edge-compatible AI streaming and generation.
 */

export interface AIResponse {
  text: string;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function generateText(prompt: string, systemPrompt?: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is missing. Using fallback response.");
    return "AI features are currently unavailable because the API key is not configured.";
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contents: any[] = [];
  if (systemPrompt) {
    contents.push({
      role: "user",
      parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}` }]
    });
    contents.push({
      role: "model",
      parts: [{ text: "Understood. I will strictly follow these system instructions." }]
    });
  }
  
  contents.push({
    role: "user",
    parts: [{ text: prompt }]
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API Error:", errorText);
    throw new Error(`Failed to generate AI response: ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
}
