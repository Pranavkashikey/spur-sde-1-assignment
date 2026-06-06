import { v4 as uuidv4 } from "uuid";
import { getDb } from "./connection";
import type { Conversation, Message, Sender } from "../types";

// ── Conversations ─────────────────────────────────────────────────────────────

export async function createConversation(): Promise<Conversation> {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  await db.query(
    `INSERT INTO conversations (id, created_at, updated_at) VALUES ($1, $2, $3)`,
    [id, now, now]
  );
  return { id, created_at: now, updated_at: now, metadata: null };
}

export async function findConversation(id: string): Promise<Conversation | null> {
  const db = getDb();
  const result = await db.query(
    `SELECT * FROM conversations WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function touchConversation(id: string): Promise<void> {
  const db = getDb();
  await db.query(
    `UPDATE conversations SET updated_at = $1 WHERE id = $2`,
    [new Date().toISOString(), id]
  );
}

// ── Messages ──────────────────────────────────────────────────────────────────

export async function insertMessage(
  conversationId: string,
  sender: Sender,
  text: string
): Promise<Message> {
  const db = getDb();
  const id = uuidv4();
  const timestamp = new Date().toISOString();
  await db.query(
    `INSERT INTO messages (id, conversation_id, sender, text, timestamp)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, conversationId, sender, text, timestamp]
  );
  return { id, conversation_id: conversationId, sender, text, timestamp };
}

export async function getMessagesByConversation(conversationId: string): Promise<Message[]> {
  const db = getDb();
  const result = await db.query(
    `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY timestamp ASC`,
    [conversationId]
  );
  return result.rows;
}

export async function getRecentMessages(
  conversationId: string,
  limit: number = 20
): Promise<Message[]> {
  const db = getDb();
  const result = await db.query(
    `SELECT * FROM messages
     WHERE conversation_id = $1
     ORDER BY timestamp DESC
     LIMIT $2`,
    [conversationId, limit]
  );
  return result.rows.reverse();
}