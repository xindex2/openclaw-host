import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import StarField from '../../components/StarField';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faRocket, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export default function Install() {
    useEffect(() => {
        document.title = "How to Install OpenClaw - 1-Click Automated Setup";
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
                    <Link to="/register" className="btn btn-primary">Start Installation</Link>
                </div>
            </nav>

            <div className="container" style={{ position: 'relative', zIndex: 1, padding: '6rem 1rem' }}>
                <div className="text-center" style={{ maxWidth: '900px', margin: '0 auto var(--spacing-2xl)' }}>
                    <h1 className="text-gradient" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1.5rem' }}>
                        Install OpenClaw Instantly
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        Forget complex terminal commands. <strong>Install OpenClaw</strong> with our automated 1-click wizard.
                        We handle all dependencies, environment variables, and Docker setup in the background.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                    <div className="card-glass" style={{ padding: '2rem' }}>
                        <FontAwesomeIcon icon={faDownload} style={{ fontSize: '2rem', color: 'var(--coral-bright)', marginBottom: '1rem' }} />
                        <h3>No Manual Downloads</h3>
                        <p style={{ color: 'var(--color-text-secondary)' }}>Our servers pull the latest stable OpenClaw image directly, ensuring you're always up to date.</p>
                    </div>
                    <div className="card-glass" style={{ padding: '2rem' }}>
                        <FontAwesomeIcon icon={faRocket} style={{ fontSize: '2rem', color: 'var(--coral-bright)', marginBottom: '1rem' }} />
                        <h3>Fast Automated Setup</h3>
                        <p style={{ color: 'var(--color-text-secondary)' }}>The entire installation process takes less than 60 seconds from click to terminal.</p>
                    </div>
                    <div className="card-glass" style={{ padding: '2rem' }}>
                        <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: '2rem', color: 'var(--coral-bright)', marginBottom: '1rem' }} />
                        <h3>Dependency Management</h3>
                        <p style={{ color: 'var(--color-text-secondary)' }}>Node.js, Docker, and system libraries are pre-configured in our optimized containers.</p>
                    </div>
                </div>

                <div className="text-center">
                    <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.25rem' }}>
                        Install Your First Agent
                    </Link>
                </div>
            </div>
            <Footer />
        </div>
    );
}
