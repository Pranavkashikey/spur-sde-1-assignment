import { getDb } from "./connection";

export async function runMigrations(): Promise<void> {
  const db = getDb();

  await db.query(`
    CREATE TABLE IF NOT EXISTS conversations (
      id          TEXT PRIMARY KEY,
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL,
      metadata    TEXT
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id              TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender          TEXT NOT NULL CHECK(sender IN ('user','ai')),
      text            TEXT NOT NULL,
      timestamp       TEXT NOT NULL
    )
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
    ON messages(conversation_id, timestamp)
  `);

  console.log("✅ Migrations complete.");
}

if (require.main === module) {
  runMigrations().then(() => process.exit(0)).catch(console.error);
}