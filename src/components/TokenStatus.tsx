'use client';

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";

const MAX_TIME = 3600 * 1000;

export default function TokenStatus() {
    const { data: session, status } = useSession();
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [percentage, setPercentage] = useState<number>(0);

    useEffect(() => {
        if (session?.error === "RefreshAccessTokenError") signIn();
        if (!session?.user?.accessTokenExpires) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const expires = session.user.accessTokenExpires as number;
            const distance = expires - now;
            
            setTimeLeft(Math.max(0, distance));
            setPercentage(Math.max(0, (distance / MAX_TIME) * 100));
        }, 1000);

        return () => clearInterval(interval);
    }, [session]);

    if (status === "loading") return <div className="w-8 h-8 rounded-full border-2 border-slate-700 animate-pulse" />;
    
    // NOT SIGNED IN
    if (status === "unauthenticated") {
        return (
            <div className="token-ring-container">
                <div className="token-text-wrapper">
                    <span className="token-label">JWT Status</span>
                    <span className="token-value text-red-500">Unauthenticated</span>
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] bg-red-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                </div>
            </div>
        );
    }

    // SIGNED IN
    const hue = Math.max(0, (percentage / 100) * 120);
    const color = `hsl(${hue}, 100%, 50%)`;
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return (
        <div className="token-ring-container">
            <div className="token-text-wrapper">
                <span className="token-label">JWT Status</span>
                <span className="token-value" style={{ color }}>{`${minutes}m ${seconds.toString().padStart(2, '0')}s`}</span>
            </div>
            
            <div className="token-svg-wrapper">
                <svg className="token-ring-bg">
                    <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" fill="transparent" />
                    <circle 
                        cx="16" cy="16" r="14" 
                        stroke="currentColor" strokeWidth="3" fill="transparent"
                        strokeDasharray={2 * Math.PI * 14}
                        strokeDashoffset={2 * Math.PI * 14 * (1 - percentage / 100)}
                        className="token-ring-progress"
                        style={{ color }}
                    />
                </svg>
                <div className="token-dot" style={{ backgroundColor: color }} />
            </div>
        </div>
    );
}