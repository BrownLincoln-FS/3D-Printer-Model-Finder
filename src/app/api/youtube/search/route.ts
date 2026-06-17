import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    
    // videoCategoryId=10 ensures we are only searching for Music
    const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=15&key=${apiKey}`;

    try {
        const res = await fetch(youtubeUrl);
        const data = await res.json();

        if (data.error) throw new Error(data.error.message);

        // Map data to a clean format for our UI
        const tracks = data.items.map((item: { id: { videoId: string }; snippet: { title: string; channelTitle: string; thumbnails: { high: { url: string } } } }) => ({
            videoId: item.id.videoId,
            title: item.snippet.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&'),
            artist: item.snippet.channelTitle,
            thumbnailUrl: item.snippet.thumbnails.high.url,
        }));

        return NextResponse.json(tracks);
        
    } catch (error) {
        console.error("YouTube API Error:", error);
        return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 });
    }
}