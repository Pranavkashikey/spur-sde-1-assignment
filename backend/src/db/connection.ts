import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

let _pool: Pool | null = null;

export function getDb(): Pool {
  if (!_pool) {
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
     ssl: { rejectUnauthorized: false },
    });
  }
  return _pool;
}