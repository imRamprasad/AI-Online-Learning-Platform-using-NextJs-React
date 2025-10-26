import { NextResponse } from 'next/server';
import { db, pingDB } from '@/config/db';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const ping = await pingDB();
    if (!ping) {
      throw new Error('DB ping failed');
    }

    // Use the underlying Neon client to fetch columns and count for compatibility
    // Re-create a client from env for this quick diagnostic (non-persistent)
    const client = neon(process.env.DATABASE_URL);
    const colsRes = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'courses' ORDER BY ordinal_position;`);
    const countRes = await client.query(`SELECT count(*)::int AS cnt FROM courses;`);
    const columns = Array.isArray(colsRes) ? colsRes : (colsRes.rows || []);
    const cnt = Array.isArray(countRes) ? countRes[0].cnt : (countRes?.rows?.[0]?.cnt ?? null);

    return NextResponse.json({ ok: true, columns, count: cnt });
  } catch (err) {
    console.error('Health check failed:', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
