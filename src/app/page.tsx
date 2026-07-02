import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "./api/auth/[...nextauth]/route"; 

export default async function HomePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/signin");
    }

    return (
        <main className="hero-section">
            <div className="status-badge">
                <span className="ping-dot"></span>
                Ready to Stream
            </div>

            <h1 className="hero-title">
                Your Personal <br className="desktop-break" />
                <span className="text-highlight">Audio Ecosystem.</span>
            </h1>
            
            <p className="hero-subtitle">
                Search millions of tracks, generate AI lyrics in real-time, and build your ultimate 
                saved library without the bloat. Welcome to the future of listening.
            </p>

            <div className="features-grid">
                <div className="feature-card">
                    <h3 className="feature-title">Discover</h3>
                    <p className="feature-text">Search the massive YouTube audio catalog instantly with zero ads or interruptions.</p>
                </div>
                <div className="feature-card">
                    <h3 className="feature-title">AI Lyrics</h3>
                    <p className="feature-text">Automatically generate and sync lyrics for any song in your library using advanced LLMs.</p>
                </div>
                <div className="feature-card">
                    <h3 className="feature-title">Curate</h3>
                    <p className="feature-text">Save your favorite tracks to your personal PostgreSQL database for instant access.</p>
                </div>
            </div>
        </main>
    );
}