// Core domain types

export type Sender = "user" | "ai";

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  metadata: string | null; // JSON string
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: Sender;
  text: string;
  timestamp: string;
}

// API request/response shapes
export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
  messageId: string;
}

export interface HistoryResponse {
  sessionId: string;
  messages: Message[];
}

export interface ErrorResponse {
  error: string;
  code?: string;
}

// LLM layer
export interface LLMMessage {
  role: "user" | "assistant";
  content: string;
}
