import { NextResponse } from 'next/server';

interface LRCLibResponse {
    id: number;
    trackName: string;
    artistName: string;
    albumName: string;
    duration: number;
    instrumental: boolean;
    plainLyrics: string | null;
    syncedLyrics: string | null;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    let artist = searchParams.get('artist') || '';
    let title = searchParams.get('title') || '';

    if (!artist || !title) {
        return NextResponse.json({ error: 'Missing artist or title' }, { status: 400 });
    }

    // Advanced YouTube Scrubber
    // Removes (Official Video), [Audio], etc.
    title = title.replace(/\([^)]*\)|\[[^\]]*\]/g, '').replace(/official video/i, '').trim();
    
    // Removes VEVO and Topic
    artist = artist.replace(/VEVO/i, '').replace(/- Topic/i, '').trim();

    // Fixes camelCase YouTube channel names (e.g., "MorganWallen" -> "Morgan Wallen")
    artist = artist.replace(/([a-z])([A-Z])/g, '$1 $2');

    // Combine into a single "Fuzzy" query (Much better for YouTube data)
    const searchQuery = `${artist} ${title}`;

    try {
        // LRCLIB (Fuzzy Search) ---
        const lrcRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(searchQuery)}`, {
            headers: { 'User-Agent': 'CustomNextJsMediaPlayer v1.0' }
        });
        
        if (lrcRes.ok) {
            const lrcData = await lrcRes.json();
            
            // Grab the first result that actually has plain lyrics attached
            const bestMatch = lrcData.find((track: LRCLibResponse) => track.plainLyrics);
            
            if (bestMatch && bestMatch.plainLyrics) {
                return NextResponse.json({ lyrics: bestMatch.plainLyrics });
            }
        }

        // OVH Fallback (With 3-second Kill Switch) ---
        // OVH hangs forever if it can't find a song. We kill it after 3s to prevent timeouts.
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        try {
            const ovhRes = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (ovhRes.ok) {
                const ovhData = await ovhRes.json();
                if (ovhData.lyrics) {
                    const cleanLyrics = ovhData.lyrics.replace(/Paroles de la chanson.*?(\r\n|\n)/i, '').trim();
                    return NextResponse.json({ lyrics: cleanLyrics });
                }
            }
        } catch {
            // We intentionally swallow the OVH timeout error so it can proceed to the 404 response
            clearTimeout(timeoutId);
        }

        // If both databases completely fail to find it
        return NextResponse.json({ error: 'Lyrics not found in databases' }, { status: 404 });
        
    } catch (error) {
        console.error("Lyrics Fetch Error:", error);
        return NextResponse.json({ error: 'Failed to fetch lyrics' }, { status: 500 });
    }
}