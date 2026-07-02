import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getServerSession(authOptions);

    // If there is no session, or if our JWT callback flagged a refresh error
    if (!session || session.error === "RefreshAccessTokenError") {
        return NextResponse.json({ 
            isValid: false, 
            requiresLogin: true,
            message: "Token expired and could not be refreshed."
        }, { status: 401 });
    }

    // Token is valid and active
    return NextResponse.json({ 
        isValid: true, 
        requiresLogin: false,
        expiresAt: session.user.accessTokenExpires 
    }, { status: 200 });
}