import React, { useMemo } from 'react';

export default function StarField() {
    const stars = useMemo(() => {
        return Array.from({ length: 150 }).map((_, i) => ({
            id: i,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            size: Math.floor(Math.random() * 3) + 1,
            duration: `${Math.random() * 3 + 2}s`,
            delay: `${Math.random() * 5}s`,
        }));
    }, []);

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            pointerEvents: 'none',
            background: 'var(--bg-deep)',
            zIndex: 0,
        }}>
            {stars.map((star) => (
                <div
                    key={star.id}
                    className={`star star-${star.size} animate-star`}
                    style={{
                        top: star.top,
                        left: star.left,
                        '--duration': star.duration,
                        animationDelay: star.delay,
                        boxShadow: star.size > 2 ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none',
                    }}
                />
            ))}
        </div>
    );
}
