'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface Track {
    videoId: string;
    title: string;
    artist: string;
    thumbnailUrl: string;
    isPodcast?: boolean; // NEW: Flag to tell the player how to handle the track
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
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    
    // NEW: Queue Management State
    const [queue, setQueue] = useState<Track[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(-1);

    // Now accepts the search results array as the active queue
    const playTrack = (track: Track, newQueue?: Track[]) => {
        setCurrentTrack(track);
        if (newQueue) {
            setQueue(newQueue);
            setCurrentIndex(newQueue.findIndex(t => t.videoId === track.videoId));
        }
        if (!isExpanded) setIsExpanded(true); 
    };

    const jumpToTrack = (index: number) => {
        if (index >= 0 && index < queue.length) {
            setCurrentIndex(index);
            setCurrentTrack(queue[index]);
        }
    };

    // RESTORED: nextTrack function
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

    // Helper booleans for your GlobalPlayer to read
    const hasNextTrack = currentIndex < queue.length - 1 && currentIndex !== -1;
    const hasPrevTrack = currentIndex > 0;

    return (
        <PlayerContext.Provider value={{ 
            currentTrack, playTrack, nextTrack, prevTrack, 
            hasNextTrack, hasPrevTrack, isExpanded, setIsExpanded,
            queue, currentIndex, jumpToTrack 
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