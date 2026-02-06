import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import StarField from '../../components/StarField';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloud, faChartLine, faUsers } from '@fortawesome/free-solid-svg-icons';

export default function Hosting() {
    useEffect(() => {
        document.title = "OpenClaw Hosting - Professional Managed AI Agent Solutions";
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
                    <Link to="/register" className="btn btn-primary">Try Hosting</Link>
                </div>
            </nav>

            <div className="container" style={{ position: 'relative', zIndex: 1, padding: '6rem 1rem' }}>
                <div className="text-center" style={{ maxWidth: '900px', margin: '0 auto var(--spacing-2xl)' }}>
                    <h1 className="text-gradient" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1.5rem' }}>
                        Premium OpenClaw Hosting
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        Zero-config <strong>OpenClaw hosting</strong> for developers and businesses.
                        We handle the infrastructure, updates, and scaling while you focus on building your agents.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                    <div className="card-glass" style={{ padding: '2rem' }}>
                        <FontAwesomeIcon icon={faCloud} style={{ fontSize: '2rem', color: 'var(--coral-bright)', marginBottom: '1rem' }} />
                        <h3>Managed Infrastructure</h3>
                        <p style={{ color: 'var(--color-text-secondary)' }}>Never worry about system updates or Docker configs. We manage the stack for you.</p>
                    </div>
                    <div className="card-glass" style={{ padding: '2rem' }}>
                        <FontAwesomeIcon icon={faChartLine} style={{ fontSize: '2rem', color: 'var(--coral-bright)', marginBottom: '1rem' }} />
                        <h3>Operational Visibility</h3>
                        <p style={{ color: 'var(--color-text-secondary)' }}>Track your agent's health and logs with our integrated terminal and monitoring tools.</p>
                    </div>
                    <div className="card-glass" style={{ padding: '2rem' }}>
                        <FontAwesomeIcon icon={faUsers} style={{ fontSize: '2rem', color: 'var(--coral-bright)', marginBottom: '1rem' }} />
                        <h3>Team Ready</h3>
                        <p style={{ color: 'var(--color-text-secondary)' }}>Collaborate with your team by managing multiple agent instances under a single dashboard.</p>
                    </div>
                </div>

                <div className="text-center">
                    <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.25rem' }}>
                        Start Your Free Hosting Trial
                    </Link>
                </div>
            </div>
            <Footer />
        </div>
    );
}
