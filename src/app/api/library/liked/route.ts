import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { prisma } from '@/lib/prisma'; 

export const dynamic = 'force-dynamic';

// Helper function to validate the session
async function getUserId() {
    const session = await getServerSession(); 
    console.log("🔎 [AUTH CHECK] Session Data:", session);

    if (!session || !session.user?.email) {
        console.log("[AUTH CHECK] FAILED - User is not logged in or session is missing.");
        return null; 
    }
    return session.user.email; 
}

export async function GET() {
    console.log("[GET] Fetching liked songs on page load...");
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Using safe singleton prisma instance
        const dbTracks = await prisma.likedTrack.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' }
        });
        
        console.log(`[GET] Successfully found ${dbTracks.length} songs for ${userId}`);
        return NextResponse.json(dbTracks);
    } catch (error) {
        console.error("[GET DB ERROR]:", error);
        return NextResponse.json({ error: 'Failed to fetch liked songs' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    console.log("[POST] Attempting to save a track...");
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { track } = await request.json();

        if (!track || !track.videoId) {
            return NextResponse.json({ error: 'Invalid track data' }, { status: 400 });
        }

        await prisma.likedTrack.upsert({
            where: {
                userId_videoId: {
                    userId: userId,
                    videoId: track.videoId
                }
            },
            update: {},
            create: {
                userId: userId,
                videoId: track.videoId,
                title: track.title,
                artist: track.artist,
                thumbnailUrl: track.thumbnailUrl,
                isPodcast: track.isPodcast || false,
            }
        });

        console.log(`[POST] Track ${track.title} saved successfully!`);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[POST DB ERROR]:", error);
        return NextResponse.json({ error: 'Failed to save track' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    console.log("[DELETE] Attempting to remove a track...");
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { track } = await request.json();

        if (!track || !track.videoId) {
            return NextResponse.json({ error: 'Invalid track data' }, { status: 400 });
        }

        await prisma.likedTrack.delete({
            where: {
                userId_videoId: {
                    userId: userId,
                    videoId: track.videoId
                }
            }
        });

        console.log(`[DELETE] Track ${track.title} removed successfully!`);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE DB ERROR]:", error);
        return NextResponse.json({ error: 'Failed to remove track' }, { status: 500 });
    }
}