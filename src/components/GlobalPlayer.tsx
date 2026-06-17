'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePlayer } from '@/contexts/PlayerContext';

interface YouTubePlayerInstance {
    loadVideoById(videoId: string): void;
    playVideo(): void;
    pauseVideo(): void;
    setVolume(volume: number): void;
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
    const { currentTrack, nextTrack, prevTrack, isExpanded, setIsExpanded } = usePlayer();
    const playerRef = useRef<YouTubePlayerInstance | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<'song' | 'video'>('video');
    const [activeTab, setActiveTab] = useState<TabOption>('lyrics');
    const [volume, setVolume] = useState<number>(80);

    useEffect(() => {
        if (!currentTrack) return;

        const initPlayer = () => {
            if (!window.YT) return;

            if (playerRef.current) {
                playerRef.current.loadVideoById(currentTrack.videoId);
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

    if (!currentTrack) return null;

    const isVideoVisible = isExpanded && viewMode === 'video';

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
                    <div className="media-area">
                        <div id="yt-player-iframe" className={`yt-iframe-wrapper ${isVideoVisible ? 'element-visible' : 'element-hidden'}`} />
                        
                        {!isVideoVisible && (
                            <div className="album-art-wrapper">
                                <Image src={currentTrack.thumbnailUrl} alt={currentTrack.title} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" fill className="object-cover" />
                            </div>
                        )}
                    </div>

                    <div className="info-panel">
                        <div className="tabs-header">
                            {TAB_OPTIONS.map((tab) => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`btn-tab ${activeTab === tab ? 'btn-tab-active' : ''}`}>{tab}</button>
                            ))}
                        </div>
                        <div className="panel-content">
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
                <div className="player-control-bar">
                    <div className="flex items-center gap-6">
                        <button onClick={() => prevTrack()} className="btn-nav"><svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></button>
                        <button onClick={togglePlay} className="btn-play-main w-16 h-16">{isPlaying ? <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}</button>
                        <button onClick={() => nextTrack()} className="btn-nav"><svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></button>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-white font-bold">{currentTrack.title}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} className="volume-slider" />
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

                <div className="docked-center flex gap-4">
                    <button onClick={(e) => { e.stopPropagation(); prevTrack(); }} className="btn-nav"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></button>
                    <button onClick={togglePlay} className="btn-play-main w-10 h-10">{isPlaying ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}</button>
                    <button onClick={(e) => { e.stopPropagation(); nextTrack(); }} className="btn-nav"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></button>
                </div>

                <div className="docked-right">
                    <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} className="volume-slider" />
                </div>
            </div>
        </>
    );
}