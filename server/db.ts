import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 10000,
  query_timeout: 30000,
  statement_timeout: 30000,
  max: 10,
  ssl: {
    rejectUnauthorized: false
  }
});

export const db = drizzle(pool, { schema });