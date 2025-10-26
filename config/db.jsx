// import { drizzle } from 'drizzle-orm/neon-http';

// export const db = drizzle(process.env.DATABASE_URL);


import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

if (!process.env.DATABASE_URL) {
	// Fail fast during server startup so missing envs are obvious
	throw new Error('Missing required env var DATABASE_URL');
}

// Initialize Neon client with the DATABASE_URL environment variable
const client = neon(process.env.DATABASE_URL);

// Create and export the Drizzle DB instance
export const db = drizzle(client);

// Lightweight helper to ping the DB; returns a boolean
export async function pingDB() {
	try {
		const res = await client.query('SELECT 1');
		// many Neon client variants return an array or { rows }
		const ok = Array.isArray(res) ? res.length > 0 : (res?.rows?.length > 0);
		return Boolean(ok);
	} catch (err) {
		console.error('DB ping failed:', err?.message || err);
		return false;
	}
}
