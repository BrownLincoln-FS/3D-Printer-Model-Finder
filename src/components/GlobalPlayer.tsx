'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePlayer } from '@/contexts/PlayerContext';

interface YouTubePlayerInstance {
    loadVideoById(videoId: string): void;
    playVideo(): void;
    pauseVideo(): void;
    setVolume(volume: number): void;
    getCurrentTime(): number;
    getDuration(): number;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
}

interface YouTubeEvent {
    data: number;
}

declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
        YT?: {
            Player: new (
                elementId: string,
                options: {
                    videoId: string;
                    playerVars: {
                        autoplay: number;
                        controls: number;
                        disablekb: number;
                        modestbranding: number;
                        rel: number;
                    };
                    events: {
                        onStateChange: (event: YouTubeEvent) => void;
                    };
                }
            ) => YouTubePlayerInstance;
            PlayerState: {
                PLAYING: number;
                PAUSED: number;
                ENDED: number;
            };
        };
    }
}

type TabOption = 'upnext' | 'lyrics' | 'related';
const TAB_OPTIONS: TabOption[] = ['upnext', 'lyrics', 'related'];

export default function GlobalPlayer() {
    const { 
        currentTrack, nextTrack, prevTrack, hasNextTrack, hasPrevTrack, 
        isExpanded, setIsExpanded, queue, currentIndex, jumpToTrack 
    } = usePlayer();
    
    const playerRef = useRef<YouTubePlayerInstance | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<'song' | 'video'>('video');
    const [activeTab, setActiveTab] = useState<TabOption>('lyrics');
    
    const [volume, setVolume] = useState<number>(80);
    const [progress, setProgress] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [isDragging, setIsDragging] = useState<boolean>(false);

    // YouTube Initialization Loop
    useEffect(() => {
        if (!currentTrack) return;

        const initPlayer = () => {
            if (!window.YT) return;

            if (playerRef.current) {
                // Checks if the method has been injected yet
                if (typeof playerRef.current.loadVideoById === 'function') {
                    playerRef.current.loadVideoById(currentTrack.videoId);
                }
            } else {
                playerRef.current = new window.YT.Player('yt-player-iframe', {
                    videoId: currentTrack.videoId,
                    playerVars: { autoplay: 1, controls: 0, disablekb: 1, modestbranding: 1, rel: 0 },
                    events: {
                        onStateChange: (e: YouTubeEvent) => {
                            setIsPlaying(e.data === window.YT!.PlayerState.PLAYING);
                        }
                    }
                });
            }
        };

        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            document.body.appendChild(tag);
            window.onYouTubeIframeAPIReady = initPlayer;
        } else {
            initPlayer();
        }
    }, [currentTrack]);

    // Timeline Sync Loop (Updates the slider as the song plays)
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isPlaying && !isDragging) {
            interval = setInterval(() => {
                // Checks if the getCurrentTime method exists before scrubbing
                if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                    setProgress(playerRef.current.getCurrentTime() || 0);
                    setDuration(playerRef.current.getDuration() || 0);
                }
            }, 500);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying, isDragging]);

    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // --- SEEK BAR DRAG HANDLERS ---
    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsDragging(true);
        setProgress(parseFloat(e.target.value));
    };

    const handleSeekMouseUp = () => {
        setIsDragging(false);
        if (playerRef.current) {
            playerRef.current.seekTo(progress, true);
        }
    };
    // ------------------------------

    const handlePrevClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!playerRef.current || !currentTrack) return;

        const currentTime = playerRef.current.getCurrentTime();

        if (currentTrack.isPodcast) {
            if (currentTime >= 30) {
                playerRef.current.seekTo(currentTime - 30, true);
                return;
            }
        } else {
            if (currentTime >= 10) {
                playerRef.current.seekTo(0, true);
                return;
            }
        }

        if (hasPrevTrack) {
            prevTrack();
        } else {
            playerRef.current.seekTo(0, true);
        }
    };

    const handleNextClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!playerRef.current || !currentTrack) return;

        if (currentTrack.isPodcast) {
            const currentTime = playerRef.current.getCurrentTime();
            playerRef.current.seekTo(currentTime + 30, true);
            return;
        }

        if (hasNextTrack) {
            nextTrack();
        } else {
            const duration = playerRef.current.getDuration();
            playerRef.current.seekTo(duration, true);
        }
    };

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!playerRef.current) return;
        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVol = parseInt(e.target.value);
        setVolume(newVol);
        if (playerRef.current) {
            playerRef.current.setVolume(newVol);
        }
    };

    // --- REUSABLE UI COMPONENTS ---
    const playbackControls = (
        <>
            <button onClick={handlePrevClick} className="btn-nav hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>
            
            <button onClick={togglePlay} className="btn-play-main w-12 h-12">
                {isPlaying ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                    <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
            </button>
            
            <button onClick={handleNextClick} className="btn-nav hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>
        </>
    );

    const seekBarUI = (
        <div className="flex items-center gap-3 w-full px-4" onClick={(e) => e.stopPropagation()}>
            <span className="text-xs text-slate-400 w-10 text-right">{formatTime(progress)}</span>
            <input
                type="range"
                min={0}
                max={duration || 100}
                value={progress}
                onChange={handleSeekChange}
                onMouseUp={handleSeekMouseUp}
                onTouchEnd={handleSeekMouseUp}
                className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-cyan-500 hover:h-1.5 transition-all"
            />
            <span className="text-xs text-slate-400 w-10">{formatTime(duration)}</span>
        </div>
    );
    // ------------------------------

    if (!currentTrack) return null;

    return (
        <>
            {/* EXPANDED VIEW */}
            <div className={`player-expanded-wrapper ${isExpanded ? 'slide-up-open' : 'slide-up-closed'}`}>
                
                <div className="player-header">
                    <button onClick={() => setIsExpanded(false)} className="btn-icon-circular">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    
                    <div className="view-mode-container">
                        <button onClick={() => setViewMode('song')} className={`btn-view-mode ${viewMode === 'song' ? 'btn-view-mode-active' : ''}`}>Song</button>
                        <button onClick={() => setViewMode('video')} className={`btn-view-mode ${viewMode === 'video' ? 'btn-view-mode-active' : ''}`}>Video</button>
                    </div>
                    <div className="w-12 h-12" />
                </div>

                <div className="player-main-content">
                    <div className="media-area relative overflow-hidden">
                        <div className={`yt-iframe-wrapper absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                            viewMode === 'video' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none -z-10'
                        }`}>
                            <div id="yt-player-iframe" className="w-full h-full" />
                        </div>

                        <div className={`album-art-wrapper absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                            viewMode === 'song' ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 pointer-events-none -z-10'
                        }`}>
                            <Image 
                                src={currentTrack.thumbnailUrl} 
                                alt={currentTrack.title} 
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
                                fill 
                                className="object-cover" 
                            />
                        </div>
                    </div>

                    <div className="info-panel">
                        <div className="tabs-header">
                            {TAB_OPTIONS.map((tab) => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`btn-tab ${activeTab === tab ? 'btn-tab-active' : ''}`}>{tab}</button>
                            ))}
                        </div>
                        <div className="panel-content">
                            {activeTab === 'upnext' && (
                                <div className="space-y-2">
                                    {queue.length > 0 ? (
                                        queue.map((track, index) => (
                                            <div 
                                                key={`${track.videoId}-${index}`}
                                                onClick={() => jumpToTrack(index)}
                                                className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${
                                                    index === currentIndex 
                                                        ? 'bg-cyan-500/20 border border-cyan-500/50' 
                                                        : 'hover:bg-white/5 border border-transparent'
                                                }`}
                                            >
                                                <div className="relative w-12 h-12 shrink-0 rounded-md overflow-hidden shadow-md">
                                                    <Image src={track.thumbnailUrl} alt={track.title} fill className="object-cover" />
                                                    {index === currentIndex && (
                                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                            <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col truncate">
                                                    <span className={`truncate font-medium ${index === currentIndex ? 'text-cyan-400' : 'text-white'}`}>
                                                        {track.title}
                                                    </span>
                                                    <span className="text-sm text-slate-400 truncate">
                                                        {track.artist}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-400 mt-12">
                                            <p>Your queue is empty.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'lyrics' && (
                                <div className="lyrics-wrapper">
                                    <h3 className="lyrics-title">AI Lyric Generator</h3>
                                    <p className="lyrics-placeholder">Waiting for backend integration...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* EXPANDED CONTROL BAR */}
                <div className="player-control-bar flex-col gap-4">
                    <div className="w-full max-w-3xl mx-auto">
                        {seekBarUI}
                    </div>

                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-6">
                            {playbackControls}
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-white font-bold">{currentTrack.title}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} className="volume-slider" />
                        </div>
                    </div>
                </div>
            </div>

            {/* DOCKED VIEW */}
            <div onClick={() => setIsExpanded(true)} className={`player-docked ${isExpanded ? 'slide-up-closed' : 'slide-up-open'}`}>
                <div className="docked-left">
                    <div className="docked-image-wrapper">
                        <Image src={currentTrack.thumbnailUrl} alt={currentTrack.title} sizes="56px" fill className="object-cover" />
                    </div>
                    <div className="docked-track-info">
                        <span className="docked-title">{currentTrack.title}</span>
                        <span className="docked-artist">{currentTrack.artist}</span>
                    </div>
                </div>

                <div className="docked-center flex flex-col items-center justify-center w-1/3">
                    <div className="flex gap-4 items-center mb-1">
                        {playbackControls}
                    </div>
                    {seekBarUI}
                </div>

                <div className="docked-right">
                    <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} className="volume-slider" onClick={(e) => e.stopPropagation()} />
                </div>
            </div>
        </>
    );
}