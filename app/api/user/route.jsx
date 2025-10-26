import { NextResponse } from 'next/server';
import { db } from '@/config/db';
import { usersTable } from '@/config/schema';
import { eq } from 'drizzle-orm';

export async function POST(req) {
    try {
        const { email, name } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const users = await db.select().from(usersTable).where(eq(usersTable.email, email));

        if (!users || users.length === 0) {
            const result = await db.insert(usersTable).values({
                name: name || null,
                email: email,
            }).returning();

            console.log('Inserted user:', result);
            return NextResponse.json(result[0]);
        }

        return NextResponse.json(users[0]);
    } catch (err) {
        console.error('Error in POST /api/user:', err);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}