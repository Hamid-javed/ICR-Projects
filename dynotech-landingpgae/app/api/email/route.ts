import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Email from '@/models/email.model';

// Connect to DB (cached across requests)
let isDbConnected = false;

async function ensureDbConnection() {
    if (!isDbConnected) {
        try {
            await dbConnect();
            isDbConnected = true;
        } catch (error) {
            throw new Error('Database connection failed');
        }
    }
}

// POST: Save email to DB
export async function POST(request: Request) {
    try {
        await ensureDbConnection(); // Check DB connection
        const { email } = await request.json();

        // Validation
        if (!email?.includes('@')) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        // Save to MongoDB
        const newEmail = new Email({ email });
        await newEmail.save();

        return NextResponse.json(
            { success: true, message: 'Email saved successfully' },
            { status: 201 }
        );

    } catch (error: any) {
        // Handle duplicate email (MongoDB E11000 error)
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 409 }
            );
        }

        // Handle DB connection errors
        if (error.message === 'Database connection failed') {
            return NextResponse.json(
                { error: 'Database service unavailable' },
                { status: 503 }
            );
        }

        // Generic server error
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}

// Block all other HTTP methods
export async function GET() {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    );
}