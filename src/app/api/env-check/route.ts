import { NextResponse } from 'next/server';

export async function GET() {
  // Attempt to load the database URL from .env.local
  const dbUrl = process.env.DATABASE_URL;
  
  // If the variable is missing, return a 500 Error
  if (!dbUrl) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Backend Check Failed: DATABASE_URL is missing.' 
      }, 
      { status: 500 }
    );
  }

  // If it exists, return a 200 OK (Do NOT send the actual URL back to the client for security)
  return NextResponse.json(
    { 
      success: true, 
      message: 'Backend Check Passed: Environment variables are loaded and secure.' 
    }, 
    { status: 200 }
  );
}