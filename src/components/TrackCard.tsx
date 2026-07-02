'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { usePlayer, Track } from '@/contexts/PlayerContext';

interface TrackCardProps {
    track: Track;
    contextQueue?: Track[]; 
}

const LikedIcon = ({ className = "icon-md" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 10v12"/>
        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
    </svg>
);

export default function TrackCard({ track, contextQueue }: TrackCardProps) {
    const { playTrack, playNext, addToQueue, startMix, toggleLike, isLiked } = usePlayer();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Completely self-contained click-away listener
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    const handlePlay = () => {
        // If a context queue is provided (like the Liked Songs array), use it. Otherwise, just play the single track.
        playTrack(track, contextQueue && contextQueue.length > 0 ? contextQueue : [track]);
    };

    return (
        <div className={`track-card group ${isMenuOpen ? 'z-50' : 'z-10'}`} onClick={handlePlay}>
            
            <div className={`track-menu-wrapper ${isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <button 
                    onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                    className={isLiked(track.videoId) ? 'btn-like-active' : 'btn-like-default'}
                >
                    <LikedIcon />
                </button>
                
                <div className="relative flex items-center" ref={menuRef}>
                    <button 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            setIsMenuOpen(!isMenuOpen); 
                        }} 
                        className="btn-menu-trigger"
                    >
                        <svg className="icon-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                    </button>

                    {isMenuOpen && (
                        <div className="menu-dropdown top-full z-50">
                            <button onClick={(e) => { e.stopPropagation(); playNext(track); setIsMenuOpen(false); }} className="btn-menu-item">Play Next</button>
                            <button onClick={(e) => { e.stopPropagation(); addToQueue(track); setIsMenuOpen(false); }} className="btn-menu-item">Add to Queue</button>
                            <button onClick={(e) => { e.stopPropagation(); startMix(track); setIsMenuOpen(false); }} className="btn-menu-item">Start Mix</button>
                            <div className="h-px bg-white/10 my-1 mx-2" />
                            
                            {/* Dynamic Text based on whether it's already liked */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleLike(track); setIsMenuOpen(false); }} 
                                className={`btn-menu-item ${isLiked(track.videoId) ? 'btn-menu-item-danger' : 'text-cyan-400 hover:text-cyan-300'}`}
                            >
                                {isLiked(track.videoId) ? 'Remove from Liked' : 'Save to Library'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="track-image-wrapper">
                <Image 
                    src={track.thumbnailUrl} 
                    alt={track.title} 
                    fill 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={true}
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
                <span className="track-title">{track.title}</span>
                <span className="track-artist">{track.artist}</span>
            </div>
        </div>
    );
}