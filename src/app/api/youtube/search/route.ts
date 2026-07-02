import { NextResponse } from 'next/server';

// Defines the exact structure we expect from the YouTube API
interface YouTubeSearchItem {
    id: {
        videoId: string;
    };
    snippet: {
        title: string;
        channelTitle: string;
        thumbnails: {
            high: {
                url: string;
            };
        };
    };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || 'trending pop and hiphop hits';
    const apiKey = process.env.YOUTUBE_API_KEY;

    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&key=${apiKey}`
        );

        if (!response.ok) {
            throw new Error(`YouTube API responded with status ${response.status}`);
        }

        const data = await response.json();

        // Applies the interface to the map function to satisfy strict mode
        const tracks = data.items.map((item: YouTubeSearchItem) => ({
            videoId: item.id.videoId,
            title: item.snippet.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
            artist: item.snippet.channelTitle,
            thumbnailUrl: item.snippet.thumbnails.high.url,
        }));

        return NextResponse.json(tracks);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('YouTube Search Error:', errorMessage);
        return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 });
    }
}