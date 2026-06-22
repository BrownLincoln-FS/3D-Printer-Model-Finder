'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePlayer, Track } from '@/contexts/PlayerContext';

export default function SearchClient() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Track[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [isShowingSuggestions, setIsShowingSuggestions] = useState(true);

    const { playTrack } = usePlayer();

    // 1. Declare the fetch logic FIRST so it exists in memory
    const fetchTracks = async (searchQuery: string) => {
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}`);
            if (!res.ok) throw new Error('Failed to fetch tracks');

            const data = await res.json();
            setResults(data);

            // If they searched for something, update the UI header
            setIsShowingSuggestions(searchQuery.trim() === '');
        } catch {
            setError('Could not load tracks. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // 2. NOW fire it off in the useEffect since it is safely declared
    useEffect(() => {
        const loadInitialTracks = async () => {
            await fetchTracks('');
        };

        loadInitialTracks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        fetchTracks(query);
    };

    return (
        <div>
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="search-bar-wrapper">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for any song or artist..."
                    className="search-input"
                />
                <button type="submit" disabled={isLoading} className="search-btn">
                    {isLoading ? 'Loading...' : 'Search'}
                </button>
            </form>

            {error && <p className="text-red-500 mb-8">{error}</p>}

            {/* Dynamic Header */}
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                {isShowingSuggestions ? '🔥 Trending Suggestions' : 'Search Results'}
            </h2>

            {/* Results Grid (Your existing UI stays exactly the same!) */}
            <div className="track-grid">
                {results.map((track) => (
                    <div
                        key={`${track.title}-${track.artist}`}
                        className="track-card group"
                        onClick={() => playTrack(track, [track])}
                    >
                        <div className="track-image-wrapper">
                            <Image
                                src={track.thumbnailUrl}
                                alt={track.title}
                                fill
                                loading="eager"
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