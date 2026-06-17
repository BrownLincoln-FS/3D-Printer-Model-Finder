'use client';

import Image from 'next/image';
import { useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';

interface Track {
    videoId: string;
    title: string;
    artist: string;
    thumbnailUrl: string;
}

export default function SearchClient() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Track[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { playTrack } = usePlayer();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error('Failed to fetch tracks');
            
            const data = await res.json();
            setResults(data);
        } catch {
            setError('Could not load search results. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="search-bar-wrapper">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="What do you want to listen to?"
                    className="search-input"
                />
                <button type="submit" disabled={isLoading} className="search-btn">
                    {isLoading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {error && <p className="text-red-500 mb-8">{error}</p>}

            {/* Results Grid */}
            <div className="track-grid">
                {results.map((track) => (
                    <div 
                        key={track.videoId} 
                        className="track-card group"
                        onClick={() => playTrack(track)}
                    >
                        <div className="track-image-wrapper">
                            <Image 
                                src={track.thumbnailUrl} 
                                alt={track.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="track-image"
                            />
                            <div className="track-play-overlay">
                                <div className="track-play-btn">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="track-info">
                            <span className="track-title" title={track.title}>
                                {track.title}
                            </span>
                            <span className="track-artist" title={track.artist}>
                                {track.artist}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}