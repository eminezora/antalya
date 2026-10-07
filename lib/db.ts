import { Pool, QueryResult, QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var postgresPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var isDbInitialized: boolean | undefined;
}

function getConnectionString(): string | null {
  const url =
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.PRISMA_DATABASE_URL;

  if (!url || url.includes("[SENSITIVE]")) {
    return null;
  }
  return url;
}

export function getDbPool(): Pool {
  if (globalThis.postgresPool) {
    return globalThis.postgresPool;
  }

  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error(
      "Veritabanı bağlantı adresi (POSTGRES_URL veya DATABASE_URL) bulunamadı. " +
      "Vercel Postgres veya Neon bağlantı bilginizi .env.local dosyanıza ekleyin."
    );
  }

  const isLocal =
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1");

  const pool = new Pool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  if (process.env.NODE_ENV !== "production") {
    globalThis.postgresPool = pool;
  }

  return pool;
}

/**
 * users tablosunu ve gerekli indeksleri oluşturur.
 */
export async function initDb(): Promise<void> {
  if (globalThis.isDbInitialized) {
    return;
  }

  const pool = getDbPool();

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'student',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `;

  await pool.query(createTableQuery);
  globalThis.isDbInitialized = true;
}

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  await initDb();
  const pool = getDbPool();
  return pool.query<T>(text, params);
}
