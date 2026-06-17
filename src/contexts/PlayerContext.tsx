'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface Track {
    videoId: string;
    title: string;
    artist: string;
    thumbnailUrl: string;
}

interface PlayerContextType {
    currentTrack: Track | null;
    playTrack: (track: Track) => void;
    nextTrack: () => void;
    prevTrack: () => void;
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const playTrack = (track: Track) => {
        setCurrentTrack(track);
        if (!isExpanded) setIsExpanded(true); 
    };

    const nextTrack = () => console.log('Next track logic placeholder');
    const prevTrack = () => console.log('Previous track logic placeholder');

    return (
        <PlayerContext.Provider value={{ currentTrack, playTrack, nextTrack, prevTrack, isExpanded, setIsExpanded }}>
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