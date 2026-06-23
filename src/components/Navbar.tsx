'use client';

import Link from "next/link";
import { useSession } from "next-auth/react";
import SignOutButton from "@/components/SignOutButton";
import TokenStatus from "@/components/TokenStatus";

export default function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="main-nav">
            <div className="nav-container">
                
                {/* LEFT GROUP: Logo + Links */}
                <div className="flex items-center gap-8">
                    <div className="logo">
                        <Link href="/" className="logo-link">
                            <svg className="logo-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12 -3v13M9 19c-1.105 0 -2 .895 -2 2s.895 2 2 2 2 .895 2 2-.895 2 -2 2zm12 -3c-1.105 0 -2 .895 -2 2s.895 2 2 2 2 .895 2 2-.895 2 -2 2zM5 10h4" />
                            </svg>
                            AudioStream
                        </Link>
                    </div>

                    {session && (
                        <div className="nav-links">
                            <Link href="/search" className="nav-link">Discover</Link>
                            <Link href="/library" className="nav-link">My Library</Link>
                        </div>
                    )}
                </div>

                {/* RIGHT GROUP: JWT Status + Sign Out */}
                <div className="user-controls-fixed">
                    <div className="nav-jwt-wrapper">
                        <TokenStatus />
                    </div>
                    {session && <SignOutButton />}
                </div>

            </div>
        </nav>
    );
}