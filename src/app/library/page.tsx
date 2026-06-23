'use client';

import { useState, Suspense } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useSearchParams, useRouter } from 'next/navigation';
import TrackCard from '@/components/TrackCard';

type LibraryTab = 'Playlists' | 'Artists' | 'Albums';
type ViewState = 'overview' | 'playlist';

const LikedIcon = ({ className = "icon-md" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 10v12"/>
        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
    </svg>
);

function LibraryContent() {
    const { likedSongs, playList, shuffleList, addListToQueue } = usePlayer();
    const [activeTab, setActiveTab] = useState<LibraryTab>('Playlists');

    const searchParams = useSearchParams();
    const router = useRouter();

    const viewParam = searchParams.get('view');
    const currentView: ViewState = viewParam === 'playlist' ? 'playlist' : 'overview';

    const handleViewChange = (view: ViewState) => {
        router.replace(view === 'overview' ? '/library' : '/library?view=playlist', { scroll: false });
    };

    const TABS: LibraryTab[] = ['Playlists', 'Artists', 'Albums'];

    if (currentView === 'overview') {
        return (
            <div className="library-container">
                <h1 className="library-header-title">My Library</h1>
                <div className="library-tabs-wrapper">
                    {TABS.map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`library-tab ${activeTab === tab ? 'library-tab-active' : ''}`}>
                            {tab}
                            {activeTab === tab && <div className="library-tab-indicator" />}
                        </button>
                    ))}
                </div>

                {activeTab === 'Playlists' && (
                    <div className="playlist-grid">
                        <div className="playlist-card" onClick={() => handleViewChange('playlist')}>
                            <div className="playlist-card-gradient">
                                <LikedIcon className="icon-lg" />
                            </div>
                            <h3 className="playlist-card-title">Liked Songs</h3>
                            <p className="playlist-card-subtitle">{likedSongs.length} Tracks</p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="library-container">
            <button onClick={() => handleViewChange('overview')} className="btn-back">
                <svg className="icon-sm" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                Back to Library
            </button>

            <div className="playlist-header">
                <div className="playlist-cover">
                    <LikedIcon className="icon-xl" />
                </div>
                
                <div className="playlist-info">
                    <span className="playlist-type">Playlist</span>
                    <h1 className="playlist-title">Liked Songs</h1>
                    
                    <div className="btn-action-group">
                        <button onClick={() => playList(likedSongs)} className="btn-action-primary">
                            <svg className="icon-sm" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> Play
                        </button>
                        <button onClick={() => shuffleList(likedSongs)} className="btn-action-secondary">
                            <svg className="icon-sm" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" /></svg> Shuffle
                        </button>
                        <button onClick={() => addListToQueue(likedSongs)} className="btn-action-secondary">
                            <svg className="icon-sm" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg> Add to Queue
                        </button>
                    </div>
                </div>
            </div>

            {likedSongs.length === 0 ? (
                <div className="library-empty-state">No liked songs yet.</div>
            ) : (
                <div className="track-grid">
                    {/* Look how clean this is now! */}
                    {likedSongs.map((track) => (
                        <TrackCard 
                            key={`liked-detail-${track.videoId}`} 
                            track={track} 
                            contextQueue={likedSongs} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function LibraryPage() {
    return (
        <Suspense fallback={<div className="library-container"><h1 className="library-header-title">Loading Library...</h1></div>}>
            <LibraryContent />
        </Suspense>
    );
}