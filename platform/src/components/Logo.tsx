import React from 'react';

export default function Logo({ size = 40, className = '' }: { size?: number, className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <circle cx="50" cy="50" r="45" fill="#FF6B6B" />
            <circle cx="35" cy="40" r="5" fill="#050505" />
            <circle cx="65" cy="40" r="5" fill="#050505" />
            <path d="M20 50C15 50 10 45 10 40C10 35 15 30 20 30" stroke="#FF6B6B" strokeWidth="5" strokeLinecap="round" />
            <path d="M80 50C85 50 90 45 90 40C90 35 85 30 80 30" stroke="#FF6B6B" strokeWidth="5" strokeLinecap="round" />
            <rect x="45" y="80" width="10" height="10" fill="#FF6B6B" />
        </svg>
    );
}
