'use client';

import { useState, useEffect } from 'react';
import { Track } from '@/contexts/PlayerContext';
import TrackCard from '@/components/TrackCard';

export default function SearchClient() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Track[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [isShowingSuggestions, setIsShowingSuggestions] = useState(true);

    const fetchTracks = async (searchQuery: string) => {
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}`);
            if (!res.ok) throw new Error('Failed to fetch tracks');

            const data = await res.json();
            setResults(data);
            setIsShowingSuggestions(searchQuery.trim() === '');
        } catch {
            setError('Could not load tracks. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const loadInitialTracks = async () => {
            await fetchTracks('');
        };
        loadInitialTracks();
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        fetchTracks(query);
    };

    return (
        <div>
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

            {error && <p className="search-error">{error}</p>}

            <h2 className="search-results-header">
                {isShowingSuggestions ? '🔥 Trending Suggestions' : 'Search Results'}
            </h2>

            <div className="track-grid">
                {results.map((track) => (
                    <TrackCard 
                        key={track.videoId} 
                        track={track} 
                        contextQueue={results} 
                    />
                ))}
            </div>
        </div>
    );
}