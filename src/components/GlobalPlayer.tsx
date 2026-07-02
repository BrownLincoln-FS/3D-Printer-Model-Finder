'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePlayer, Track } from '@/contexts/PlayerContext';

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
        currentTrack, playTrack, nextTrack, prevTrack, hasNextTrack, hasPrevTrack, 
        isExpanded, setIsExpanded, queue, currentIndex, jumpToTrack, clearQueue,
        isLiked, toggleLike
    } = usePlayer();
    
    const playerRef = useRef<YouTubePlayerInstance | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<'song' | 'video'>('video');
    const [activeTab, setActiveTab] = useState<TabOption>('upnext');
    
    const [volume, setVolume] = useState<number>(80);
    const [progress, setProgress] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [isDragging, setIsDragging] = useState<boolean>(false);

    const [lyrics, setLyrics] = useState<string>('');
    const [isFetchingLyrics, setIsFetchingLyrics] = useState<boolean>(false);
    const [lyricsError, setLyricsError] = useState<string>('');
    const fetchedLyricsTrackId = useRef<string | null>(null);

    const [relatedTracks, setRelatedTracks] = useState<Track[]>([]);
    const [isFetchingRelated, setIsFetchingRelated] = useState<boolean>(false);

    useEffect(() => {
        if (!currentTrack) return;

        const initPlayer = () => {
            if (!window.YT) return;

            if (playerRef.current) {
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

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isPlaying && !isDragging) {
            interval = setInterval(() => {
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

    useEffect(() => {
        if (currentTrack && currentTrack.videoId !== fetchedLyricsTrackId.current) {
            setLyrics('');
            setLyricsError('');
            fetchedLyricsTrackId.current = null;
        }

        if (!currentTrack) return;
        if (fetchedLyricsTrackId.current === currentTrack.videoId) return;

        let isMounted = true;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); 

        const fetchLyrics = async () => {
            setIsFetchingLyrics(true);
            setLyricsError('');

            try {
                const res = await fetch(`/api/lyrics?artist=${encodeURIComponent(currentTrack.artist)}&title=${encodeURIComponent(currentTrack.title)}`, {
                    signal: controller.signal
                });
                const data = await res.json();
                
                if (!isMounted) return;
                if (!res.ok) throw new Error(data.error || 'Failed to fetch lyrics');
                
                setLyrics(data.lyrics);
                fetchedLyricsTrackId.current = currentTrack.videoId; 
            } catch (err) {
                if (!isMounted) return;
                if (err instanceof Error && err.name === 'AbortError') {
                    setLyricsError('The lyrics database took too long to respond.');
                } else {
                    setLyricsError('Could not find lyrics for this track.');
                }
            } finally {
                clearTimeout(timeoutId);
                if (isMounted) setIsFetchingLyrics(false);
            }
        };

        fetchLyrics();

        return () => {
            isMounted = false;
            controller.abort(); 
        };
    }, [currentTrack]); 

    useEffect(() => {
        if (!currentTrack) return;

        let isMounted = true;
        
        const fetchRelated = async () => {
            setIsFetchingRelated(true);
            try {
                const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(currentTrack.artist + ' music')}`);
                
                // Soft exit
                if (!res.ok) {
                    console.warn(`Related tracks API failed with status: ${res.status}`);
                    return; 
                }
                
                const data = await res.json();
                if (!isMounted) return;

                const filteredTracks = data.filter((t: Track) => t.videoId !== currentTrack.videoId);
                setRelatedTracks(filteredTracks);
            } catch (error) {
                console.warn("Failed to fetch related tracks:", error);
            } finally {
                if (isMounted) setIsFetchingRelated(false);
            }
        };

        fetchRelated();

        return () => {
            isMounted = false;
        };
    }, [currentTrack]); 


    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

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

    // --- NEW: Dynamic Like Status ---
    const currentlyLiked = currentTrack ? isLiked(currentTrack.videoId) : false;

    const playbackControls = (
        <>
            <button onClick={handlePrevClick} className="btn-nav hover-scale">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>
            
            <button onClick={togglePlay} className="btn-play-main">
                {isPlaying ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                    <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
            </button>
            
            <button onClick={handleNextClick} className="btn-nav hover-scale">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>

            {/* Thumbs Up Button (Outline Only) */}
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    if (currentTrack) toggleLike(currentTrack);
                }} 
                className={`btn-nav hover-scale transition-colors ml-2 ${currentlyLiked ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}
            >
                <svg 
                    className="w-6 h-6 transition-all" 
                    viewBox="0 0 24 24" 
                    fill="none" //
                    stroke="currentColor"
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                >
                    <path d="M7 10v12"/>
                    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
                </svg>
            </button>
        </>
    );

    const seekBarUI = (
        <div className="seek-bar-wrapper" onClick={(e) => e.stopPropagation()}>
            <span className="seek-bar-time">{formatTime(progress)}</span>
            <input
                type="range"
                min={0}
                max={duration || 100}
                value={progress}
                onChange={handleSeekChange}
                onMouseUp={handleSeekMouseUp}
                onTouchEnd={handleSeekMouseUp}
                className="seek-bar-input"
            />
            <span className="seek-bar-time">{formatTime(duration)}</span>
        </div>
    );

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
                            {/* Up Next Tab */}
                            {activeTab === 'upnext' && (
                                <div className="queue-container">
                                    <div className="queue-header">
                                        <span className="queue-title">Playing Next</span>
                                        {queue.length > 1 && (
                                            <button onClick={clearQueue} className="btn-queue-clear">
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                    <div className="queue-list">
                                        {queue.length > 0 ? (
                                            queue.map((track, index) => (
                                                <div 
                                                    key={`${track.videoId}-${index}`}
                                                    onClick={() => jumpToTrack(index)}
                                                    className={`queue-item ${index === currentIndex ? 'queue-item-active' : 'queue-item-default'}`}
                                                >
                                                    <div className="queue-item-image-wrapper">
                                                        <Image src={track.thumbnailUrl} alt={track.title} fill sizes="48px" className="object-cover" />
                                                        {index === currentIndex && (
                                                            <div className="queue-item-overlay">
                                                                <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="queue-item-info">
                                                        <span className={`queue-item-title ${index === currentIndex ? 'queue-item-title-active' : 'queue-item-title-default'}`}>
                                                            {track.title}
                                                        </span>
                                                        <span className="queue-item-artist">
                                                            {track.artist}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="queue-empty">
                                                <p>Your queue is empty.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Lyrics Tab */}
                            {activeTab === 'lyrics' && (
                                <div className="lyrics-container">
                                    {isFetchingLyrics ? (
                                        <div className="lyrics-loading-wrapper">
                                            <div className="spinner"></div>
                                            <p className="font-medium animate-pulse">Searching database...</p>
                                        </div>
                                    ) : lyricsError ? (
                                        <div className="lyrics-error">
                                            {lyricsError}
                                        </div>
                                    ) : lyrics ? (
                                        <div className="lyrics-text">
                                            {lyrics}
                                        </div>
                                    ) : (
                                        <div className="lyrics-loading-wrapper">
                                            <div className="spinner"></div>
                                            <p className="font-medium">Preparing...</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Related Tab */}
                            {activeTab === 'related' && (
                                <div className="queue-container">
                                    <div className="queue-header">
                                        <span className="queue-title">Similar Tracks</span>
                                    </div>
                                    <div className="queue-list">
                                        {isFetchingRelated ? (
                                            <div className="lyrics-loading-wrapper">
                                                <div className="spinner"></div>
                                                <p className="font-medium animate-pulse">Finding similar music...</p>
                                            </div>
                                        ) : relatedTracks.length > 0 ? (
                                            relatedTracks.map((track) => (
                                                <div 
                                                    key={`related-${track.videoId}`}
                                                    onClick={() => playTrack(track, [track])}
                                                    className="queue-item queue-item-default"
                                                >
                                                    <div className="queue-item-image-wrapper">
                                                        <Image src={track.thumbnailUrl} alt={track.title} fill sizes="48px" className="object-cover" />
                                                    </div>
                                                    <div className="queue-item-info">
                                                        <span className="queue-item-title queue-item-title-default">
                                                            {track.title}
                                                        </span>
                                                        <span className="queue-item-artist">
                                                            {track.artist}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="queue-empty">
                                                <p>No related tracks found.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* EXPANDED CONTROL BAR */}
                <div className="player-control-bar player-control-bar-stacked">
                    <div className="seek-bar-container">
                        {seekBarUI}
                    </div>

                    <div className="controls-row">
                        <div className="controls-group">
                            {playbackControls}
                        </div>
                        <div className="track-meta-group">
                            <span className="track-meta-title">{currentTrack.title}</span>
                        </div>
                        <div className="volume-group">
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

                <div className="docked-controls-wrapper">
                    <div className="docked-controls-row">
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