'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Track {
    videoId: string;
    title: string;
    artist: string;
    thumbnailUrl: string;
    isPodcast?: boolean; 
}

interface PlayerContextType {
    currentTrack: Track | null;
    playTrack: (track: Track, newQueue?: Track[]) => void;
    nextTrack: () => void;
    prevTrack: () => void;
    hasNextTrack: boolean;
    hasPrevTrack: boolean;
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
    queue: Track[];
    currentIndex: number;
    jumpToTrack: (index: number) => void;
    startMix: (track: Track) => void;
    clearQueue: () => void;
    isMixMode: boolean;
    playNext: (track: Track) => void;
    addToQueue: (track: Track) => void;
    likedSongs: Track[];
    toggleLike: (track: Track) => void;
    isLiked: (videoId: string) => boolean;
    playList: (tracks: Track[]) => void;
    shuffleList: (tracks: Track[]) => void;
    addListToQueue: (tracks: Track[]) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    
    const [queue, setQueue] = useState<Track[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(-1);
    
    const [isMixMode, setIsMixMode] = useState<boolean>(false);
    const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);

    const [likedSongs, setLikedSongs] = useState<Track[]>([]);

    // Fetch Liked Songs on App Load ---
    useEffect(() => {
        const fetchLikedSongs = async () => {
            try {
                const res = await fetch('/api/library/liked');
                if (res.ok) {
                    const data = await res.json();
                    setLikedSongs(data);
                }
            } catch (error) {
                console.error("Failed to load liked songs from DB:", error);
            }
        };
        
        fetchLikedSongs();
    }, []); // Empty dependency array ensures this runs only once on mount

    // Optimistic UI Sync for Toggling Likes ---
    const toggleLike = async (track: Track) => {
        const isCurrentlyLiked = likedSongs.some(t => t.videoId === track.videoId);

        // Update React State INSTANTLY (Zero UI Lag)
        setLikedSongs(prev => {
            if (isCurrentlyLiked) {
                return prev.filter(t => t.videoId !== track.videoId); // Remove if already liked
            } else {
                return [...prev, track]; // Add if not liked
            }
        });

        // Sync with Database Silently in Background
        try {
            await fetch('/api/library/liked', {
                method: isCurrentlyLiked ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ track })
            });
        } catch (error) {
            console.error("Database sync failed:", error);
        }
    };

    const isLiked = (videoId: string) => likedSongs.some(t => t.videoId === videoId);

    const playTrack = (track: Track, newQueue?: Track[]) => {
        setIsMixMode(false); 
        setCurrentTrack(track);
        if (newQueue) {
            setQueue(newQueue);
            setCurrentIndex(newQueue.findIndex(t => t.videoId === track.videoId));
        }
        if (!isExpanded) setIsExpanded(true); 
    };

    const playNext = (track: Track) => {
        setQueue(prev => {
            if (prev.length === 0) return [track];
            const newQueue = [...prev];
            newQueue.splice(currentIndex + 1, 0, track);
            return newQueue;
        });
        
        if (!currentTrack) playTrack(track, [track]);
    };

    const addToQueue = (track: Track) => {
        setQueue(prev => {
            if (prev.length === 0) return [track];
            return [...prev, track];
        });

        if (!currentTrack) playTrack(track, [track]);
    };

    const startMix = async (track: Track) => {
        setIsMixMode(true); 
        setCurrentTrack(track);
        setQueue([track]);
        setCurrentIndex(0);
        if (!isExpanded) setIsExpanded(true);

        try {
            const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(track.artist + ' music mix')}`);
            
            // FIXED: Soft exit instead of throwing a hard error
            if (!res.ok) {
                console.warn(`Mix API failed with status: ${res.status}. Quota likely exceeded.`);
                return; 
            }
            
            const mixTracks: Track[] = await res.json();
            const filteredMix = mixTracks.filter((t: Track) => t.videoId !== track.videoId);
            
            setQueue(prevQueue => [...prevQueue, ...filteredMix]);
        } catch (error) {
            // FIXED: Use warn instead of error to bypass Next.js red screen
            console.warn("Failed to generate mix:", error);
        }
    };

    const clearQueue = () => {
        setIsMixMode(false); 
        if (currentTrack) {
            setQueue([currentTrack]);
            setCurrentIndex(0);
        } else {
            setQueue([]);
            setCurrentIndex(-1);
        }
    };

    const jumpToTrack = (index: number) => {
        if (index >= 0 && index < queue.length) {
            setCurrentIndex(index);
            setCurrentTrack(queue[index]);
        }
    };

    const nextTrack = () => {
        if (currentIndex < queue.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            setCurrentTrack(queue[nextIndex]);
        }
    };

    const prevTrack = () => {
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            setCurrentIndex(prevIndex);
            setCurrentTrack(queue[prevIndex]);
        }
    };

    const playList = (tracks: Track[]) => {
        if (tracks.length === 0) return;
        setIsMixMode(false);
        setQueue(tracks);
        setCurrentIndex(0);
        setCurrentTrack(tracks[0]);
        if (!isExpanded) setIsExpanded(true);
    };

    const shuffleList = (tracks: Track[]) => {
        if (tracks.length === 0) return;
        const shuffled = [...tracks].sort(() => Math.random() - 0.5);
        playList(shuffled);
    };

    const addListToQueue = (tracks: Track[]) => {
        if (tracks.length === 0) return;
        setQueue(prev => {
            if (prev.length === 0) return tracks;
            return [...prev, ...tracks];
        });
        
        if (!currentTrack) {
            setCurrentTrack(tracks[0]);
            setCurrentIndex(queue.length > 0 ? queue.length : 0);
            if (!isExpanded) setIsExpanded(true);
        }
    };

    useEffect(() => {
        if (isMixMode && !isFetchingMore && queue.length > 0 && (queue.length - currentIndex <= 3)) {
            const fetchMoreTracks = async () => {
                setIsFetchingMore(true);
                try {
                    const currentArtist = queue[currentIndex]?.artist;
                    if (!currentArtist) return;

                    const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(currentArtist + ' music mix')}`);
                    
                    // FIXED: Soft exit
                    if (!res.ok) {
                        console.warn(`Infinite mix API failed with status: ${res.status}.`);
                        return;
                    }

                    const newTracks: Track[] = await res.json();
                    const existingIds = new Set(queue.map(t => t.videoId));
                    const uniqueNewTracks = newTracks.filter(t => !existingIds.has(t.videoId));

                    if (uniqueNewTracks.length > 0) {
                        setQueue(prev => [...prev, ...uniqueNewTracks]);
                    }
                } catch (error) {
                    console.warn("Failed to fetch infinite mix tracks:", error);
                } finally {
                    setIsFetchingMore(false);
                }
            };

            fetchMoreTracks();
        }
    }, [currentIndex, queue, isMixMode, isFetchingMore]);

    const hasNextTrack = currentIndex < queue.length - 1 && currentIndex !== -1;
    const hasPrevTrack = currentIndex > 0;

    return (
        <PlayerContext.Provider value={{ 
            currentTrack, playTrack, nextTrack, prevTrack, 
            hasNextTrack, hasPrevTrack, isExpanded, setIsExpanded,
            queue, currentIndex, jumpToTrack, startMix, clearQueue, isMixMode,
            playNext, addToQueue, likedSongs, toggleLike, isLiked, playList, shuffleList, addListToQueue
        }}>
            {children}
        </PlayerContext.Provider>
    );
}

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (context === undefined) throw new Error('usePlayer must be used within PlayerProvider');
    return context;
};

export default PlayerProvider;