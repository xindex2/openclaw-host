import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import StarField from '../../components/StarField';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faServer, faBolt, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

export default function VPS() {
    useEffect(() => {
        document.title = "OpenClaw VPS - Dedicated High-Performance AI Hosting";
    }, []);

    return (
        <div style={{ background: 'var(--bg-deep)', minHeight: '100vh', color: 'var(--color-text)' }}>
            <StarField />
            <nav className="nav" style={{ position: 'relative', zIndex: 10, borderBottom: '1px solid var(--color-border)' }}>
                <div className="container flex-between" style={{ padding: '1.25rem var(--spacing-lg)' }}>
                    <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <Logo size={32} />
                        <h3 style={{ margin: 0 }}>OpenClaw Host</h3>
                    </Link>
                    <Link to="/register" className="btn btn-primary">Deploy Now</Link>
                </div>
            </nav>

            <div className="container" style={{ position: 'relative', zIndex: 1, padding: '6rem 1rem' }}>
                <div className="text-center" style={{ maxWidth: '900px', margin: '0 auto var(--spacing-2xl)' }}>
                    <h1 className="text-gradient" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1.5rem' }}>
                        Enterprise-Grade OpenClaw VPS
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        Run your AI agents on dedicated infrastructure optimized for speed, reliability, and security.
                        Our <strong>OpenClaw VPS</strong> instances provide the power you need for 24/7 agent operations.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                    <div className="card-glass" style={{ padding: '2rem' }}>
                        <FontAwesomeIcon icon={faServer} style={{ fontSize: '2rem', color: 'var(--coral-bright)', marginBottom: '1rem' }} />
                        <h3>Dedicated Resources</h3>
                        <p style={{ color: 'var(--color-text-secondary)' }}>No noisy neighbors. Get dedicated CPU and RAM for your OpenClaw agents to ensure consistent performance.</p>
                    </div>
                    <div className="card-glass" style={{ padding: '2rem' }}>
                        <FontAwesomeIcon icon={faBolt} style={{ fontSize: '2rem', color: 'var(--coral-bright)', marginBottom: '1rem' }} />
                        <h3>Ultra-Low Latency</h3>
                        <p style={{ color: 'var(--color-text-secondary)' }}>Strategic datacenter locations minimize latency for faster communication between your agent and its tools.</p>
                    </div>
                    <div className="card-glass" style={{ padding: '2rem' }}>
                        <FontAwesomeIcon icon={faShieldAlt} style={{ fontSize: '2rem', color: 'var(--coral-bright)', marginBottom: '1rem' }} />
                        <h3>Security First</h3>
                        <p style={{ color: 'var(--color-text-secondary)' }}>Every VPS runs in its own isolated Docker container with zero-trust networking protocols.</p>
                    </div>
                </div>

                <div className="text-center">
                    <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.25rem' }}>
                        Get Started with OpenClaw VPS
                    </Link>
                </div>
            </div>
            <Footer />
        </div>
    );
}
