import {
  createConversation,
  findConversation,
  insertMessage,
  getMessagesByConversation,
  getRecentMessages,
  touchConversation,
} from "../db/repository";
import { generateReply } from "./llm";
import type { LLMMessage, ChatResponse, HistoryResponse } from "../types";

const MAX_MESSAGE_LENGTH = 2000;

export async function handleChat(
  rawMessage: string,
  sessionId?: string
): Promise<ChatResponse> {
  const message =
    rawMessage.length > MAX_MESSAGE_LENGTH
      ? rawMessage.slice(0, MAX_MESSAGE_LENGTH) + " [message truncated]"
      : rawMessage;

  let conversation = sessionId ? await findConversation(sessionId) : null;
  if (!conversation) {
    conversation = await createConversation();
  }

  await insertMessage(conversation.id, "user", message);
  await touchConversation(conversation.id);

  const recentDbMessages = await getRecentMessages(conversation.id, 21);
  const historyMessages = recentDbMessages.slice(0, -1);

  const llmHistory: LLMMessage[] = historyMessages.map((m) => ({
    role: m.sender === "user" ? "user" : "assistant",
    content: m.text,
  }));

  const reply = await generateReply(llmHistory, message);

  const aiMessage = await insertMessage(conversation.id, "ai", reply);
  await touchConversation(conversation.id);

  return { reply, sessionId: conversation.id, messageId: aiMessage.id };
}

export async function getHistory(sessionId: string): Promise<HistoryResponse | null> {
  const conversation = await findConversation(sessionId);
  if (!conversation) return null;
  const messages = await getMessagesByConversation(sessionId);
  return { sessionId, messages };
}