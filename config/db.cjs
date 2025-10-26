const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');

if (!process.env.DATABASE_URL) {
  throw new Error('Missing required env var DATABASE_URL');
}

const client = neon(process.env.DATABASE_URL);
const db = drizzle(client);

async function pingDB() {
  try {
    const res = await client.query('SELECT 1');
    return Array.isArray(res) ? res.length > 0 : (res?.rows?.length > 0);
  } catch (err) {
    console.error('DB ping failed (CJS):', err?.message || err);
    return false;
  }
}

module.exports = { db, pingDB };
