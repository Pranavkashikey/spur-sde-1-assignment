import { GoogleGenAI } from "@google/genai";
import { STORE_KNOWLEDGE } from "./knowledge";
import type { LLMMessage } from "../types";

let _client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Please add it to your .env file.");
  }
  if (!_client) {
    _client = new GoogleGenAI({ apiKey });
  }
  return _client;
}

const SYSTEM_PROMPT = `You are a helpful, friendly customer support agent for Spark & Co.,
a premium online electronics and gadgets store.

Your job is to assist customers clearly and concisely. Always be polite and empathetic.
If you don't know the answer, say so honestly and offer to escalate to the support team.

Here is the store's policy and knowledge base — use it to answer questions accurately:

${STORE_KNOWLEDGE}

Guidelines:
- Keep responses concise (2–4 sentences for most queries).
- Never make up policies or prices not listed above.
- If a customer seems frustrated, acknowledge their feelings before addressing the issue.
- Do not discuss topics unrelated to Spark & Co. or customer support.`;

export async function generateReply(
  history: LLMMessage[],
  userMessage: string
): Promise<string> {
  const client = getClient();

  const contents = [
    ...history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    {
      role: "user",
      parts: [{ text: userMessage }],
    },
  ];

  try {
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens: 512,
      },
    });

    return response.text ?? "Sorry, I could not generate a response.";
  } catch (err: unknown) {
    console.error("Gemini error:", err);
    if (err instanceof Error) {
      if (err.message.includes("401") || err.message.includes("API_KEY_INVALID")) {
        throw new Error("Invalid Gemini API key. Please check your .env file.");
      }
      if (err.message.includes("429") || err.message.includes("quota")) {
        throw new Error("Gemini rate limit reached. Please try again in a moment.");
      }
      if (err.message.includes("503") || err.message.includes("unavailable")) {
        throw new Error("Gemini is temporarily unavailable. Please try again shortly.");
      }
      throw new Error(`AI error: ${err.message}`);
    }
    throw new Error("Something went wrong. Please try again.");
  }
}